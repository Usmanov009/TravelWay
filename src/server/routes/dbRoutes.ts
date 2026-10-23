import { Router } from 'express';
import { getDBStatus, TourModel, BookingModel, PriceAlertModel, UserModel } from '../../../db.js';
import { INITIAL_TOURS } from '../../data/mockData.js';
import { optionalAuth, authenticateToken, requireRole, AuthRequest } from '../auth.js';

const router = Router();

// In-memory fallback stores when MongoDB is buffering or offline
let memoryTours: any[] = [...INITIAL_TOURS];
let memoryBookings: any[] = [];
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

router.post('/tours', authenticateToken, requireRole('main_admin', 'tour_admin'), async (req: AuthRequest, res) => {
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

router.delete('/tours/:id', authenticateToken, requireRole('main_admin', 'tour_admin'), async (req: AuthRequest, res) => {
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
// 2. BOOKINGS ENDPOINTS (PROTECTED)
// ==========================================
router.get('/bookings', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const isDBReady = getDBStatus().connected;
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const voucherQuery = req.query.voucherId as string;

    // 1. Admins see all bookings
    if (userRole === 'main_admin' || userRole === 'tour_admin') {
      if (!isDBReady) {
        return res.json({ success: true, count: memoryBookings.length, bookings: memoryBookings, fallback: true });
      }
      const bookings = await BookingModel.find().maxTimeMS(2500).sort({ createdAt: -1 });
      return res.json({ success: true, count: bookings.length, bookings });
    }

    // 2. Authenticated customers see only their own bookings
    if (userId) {
      if (!isDBReady) {
        const userBookings = memoryBookings.filter(b => b.travelerId === userId || b.tcId === userId || b.travelerName === req.user?.name);
        return res.json({ success: true, count: userBookings.length, bookings: userBookings, fallback: true });
      }
      const bookings = await BookingModel.find({
        $or: [
          { travelerId: userId },
          { tcId: userId },
          { travelerName: req.user?.name }
        ]
      }).maxTimeMS(2500).sort({ createdAt: -1 });
      return res.json({ success: true, count: bookings.length, bookings });
    }

    // 3. Single voucher lookup if voucherId provided
    if (voucherQuery) {
      const match = memoryBookings.find(b => b.voucherId === voucherQuery);
      if (match) return res.json({ success: true, count: 1, bookings: [match] });
      if (isDBReady) {
        const dbMatch = await BookingModel.findOne({ voucherId: voucherQuery });
        if (dbMatch) return res.json({ success: true, count: 1, bookings: [dbMatch] });
      }
    }

    // 4. Anonymous visitors must NOT receive customer bookings
    return res.json({ success: true, count: 0, bookings: [] });
  } catch (err: any) {
    res.json({ success: true, count: 0, bookings: [], fallback: true });
  }
});

router.post('/bookings', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const bookingData = { ...req.body };
    if (req.user?.id) {
      bookingData.travelerId = req.user.id;
    }
    const existingIdx = memoryBookings.findIndex(b => b.id === bookingData.id);
    if (existingIdx >= 0) {
      memoryBookings[existingIdx] = { ...memoryBookings[existingIdx], ...bookingData };
    } else {
      memoryBookings.unshift(bookingData);
    }

    if (getDBStatus().connected) {
      await BookingModel.findOneAndUpdate(
        { id: bookingData.id },
        bookingData,
        { upsert: true, new: true }
      ).maxTimeMS(2500);
    }
    res.json({ success: true, booking: bookingData });
  } catch (err: any) {
    res.json({ success: true, booking: req.body, fallback: true });
  }
});

router.put('/bookings/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // Only admins or booking owners can edit bookings
    if (userRole !== 'main_admin' && userRole !== 'tour_admin') {
      const existing = memoryBookings.find(b => b.id === req.params.id);
      if (existing && existing.travelerId && existing.travelerId !== userId) {
        return res.status(403).json({ success: false, error: "Ruxsat berilmagan: Bu bron sizga tegishli emas" });
      }
    }

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

router.delete('/bookings/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    if (userRole !== 'main_admin' && userRole !== 'tour_admin') {
      const existing = memoryBookings.find(b => b.id === req.params.id);
      if (existing && existing.travelerId && existing.travelerId !== userId) {
        return res.status(403).json({ success: false, error: "Ruxsat berilmagan: Bu bron sizga tegishli emas" });
      }
    }

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
// ==========================================
// 4. USERS ENDPOINTS (PROTECTED)
// ==========================================
router.get('/users', authenticateToken, requireRole('main_admin', 'tour_admin'), async (req: AuthRequest, res) => {
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

router.get('/users/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Avtorizatsiya talab qilinadi" });
    }
    if (getDBStatus().connected) {
      const user = await UserModel.findOne({ tcId: userId });
      if (user) return res.json({ success: true, user });
    }
    const memUser = memoryUsers.find(u => u.tcId === userId);
    res.json({ success: true, user: memUser || null });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/users', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const userData = req.body;
    if (!userData || !userData.tcId) {
      return res.status(400).json({ success: false, error: "Foydalanuvchi identifikatori (tcId) kiritilmagan" });
    }

    // Authorization check: If logged in as non-admin, cannot edit another user's profile
    if (req.user && req.user.role !== 'main_admin' && req.user.role !== 'tour_admin' && req.user.id !== userData.tcId) {
      return res.status(403).json({ success: false, error: "Boshqa foydalanuvchi profilini tahrirlash taqiqlanadi" });
    }

    const existingIdx = memoryUsers.findIndex(u => u.tcId === userData.tcId);
    if (existingIdx >= 0) {
      memoryUsers[existingIdx] = { ...memoryUsers[existingIdx], ...userData };
    } else {
      memoryUsers.unshift(userData);
    }

    if (getDBStatus().connected) {
      const user = await UserModel.findOneAndUpdate(
        { tcId: userData.tcId },
        userData,
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
