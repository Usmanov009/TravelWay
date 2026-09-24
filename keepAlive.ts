/**
 * Render Keep-Alive Service
 * 
 * Render.com bepul tarifida (Free Tier) serverga 15 daqiqa davomida so'rov kelmasa,
 * u avtomatik ravishda uyqu (sleep / spin down) rejimiga o'tib qoladi.
 * Natijada:
 *  - Keyingi kirishda 30-50 soniya kutish ("Cold start") yuzaga keladi.
 *  - Telegram bot xabarlarni o'z vaqtida qabul qilmay to'xtab qoladi.
 * 
 * Ushbu xizmat server har 10 daqiqada o'zining tashqi ommaviy URL manziliga (health endpoint)
 * so'rov yuborib turishini ta'minlaydi va Render serverini 24/7 uyg'oq holda saqlaydi.
 */

const DEFAULT_RENDER_URL = 'https://travelway-9x8l.onrender.com';
const PING_INTERVAL_MS = 10 * 60 * 1000; // Har 10 daqiqada (Render 15 daqiqada o'chadi)

export function startKeepAlive() {
  const isProd = process.env.NODE_ENV === 'production';
  const externalUrl =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.APP_URL ||
    (isProd ? DEFAULT_RENDER_URL : '');

  // Mahalliy kompyuterda (localhost) render keep-alive talab etilmaydi
  if (!externalUrl || externalUrl.includes('localhost') || externalUrl === 'MY_APP_URL') {
    console.log('ℹ️ [KeepAlive] Mahalliy muhit (local) aniqlandi. Keep-alive pinger nofaol.');
    return;
  }

  const cleanUrl = externalUrl.replace(/\/+$/, '');
  const pingUrl = `${cleanUrl}/api/health`;

  console.log(`🚀 [KeepAlive] Faollashtirildi! Har 10 daqiqada ${pingUrl} ga so'rov yuboriladi.`);

  const ping = async () => {
    try {
      const startTime = Date.now();
      const res = await fetch(pingUrl, {
        headers: {
          'User-Agent': 'TravelWay-KeepAlive-Worker/1.0'
        },
        signal: AbortSignal.timeout(20000) // 20 soniya kutish chegarasi
      });
      const duration = Date.now() - startTime;

      if (res.ok) {
        console.log(`[KeepAlive] 🟢 Server faol saqlandi (${res.status} OK, ${duration}ms) - ${new Date().toLocaleTimeString('uz-UZ')}`);
      } else {
        console.warn(`[KeepAlive] 🟡 Javob kodi: ${res.status} (${duration}ms)`);
      }
    } catch (err: any) {
      console.warn(`[KeepAlive] ⚠️ Ping ogohlantirish: ${err?.message || err}`);
    }
  };

  // Server to'liq ishga tushgach, 1 daqiqadan so'ng ilk ping yuboriladi
  setTimeout(ping, 60 * 1000);

  // Har 10 daqiqada takrorlanadi
  setInterval(ping, PING_INTERVAL_MS);
}
