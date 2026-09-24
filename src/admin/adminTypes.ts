import { TourPackage, Booking, PriceAlert, ComboTour, FlightTicket, HotelOnly, UserProfile } from '../types';

export type AdminRole = 'main_admin' | 'tour_admin';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  roleTitle: string; // 'Bosh Admin (Super)' | 'Tur Admin (Operatsion)'
  avatar: string;
  phone: string;
  assignedDestinations?: string[]; // e.g. ['Turkiya', 'BAA', 'Misr', 'Tailand']
  canManageUsers: boolean; // only main_admin
  canManageStaff: boolean; // only main_admin
  canDeleteTours: boolean; // main_admin has full delete, tour_admin can archive
  canEditFinancials: boolean; // only main_admin
  canManageBookings: boolean; // both
  canManageCatalog: boolean; // both
  createdAt: string;
  lastActive: string;
  status: 'active' | 'suspended';
}

export type AdminTab = 
  | 'dashboard'
  | 'tours'
  | 'combo'
  | 'flights'
  | 'hotels'
  | 'bookings'
  | 'users'
  | 'staff'
  | 'price_alerts'
  | 'settings';

export interface AdminStats {
  totalTours: number;
  totalCombo: number;
  totalFlights: number;
  totalHotels: number;
  totalBookings: number;
  activeBookings: number;
  totalRevenueUSD: number;
  totalUsers: number;
  activePriceAlerts: number;
  kompasOnlineConnected: boolean;
}
