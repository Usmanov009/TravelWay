import { Router } from 'express';
import { getDBStatus, TourModel, BookingModel, PriceAlertModel, UserModel } from '../../../db.js';
import { INITIAL_TOURS } from '../../data/mockData.js';
import { optionalAuth, AuthRequest } from '../auth.js';

const router = Router();

// In-memory fallback stores when MongoDB is buffering or offline
let memoryTours: any[] = [...INITIAL_TOURS];
let memoryBookings: any[] = [
  {
    id: 'BK-99120',
    tourTitle: 'Rixos Premium Belek 5* Deluxe',
    dest: 'Antalya, Turkiya',
    dates: '12.06.2025 - 19.06.2025',
    status: 'Tasdiqlangan',
    voucherId: 'VCH-TR-88219',
    price: '$740',
    totalNumeric: 740,
    travelerName: 'Sardor Alimov',
    type: 'active',
    startDate: '2025-06-12',
    endDate: '2025-06-19',
    hotelImg: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    flight: 'HY 3501 (Toshkent — Antalya)',
    airline: 'Uzbekistan Airways',
    nightsCount: 7
  }
];
let memoryPriceAlerts: any[] = [];
let memoryUsers: any[] = [];

// DB Health / Connection Status
router.get('/status', (req, res) => {
  res.json({ success: true, ...getDBStatus() });
});

// ==========================================
// 1. TOURS ENDPOINTS (FIXES MISSING ENDPOINTS)
// ==========================================
router.get('/tours', async (req, res) => {
  try {
    const isDBReady = getDBStatus().connected;
    if (!isDBReady) {
      return res.json({ success: true, count: memoryTours.length, tours: memoryTours, fallback: true });
    }
    const dbTours = await TourModel.find().maxTimeMS(2500).sort({ createdAt: -1 });
    if (!dbTours || dbTours.length === 0) {
      return res.json({ success: true, count: memoryTours.length, tours: memoryTours, fallback: true });
    }
    res.json({ success: true, count: dbTours.length, tours: dbTours });
  } catch (err: any) {
    res.json({ success: true, count: memoryTours.length, tours: memoryTours, fallback: true });
  }
});

router.post('/tours', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const tourData = req.body;
    if (!tourData || !tourData.id) {
      return res.status(400).json({ success: false, error: "Tur ma'lumotlari yoki id kiritilmagan" });
    }

    // Update in-memory fallback
    const existingIdx = memoryTours.findIndex(t => t.id === tourData.id);
    if (existingIdx >= 0) {
      memoryTours[existingIdx] = { ...memoryTours[existingIdx], ...tourData };
    } else {
      memoryTours.unshift(tourData);
    }

    if (getDBStatus().connected) {
      await TourModel.findOneAndUpdate(
        { id: tourData.id },
        tourData,
        { upsert: true, new: true }
      ).maxTimeMS(2500);
    }

    res.json({ success: true, tour: tourData });
  } catch (err: any) {
    res.json({ success: true, tour: req.body, fallback: true });
  }
});

router.delete('/tours/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const tourId = req.params.id;
    memoryTours = memoryTours.filter(t => t.id !== tourId);

    if (getDBStatus().connected) {
      await TourModel.deleteOne({ id: tourId }).maxTimeMS(2500);
    }

    res.json({ success: true, id: tourId });
  } catch (err: any) {
    res.json({ success: true, fallback: true, id: req.params.id });
  }
});

// ==========================================
// 2. BOOKINGS ENDPOINTS
// ==========================================
router.get('/bookings', async (req, res) => {
  try {
    const isDBReady = getDBStatus().connected;
    if (!isDBReady) {
      return res.json({ success: true, count: memoryBookings.length, bookings: memoryBookings, fallback: true });
    }
    const bookings = await BookingModel.find().maxTimeMS(2500).sort({ createdAt: -1 });
    res.json({ success: true, count: bookings.length, bookings });
  } catch (err: any) {
    res.json({ success: true, count: memoryBookings.length, bookings: memoryBookings, fallback: true });
  }
});

router.post('/bookings', async (req, res) => {
  try {
    const bookingData = req.body;
    const existingIdx = memoryBookings.findIndex(b => b.id === bookingData.id);
    if (existingIdx >= 0) {
      memoryBookings[existingIdx] = { ...memoryBookings[existingIdx], ...bookingData };
    } else {
      memoryBookings.unshift(bookingData);
    }

    if (getDBStatus().connected) {
      await BookingModel.findOneAndUpdate(
        { id: req.body.id },
        req.body,
        { upsert: true, new: true }
      ).maxTimeMS(2500);
    }
    res.json({ success: true, booking: bookingData });
  } catch (err: any) {
    res.json({ success: true, booking: req.body, fallback: true });
  }
});

router.put('/bookings/:id', async (req, res) => {
  try {
    const existingIdx = memoryBookings.findIndex(b => b.id === req.params.id);
    if (existingIdx >= 0) {
      memoryBookings[existingIdx] = { ...memoryBookings[existingIdx], ...req.body };
    }
    if (getDBStatus().connected) {
      await BookingModel.findOneAndUpdate(
        { id: req.params.id },
        { $set: req.body },
        { new: true }
      ).maxTimeMS(2500);
    }
    res.json({ success: true, booking: memoryBookings[existingIdx] || req.body });
  } catch (err: any) {
    res.json({ success: true, booking: req.body, fallback: true });
  }
});

router.delete('/bookings/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    memoryBookings = memoryBookings.filter(b => b.id !== req.params.id);
    if (getDBStatus().connected) {
      await BookingModel.deleteOne({ id: req.params.id }).maxTimeMS(2500);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.json({ success: true, fallback: true });
  }
});

// ==========================================
// 3. PRICE ALERTS ENDPOINTS
// ==========================================
router.get('/price-alerts', async (req, res) => {
  try {
    if (!getDBStatus().connected) {
      return res.json({ success: true, count: memoryPriceAlerts.length, alerts: memoryPriceAlerts, fallback: true });
    }
    const alerts = await PriceAlertModel.find().maxTimeMS(2500).sort({ createdAt: -1 });
    res.json({ success: true, count: alerts.length, alerts });
  } catch (err: any) {
    res.json({ success: true, count: memoryPriceAlerts.length, alerts: memoryPriceAlerts, fallback: true });
  }
});

router.post('/price-alerts', async (req, res) => {
  try {
    const alertData = req.body;
    const existingIdx = memoryPriceAlerts.findIndex(a => a.id === alertData.id);
    if (existingIdx >= 0) {
      memoryPriceAlerts[existingIdx] = { ...memoryPriceAlerts[existingIdx], ...alertData };
    } else {
      memoryPriceAlerts.unshift(alertData);
    }
    if (getDBStatus().connected) {
      await PriceAlertModel.findOneAndUpdate(
        { id: req.body.id },
        req.body,
        { upsert: true, new: true }
      ).maxTimeMS(2500);
    }
    res.json({ success: true, alert: alertData });
  } catch (err: any) {
    res.json({ success: true, alert: req.body, fallback: true });
  }
});

router.delete('/price-alerts/:id', async (req, res) => {
  try {
    memoryPriceAlerts = memoryPriceAlerts.filter(a => a.id !== req.params.id);
    if (getDBStatus().connected) {
      await PriceAlertModel.deleteOne({ id: req.params.id }).maxTimeMS(2500);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.json({ success: true, fallback: true });
  }
});

// ==========================================
// 4. USERS ENDPOINTS
// ==========================================
router.get('/users', async (req, res) => {
  try {
    if (!getDBStatus().connected) {
      return res.json({ success: true, count: memoryUsers.length, users: memoryUsers, fallback: true });
    }
    const users = await UserModel.find().maxTimeMS(2500).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (err: any) {
    res.json({ success: true, count: memoryUsers.length, users: memoryUsers, fallback: true });
  }
});

router.post('/users', async (req, res) => {
  try {
    const userData = req.body;
    const existingIdx = memoryUsers.findIndex(u => u.tcId === userData.tcId);
    if (existingIdx >= 0) {
      memoryUsers[existingIdx] = { ...memoryUsers[existingIdx], ...userData };
    } else {
      memoryUsers.unshift(userData);
    }

    if (getDBStatus().connected) {
      const user = await UserModel.findOneAndUpdate(
        { tcId: req.body.tcId },
        req.body,
        { upsert: true, new: true }
      ).maxTimeMS(2500);
      return res.json({ success: true, user });
    }
    res.json({ success: true, user: userData, fallback: true });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
