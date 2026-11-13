import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { AdminStaffModel } from '../../../db.js';
import { hashPassword } from '../auth.js';

export interface AdminStaffRecord {
  id: string;
  name: string;
  username: string;
  password: string;
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

function assertDatabaseReady() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB ulanmagan; admin xodimlari bazasiga murojaat qilib bo‘lmadi.');
  }
}

export function sanitizeStaff(staff: any) {
  if (!staff) return null;
  const record = staff.toObject ? staff.toObject() : { ...staff };
  delete record.password;
  delete record.plainPassword;
  delete record.__v;
  return record;
}

export async function syncStaffWithMongoDB(): Promise<void> {
  assertDatabaseReady();
  await AdminStaffModel.findOne().select('_id').maxTimeMS(2500);
}

export async function getAllStaff(): Promise<AdminStaffRecord[]> {
  assertDatabaseReady();
  return AdminStaffModel.find().sort({ createdAt: -1 }).lean() as unknown as Promise<AdminStaffRecord[]>;
}

export async function getPublicStaffList() {
  const staff = await getAllStaff();
  return staff.map(sanitizeStaff);
}

export async function findStaffByIdentifier(identifier: string): Promise<AdminStaffRecord | null> {
  assertDatabaseReady();
  const clean = identifier.trim().toLowerCase();
  if (!clean) return null;
  return AdminStaffModel.findOne({
    $or: [{ username: clean }, { email: clean }],
  }).lean() as unknown as Promise<AdminStaffRecord | null>;
}

export async function saveStaff(
  data: Partial<AdminStaffRecord> & { username: string; password?: string },
): Promise<{ success: boolean; staff?: unknown; error?: string }> {
  assertDatabaseReady();
  const username = data.username.trim().toLowerCase();
  if (!username || !data.name?.trim()) {
    return { success: false, error: 'Xodim ismi va login kiritilishi shart.' };
  }

  const id = data.id || `staff-${randomUUID()}`;
  const [duplicate, existing] = await Promise.all([
    AdminStaffModel.findOne({ username, id: { $ne: id } }).select('_id').lean(),
    AdminStaffModel.findOne({ id }).lean() as unknown as Promise<AdminStaffRecord | null>,
  ]);
  if (duplicate) return { success: false, error: 'Bu login bilan admin allaqachon mavjud.' };
  if (!existing && !data.password?.trim()) {
    return { success: false, error: 'Yangi admin uchun parol kiritish shart.' };
  }

  const password = data.password?.trim()
    ? await hashPassword(data.password.trim())
    : existing?.password;
  if (!password) return { success: false, error: 'Admin paroli saqlanmadi.' };

  const record: AdminStaffRecord = {
    id,
    name: data.name.trim(),
    username,
    password,
    email: data.email?.trim().toLowerCase() || `${username}@sayrhub.uz`,
    phone: data.phone?.trim() || '',
    role: 'tour_admin',
    roleTitle: 'Tur Admin',
    avatar: data.avatar || '',
    assignedDestinations: data.assignedDestinations || [],
    canManageUsers: false,
    canManageStaff: false,
    canDeleteTours: data.canDeleteTours ?? false,
    canEditFinancials: false,
    canManageBookings: data.canManageBookings ?? true,
    canManageCatalog: data.canManageCatalog ?? true,
    createdAt: existing?.createdAt || new Date().toISOString(),
    lastActive: new Date().toISOString(),
    status: data.status || existing?.status || 'active',
  };

  const saved = await AdminStaffModel.findOneAndUpdate(
    { id },
    { $set: record },
    { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true },
  );
  return { success: true, staff: sanitizeStaff(saved) };
}

export async function deleteStaff(id: string): Promise<{ success: boolean; error?: string }> {
  assertDatabaseReady();
  const result = await AdminStaffModel.deleteOne({ id });
  return result.deletedCount
    ? { success: true }
    : { success: false, error: 'O‘chiriladigan admin xodimi topilmadi.' };
}
