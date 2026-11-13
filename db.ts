import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dns from 'node:dns';

// Render/Cloud Run kabi muhitlarda IPv6 egress bo'lmasa, SRV yozuvlari IPv6
// manzilni birinchi qaytarib ulanishni "osilib" qo'yishi mumkin.
try {
  dns.setDefaultResultOrder('ipv4first');
} catch {
  // Node versiyasi qo'llamasagina e'tiborsiz qoldiramiz
}

const MONGODB_URI = process.env.MONGODB_URI;

// Tour Schema
const TourSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  location: String,
  tag: String,
  badgeType: String,
  is5Star: Boolean,
  rating: Number,
  nights: String,
  flight: String,
  price: Number,
  oldPrice: Number,
  img: String,
  saved: { type: Boolean, default: false },
  category: String,
  departureCity: String,
  country: String,
  resort: String,
  hotelStars: String,
  mealType: String,
  mealDesc: String,
  roomType: String,
  departureDate: String,
  nightsCount: Number,
  flightNumber: String,
  airline: String,
  baggage: String,
  seatsStatus: String,
  kompasTourCode: String,
  kompasOnlineUrl: String,
  isLiveKompas: Boolean,
  inclusions: [String],
  lat: Number,
  lng: Number,
}, { timestamps: true, strict: false });

// Booking Schema
const BookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tourTitle: { type: String, required: true },
  dest: String,
  dates: String,
  status: { type: String, default: 'Jarayonda' },
  voucherId: String,
  price: String,
  totalNumeric: Number,
  travelerName: String,
  travelerPhone: String,
  travelerPassport: String,
  travelerId: String, // Links booking to a registered user (tcId / JWT sub)
  type: { type: String, default: 'active' },
  startDate: String,
  endDate: String,
  hotelImg: String,
  flight: String,
  airline: String,
  nightsCount: Number,
  guestsCount: Number,
  adultsCount: Number,
  childrenCount: Number,
  cancellationReason: String,
  cancelledAt: String,
  paymentType: String,
}, { timestamps: true });

// Price Alert Schema
const PriceAlertSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  tourId: String,
  tourTitle: String,
  tourLocation: String,
  tourImg: String,
  currentPrice: Number,
  targetPrice: Number,
  createdAt: String,
  status: { type: String, default: 'active' },
  notifyViaPush: { type: Boolean, default: true },
  notifyViaTelegram: { type: Boolean, default: true },
  userEmail: String,
  userId: String,
}, { timestamps: true });

// User Profile Schema
const UserSchema = new mongoose.Schema({
  tcId: { type: String, required: true, unique: true },
  name: String,
  phone: String,
  email: String,
  telegramId: String,
  telegramUsername: String,
  passportNumber: String,
  passportExpiry: String,
  dob: String,
  citizenship: String,
  cashbackBalance: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'blocked'], default: 'active' },
  favoriteTourIds: [String],
  paymentCards: [{
    id: String,
    type: { type: String, enum: ['HUMO', 'UZCARD', 'VISA'] },
    last4: String,
    bank: String,
    isPrimary: Boolean,
  }],
}, { timestamps: true });

// Admin Staff Schema
const AdminStaffSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  email: { type: String, lowercase: true, trim: true },
  phone: String,
  role: { type: String, default: 'tour_admin' },
  roleTitle: { type: String, default: 'Tur Admin' },
  avatar: String,
  assignedDestinations: [String],
  canManageUsers: { type: Boolean, default: false },
  canManageStaff: { type: Boolean, default: false },
  canDeleteTours: { type: Boolean, default: true },
  canEditFinancials: { type: Boolean, default: true },
  canManageBookings: { type: Boolean, default: true },
  canManageCatalog: { type: Boolean, default: true },
  createdAt: String,
  lastActive: String,
  status: { type: String, default: 'active' },
}, { timestamps: true });

AdminStaffSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Agency Settings Schema
const AgencySettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'global_settings' },
  agencyCommissionRate: { type: Number, default: 0 },
  agencyName: { type: String, default: 'SayrHub' },
  tourOperator: { type: String, default: 'Kompas Tour' },
  updatedBy: String,
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export const TourModel = mongoose.models.Tour || mongoose.model('Tour', TourSchema);
export const BookingModel = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
export const PriceAlertModel = mongoose.models.PriceAlert || mongoose.model('PriceAlert', PriceAlertSchema);
export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);
export const AdminStaffModel = mongoose.models.AdminStaff || mongoose.model('AdminStaff', AdminStaffSchema);
export const AgencySettingsModel = mongoose.models.AgencySettings || mongoose.model('AgencySettings', AgencySettingsSchema);
const CatalogItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  kind: { type: String, enum: ['combo-tours', 'flights', 'hotels'], required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });
CatalogItemSchema.index({ kind: 1, id: 1 }, { unique: true });
export const CatalogItemModel = mongoose.models.CatalogItem || mongoose.model('CatalogItem', CatalogItemSchema);

// Telegram Auth Session Schema (TTL 15 minutes)
const TelegramSessionSchema = new mongoose.Schema({
  sessionToken: { type: String, required: true, unique: true, index: true },
  chatId: { type: String, index: true },
  code: String,
  authenticated: { type: Boolean, default: false },
  attempts: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.Mixed },
  token: String,
  createdAt: { type: Date, default: Date.now, expires: 900 },
}, { timestamps: true });
export const TelegramSessionModel = mongoose.models.TelegramSession || mongoose.model('TelegramSession', TelegramSessionSchema);

let isConnected = false;
let reconnectTimer: NodeJS.Timeout | null = null;
let lastConnectionError: string | null = null;
let lastConnectionAttemptAt: string | null = null;

/**
 * Atlas/driver xatolarini foydalanuvchi tushunadigan ko'rsatmaga aylantiradi.
 */
export function diagnoseMongoError(error: unknown): string | null {
  const message = String((error as any)?.message || error || '');
  if (!message) return null;

  if (/IP whitelist|not whitelisted|whitelist.*IP|Could not connect to any servers/i.test(message)) {
    return "Atlas Network Access: joriy IP ruxsat etilmagan. Atlas → Security → Network Access → Add IP Address (server uchun 0.0.0.0/0) qo'shing.";
  }
  if (/Authentication failed|bad auth|SCRAM|credentials/i.test(message)) {
    return "Atlas foydalanuvchi nomi/paroli noto'g'ri. MONGODB_URI ichidagi maxsus belgilarni URL-encode qiling (@ → %40, # → %23, : → %3A).";
  }
  if (/ENOTFOUND|querySrv|EAI_AGAIN|DNS/i.test(message)) {
    return "DNS/SRV yechilmadi: klaster hosti xato yoki DNS filtri. MONGODB_URI'dagi hostni Atlas → Connect → Drivers bo'limidan tekshiring.";
  }
  if (/ECONNREFUSED|EHOSTUNREACH|ENETUNREACH|ECONNRESET/i.test(message)) {
    return "Tarmoq ulanishi rad etildi: 27017-port to'silgan yoki Atlas hosti noto'g'ri. Hosting provayderining outbound 27017 ruxsatini tekshiring.";
  }
  if (/timed out|ETIMEDOUT|Server selection/i.test(message)) {
    return "Server tanlanmadi: Atlas klasteri pauza (M0) holatida bo'lishi yoki tarmoq 27017-portni to'sgan bo'lishi mumkin. Atlas → Clusters → Resume.";
  }
  return null;
}

function reportConnectionFailure(error: unknown, context: string) {
  const message = String((error as any)?.message || error || 'Unknown MongoDB error');
  const hint = diagnoseMongoError(error);
  lastConnectionError = message;
  lastConnectionAttemptAt = new Date().toISOString();
  console.error(`❌ ${context}:`, message);
  if (hint) console.error(`💡 ${hint}`);
  return hint;
}

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  if (!MONGODB_URI) {
    lastConnectionError = 'MONGODB_URI belgilanmagan';
    lastConnectionAttemptAt = new Date().toISOString();
    console.error('❌ MONGODB_URI belgilanmagan — database API ishlamaydi.');
    return;
  }
  lastConnectionAttemptAt = new Date().toISOString();
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    isConnected = !!conn.connections[0].readyState;
    lastConnectionError = null;
    console.log(`✅ MongoDB Connected to database: ${conn.connection.name}`);

    if (reconnectTimer) {
      clearInterval(reconnectTimer);
      reconnectTimer = null;
    }

    // Load agency settings
    try {
      const { initAgencySettings } = await import('./src/server/services/agencySettings.js');
      await initAgencySettings();
    } catch (e: any) {
      console.warn('⚠️ Error initializing agency settings from DB:', e.message);
    }

    // Sync admin staff between MongoDB and persistent storage
    try {
      const { syncStaffWithMongoDB } = await import('./src/server/services/adminStaffStorage.js');
      await syncStaffWithMongoDB();
    } catch (e: any) {
      console.warn('⚠️ Error syncing admin staff with DB:', e.message);
    }

  } catch (error: any) {
    isConnected = false;
    reportConnectionFailure(error, 'MongoDB Connection Error');

    // Schedule background reconnect retry
    if (!reconnectTimer) {
      reconnectTimer = setInterval(async () => {
        if ((mongoose.connection.readyState as number) !== 1) {
          try {
            await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
            if ((mongoose.connection.readyState as number) === 1) {
              isConnected = true;
              lastConnectionError = null;
              console.log('✅ MongoDB background connection established!');
              if (reconnectTimer) {
                clearInterval(reconnectTimer);
                reconnectTimer = null;
              }
              const { initAgencySettings } = await import('./src/server/services/agencySettings.js');
              await initAgencySettings();
              const { syncStaffWithMongoDB } = await import('./src/server/services/adminStaffStorage.js');
              await syncStaffWithMongoDB();
            }
          } catch (error: any) {
            reportConnectionFailure(error, 'MongoDB reconnect failed');
          }
        }
      }, 30000);
    }
  }
}

export function getDBStatus() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.name || 'travelway',
    lastAttemptAt: lastConnectionAttemptAt,
    hint: lastConnectionError ? diagnoseMongoError(lastConnectionError) : null,
    // Raw driver message faqat lokal/staging muhitida ko'rsatiladi.
    lastError: isProd ? null : lastConnectionError,
  };
}
