import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
}, { timestamps: true });

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
  citizenship: String,
  cashbackBalance: { type: Number, default: 0 },
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
  agencyCommissionRate: { type: Number, default: 8 },
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

let isConnected = false;
let reconnectTimer: NodeJS.Timeout | null = null;

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  if (!MONGODB_URI) {
    console.log('ℹ️ MONGODB_URI belgilanmagan — tizim xavfsiz in-memory zaxira rejimida ishlaydi.');
    return;
  }
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = !!conn.connections[0].readyState;
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

    // Auto-seed initial tours and bookings if empty
    const tourCount = await TourModel.countDocuments();
    if (tourCount === 0) {
      try {
        const { INITIAL_TOURS } = await import('./src/data/mockData.js');
        if (Array.isArray(INITIAL_TOURS) && INITIAL_TOURS.length > 0) {
          await TourModel.insertMany(INITIAL_TOURS);
          console.log(` Seeded ${INITIAL_TOURS.length} initial tours into MongoDB`);
        }
      } catch (seedErr: any) {
        console.warn(' Auto-seed warning:', seedErr.message);
      }
    }
  } catch (error: any) {
    isConnected = false;
    console.error(' MongoDB Connection Error:', error.message);

    // Schedule background reconnect retry
    if (!reconnectTimer) {
      reconnectTimer = setInterval(async () => {
        if ((mongoose.connection.readyState as number) !== 1) {
          try {
            await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
            if ((mongoose.connection.readyState as number) === 1) {
              isConnected = true;
              console.log('✅ MongoDB background connection established!');
              if (reconnectTimer) {
                clearInterval(reconnectTimer);
                reconnectTimer = null;
              }
              const { syncStaffWithMongoDB } = await import('./src/server/services/adminStaffStorage.js');
              await syncStaffWithMongoDB();
            }
          } catch { }
        }
      }, 30000);
    }
  }
}

export function getDBStatus() {
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    dbName: mongoose.connection.name || 'travelway'
  };
}
