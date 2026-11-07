import { NextFunction, Request, Response, Router } from 'express';
import {
  BookingModel,
  CatalogItemModel,
  getDBStatus,
  PriceAlertModel,
  TourModel,
  UserModel,
} from '../../../db.js';
import { authenticateToken, AuthRequest, optionalAuth, requireRole } from '../auth.js';

const router = Router();
const adminRoles = ['main_admin', 'tour_admin'];
const catalogKinds = ['combo-tours', 'flights', 'hotels'] as const;
type CatalogKind = typeof catalogKinds[number];

function requireDatabase(_req: Request, res: Response, next: NextFunction) {
  if (!getDBStatus().connected) {
    return res.status(503).json({
      success: false,
      error: 'MongoDB bilan aloqa yo‘q. Ma’lumotlar saqlanmadi; database sozlamasini tekshiring.',
    });
  }
  next();
}

function requireActiveUser(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== 'user') return next();
  UserModel.findOne({ tcId: req.user.id }).select('status').lean()
    .then((user) => {
      if (!user || user.status === 'blocked') {
        return res.status(403).json({ success: false, error: 'Foydalanuvchi akkaunti faol emas.' });
      }
      next();
    })
    .catch((error) => sendDatabaseError(res, error));
}

function sendDatabaseError(res: Response, error: unknown) {
  console.error('Database request failed:', error);
  return res.status(500).json({
    success: false,
    error: 'Ma’lumotlar bazasiga murojaat qilish amalga oshmadi.',
  });
}

function isAdmin(req: AuthRequest) {
  return adminRoles.includes(req.user?.role || '');
}

router.get('/status', (_req, res) => {
  res.json({ success: true, ...getDBStatus() });
});

router.get('/tours', requireDatabase, async (_req, res) => {
  try {
    const tours = await TourModel.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, count: tours.length, tours });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

router.post('/tours', authenticateToken, requireRole(...adminRoles), requireDatabase, async (req: AuthRequest, res) => {
  try {
    const tour = req.body;
    if (!tour?.id || !tour?.title) {
      return res.status(400).json({ success: false, error: 'Tur ID va nomi kiritilishi shart.' });
    }
    const { _id: _ignoredId, __v: _ignoredVersion, ...tourData } = tour;
    const savedTour = await TourModel.findOneAndUpdate(
      { id: String(tour.id) },
      { $set: tourData },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean();
    return res.json({ success: true, tour: savedTour });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

router.delete('/tours/:id', authenticateToken, requireRole(...adminRoles), requireDatabase, async (req, res) => {
  try {
    const result = await TourModel.deleteOne({ id: req.params.id });
    return result.deletedCount
      ? res.json({ success: true, id: req.params.id })
      : res.status(404).json({ success: false, error: 'Tur topilmadi.' });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

router.get('/catalog/:kind', requireDatabase, async (req, res) => {
  const kind = req.params.kind as CatalogKind;
  if (!catalogKinds.includes(kind)) {
    return res.status(404).json({ success: false, error: 'Katalog turi topilmadi.' });
  }
  try {
    const entries = await CatalogItemModel.find({ kind }).sort({ createdAt: -1 }).lean();
    return res.json({
      success: true,
      count: entries.length,
      items: entries.map(({ data }) => data),
    });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

router.post('/catalog/:kind', authenticateToken, requireRole(...adminRoles), requireDatabase, async (req, res) => {
  const kind = req.params.kind as CatalogKind;
  if (!catalogKinds.includes(kind)) {
    return res.status(404).json({ success: false, error: 'Katalog turi topilmadi.' });
  }
  const item = req.body;
  const hasName = kind === 'hotels' ? Boolean(item?.name) : kind === 'flights'
    ? Boolean(item?.flightNumber) : Boolean(item?.title);
  if (!item?.id || !hasName) {
    return res.status(400).json({ success: false, error: 'Katalog elementi ID va nomga ega bo‘lishi kerak.' });
  }
  try {
    await CatalogItemModel.findOneAndUpdate(
      { kind, id: String(item.id) },
      { $set: { data: item } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    );
    return res.json({ success: true, item });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

router.delete('/catalog/:kind/:id', authenticateToken, requireRole(...adminRoles), requireDatabase, async (req, res) => {
  const kind = req.params.kind as CatalogKind;
  if (!catalogKinds.includes(kind)) {
    return res.status(404).json({ success: false, error: 'Katalog turi topilmadi.' });
  }
  try {
    const result = await CatalogItemModel.deleteOne({ kind, id: req.params.id });
    return result.deletedCount
      ? res.json({ success: true, id: req.params.id })
      : res.status(404).json({ success: false, error: 'Katalog elementi topilmadi.' });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

router.get('/bookings', optionalAuth, requireDatabase, async (req: AuthRequest, res) => {
  try {
    let query: any = {};
    if (isAdmin(req)) {
      query = {};
    } else if (req.user) {
      query = { travelerId: req.user.id };
    } else if (req.query.voucherId) {
      query = { voucherId: String(req.query.voucherId) };
    } else if (req.query.travelerId) {
      query = { travelerId: String(req.query.travelerId) };
    } else if (req.query.phone) {
      query = { travelerPhone: String(req.query.phone) };
    } else {
      query = {};
    }
    const bookings = await BookingModel.find(query).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

router.post('/bookings', optionalAuth, requireDatabase, async (req: AuthRequest, res) => {
  const booking = req.body;
  if (!booking?.id || !booking?.tourTitle) {
    return res.status(400).json({ success: false, error: 'Bron ID va tur nomi kiritilishi shart.' });
  }
  try {
    const travelerId = isAdmin(req)
      ? (booking.travelerId || req.user?.id || 'guest')
      : (req.user?.id || booking.travelerId || 'guest');
    const savedBooking = await BookingModel.findOneAndUpdate(
      { id: String(booking.id) },
      { $set: { ...booking, travelerId } },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true },
    ).lean();
    return res.json({ success: true, booking: savedBooking });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

router.put('/bookings/:id', optionalAuth, requireDatabase, async (req: AuthRequest, res) => {
  const query = isAdmin(req) || !req.user
    ? { id: req.params.id }
    : { id: req.params.id, travelerId: req.user.id };
  const update = isAdmin(req)
    ? req.body
    : {
      status: 'Bekor qilingan',
      type: 'cancelled',
      cancellationReason: String(req.body.cancellationReason || ''),
      cancelledAt: String(req.body.cancelledAt || new Date().toISOString()),
    };
  try {
    const booking = await BookingModel.findOneAndUpdate(
      query,
      { $set: update },
      { new: true, runValidators: true },
    ).lean();
    return booking
      ? res.json({ success: true, booking })
      : res.status(404).json({ success: false, error: 'Bron topilmadi yoki ruxsat yo‘q.' });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

router.delete('/bookings/:id', authenticateToken, requireDatabase, requireActiveUser, async (req: AuthRequest, res) => {
  const query = isAdmin(req)
    ? { id: req.params.id }
    : { id: req.params.id, travelerId: req.user?.id };
  try {
    const result = await BookingModel.deleteOne(query);
    return result.deletedCount
      ? res.json({ success: true })
      : res.status(404).json({ success: false, error: 'Bron topilmadi yoki ruxsat yo‘q.' });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

router.get('/price-alerts', optionalAuth, requireDatabase, async (req: AuthRequest, res) => {
  try {
    const query = isAdmin(req) || !req.user
      ? (req.query.userId ? { userId: String(req.query.userId) } : {})
      : { userId: req.user.id };
    const alerts = await PriceAlertModel.find(query).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, count: alerts.length, alerts });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

router.post('/price-alerts', optionalAuth, requireDatabase, async (req: AuthRequest, res) => {
  const alert = req.body;
  if (!alert?.id || !alert?.tourId) {
    return res.status(400).json({ success: false, error: 'Narx signali ID va tur ID talab qiladi.' });
  }
  try {
    const userId = req.user?.id || alert.userId || 'guest';
    const savedAlert = await PriceAlertModel.findOneAndUpdate(
      { id: String(alert.id) },
      { $set: { ...alert, userId } },
      { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true },
    ).lean();
    return res.json({ success: true, alert: savedAlert });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

router.delete('/price-alerts/:id', optionalAuth, requireDatabase, async (req: AuthRequest, res) => {
  try {
    const query = isAdmin(req) || !req.user
      ? { id: req.params.id }
      : { id: req.params.id, userId: req.user?.id };
    const result = await PriceAlertModel.deleteOne(query);
    return result.deletedCount
      ? res.json({ success: true })
      : res.status(404).json({ success: false, error: 'Narx signali topilmadi yoki ruxsat yo‘q.' });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

router.get('/users', authenticateToken, requireRole(...adminRoles), requireDatabase, async (_req, res) => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 }).lean();
    const bookingCounts = await BookingModel.aggregate([
      { $group: { _id: '$travelerId', bookingsCount: { $sum: 1 }, totalSpentUSD: { $sum: '$totalNumeric' } } },
    ]);
    const byId = new Map(bookingCounts.map((entry) => [entry._id, entry]));
    const results = users.map((user) => {
      const booking = byId.get(user.tcId);
      return {
        ...user,
        id: user.tcId,
        cashback: user.cashbackBalance || 0,
        bookingsCount: booking?.bookingsCount || 0,
        totalSpentUSD: booking?.totalSpentUSD || 0,
        registeredAt: user.createdAt,
        status: user.status || 'active',
      };
    });
    return res.json({ success: true, count: results.length, users: results });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

router.get('/users/count', authenticateToken, requireRole(...adminRoles), requireDatabase, async (_req, res) => {
  try {
    const count = await UserModel.countDocuments();
    return res.json({ success: true, count });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

router.get('/users/me', authenticateToken, requireDatabase, async (req: AuthRequest, res) => {
  if (req.user?.role !== 'user') {
    return res.status(403).json({ success: false, error: 'Foydalanuvchi akkaunti talab qilinadi.' });
  }
  try {
    const user = await UserModel.findOne({ tcId: req.user.id }).lean();
    if (!user) return res.status(404).json({ success: false, error: 'Foydalanuvchi profili topilmadi.' });
    if (user.status === 'blocked') return res.status(403).json({ success: false, error: 'Foydalanuvchi akkaunti bloklangan.' });
    return res.json({ success: true, user });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

router.post('/users', authenticateToken, requireDatabase, requireActiveUser, async (req: AuthRequest, res) => {
  const user = req.body;
  if (!user?.tcId || req.user?.role !== 'user' || req.user.id !== user.tcId) {
    return res.status(403).json({ success: false, error: 'Faqat o‘z profilingizni saqlashingiz mumkin.' });
  }
  const profile = {
    tcId: String(user.tcId),
    name: String(user.name || ''),
    phone: String(user.phone || ''),
    email: String(user.email || ''),
    telegramId: String(user.telegramId || ''),
    telegramUsername: String(user.telegramUsername || ''),
    passportNumber: String(user.passportNumber || ''),
    passportExpiry: String(user.passportExpiry || ''),
    dob: String(user.dob || ''),
    cashbackBalance: Number(user.cashbackBalance ?? user.cashback ?? 0),
    isVerified: Boolean(user.isVerified),
    favoriteTourIds: Array.isArray(user.favoriteTourIds) ? user.favoriteTourIds.map(String) : [],
    paymentCards: Array.isArray(user.paymentCards) ? user.paymentCards : [],
  };
  try {
    const savedUser = await UserModel.findOneAndUpdate(
      { tcId: profile.tcId },
      { $set: profile, $setOnInsert: { status: 'active' } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean();
    return res.json({ success: true, user: savedUser });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

router.patch('/users/:tcId/status', authenticateToken, requireRole('main_admin'), requireDatabase, async (req, res) => {
  const status = req.body?.status;
  if (status !== 'active' && status !== 'blocked') {
    return res.status(400).json({ success: false, error: 'Foydalanuvchi holati yaroqsiz.' });
  }
  try {
    const user = await UserModel.findOneAndUpdate(
      { tcId: req.params.tcId },
      { $set: { status } },
      { new: true, runValidators: true },
    ).lean();
    return user
      ? res.json({ success: true, user })
      : res.status(404).json({ success: false, error: 'Foydalanuvchi topilmadi.' });
  } catch (error) {
    return sendDatabaseError(res, error);
  }
});

export default router;
