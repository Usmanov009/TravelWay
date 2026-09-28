import React, { useState } from 'react';
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
import { INITIAL_REGISTERED_USERS } from './adminMockData';

interface AdminPageProps {
  currentRole: AdminRole;
  currentAdminUser?: AdminUser | null;
  onSwitchRole: (role: AdminRole) => void;
  onExitToApp: () => void;
  // Live linked data
  tours: TourPackage[];
  onAddTour: (tour: TourPackage) => void;
  onUpdateTour: (tour: TourPackage) => void;
  onDeleteTour: (tourId: string) => void;
  comboTours: ComboTour[];
  onAddComboTour: (combo: ComboTour) => void;
  onUpdateComboTour: (combo: ComboTour) => void;
  onDeleteComboTour: (comboId: string) => void;
  flights: FlightTicket[];
  onAddFlight: (flight: FlightTicket) => void;
  onUpdateFlight: (flight: FlightTicket) => void;
  onDeleteFlight: (flightId: string) => void;
  hotels: HotelOnly[];
  onAddHotel: (hotel: HotelOnly) => void;
  onUpdateHotel: (hotel: HotelOnly) => void;
  onDeleteHotel: (hotelId: string) => void;
  bookings: Booking[];
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  onCancelBooking: (bookingId: string) => void;
  priceAlerts: PriceAlert[];
  onSimulatePriceDrop: (tourId: string, price: number) => void;
  onDeletePriceAlert?: (alertId: string) => void;
  staffList: AdminUser[];
  onAddStaff: (staff: AdminUser) => void;
  onUpdateStaff: (staff: AdminUser) => void;
  onRemoveStaff: (staffId: string) => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
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
  onSimulatePriceDrop,
  onDeletePriceAlert,
  staffList,
  onAddStaff,
  onUpdateStaff,
  onRemoveStaff,
  onShowToast
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [adminTheme, setAdminTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('travelway_admin_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    return 'light'; // Default to Flexy crisp light dashboard
  });

  const toggleAdminTheme = () => {
    const next = adminTheme === 'light' ? 'dark' : 'light';
    setAdminTheme(next);
    try {
      localStorage.setItem('travelway_admin_theme', next);
    } catch (e) {}
  };

  // Find active admin profile with safe fallback
  const fallbackAdmin: AdminUser = {
    id: 'adm-root',
    name: 'Admin',
    email: 'admin@travelway.uz',
    role: currentRole,
    roleTitle: currentRole === 'main_admin' ? 'Bosh Admin' : 'Tur Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    phone: '',
    assignedDestinations: ['Barcha yo\'nalishlar'],
    canManageUsers: true,
    canManageStaff: true,
    canDeleteTours: true,
    canEditFinancials: true,
    canManageBookings: true,
    canManageCatalog: true,
    createdAt: new Date().toISOString().split('T')[0],
    lastActive: 'Hozir online',
    status: 'active'
  };
  const currentAdmin = currentAdminUser || staffList.find(s => s.role === currentRole) || staffList[0] || fallbackAdmin;
  const activeBookingsCount = bookings.filter(b => b.status === 'Jarayonda' || b.type === 'active').length;

  const handleQuickAddTour = () => {
    setCurrentTab('tours');
  };

  return (
    <div
      className={`${
        adminTheme === 'dark'
          ? 'dark bg-[#141217] text-[#FAF9FB]'
          : 'bg-[#fafbfb] text-[#11142d]'
      } min-h-screen flex font-sans antialiased transition-colors duration-200 select-none`}
    >
      {/* 1. FLEXY SIDEBAR */}
      <AdminSidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        currentRole={currentRole}
        currentAdmin={currentAdmin}
        totalActiveBookings={activeBookingsCount}
        totalAlerts={priceAlerts.length}
        onExitToApp={onExitToApp}
        isCollapsed={isSidebarCollapsed}
      />

      {/* 2. MAIN FLEXY CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* TOP BAR */}
        <AdminTopNav
          currentRole={currentRole}
          currentAdmin={currentAdmin}
          onSwitchRole={onSwitchRole}
          onQuickAddTour={handleQuickAddTour}
          onExitToApp={onExitToApp}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isSidebarCollapsed={isSidebarCollapsed}
          adminTheme={adminTheme}
          onToggleTheme={toggleAdminTheme}
        />

        {/* TAB CONTENT CONTAINER */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
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
              usersCount={INITIAL_REGISTERED_USERS.length}
              onSelectTab={(tab) => setCurrentTab(tab)}
              onUpdateBookingStatus={onUpdateBookingStatus}
              onSimulatePriceDrop={onSimulatePriceDrop}
              onQuickAddTour={handleQuickAddTour}
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
            />
          )}

          {currentTab === 'users' && (
            <AdminUsersManager
              currentRole={currentRole}
              currentAdmin={currentAdmin}
              onShowToast={onShowToast}
            />
          )}

          {currentTab === 'staff' && (
            <AdminStaffManager
              currentRole={currentRole}
              currentAdmin={currentAdmin}
              staffList={staffList}
              onAddStaff={onAddStaff}
              onUpdateStaff={onUpdateStaff}
              onRemoveStaff={onRemoveStaff}
              onShowToast={onShowToast}
            />
          )}

          {currentTab === 'price_alerts' && (
            <AdminPriceAlertsManager
              currentRole={currentRole}
              currentAdmin={currentAdmin}
              priceAlerts={priceAlerts}
              tours={tours}
              onSimulatePriceDrop={onSimulatePriceDrop}
              onDeletePriceAlert={onDeletePriceAlert}
              onShowToast={onShowToast}
            />
          )}

          {currentTab === 'settings' && (
            <AdminSettings
              currentRole={currentRole}
              currentAdmin={currentAdmin}
              onShowToast={onShowToast}
            />
          )}
        </main>
      </div>
    </div>
  );
};
