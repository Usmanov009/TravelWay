import { randomBytes, randomInt } from 'crypto';
import { UserModel } from './db.js';
import { generateToken } from './src/server/auth.js';

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'sayrhub_bot';

export interface PendingTelegramSession {
  sessionToken: string;
  code?: string;
  authenticated: boolean;
  createdAt: number;
  user?: any;
  token?: string;
  attempts: number;
}

// In-memory session tracking and active verification codes
export const pendingSessions = new Map<string, PendingTelegramSession>();
export const userChatSessions = new Map<number | string, string>(); // chatId -> sessionToken

/**
 * Creates a unique registration/login session linked to Telegram deep linking
 */
export function createTelegramAuthSession() {
  const sessionToken = 'reg_' + randomBytes(16).toString('hex');
  const session: PendingTelegramSession = {
    sessionToken,
    authenticated: false,
    createdAt: Date.now(),
    attempts: 0
  };
  pendingSessions.set(sessionToken, session);

  // Clean old sessions (> 30 mins)
  const now = Date.now();
  for (const [key, s] of pendingSessions.entries()) {
    if (now - s.createdAt > 30 * 60 * 1000) {
      pendingSessions.delete(key);
    }
  }

  // NOTE: 'code' is NEVER returned here to prevent OTP leakage.
  // The OTP code is securely delivered strictly to the user's Telegram chat.
  return {
    sessionToken,
    botUsername: TELEGRAM_BOT_USERNAME,
    deepLink: `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${sessionToken}`
  };
}

/**
 * Checks if a session was authenticated by the Telegram bot
 */
export function checkTelegramAuthSession(sessionToken: string) {
  const session = pendingSessions.get(sessionToken);
  if (!session) {
    return { success: false, authenticated: false, error: 'Sessiya topilmadi' };
  }
  return {
    success: true,
    authenticated: session.authenticated,
    user: session.user || null,
    token: session.token || null
  };
}

/**
 * Verifies 4-digit code entered manually by the user
 */
export function verifyTelegramCode(code: string, sessionToken?: string) {
  const cleanCode = (code || '').trim();
  if (!cleanCode || cleanCode.length < 4) {
    return { success: false, error: "Tasdiqlash kodi 4 xonali bo'lishi kerak" };
  }

  if (!sessionToken) {
    return { success: false, error: "Sessiya identifikatori (sessionToken) ko'rsatilmadi" };
  }

  const session = pendingSessions.get(sessionToken);
  if (!session) {
    return { success: false, error: "Sessiya topilmadi yoki muddati tugagan" };
  }

  if (session.attempts >= 5) {
    pendingSessions.delete(sessionToken);
    return { success: false, error: "Ko'p marotaba noto'g'ri kod kiritildi. Iltimos, yangi sessiya oching." };
  }

  if (session.code && session.code === cleanCode && (Date.now() - session.createdAt < 15 * 60 * 1000)) {
    session.authenticated = true;
    const user = session.user;
    const token = session.token;
    delete session.code; // Prevent replay attacks
    return { success: true, user, token };
  }

  session.attempts = (session.attempts || 0) + 1;
  const remaining = Math.max(0, 5 - session.attempts);
  return { 
    success: false, 
    error: `Tasdiqlash kodi noto'g'ri! Qolgan urinishlar: ${remaining}` 
  };
}

/**
 * Sends a message via the Telegram Bot API
 */
export async function sendTelegramMessage(chatId: number | string, text: string, replyMarkup?: any) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('TELEGRAM_BOT_TOKEN belgilanmagan — xabar yuborilmadi.');
    return null;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        reply_markup: replyMarkup
      })
    });
    return await res.json();
  } catch (err: any) {
    console.error('Failed to send Telegram message:', err.message);
    return null;
  }
}

/**
 * Processes incoming webhook or polling updates from Telegram
 */
export async function processTelegramUpdate(update: any) {
  const message = update.message;
  if (!message) return;

  const chatId = message.chat.id;
  const user = message.from;
  const text = (message.text || '').trim();

  // 1. Command /start or /start reg_xxxx
  if (text.startsWith('/start')) {
    const parts = text.split(' ');
    const sessionParam = parts[1];
    if (sessionParam) {
      userChatSessions.set(chatId, sessionParam);
    }

    const firstName = user.first_name || 'Hurmatli foydalanuvchi';
    const welcomeText = `👋 Assalomu alaykum, <b>${firstName}</b>!\n\n` +
      `🛫 <b>SayrHub</b> rasmiy sayohat platformasiga xush kelibsiz!\n\n` +
      `🔐 Ilovada <b>ro'yxatdan o'tish</b> yoki hisobingizga kirish uchun quyidagi <b>"📱 Telefon raqamni ulashish"</b> tugmasini bosing:`;

    await sendTelegramMessage(chatId, welcomeText, {
      keyboard: [
        [{ text: "📱 Telefon raqamni ulashish", request_contact: true }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    });
    return;
  }

  // 2. User shared contact (phone number)
  if (message.contact) {
    if (message.contact.user_id && message.contact.user_id !== user.id) {
      await sendTelegramMessage(chatId, `⚠️ Iltimos, faqat o'zingizning telefon raqamingizni <b>"📱 Telefon raqamni ulashish"</b> tugmasi orqali yuboring.`);
      return;
    }

    let rawPhone = message.contact.phone_number.trim();
    if (!rawPhone.startsWith('+')) {
      rawPhone = '+' + rawPhone;
    }

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'SayrHub Mijoz';
    const tgUsername = user.username ? `@${user.username}` : '';
    const otpCode = String(randomInt(1000, 10000));

    let dbUser: any = null;
    try {
      dbUser = await UserModel.findOneAndUpdate(
        { $or: [{ telegramId: String(user.id) }, { phone: rawPhone }] },
        {
          $set: {
            tcId: 'tw-' + user.id,
            name: fullName,
            phone: rawPhone,
            telegramId: String(user.id),
            telegramUsername: tgUsername
          },
          $setOnInsert: {
            citizenship: "O'zbekiston"
          }
        },
        { upsert: true, new: true }
      );
    } catch (e: any) {
      console.warn('MongoDB save telegram user warning:', e.message);
      dbUser = {
        tcId: 'tw-' + user.id,
        name: fullName,
        phone: rawPhone,
        telegramId: String(user.id),
        telegramUsername: tgUsername
      };
    }

    const userToken = generateToken({
      id: dbUser.tcId,
      username: dbUser.phone || dbUser.tcId,
      role: 'user',
      name: dbUser.name
    }, '30d');

    // Attach to pending session if exists
    const sessionToken = userChatSessions.get(chatId);
    if (sessionToken && pendingSessions.has(sessionToken)) {
      const sess = pendingSessions.get(sessionToken)!;
      sess.authenticated = true;
      sess.user = dbUser;
      sess.token = userToken;
      sess.code = otpCode;
    }

    const successText = `✅ <b>Ro'yxatdan o'tish muvaffaqiyatli yakunlandi!</b>\n\n` +
      `👤 <b>Ism:</b> ${fullName}\n` +
      `📱 <b>Telefon:</b> ${rawPhone}\n\n` +
      `🔑 <b>Sizning tasdiqlash kodingiz:</b> <code>${otpCode}</code>\n\n` +
      `<i>SayrHub mobil ilovasida ushbu kodni kiriting:</i>`;

    await sendTelegramMessage(chatId, successText, {
      inline_keyboard: [
        [{ text: "🚀 SayrHub ilovasiga kirish", url: "https://sayrhub.uz" }]
      ]
    });
    return;
  }

  // 3. User typed phone number manually as text
  if (text) {
    const digitsOnly = text.replace(/\D/g, '');
    if (digitsOnly.length >= 9) {
      const formattedPhone = '+' + (digitsOnly.startsWith('998') ? digitsOnly : '998' + digitsOnly);
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'SayrHub Mijoz';
      const tgUsername = user.username ? `@${user.username}` : '';
      const otpCode = String(randomInt(1000, 10000));

      let dbUser: any = null;
      try {
        dbUser = await UserModel.findOneAndUpdate(
          { $or: [{ telegramId: String(user.id) }, { phone: formattedPhone }] },
          {
            $set: {
              tcId: 'tw-' + user.id,
              name: fullName,
              phone: formattedPhone,
              telegramId: String(user.id),
              telegramUsername: tgUsername
            },
            $setOnInsert: {
              citizenship: "O'zbekiston"
            }
          },
          { upsert: true, new: true }
        );
      } catch (e: any) {
        dbUser = {
          tcId: 'tw-' + user.id,
          name: fullName,
          phone: formattedPhone,
          telegramId: String(user.id),
          telegramUsername: tgUsername
        };
      }

      const userToken = generateToken({
        id: dbUser.tcId,
        username: dbUser.phone || dbUser.tcId,
        role: 'user',
        name: dbUser.name
      }, '30d');

      const sessionToken = userChatSessions.get(chatId);
      if (sessionToken && pendingSessions.has(sessionToken)) {
        const sess = pendingSessions.get(sessionToken)!;
        sess.authenticated = true;
        sess.user = dbUser;
        sess.token = userToken;
        sess.code = otpCode;
      }

      const reply = `✅ <b>Telefon raqamingiz qabul qilindi!</b>\n\n` +
        `🔑 <b>Tasdiqlash kodingiz:</b> <code>${otpCode}</code>\n\n` +
        `<i>Ilovada ushbu kodni kiriting.</i>`;

      await sendTelegramMessage(chatId, reply, {
        inline_keyboard: [
          [{ text: "🚀 SayrHub ilovasiga kirish", url: "https://sayrhub.uz" }]
        ]
      });
      return;
    }

    // Default guidance message
    await sendTelegramMessage(chatId, `Ilovada ro'yxatdan o'tish yoki kirish uchun quyidagi <b>"📱 Telefon raqamni ulashish"</b> tugmasini bosing:`, {
      keyboard: [
        [{ text: "📱 Telefon raqamni ulashish", request_contact: true }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    });
  }
}

/**
 * Initializes continuous background long-polling for the bot
 */
let isPolling = false;
let updateOffset = 0;

export function startTelegramPolling() {
  if (isPolling) return;
  if (!TELEGRAM_BOT_TOKEN) {
    console.log('ℹ️ TELEGRAM_BOT_TOKEN belgilanmagan — Telegram bot polling xizmati faollashtirilmadi.');
    return;
  }
  isPolling = true;
  console.log(`🤖 Telegram Bot @${TELEGRAM_BOT_USERNAME} polling service started...`);

  const poll = async () => {
    while (isPolling) {
      try {
        const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${updateOffset}&timeout=20`, {
          signal: AbortSignal.timeout(30000)
        });
        const data = await res.json();
        if (data.ok && Array.isArray(data.result)) {
          for (const update of data.result) {
            updateOffset = update.update_id + 1;
            try {
              await processTelegramUpdate(update);
            } catch (err: any) {
              console.error('Error processing telegram update:', err.message);
            }
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } catch (err: any) {
        // Sleep 2 seconds before retry on network timeouts
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  };

  poll().catch((e) => console.error('Fatal telegram bot error:', e));
}
