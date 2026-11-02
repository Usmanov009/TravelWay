import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { AdminStaffModel } from '../../../db.js';
import { hashPassword } from '../auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Root data folder for persistent fallback
const DATA_DIR = path.resolve(__dirname, '../../../data');
const STORAGE_FILE = path.join(DATA_DIR, 'adminStaffStorage.json');

export interface AdminStaffRecord {
  id: string;
  name: string;
  username: string;
  password: string; // bcrypt hash
  email?: string;
  phone?: string;
  role: 'main_admin' | 'tour_admin';
  roleTitle?: string;
  avatar?: string;
  assignedDestinations?: string[];
  canManageUsers?: boolean;
  canManageStaff?: boolean;
  canDeleteTours?: boolean;
  canEditFinancials?: boolean;
  canManageBookings?: boolean;
  canManageCatalog?: boolean;
  createdAt?: string;
  lastActive?: string;
  status: 'active' | 'suspended';
}

function isMongoReady(): boolean {
  return mongoose.connection.readyState === 1;
}

// In-memory cache synced with disk file
let staffCache: AdminStaffRecord[] = [];
let isInitialized = false;

// Default tour admin seed
const DEFAULT_TOUR_ADMIN: AdminStaffRecord = {
  id: 'staff-tour-1',
  name: 'Azizbek Rahimov',
  username: 'tour_admin',
  password: '$2a$10$vU32iLz7qg5vT6Z0c8HZeOUeTfJc5xU2N1E7C4c.XJ3yB8eE9U2qK', // bcrypt for 'tour123'
  email: 'tour@sayrhub.uz',
  phone: '+998 90 123 45 67',
  role: 'tour_admin',
  roleTitle: 'Tur Admin (Operatsion)',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  assignedDestinations: ['Turkiya', 'BAA', 'Misr', 'Tailand', 'Maldiv'],
  canManageUsers: false,
  canManageStaff: false,
  canDeleteTours: true,
  canEditFinancials: true,
  canManageBookings: true,
  canManageCatalog: true,
  createdAt: '2026-01-15',
  lastActive: 'Hozir faol',
  status: 'active'
};

/**
 * Initialize cache from disk file or defaults
 */
function initStorage() {
  if (isInitialized) return;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORAGE_FILE)) {
      const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        staffCache = parsed;
        isInitialized = true;
        return;
      }
    }
  } catch (err: any) {
    console.warn('⚠️ Error loading admin staff storage file:', err.message);
  }

  // Seed default if empty
  staffCache = [DEFAULT_TOUR_ADMIN];
  saveToDisk();
  isInitialized = true;
}

/**
 * Persist staff cache to disk file
 */
function saveToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(staffCache, null, 2), 'utf-8');
  } catch (err: any) {
    console.warn('⚠️ Error saving admin staff storage file:', err.message);
  }
}

/**
 * Sanitize staff record for safe public/frontend transmission
 */
export function sanitizeStaff(staff: any): any {
  if (!staff) return null;
  const obj = staff.toObject ? staff.toObject() : { ...staff };
  delete obj.password;
  delete obj.plainPassword;
  delete obj.__v;
  return obj;
}

/**
 * Synchronize staff between MongoDB and disk storage
 */
export async function syncStaffWithMongoDB(): Promise<void> {
  initStorage();
  if (!isMongoReady()) return;

  try {
    const dbStaff = await AdminStaffModel.find().lean() as any[];

    if (!dbStaff || dbStaff.length === 0) {
      // Seed MongoDB with existing cache
      for (const item of staffCache) {
        await AdminStaffModel.findOneAndUpdate(
          { id: item.id },
          { $set: item },
          { upsert: true, new: true }
        );
      }
      console.log(`✅ Seeded ${staffCache.length} admin staff into MongoDB from local storage`);
      return;
    }

    // Merge: Add any staff from DB to cache
    const dbMap = new Map<string, AdminStaffRecord>();
    for (const s of dbStaff) {
      const record: AdminStaffRecord = {
        id: s.id,
        name: s.name,
        username: (s.username || '').toLowerCase().trim(),
        password: s.password,
        email: s.email ? s.email.toLowerCase().trim() : undefined,
        phone: s.phone,
        role: s.role || 'tour_admin',
        roleTitle: s.roleTitle || 'Tur Admin',
        avatar: s.avatar,
        assignedDestinations: s.assignedDestinations,
        canManageUsers: s.canManageUsers,
        canManageStaff: s.canManageStaff,
        canDeleteTours: s.canDeleteTours,
        canEditFinancials: s.canEditFinancials,
        canManageBookings: s.canManageBookings,
        canManageCatalog: s.canManageCatalog,
        createdAt: s.createdAt,
        lastActive: s.lastActive,
        status: s.status || 'active'
      };
      dbMap.set(record.username, record);
      if (record.id) dbMap.set(record.id, record);
    }

    // Check if local cache has staff not yet in DB
    for (const localItem of staffCache) {
      if (!dbMap.has(localItem.username) && !dbMap.has(localItem.id)) {
        await AdminStaffModel.findOneAndUpdate(
          { id: localItem.id },
          { $set: localItem },
          { upsert: true, new: true }
        );
        dbMap.set(localItem.username, localItem);
      }
    }

    // Update staff cache from merged list
    const uniqueStaff = Array.from(
      new Map(Array.from(dbMap.values()).map(s => [s.id || s.username, s])).values()
    );
    staffCache = uniqueStaff;
    saveToDisk();
    console.log(`🔄 Synced admin staff: ${staffCache.length} active admins available across MongoDB & local storage`);
  } catch (err: any) {
    console.warn('⚠️ Error during admin staff sync with MongoDB:', err.message);
  }
}

/**
 * Get all staff records (includes passwords for internal auth check only)
 */
export async function getAllStaff(): Promise<AdminStaffRecord[]> {
  initStorage();

  if (isMongoReady()) {
    try {
      const dbStaff = await AdminStaffModel.find().sort({ createdAt: -1 }).lean() as any[];
      if (dbStaff && dbStaff.length > 0) {
        return dbStaff as AdminStaffRecord[];
      }
    } catch (err: any) {
      console.warn('DB read staff error, using cache:', err.message);
    }
  }

  return staffCache;
}

/**
 * Get sanitized public staff list for frontend
 */
export async function getPublicStaffList(): Promise<any[]> {
  const staff = await getAllStaff();
  return staff.map(sanitizeStaff);
}

/**
 * Find admin staff by username or email (case-insensitive)
 */
export async function findStaffByIdentifier(identifier: string): Promise<AdminStaffRecord | null> {
  initStorage();
  const clean = (identifier || '').trim().toLowerCase();
  if (!clean) return null;

  // 1. Check MongoDB first if connected
  if (isMongoReady()) {
    try {
      const dbStaff = await AdminStaffModel.findOne({
        $or: [
          { username: clean },
          { email: clean }
        ]
      }).lean();

      if (dbStaff) {
        return dbStaff as AdminStaffRecord;
      }
    } catch (err: any) {
      console.warn('DB findStaffByIdentifier error, using cache:', err.message);
    }
  }

  // 2. Fallback to cache / persistent storage
  const found = staffCache.find(s => 
    (s.username || '').toLowerCase() === clean || 
    (s.email || '').toLowerCase() === clean
  );

  return found || null;
}

/**
 * Create or update admin staff in MongoDB and persistent storage
 */
export async function saveStaff(data: Partial<AdminStaffRecord> & { username: string; password?: string }): Promise<{ success: boolean; staff?: any; error?: string }> {
  initStorage();

  const cleanUser = (data.username || '').trim().toLowerCase();
  if (!cleanUser) {
    return { success: false, error: "Admin login (username) ko'rsatilishi shart!" };
  }

  const staffId = data.id || `adm-${Date.now()}`;

  // Check for duplicate username
  const existing = staffCache.find(s => s.username.toLowerCase() === cleanUser && s.id !== staffId);
  if (existing) {
    return { success: false, error: "Bu login bilan boshqa admin mavjud! Iltimos, boshqa login tanlang." };
  }

  if (isMongoReady()) {
    try {
      const dbExisting = await AdminStaffModel.findOne({
        username: cleanUser,
        id: { $ne: staffId }
      });
      if (dbExisting) {
        return { success: false, error: "Bu login bilan boshqa admin mavjud! Iltimos, boshqa login tanlang." };
      }
    } catch {}
  }

  // Handle password hashing
  let finalPassword = '';
  const incomingPassword = (data.password || '').trim();

  if (incomingPassword) {
    if (incomingPassword.startsWith('$2a$') || incomingPassword.startsWith('$2b$')) {
      finalPassword = incomingPassword;
    } else {
      finalPassword = await hashPassword(incomingPassword);
    }
  } else {
    // Preserve existing password if editing
    const oldStaff = staffCache.find(s => s.id === staffId);
    if (oldStaff && oldStaff.password) {
      finalPassword = oldStaff.password;
    } else {
      // Default fallback password hash for 'tour123'
      finalPassword = await hashPassword('tour123');
    }
  }

  const finalRecord: AdminStaffRecord = {
    id: staffId,
    name: (data.name || 'Tur Admin').trim(),
    username: cleanUser,
    password: finalPassword,
    email: data.email ? data.email.trim().toLowerCase() : `${cleanUser}@sayrhub.uz`,
    phone: data.phone?.trim() || '+998 90',
    role: (data.role as 'main_admin' | 'tour_admin') || 'tour_admin',
    roleTitle: data.roleTitle || (data.role === 'main_admin' ? 'Bosh Admin' : 'Tur Admin'),
    avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    assignedDestinations: data.assignedDestinations || ['Barcha yo\'nalishlar'],
    canManageUsers: !!data.canManageUsers,
    canManageStaff: !!data.canManageStaff,
    canDeleteTours: data.canDeleteTours !== false,
    canEditFinancials: data.canEditFinancials !== false,
    canManageBookings: data.canManageBookings !== false,
    canManageCatalog: data.canManageCatalog !== false,
    createdAt: data.createdAt || new Date().toISOString().split('T')[0],
    lastActive: data.lastActive || 'Hozir online',
    status: (data.status as 'active' | 'suspended') || 'active'
  };

  // 1. Update local cache & file
  const idx = staffCache.findIndex(s => s.id === staffId || s.username === cleanUser);
  if (idx !== -1) {
    staffCache[idx] = finalRecord;
  } else {
    staffCache.unshift(finalRecord);
  }
  saveToDisk();

  // 2. Persist to MongoDB
  if (isMongoReady()) {
    try {
      await AdminStaffModel.findOneAndUpdate(
        { id: staffId },
        { $set: finalRecord },
        { upsert: true, new: true, runValidators: false }
      );
      console.log(`✅ Admin staff "${cleanUser}" saved to MongoDB with bcrypt hashed password`);
    } catch (err: any) {
      console.warn('⚠️ Error saving admin staff to MongoDB (stored locally):', err.message);
    }
  }

  return { success: true, staff: sanitizeStaff(finalRecord) };
}

/**
 * Delete admin staff by ID
 */
export async function deleteStaff(id: string): Promise<{ success: boolean; error?: string }> {
  initStorage();

  if (id === 'adm-root' || id === 'admin') {
    return { success: false, error: "Bosh admin (Super Admin) o'chirib yuborilishi mumkin emas!" };
  }

  // 1. Remove from cache & disk
  staffCache = staffCache.filter(s => s.id !== id && s.username !== id);
  saveToDisk();

  // 2. Remove from MongoDB
  if (isMongoReady()) {
    try {
      await AdminStaffModel.findOneAndDelete({
        $or: [{ id }, { username: id }]
      });
      console.log(`✅ Admin staff ID "${id}" removed from MongoDB`);
    } catch (err: any) {
      console.warn('⚠️ Error deleting admin staff from MongoDB:', err.message);
    }
  }

  return { success: true };
}
