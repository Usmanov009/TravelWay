import { Router } from 'express';
import { AdminStaffModel } from '../../../db.js';
import { 
  generateToken, 
  comparePassword, 
  hashPassword, 
  authenticateToken, 
  requireRole, 
  optionalAuth,
  AuthRequest 
} from '../auth.js';

const router = Router();

// ==========================================
// 1. ADMIN AUTHENTICATION (LOGIN)
// ==========================================
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const isProd = process.env.NODE_ENV === 'production';
  const validUser = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
  const validPass = process.env.ADMIN_PASSWORD;

  const inputUser = (username || '').trim().toLowerCase();
  const inputPass = (password || '').trim();

  // 1. Super / Main Admin check (from environment)
  const isEnvAdminMatched = validPass 
    ? (inputUser === validUser || inputUser === 'admin@sayrhub.uz' || inputUser === 'admin@travelway.uz') && (inputPass === validPass)
    : (!isProd && (inputUser === validUser || inputUser === 'admin@sayrhub.uz' || inputUser === 'admin@travelway.uz') && (inputPass === 'admin123'));

  if (isEnvAdminMatched) {
    const adminUser = {
      id: 'adm-root',
      name: 'Bosh Admin',
      username: 'admin',
      role: 'main_admin' as const,
      roleTitle: 'Bosh Admin (Super)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    };

    const token = generateToken(adminUser, '7d');

    return res.json({
      success: true,
      role: 'main_admin',
      adminUser,
      token
    });
  }

  // 2. Check Tour Admins in MongoDB
  try {
    const staff = await AdminStaffModel.findOne({
      $or: [
        { username: inputUser },
        { email: inputUser }
      ]
    });

    if (staff) {
      const isPasswordValid = await comparePassword(inputPass, staff.password);
      if (isPasswordValid) {
        if (staff.status === 'suspended') {
          return res.status(403).json({
            success: false,
            error: "Bu admin hisobi to'xtatilgan (faol emas)!"
          });
        }

        const adminPayload = {
          id: staff.id,
          username: staff.username,
          role: (staff.role || 'tour_admin') as 'main_admin' | 'tour_admin',
          name: staff.name
        };

        const token = generateToken(adminPayload, '7d');

        return res.json({
          success: true,
          role: staff.role || 'tour_admin',
          adminUser: staff,
          token
        });
      }
    }
  } catch (dbErr: any) {
    console.warn('DB check for admin staff login error:', dbErr?.message);
  }

  res.status(401).json({
    success: false,
    error: "Login yoki parol noto'g'ri! Iltimos, qaytadan urinib ko'ring."
  });
});

// ==========================================
// 2. ADMIN STAFF MANAGEMENT (PROTECTED)
// ==========================================
router.get('/staff', authenticateToken, requireRole('main_admin', 'tour_admin'), async (req: AuthRequest, res) => {
  try {
    const staff = await AdminStaffModel.find().sort({ createdAt: -1 });
    // Remove hashed password from returned payload for security
    const sanitizedStaff = staff.map((s: any) => {
      const obj = s.toObject ? s.toObject() : { ...s };
      delete obj.password;
      return obj;
    });
    res.json({ success: true, staff: sanitizedStaff });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message, staff: [] });
  }
});

router.post('/staff', authenticateToken, requireRole('main_admin'), async (req: AuthRequest, res) => {
  try {
    const { id, username, password } = req.body;
    const cleanUsername = (username || '').trim().toLowerCase();

    // Check if username already used by another staff
    if (cleanUsername) {
      const existing = await AdminStaffModel.findOne({
        username: cleanUsername,
        id: { $ne: id }
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: "Bu login bilan boshqa admin mavjud! Iltimos, boshqa login tanlang."
        });
      }
    }

    const payloadToSave = { ...req.body, username: cleanUsername };
    if (password && !password.startsWith('$2a$') && !password.startsWith('$2b$')) {
      payloadToSave.password = await hashPassword(password);
    }

    const staff = await AdminStaffModel.findOneAndUpdate(
      { id: req.body.id },
      payloadToSave,
      { upsert: true, new: true }
    );

    const safeStaff = staff.toObject ? staff.toObject() : { ...staff };
    delete safeStaff.password;

    res.json({ success: true, staff: safeStaff });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/staff/:id', authenticateToken, requireRole('main_admin'), async (req: AuthRequest, res) => {
  try {
    await AdminStaffModel.findOneAndDelete({ id: req.params.id });
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. AGENCY COMMISSION (EDITABLE BY ALL ADMINS)
// ==========================================
let agencyCommissionRate: number = 8;

router.get('/commission', (req, res) => {
  res.json({ success: true, commissionRate: agencyCommissionRate });
});

router.post('/commission', authenticateToken, requireRole('main_admin', 'tour_admin'), (req: AuthRequest, res) => {
  try {
    const { commissionRate } = req.body;
    const num = Number(commissionRate);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      agencyCommissionRate = num;
      return res.json({ success: true, commissionRate: agencyCommissionRate });
    }
    res.status(400).json({ success: false, error: "Komissiya foizi 0 dan 100 gacha bo'lishi kerak" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
