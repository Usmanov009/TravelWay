import { UserModel } from './db.js';

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8983416515:AAEm_WQRTNK92mCHXi3EALGiJAPTFop4HLE';
export const TELEGRAM_BOT_USERNAME = process.env.TELEGRAM_BOT_USERNAME || 'mytravelwaybot';

export interface PendingTelegramSession {
  sessionToken: string;
  code: string;
  authenticated: boolean;
  createdAt: number;
  user?: any;
}

// In-memory session tracking and active verification codes
export const pendingSessions = new Map<string, PendingTelegramSession>();
export const activeOtpCodes = new Map<string, { user: any; expires: number }>();
export const userChatSessions = new Map<number | string, string>(); // chatId -> sessionToken

/**
 * Creates a unique registration/login session linked to Telegram deep linking
 */
export function createTelegramAuthSession() {
  const sessionToken = 'reg_' + Math.random().toString(36).substring(2, 10);
  const code = String(Math.floor(1000 + Math.random() * 9000));
  const session: PendingTelegramSession = {
    sessionToken,
    code,
    authenticated: false,
    createdAt: Date.now()
  };
  pendingSessions.set(sessionToken, session);

  // Clean old sessions (> 30 mins)
  const now = Date.now();
  for (const [key, s] of pendingSessions.entries()) {
    if (now - s.createdAt > 30 * 60 * 1000) {
      pendingSessions.delete(key);
    }
  }

  return {
    sessionToken,
    code,
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
    user: session.user || null
  };
}

/**
 * Verifies 4-digit code entered manually by the user
 */
export function verifyTelegramCode(code: string, sessionToken?: string) {
  const cleanCode = (code || '').trim();

  // 1. Check if matches active OTP code map
  const otpEntry = activeOtpCodes.get(cleanCode);
  if (otpEntry && otpEntry.expires > Date.now()) {
    return { success: true, user: otpEntry.user };
  }

  // 2. Check if matches specific session
  if (sessionToken) {
    const session = pendingSessions.get(sessionToken);
    if (session && session.code === cleanCode) {
      return { success: true, user: session.user || null };
    }
  }

  // 3. Fallback check across all pending sessions
  for (const session of pendingSessions.values()) {
    if (session.code === cleanCode) {
      return { success: true, user: session.user || null };
    }
  }

  return { success: false, error: "Tasdiqlash kodi noto'g'ri yoki muddati tugagan" };
}

/**
 * Sends a message via the Telegram Bot API
 */
export async function sendTelegramMessage(chatId: number | string, text: string, replyMarkup?: any) {
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
      `🛫 <b>TravelWay</b> rasmiy sayohat platformasiga xush kelibsiz!\n\n` +
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
    let rawPhone = message.contact.phone_number.trim();
    if (!rawPhone.startsWith('+')) {
      rawPhone = '+' + rawPhone;
    }

    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'TravelWay Mijoz';
    const tgUsername = user.username ? `@${user.username}` : '';
    const otpCode = String(Math.floor(1000 + Math.random() * 9000));

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
            cashbackBalance: 30, // $30 registration bonus
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
        telegramUsername: tgUsername,
        cashbackBalance: 30
      };
    }

    // Attach to pending session if exists
    const sessionToken = userChatSessions.get(chatId);
    if (sessionToken && pendingSessions.has(sessionToken)) {
      const sess = pendingSessions.get(sessionToken)!;
      sess.authenticated = true;
      sess.user = dbUser;
      sess.code = otpCode;
    }

    activeOtpCodes.set(otpCode, {
      user: dbUser,
      expires: Date.now() + 15 * 60 * 1000
    });

    const successText = `✅ <b>Ro'yxatdan o'tish muvaffaqiyatli yakunlandi!</b>\n\n` +
      `👤 <b>Ism:</b> ${fullName}\n` +
      `📱 <b>Telefon:</b> ${rawPhone}\n` +
      `🎁 <b>Bonus:</b> Hisobingizga $30 sayohat vaucheri berildi!\n\n` +
      `🔑 <b>Sizning tasdiqlash kodingiz:</b> <code>${otpCode}</code>\n\n` +
      `<i>TravelWay ilovasida ushbu kodni kiriting yoki quyidagi tugma orqali bevosita kiring:</i>`;

    await sendTelegramMessage(chatId, successText, {
      inline_keyboard: [
        [{ text: "🚀 TravelWay ilovasiga kirish", url: "https://travelway-9x8l.onrender.com" }]
      ]
    });
    return;
  }

  // 3. User typed phone number manually as text
  if (text) {
    const digitsOnly = text.replace(/\D/g, '');
    if (digitsOnly.length >= 9) {
      const formattedPhone = '+' + (digitsOnly.startsWith('998') ? digitsOnly : '998' + digitsOnly);
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'TravelWay Mijoz';
      const tgUsername = user.username ? `@${user.username}` : '';
      const otpCode = String(Math.floor(1000 + Math.random() * 9000));

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
              cashbackBalance: 30,
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
          telegramUsername: tgUsername,
          cashbackBalance: 30
        };
      }

      const sessionToken = userChatSessions.get(chatId);
      if (sessionToken && pendingSessions.has(sessionToken)) {
        const sess = pendingSessions.get(sessionToken)!;
        sess.authenticated = true;
        sess.user = dbUser;
        sess.code = otpCode;
      }

      activeOtpCodes.set(otpCode, {
        user: dbUser,
        expires: Date.now() + 15 * 60 * 1000
      });

      const reply = `✅ <b>Telefon raqamingiz qabul qilindi!</b>\n\n` +
        `🔑 <b>Tasdiqlash kodingiz:</b> <code>${otpCode}</code>\n\n` +
        `<i>Ilovada ushbu kodni kiriting.</i>`;

      await sendTelegramMessage(chatId, reply, {
        inline_keyboard: [
          [{ text: "🚀 TravelWay ilovasiga kirish", url: "https://travelway-9x8l.onrender.com" }]
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
