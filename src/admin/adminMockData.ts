import { AdminUser } from './adminTypes';
import { UserProfile } from '../types';

export const DEFAULT_TOUR_ADMIN: AdminUser = {
  id: 'staff-tour-1',
  name: 'Azizbek Rahimov',
  username: 'tour_admin',
  password: 'tour123',
  email: 'tour@sayrhub.uz',
  role: 'tour_admin',
  roleTitle: 'Tur Admin (Operatsion)',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  phone: '+998 90 123 45 67',
  assignedDestinations: ['Turkiya', 'BAA', 'Misr', 'Tailand', 'Maldiv'],
  canManageUsers: false,
  canManageStaff: false,
  canDeleteTours: false,
  canEditFinancials: false,
  canManageBookings: true,
  canManageCatalog: true,
  createdAt: '2026-01-15T10:00:00.000Z',
  lastActive: 'Hozir faol',
  status: 'active'
};

export const INITIAL_ADMIN_STAFF: AdminUser[] = [DEFAULT_TOUR_ADMIN];

export const INITIAL_REGISTERED_USERS: (UserProfile & { id: string; registeredAt: string; totalSpentUSD: number; bookingsCount: number; status: 'active' | 'blocked' })[] = [];

