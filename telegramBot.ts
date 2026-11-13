import { randomBytes, randomInt } from 'crypto';
import { getDBStatus, UserModel, TelegramSessionModel } from './db.js';
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

// Resilient memory cache (synchronized with MongoDB TTL collection)
export const pendingSessions = new Map<string, PendingTelegramSession>();
export const userChatSessions = new Map<number | string, string>(); // chatId -> sessionToken

/**
 * Creates a unique registration/login session linked to Telegram deep linking
 * Persisted in MongoDB with a 15-minute TTL index
 */
export async function createTelegramAuthSession() {
  const sessionToken = 'reg_' + randomBytes(16).toString('hex');
  const now = Date.now();

  try {
    if (getDBStatus().connected) {
      await TelegramSessionModel.create({
        sessionToken,
        authenticated: false,
        attempts: 0,
        createdAt: new Date(),
      });
    }
  } catch (err: any) {
    console.warn('MongoDB session create failed, using memory fallback:', err?.message || err);
  }

  // Dual-write to in-memory map for instantaneous latency & fallback
  pendingSessions.set(sessionToken, {
    sessionToken,
    authenticated: false,
    createdAt: now,
    attempts: 0,
  });

  // Clean old in-memory sessions (> 15 mins)
  for (const [key, s] of pendingSessions.entries()) {
    if (now - s.createdAt > 15 * 60 * 1000) {
      pendingSessions.delete(key);
    }
  }

  return {
    sessionToken,
    botUsername: TELEGRAM_BOT_USERNAME,
    deepLink: `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${sessionToken}`,
  };
}

/**
 * Checks if a session was authenticated by the Telegram bot
 */
export async function checkTelegramAuthSession(sessionToken: string) {
  if (!sessionToken) {
    return { success: false, authenticated: false, error: 'Sessiya belgilanmadi' };
  }

  try {
    if (getDBStatus().connected) {
      const dbSession = await TelegramSessionModel.findOne({ sessionToken }).lean();
      if (dbSession) {
        return {
          success: true,
          authenticated: (dbSession as any).authenticated,
          user: (dbSession as any).user || null,
          token: (dbSession as any).token || null,
        };
      }
    }
  } catch (err: any) {
    console.warn('MongoDB check session failed, checking memory fallback:', err?.message || err);
  }

  const session = pendingSessions.get(sessionToken);
  if (!session) {
    return { success: false, authenticated: false, error: 'Sessiya topilmadi yoki muddati tugagan' };
  }
  return {
    success: true,
    authenticated: session.authenticated,
    user: session.user || null,
    token: session.token || null,
  };
}

/**
 * Verifies 6-digit code entered manually by the user
 */
export async function verifyTelegramCode(code: string, sessionToken?: string) {
  const cleanCode = (code || '').trim();
  if (!cleanCode || cleanCode.length < 6) {
    return { success: false, error: "Tasdiqlash kodi 6 xonali bo'lishi kerak" };
  }

  if (!sessionToken) {
    return { success: false, error: "Sessiya identifikatori (sessionToken) ko'rsatilmadi" };
  }

  try {
    if (getDBStatus().connected) {
      const dbSession = await TelegramSessionModel.findOne({ sessionToken });
      if (dbSession) {
        if (dbSession.attempts >= 5) {
          await TelegramSessionModel.deleteOne({ sessionToken });
          pendingSessions.delete(sessionToken);
          return { success: false, error: "Ko'p marotaba noto'g'ri kod kiritildi. Iltimos, yangi sessiya oching." };
        }

        if (dbSession.code && dbSession.code === cleanCode) {
          dbSession.authenticated = true;
          const user = dbSession.user;
          const token = dbSession.token;
          dbSession.code = undefined; // Prevent replay attacks
          await dbSession.save();
          pendingSessions.delete(sessionToken);
          return { success: true, user, token };
        }

        dbSession.attempts = (dbSession.attempts || 0) + 1;
        await dbSession.save();
        const remaining = Math.max(0, 5 - dbSession.attempts);
        return {
          success: false,
          error: `Tasdiqlash kodi noto'g'ri! Qolgan urinishlar: ${remaining}`,
        };
      }
    }
  } catch (err: any) {
    console.warn('MongoDB verifyTelegramCode failed, checking memory fallback:', err?.message || err);
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
    error: `Tasdiqlash kodi noto'g'ri! Qolgan urinishlar: ${remaining}`,
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
 * Notifies customer and admin on Telegram when a booking is placed
 */
export async function notifyBookingCreated(booking: any) {
  if (!TELEGRAM_BOT_TOKEN || !booking) return;
  try {
    const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
    const travelerId = booking.travelerId;
    let userChatId: string | null = null;
    if (travelerId && travelerId !== 'guest') {
      const u = await UserModel.findOne({ tcId: travelerId }).select('telegramId').lean() as any;
      if (u?.telegramId) {
        userChatId = String(u.telegramId);
      }
    }

    const bookingText =
      `🎉 <b>Yangi sayohat buyurtmasi qabul qilindi!</b>\n\n` +
      `🎫 <b>Tur:</b> ${booking.tourTitle || 'Noma\'lum tur'}\n` +
      `📍 <b>Manzil:</b> ${booking.dest || '-'}\n` +
      `📅 <b>Sana:</b> ${booking.dates || '-'}\n` +
      `👤 <b>Mijoz:</b> ${booking.travelerName || 'Hurmatli mijoz'}\n` +
      `📞 <b>Telefon:</b> ${booking.travelerPhone || '-'}\n` +
      `💰 <b>Narxi:</b> ${booking.price || '-'}\n` +
      `🧾 <b>Vaucher ID:</b> <code>${booking.voucherId || booking.id}</code>\n` +
      `⚡ <b>Holati:</b> ${booking.status || 'Jarayonda'}\n\n` +
      `<i>SayrHub jamoasi tez orada siz bilan bog'lanadi!</i>`;

    if (userChatId) {
      await sendTelegramMessage(userChatId, bookingText, {
        inline_keyboard: [
          [{ text: "📱 SayrHub ilovasiga o'tish", url: "https://sayrhub.uz" }]
        ]
      });
    }

    if (adminChatId) {
      const adminText =
        `🔔 <b>[ADMIN XABARNOMA] Yangi buyurtma kelib tushdi!</b>\n\n` +
        `🎫 <b>Tur:</b> ${booking.tourTitle || '-'}\n` +
        `👤 <b>Mijoz:</b> ${booking.travelerName || '-'} (${booking.travelerPhone || '-'})\n` +
        `💰 <b>Summa:</b> ${booking.price || '-'}\n` +
        `🧾 <b>Vaucher:</b> <code>${booking.voucherId || booking.id}</code>\n` +
        `📅 <b>Sanalar:</b> ${booking.dates || '-'}\n\n` +
        `<i>Admin panel orqali tasdiqlashingiz mumkin.</i>`;
      await sendTelegramMessage(adminChatId, adminText);
    }
  } catch (err: any) {
    console.warn('Booking Telegram notification warning:', err?.message || err);
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
      if (getDBStatus().connected) {
        TelegramSessionModel.updateOne(
          { sessionToken: sessionParam },
          { $set: { chatId: String(chatId) } }
        ).catch(() => {});
      }
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
    // SEC-06 FIX: Upgrade OTP from 4 to 6 digits (100000 - 999999)
    const otpCode = String(randomInt(100000, 1000000));

    if (!getDBStatus().connected) {
      await sendTelegramMessage(chatId, 'Hozircha baza bilan aloqa yo‘q. Iltimos, keyinroq qayta urinib ko‘ring.');
      return;
    }

    let dbUser: any = null;
    try {
      const existingUser = await UserModel.findOne({
        $or: [{ telegramId: String(user.id) }, { phone: rawPhone }],
      }).select('status').lean();
      if (existingUser?.status === 'blocked') {
        await sendTelegramMessage(chatId, 'Akkauntingiz bloklangan. Yordam uchun qo‘llab-quvvatlash xizmatiga murojaat qiling.');
        return;
      }
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
        { upsert: true, returnDocument: 'after' }
      );
    } catch (error) {
      console.error('MongoDB save telegram user failed:', error);
      await sendTelegramMessage(chatId, 'Ro‘yxatdan o‘tishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko‘ring.');
      return;
    }

    const userToken = generateToken({
      id: dbUser.tcId,
      username: dbUser.phone || dbUser.tcId,
      role: 'user',
      name: dbUser.name
    }, '30d');

    // Attach to pending session in MongoDB and memory
    const sessionToken = userChatSessions.get(chatId);
    if (sessionToken) {
      if (getDBStatus().connected) {
        try {
          await TelegramSessionModel.updateOne(
            { sessionToken },
            {
              $set: {
                chatId: String(chatId),
                authenticated: true,
                user: dbUser,
                token: userToken,
                code: otpCode,
              }
            }
          );
        } catch (e) {
          console.error('Failed to sync session with MongoDB:', e);
        }
      }
      if (pendingSessions.has(sessionToken)) {
        const sess = pendingSessions.get(sessionToken)!;
        sess.authenticated = true;
        sess.user = dbUser;
        sess.token = userToken;
        sess.code = otpCode;
      }
    }

    const successText = `✅ <b>Ro'yxatdan o'tish muvaffaqiyatli yakunlandi!</b>\n\n` +
      `👤 <b>Ism:</b> ${fullName}\n` +
      `📱 <b>Telefon:</b> ${rawPhone}\n\n` +
      `🔑 <b>Sizning 6 xonali tasdiqlash kodingiz:</b> <code>${otpCode}</code>\n\n` +
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
      // SEC-06 FIX: Upgrade OTP from 4 to 6 digits (100000 - 999999)
      const otpCode = String(randomInt(100000, 1000000));

      if (!getDBStatus().connected) {
        await sendTelegramMessage(chatId, 'Hozircha baza bilan aloqa yo‘q. Iltimos, keyinroq qayta urinib ko‘ring.');
        return;
      }

      let dbUser: any = null;
      try {
        const existingUser = await UserModel.findOne({
          $or: [{ telegramId: String(user.id) }, { phone: formattedPhone }],
        }).select('status').lean();
        if (existingUser?.status === 'blocked') {
          await sendTelegramMessage(chatId, 'Akkauntingiz bloklangan. Yordam uchun qo‘llab-quvvatlash xizmatiga murojaat qiling.');
          return;
        }
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
          { upsert: true, returnDocument: 'after' }
        );
      } catch (error) {
        console.error('MongoDB save Telegram user failed:', error);
        await sendTelegramMessage(chatId, 'Ro‘yxatdan o‘tishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko‘ring.');
        return;
      }

      const userToken = generateToken({
        id: dbUser.tcId,
        username: dbUser.phone || dbUser.tcId,
        role: 'user',
        name: dbUser.name
      }, '30d');

      const sessionToken = userChatSessions.get(chatId);
      if (sessionToken) {
        if (getDBStatus().connected) {
          try {
            await TelegramSessionModel.updateOne(
              { sessionToken },
              {
                $set: {
                  chatId: String(chatId),
                  authenticated: true,
                  user: dbUser,
                  token: userToken,
                  code: otpCode,
                }
              }
            );
          } catch (e) {
            console.error('Failed to sync session with MongoDB:', e);
          }
        }
        if (pendingSessions.has(sessionToken)) {
          const sess = pendingSessions.get(sessionToken)!;
          sess.authenticated = true;
          sess.user = dbUser;
          sess.token = userToken;
          sess.code = otpCode;
        }
      }

      const reply = `✅ <b>Telefon raqamingiz qabul qilindi!</b>\n\n` +
        `🔑 <b>Sizning 6 xonali tasdiqlash kodingiz:</b> <code>${otpCode}</code>\n\n` +
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
