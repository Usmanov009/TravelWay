import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './db.js';
import {
  startTelegramPolling,
  createTelegramAuthSession,
  checkTelegramAuthSession,
  verifyTelegramCode,
  processTelegramUpdate,
} from './telegramBot.js';
import { startKeepAlive } from './keepAlive.js';

// Modular Route Handlers
import kompasRouter from './src/server/routes/kompasRoutes.js';
import { comboRouter, flightsRouter, hotelsRouter } from './src/server/routes/servicesRoutes.js';
import dbRouter from './src/server/routes/dbRoutes.js';
import adminRouter from './src/server/routes/adminRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Enable CORS for Flutter mobile/web/desktop apps
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Mount Modular API Routes
app.use('/api/kompas', kompasRouter);
app.use('/api/combo', comboRouter);
app.use('/api/flights', flightsRouter);
app.use('/api/hotels', hotelsRouter);
app.use('/api/db', dbRouter);
app.use('/api/admin', adminRouter);

// Telegram Authentication & Deep Link Webhook
app.post('/api/auth/telegram/create-session', (req, res) => {
  try {
    const session = createTelegramAuthSession();
    res.json({ success: true, ...session });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/auth/telegram/check-session', (req, res) => {
  try {
    const sessionToken = (req.query.sessionToken as string) || '';
    const result = checkTelegramAuthSession(sessionToken);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/auth/telegram/verify-code', (req, res) => {
  try {
    const { code, sessionToken } = req.body;
    const result = verifyTelegramCode(code, sessionToken);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/telegram/webhook', async (req, res) => {
  try {
    await processTelegramUpdate(req.body);
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Health Check & Keep-Alive Monitoring
app.get(['/api/health', '/healthz'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'TravelWay',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

async function start() {
  await connectDB();
  startTelegramPolling();
  startKeepAlive();

  if (!isProd) {
    process.env.DISABLE_HMR = 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'public')));
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TravelWay server running on http://0.0.0.0:${PORT}`);
  });
}

start();
