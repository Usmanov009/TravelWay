import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { TourPackage, Booking, PriceAlert, ComboTour, FlightTicket, HotelOnly } from '../types';
import { AdminRole, AdminTab, AdminUser } from './adminTypes';
import { AppSidebar } from './dashboard/app-sidebar';
import { SiteHeader } from './dashboard/site-header';
import { SectionCards } from './dashboard/section-cards';
import { ChartAreaInteractive } from './dashboard/chart-area-interactive';
import { DataTable } from './dashboard/data-table';
import { toTableRows } from './dashboard/booking-rows';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Moon, Search, Sun, X } from '@/lib/flaticon-icons';

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
  onRefreshBookings?: () => Promise<void> | void;
  isRefreshingBookings?: boolean;
}

const pageTitles: Record<AdminTab, string> = {
  dashboard: 'Boshqaruv paneli',
  tours: 'Turpaketlar',
  combo: 'Combo turlar',
  flights: 'Aviachiptalar',
  hotels: 'Mehmonxonalar',
  bookings: 'Buyurtmalar',
  users: 'Mijozlar',
  staff: 'Adminlar jamoasi',
  price_alerts: 'Narx signallari',
  settings: 'Tizim sozlamalari'
};

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
  onUpdateCommissionRate,
  onRefreshBookings,
  isRefreshingBookings = false
}) => {
  const [currentTab, setCurrentTab] = useState<AdminTab>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocusToken, setSearchFocusToken] = useState(0);
  const [usersCount, setUsersCount] = useState(0);

  // Polling for live bookings & auto-refreshing in Admin Panel (every 12 seconds)
  useEffect(() => {
    if (!onRefreshBookings) return;
    onRefreshBookings();
    const interval = setInterval(() => {
      onRefreshBookings();
    }, 12000);
    return () => clearInterval(interval);
  }, [onRefreshBookings]);

  // When switching to bookings or dashboard tab, immediately reload bookings
  useEffect(() => {
    if (currentTab === 'bookings' || currentTab === 'dashboard') {
      onRefreshBookings?.();
    }
  }, [currentTab, onRefreshBookings]);
  const [adminTheme, setAdminTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('sayrhub_admin_theme') || localStorage.getItem('travelway_admin_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    return 'light';
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

  // The sidebar "Qidiruv" item focuses the global search field of list screens.
  useEffect(() => {
    if (!searchFocusToken) return;
    const input = document.getElementById('admin-global-search');
    if (input instanceof HTMLInputElement) input.focus();
  }, [searchFocusToken, currentTab]);

  const handleSelectTab = (tab: AdminTab) => {
    if ((tab as string) === 'search') {
      if (currentTab === 'dashboard') setCurrentTab('bookings');
      setSearchFocusToken((token) => token + 1);
      return;
    }
    setCurrentTab(tab);
  };

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

  const tableRows = toTableRows(bookings);
  const showHeaderActions = currentTab !== 'dashboard';

  return (
    <SidebarProvider
      data-theme={adminTheme}
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)'
        } as React.CSSProperties
      }
      className={`${adminTheme === 'dark' ? 'dark' : ''} min-h-svh bg-background text-foreground font-sans antialiased transition-colors duration-200`}
    >
      <AppSidebar
        variant="inset"
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        currentAdmin={currentAdmin}
        onExitToApp={onExitToApp}
      />

      <SidebarInset className="min-h-svh">
        <SiteHeader title={pageTitles[currentTab]}>
          {showHeaderActions && (
            <>
              <div className="relative hidden w-[min(30vw,18rem)] md:block">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="admin-global-search"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Qidirish..."
                  aria-label="Admin bo‘limlaridan qidirish"
                  className="h-8 bg-muted/50 pl-9 pr-9 text-xs"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-1 top-1/2 size-6 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title="Qidiruvni tozalash"
                    type="button"
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
              {onRefreshBookings && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRefreshBookings()}
                  disabled={isRefreshingBookings}
                  className="h-8 gap-1.5 text-xs font-semibold"
                  title="Buyurtmalar va ma'lumotlarni yangilash"
                  type="button"
                >
                  <span className={`material-symbols-outlined text-[16px] text-indigo-600 dark:text-indigo-400 ${isRefreshingBookings ? 'animate-spin' : ''}`}>
                    refresh
                  </span>
                  <span className="hidden sm:inline">{isRefreshingBookings ? 'Yangilanmoqda...' : 'Yangilash'}</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={toggleAdminTheme}
                className="size-8"
                title={adminTheme === 'light' ? "Tungi rejimga o'tish" : "Kunduzgi rejimga o'tish"}
                type="button"
              >
                {adminTheme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4 text-amber-400" />}
              </Button>
            </>
          )}
        </SiteHeader>

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {currentTab === 'dashboard' ? (
                <>
                  <SectionCards bookings={bookings} usersCount={usersCount} />
                  <div className="px-4 lg:px-6">
                    <ChartAreaInteractive bookings={bookings} />
                  </div>
                  <DataTable
                    data={tableRows}
                    onCancelBooking={onCancelBooking}
                    onUpdateBookingStatus={(bookingId, status) =>
                      onUpdateBookingStatus(bookingId, status as Booking['status'])
                    }
                  />
                </>
              ) : null}

              {currentTab !== 'dashboard' && (
                <div className="flex flex-1 flex-col gap-4 px-4 md:gap-6 lg:px-6">
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
                      onRefreshBookings={onRefreshBookings}
                      isRefreshing={isRefreshingBookings}
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
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
      <Toaster position="top-center" richColors />
    </SidebarProvider>
  );
};
