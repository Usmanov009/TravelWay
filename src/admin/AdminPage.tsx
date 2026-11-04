import React, { useState, useEffect } from 'react';
import { TourPackage, Booking, PriceAlert, ComboTour, FlightTicket, HotelOnly } from '../types';
import { AdminRole, AdminTab, AdminUser } from './adminTypes';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopNav } from './AdminTopNav';
import { AdminDashboard } from './AdminDashboard';
import { AdminToursManager } from './AdminToursManager';
import { AdminComboManager } from './AdminComboManager';
import { AdminFlightsManager } from './AdminFlightsManager';
import { AdminHotelsManager } from './AdminHotelsManager';
import { AdminBookingsManager } from './AdminBookingsManager';
import { AdminUsersManager } from './AdminUsersManager';
import { AdminStaffManager } from './AdminStaffManager';
import { AdminPriceAlertsManager } from './AdminPriceAlertsManager';
import { AdminSettings } from './AdminSettings';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

interface AdminPageProps {
  currentRole: AdminRole;
  currentAdminUser?: AdminUser | null;
  onSwitchRole: (role: AdminRole) => void;
  onExitToApp: () => void;
  // Live linked data
  tours: TourPackage[];
  onAddTour: (tour: TourPackage) => Promise<void>;
  onUpdateTour: (tour: TourPackage) => Promise<void>;
  onDeleteTour: (tourId: string) => Promise<void>;
  comboTours: ComboTour[];
  onAddComboTour: (combo: ComboTour) => Promise<void>;
  onUpdateComboTour: (combo: ComboTour) => Promise<void>;
  onDeleteComboTour: (comboId: string) => Promise<void>;
  flights: FlightTicket[];
  onAddFlight: (flight: FlightTicket) => Promise<void>;
  onUpdateFlight: (flight: FlightTicket) => Promise<void>;
  onDeleteFlight: (flightId: string) => Promise<void>;
  hotels: HotelOnly[];
  onAddHotel: (hotel: HotelOnly) => Promise<void>;
  onUpdateHotel: (hotel: HotelOnly) => Promise<void>;
  onDeleteHotel: (hotelId: string) => Promise<void>;
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  onCancelBooking: (bookingId: string) => void;
  priceAlerts: PriceAlert[];
  onDeletePriceAlert?: (alertId: string) => void;
  staffList: AdminUser[];
  onAddStaff: (staff: AdminUser) => Promise<void>;
  onUpdateStaff: (staff: AdminUser) => Promise<void>;
  onRemoveStaff: (staffId: string) => Promise<void>;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  agencyCommissionRate?: number;
  onUpdateCommissionRate?: (rate: number) => Promise<void>;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  currentRole,
  currentAdminUser,
  onSwitchRole,
  onExitToApp,
  tours,
  onAddTour,
  onUpdateTour,
  onDeleteTour,
  comboTours,
  onAddComboTour,
  onUpdateComboTour,
  onDeleteComboTour,
  flights,
  onAddFlight,
  onUpdateFlight,
  onDeleteFlight,
  hotels,
  onAddHotel,
  onUpdateHotel,
  onDeleteHotel,
  bookings,
  onUpdateBookingStatus,
  onCancelBooking,
  priceAlerts,
  onDeletePriceAlert,
  staffList,
  onAddStaff,
  onUpdateStaff,
  onRemoveStaff,
  onShowToast,
  agencyCommissionRate = 0,
  onUpdateCommissionRate
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [usersCount, setUsersCount] = useState(0);
  const [adminTheme, setAdminTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('sayrhub_admin_theme') || localStorage.getItem('travelway_admin_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    return 'light'; // Default to crisp, soft eye-friendly light dashboard
  });

  // Guard: If non-main-admin tries to view closed sections, redirect to dashboard
  useEffect(() => {
    if (currentRole !== 'main_admin' && (currentTab === 'staff' || currentTab === 'users')) {
      setCurrentTab('dashboard');
    }
  }, [currentRole, currentTab]);

  const toggleAdminTheme = () => {
    const next = adminTheme === 'light' ? 'dark' : 'light';
    setAdminTheme(next);
    try {
      localStorage.setItem('sayrhub_admin_theme', next);
      localStorage.setItem('travelway_admin_theme', next);
    } catch (e) {}
  };

  const currentAdmin = currentAdminUser || staffList.find((staff) => staff.role === currentRole) || null;
  const activeBookingsCount = bookings.filter(b => b.status === 'Jarayonda' || b.type === 'active').length;

  useEffect(() => {
    const token = sessionStorage.getItem('sayrhub_admin_token') || sessionStorage.getItem('travelway_admin_token');
    if (!token || currentRole !== 'main_admin') {
      setUsersCount(0);
      return;
    }
    fetch('/api/db/users/count', { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || 'Foydalanuvchilar sonini olib bo‘lmadi.');
        setUsersCount(Number(data.count) || 0);
      })
      .catch((error: unknown) => {
        onShowToast(error instanceof Error ? error.message : 'Foydalanuvchilar sonini olib bo‘lmadi.', 'error');
      });
  }, [currentRole, onShowToast]);

  if (!currentAdmin) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-6 text-center">
        <div className="max-w-sm space-y-4">
          <h1 className="text-xl font-semibold">Admin profili topilmadi</h1>
          <p className="text-sm text-muted-foreground">Sessiyangizni yangilash uchun tizimdan chiqing va qayta kiring.</p>
          <button type="button" className="text-sm font-medium text-primary underline" onClick={onExitToApp}>
            Tizimdan chiqish
          </button>
        </div>
      </div>
    );
  }

  const handleQuickAddTour = () => {
    setCurrentTab('tours');
  };

  return (
    <SidebarProvider
      data-theme={adminTheme}
      className={`${adminTheme === 'dark' ? 'dark' : ''} min-h-svh bg-background text-foreground font-sans antialiased transition-colors duration-200`}
    >
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        currentRole={currentRole}
        currentAdmin={currentAdmin}
        totalActiveBookings={activeBookingsCount}
        totalAlerts={priceAlerts.length}
        onExitToApp={onExitToApp}
      />

      <SidebarInset className="min-h-svh">
        {/* TOP BAR */}
        <AdminTopNav
          currentRole={currentRole}
          currentAdmin={currentAdmin}
          onSwitchRole={onSwitchRole}
          onQuickAddTour={handleQuickAddTour}
          onExitToApp={onExitToApp}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          adminTheme={adminTheme}
          onToggleTheme={toggleAdminTheme}
        />

        {/* TAB CONTENT CONTAINER */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto custom-scrollbar">
          {currentTab === 'dashboard' && (
            <AdminDashboard
              currentRole={currentRole}
              currentAdmin={currentAdmin}
              tours={tours}
              comboTours={comboTours}
              flights={flights}
              hotels={hotels}
              bookings={bookings}
              priceAlerts={priceAlerts}
              usersCount={usersCount}
              onSelectTab={(tab) => setCurrentTab(tab)}
              onUpdateBookingStatus={onUpdateBookingStatus}
              onQuickAddTour={handleQuickAddTour}
              agencyCommissionRate={agencyCommissionRate}
              onUpdateCommissionRate={onUpdateCommissionRate}
            />
          )}

          {currentTab === 'tours' && (
            <AdminToursManager
              currentRole={currentRole}
              currentAdmin={currentAdmin}
              tours={tours}
              onAddTour={onAddTour}
              onUpdateTour={onUpdateTour}
              onDeleteTour={onDeleteTour}
              onShowToast={onShowToast}
              globalSearch={searchTerm}
              agencyCommissionRate={agencyCommissionRate}
              onUpdateCommissionRate={onUpdateCommissionRate}
            />
          )}

          {currentTab === 'combo' && (
            <AdminComboManager
              currentRole={currentRole}
              currentAdmin={currentAdmin}
              comboTours={comboTours}
              onAddComboTour={onAddComboTour}
              onUpdateComboTour={onUpdateComboTour}
              onDeleteComboTour={onDeleteComboTour}
              onShowToast={onShowToast}
              globalSearch={searchTerm}
            />
          )}

          {currentTab === 'flights' && (
            <AdminFlightsManager
              currentRole={currentRole}
              currentAdmin={currentAdmin}
              flights={flights}
              onAddFlight={onAddFlight}
              onUpdateFlight={onUpdateFlight}
              onDeleteFlight={onDeleteFlight}
              onShowToast={onShowToast}
              globalSearch={searchTerm}
              agencyCommissionRate={agencyCommissionRate}
              onUpdateCommissionRate={onUpdateCommissionRate}
            />
          )}

          {currentTab === 'hotels' && (
            <AdminHotelsManager
              currentRole={currentRole}
              currentAdmin={currentAdmin}
              hotels={hotels}
              onAddHotel={onAddHotel}
              onUpdateHotel={onUpdateHotel}
              onDeleteHotel={onDeleteHotel}
              onShowToast={onShowToast}
              globalSearch={searchTerm}
              agencyCommissionRate={agencyCommissionRate}
              onUpdateCommissionRate={onUpdateCommissionRate}
            />
          )}

          {currentTab === 'bookings' && (
            <AdminBookingsManager
              currentRole={currentRole}
              currentAdmin={currentAdmin}
              bookings={bookings}
              onUpdateBookingStatus={onUpdateBookingStatus}
              onCancelBooking={onCancelBooking}
              onShowToast={onShowToast}
              globalSearch={searchTerm}
            />
          )}

          {currentTab === 'users' && currentRole === 'main_admin' && (
            <AdminUsersManager
              currentRole={currentRole}
              currentAdmin={currentAdmin}
              onShowToast={onShowToast}
              globalSearch={searchTerm}
            />
          )}

          {currentTab === 'staff' && currentRole === 'main_admin' && (
            <AdminStaffManager
              currentRole={currentRole}
              currentAdmin={currentAdmin}
              staffList={staffList}
              onAddStaff={onAddStaff}
              onUpdateStaff={onUpdateStaff}
              onRemoveStaff={onRemoveStaff}
              onShowToast={onShowToast}
              globalSearch={searchTerm}
            />
          )}

          {currentTab === 'price_alerts' && (
            <AdminPriceAlertsManager
              currentRole={currentRole}
              currentAdmin={currentAdmin}
              priceAlerts={priceAlerts}
              tours={tours}
              onDeletePriceAlert={onDeletePriceAlert}
              onShowToast={onShowToast}
              globalSearch={searchTerm}
            />
          )}

          {currentTab === 'settings' && (
            <AdminSettings
              currentRole={currentRole}
              currentAdmin={currentAdmin}
              onShowToast={onShowToast}
              agencyCommissionRate={agencyCommissionRate}
              onUpdateCommissionRate={onUpdateCommissionRate}
            />
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
