import { Router } from 'express';
import { getDBStatus } from '../../../db.js';
import { 
  generateToken, 
  comparePassword, 
  authenticateToken, 
  requireRole, 
  AuthRequest 
} from '../auth.js';
import { getAgencyCommissionRate, setAgencyCommissionRate } from '../services/agencySettings.js';
import { 
  getPublicStaffList, 
  findStaffByIdentifier, 
  saveStaff, 
  deleteStaff, 
  sanitizeStaff 
} from '../services/adminStaffStorage.js';

const router = Router();

// ==========================================
// 1. ADMIN AUTHENTICATION (LOGIN)
// ==========================================
router.post('/login', async (req, res) => {
  const { username, password } = req.body || {};
  const inputUser = (username || '').trim().toLowerCase();
  const inputPass = (password || '').trim();

  if (!inputUser || !inputPass) {
    return res.status(400).json({
      success: false,
      error: "Login va parol kiritilishi shart!"
    });
  }
  if (!getDBStatus().connected) {
    return res.status(503).json({
      success: false,
      error: 'MongoDB ulanmagan. Admin tizimiga kirish uchun database kerak.',
    });
  }

  // Strip quotes and trim environment variables
  const cleanEnv = (val?: string) => (val || '').replace(/^["']|["']$/g, '').trim();
  const validUser = cleanEnv(process.env.ADMIN_USERNAME).toLowerCase();
  const validPass = cleanEnv(process.env.ADMIN_PASSWORD);

  // 1. Super / Main Admin check (accepts 'admin', 'admin@sayrhub.uz', 'admin@travelway.uz' or custom ADMIN_USERNAME)
  const isUserMatched = Boolean(validUser && inputUser === validUser);
  const isPassMatched = Boolean(validPass && inputPass === validPass);

  if (isUserMatched && isPassMatched) {
    const adminUser = {
      id: 'adm-root',
      name: 'Bosh Admin',
      username: 'admin',
      role: 'main_admin' as const,
      roleTitle: 'Bosh Admin (Super)',
      email: validUser,
      avatar: '',
    };

    const token = generateToken(adminUser, '7d');

    return res.json({
      success: true,
      role: 'main_admin',
      adminUser,
      token
    });
  }

  // Authenticate staff accounts stored in MongoDB.
  try {
    const staff = await findStaffByIdentifier(inputUser);

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
          adminUser: sanitizeStaff(staff),
          token
        });
      }
    }
  } catch (err: any) {
    console.warn('Error during admin staff login lookup:', err?.message);
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
  if (!getDBStatus().connected) {
    return res.status(503).json({ success: false, error: 'MongoDB ulanmagan; admin ro‘yxati mavjud emas.' });
  }
  try {
    const staffList = await getPublicStaffList();
    res.json({ success: true, staff: staffList });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/staff', authenticateToken, requireRole('main_admin'), async (req: AuthRequest, res) => {
  if (!getDBStatus().connected) {
    return res.status(503).json({ success: false, error: 'MongoDB ulanmagan; admin xodimi saqlanmadi.' });
  }
  try {
    const result = await saveStaff(req.body);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/staff/:id', authenticateToken, requireRole('main_admin'), async (req: AuthRequest, res) => {
  if (!getDBStatus().connected) {
    return res.status(503).json({ success: false, error: 'MongoDB ulanmagan; admin xodimi o‘chirilmadi.' });
  }
  try {
    const result = await deleteStaff(req.params.id);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. AGENCY COMMISSION (EDITABLE BY ALL ADMINS & PERSISTED)
// ==========================================

router.get('/commission', (_req, res) => {
  if (!getDBStatus().connected) {
    return res.status(503).json({ success: false, error: 'MongoDB ulanmagan; agentlik sozlamalari mavjud emas.' });
  }
  try {
    const currentRate = getAgencyCommissionRate();
    return res.json({ success: true, commissionRate: currentRate });
  } catch (error) {
    console.error('Agency settings read failed:', error);
    return res.status(500).json({ success: false, error: 'Agentlik sozlamalarini olib bo‘lmadi.' });
  }
});

router.post('/commission', authenticateToken, requireRole('main_admin', 'tour_admin'), async (req: AuthRequest, res) => {
  try {
    const { commissionRate } = req.body;
    const num = Number(commissionRate);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      const savedRate = await setAgencyCommissionRate(num, req.user?.username || 'admin');
      return res.json({ success: true, commissionRate: savedRate });
    }
    res.status(400).json({ success: false, error: "Komissiya foizi 0 dan 100 gacha bo'lishi kerak" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
