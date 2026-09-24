import { AdminUser } from './adminTypes';
import { UserProfile } from '../types';

export const INITIAL_ADMIN_STAFF: AdminUser[] = [];

export const INITIAL_REGISTERED_USERS: (UserProfile & { id: string; registeredAt: string; totalSpentUSD: number; bookingsCount: number; status: 'active' | 'blocked' })[] = [];

