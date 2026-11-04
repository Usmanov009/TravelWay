import React, { lazy, Suspense, useCallback, useMemo, useState, useEffect } from 'react';
import { TabType, LanguageCode, ThemeMode, TourPackage, Booking, PaymentCard, UserProfile, ToastMessage, PriceAlert, ComboTour, FlightTicket, HotelOnly, ExploreVibe, HotSale } from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SearchScreen } from './components/SearchScreen';
import { AdminRole, AdminUser } from './admin/adminTypes';
import { AlertTriangle, Bell, CheckCircle2 } from '@/lib/flaticon-icons';

const FlutterCodeViewer = lazy(() =>
  import('./components/FlutterCodeViewer').then((module) => ({
    default: module.FlutterCodeViewer
  }))
);
const AuthScreen = lazy(() =>
  import('./components/AuthScreen').then((module) => ({ default: module.AuthScreen }))
);
const ExploreScreen = lazy(() =>
  import('./components/ExploreScreen').then((module) => ({ default: module.ExploreScreen }))
);
const HotDealsScreen = lazy(() =>
  import('./components/HotDealsScreen').then((module) => ({ default: module.HotDealsScreen }))
);
const TripsScreen = lazy(() =>
  import('./components/TripsScreen').then((module) => ({ default: module.TripsScreen }))
);
const ProfileScreen = lazy(() =>
  import('./components/ProfileScreen').then((module) => ({ default: module.ProfileScreen }))
);
const TourBookingPage = lazy(() =>
  import('./components/TourBookingPage').then((module) => ({ default: module.TourBookingPage }))
);
const Modals = lazy(() =>
  import('./components/Modals').then((module) => ({ default: module.Modals }))
);
const TelegramAuthModal = lazy(() =>
  import('./components/TelegramAuthModal').then((module) => ({
    default: module.TelegramAuthModal
  }))
);
const PriceAlertModal = lazy(() =>
  import('./components/PriceAlertModal').then((module) => ({
    default: module.PriceAlertModal
  }))
);
const AdminLoginPage = lazy(() =>
  import('./admin/AdminLoginPage').then((module) => ({ default: module.AdminLoginPage }))
);
const AdminPage = lazy(() =>
  import('./admin/AdminPage').then((module) => ({ default: module.AdminPage }))
);

export default function App() {
  // Navigation & Screen state
  const [currentTab, setCurrentTab] = useState<TabType>('search');
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [showFlutterCode, setShowFlutterCode] = useState(false);

  // App settings
  const [currentLang, setCurrentLang] = useState<LanguageCode>('UZ');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('sayrhub_theme_mode') || localStorage.getItem('travelway_theme_mode');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    return 'light';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(false);

  // Data state
  const [user, setUser] = useState<UserProfile>({
    name: '', phone: '', email: '', tcId: '', cashback: 0,
    passportNumber: '', passportExpiry: '', dob: '', isVerified: false
  });
  const [cards, setCards] = useState<PaymentCard[]>([]);
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [comboTours, setComboTours] = useState<ComboTour[]>([]);
  const [flights, setFlights] = useState<FlightTicket[]>([]);
  const [hotels, setHotels] = useState<HotelOnly[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [hotDeals, setHotDeals] = useState<any[]>([]);
  const [isRefreshingHotDeals, setIsRefreshingHotDeals] = useState<boolean>(false);

  const [agencyCommissionRate, setAgencyCommissionRate] = useState(0);

  // Sync agency commission rate from backend on mount
  useEffect(() => {
    fetch('/api/admin/commission')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Agentlik sozlamalarini olib bo‘lmadi.');
        return data;
      })
      .then((data) => {
        if (data.success && typeof data.commissionRate === 'number') {
          setAgencyCommissionRate(data.commissionRate);
        }
      })
      .catch((error) => console.error('Agency settings load failed:', error));
  }, []);

  // Desktop Admin Panel State
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      return path === '/admin' || path.startsWith('/admin');
    }
    return false;
  });
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return Boolean(sessionStorage.getItem('sayrhub_admin_token') || sessionStorage.getItem('travelway_admin_token'));
    } catch (e) {
      return false;
    }
  });
  const [currentAdminRole, setCurrentAdminRole] = useState<AdminRole>(() => {
    try {
      const saved = sessionStorage.getItem('sayrhub_active_admin_user') || sessionStorage.getItem('travelway_active_admin_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.role === 'tour_admin' || parsed?.role === 'main_admin') return parsed.role;
      }
    } catch (e) {}
    return 'main_admin';
  });
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = sessionStorage.getItem('sayrhub_active_admin_user') || sessionStorage.getItem('travelway_active_admin_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [adminStaffList, setAdminStaffList] = useState<AdminUser[]>([]);

  // Sync staff list from backend / MongoDB only when admin is authenticated
  useEffect(() => {
    if (!isAdminAuthenticated) return;
    let token = '';
    try {
      token = sessionStorage.getItem('sayrhub_admin_token') || 
              sessionStorage.getItem('travelway_admin_token') ||
              '';
    } catch (e) {}
    if (!token) return;

    fetch('/api/admin/staff', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || 'Adminlar ro‘yxatini olib bo‘lmadi.');
        return data;
      })
      .then((data) => {
        if (data.success && Array.isArray(data.staff)) {
          setAdminStaffList(data.staff);
        }
      })
      .catch((err) => {
        setAdminStaffList([]);
        console.error('Admin staff load failed:', err);
      });
  }, [isAdminAuthenticated]);

  useEffect(() => {
    const handleLocationChange = () => {
      if (typeof window !== 'undefined') {
        const path = window.location.pathname.toLowerCase();
        setIsAdminMode(path === '/admin' || path.startsWith('/admin'));
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleExitAdmin = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }
    setIsAdminMode(false);
  };

  const handleAdminLogout = () => {
    try {
      sessionStorage.removeItem('sayrhub_admin_auth');
      sessionStorage.removeItem('travelway_admin_auth');
      sessionStorage.removeItem('sayrhub_admin_token');
      sessionStorage.removeItem('travelway_admin_token');
      sessionStorage.removeItem('sayrhub_active_admin_user');
      sessionStorage.removeItem('travelway_active_admin_user');
      localStorage.removeItem('sayrhub_admin_auth');
      localStorage.removeItem('travelway_admin_auth');
      localStorage.removeItem('sayrhub_admin_token');
      localStorage.removeItem('travelway_admin_token');
      localStorage.removeItem('sayrhub_active_admin_user');
      localStorage.removeItem('travelway_active_admin_user');
    } catch (e) {}
    setIsAdminAuthenticated(false);
    setCurrentAdminUser(null);
    handleExitAdmin();
    showToast("Admin sessiyasidan chiqildi", 'info');
  };

  const fetchLiveHotDeals = async () => {
    setIsRefreshingHotDeals(true);
    try {
      const response = await fetch('/api/kompas/hot');
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || 'Jonli takliflarni olib bo?lmadi.');
      setHotDeals(Array.isArray(data.hotDeals) ? data.hotDeals : []);
    } catch (error) {
      setHotDeals([]);
      console.error('Live hot deals request failed:', error);
    } finally {
      setIsRefreshingHotDeals(false);
    }
  };

  useEffect(() => {
    let active = true;
    void fetchLiveHotDeals();
    const adminToken = sessionStorage.getItem('sayrhub_admin_token') || sessionStorage.getItem('travelway_admin_token');
    const userToken = sessionStorage.getItem('sayrhub_user_token') || sessionStorage.getItem('travelway_user_token');
    const token = adminToken || userToken;
    const headers = token ? { Authorization: 'Bearer ' + token } : undefined;
    const load = async <T,>(url: string, key: string): Promise<T[]> => {
      const response = await fetch(url, { headers });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || key + ' ?????????????? ???? ???????.');
      return Array.isArray(data[key]) ? data[key] as T[] : [];
    };

    Promise.all([
      load<TourPackage>('/api/db/tours', 'tours'),
      load<ComboTour>('/api/combo/tours', 'comboTours'),
      load<FlightTicket>('/api/flights/search', 'flights'),
      load<HotelOnly>('/api/hotels/search', 'hotels'),
    ]).then(([nextTours, nextCombos, nextFlights, nextHotels]) => {
      if (!active) return;
      setTours(nextTours);
      setComboTours(nextCombos);
      setFlights(nextFlights);
      setHotels(nextHotels);
    }).catch((error: unknown) => {
      if (!active) return;
      setTours([]);
      setComboTours([]);
      setFlights([]);
      setHotels([]);
      console.error('Catalog load from MongoDB failed:', error);
    });

    if (token) {
      fetch('/api/db/bookings', { headers })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok || !data.success) throw new Error(data.error || 'Bronlarni olib bo?lmadi.');
          if (active) setBookings(Array.isArray(data.bookings) ? data.bookings : []);
        })
        .catch((error) => { if (active) { setBookings([]); console.error('Bookings load failed:', error); } });
      fetch('/api/db/price-alerts', { headers })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok || !data.success) throw new Error(data.error || 'Narx signallarini olib bo?lmadi.');
          if (active) setPriceAlerts(Array.isArray(data.alerts) ? data.alerts : []);
        })
        .catch((error) => { if (active) { setPriceAlerts([]); console.error('Price alerts load failed:', error); } });
    } else {
      setBookings([]);
      setPriceAlerts([]);
    }

    if (userToken) {
      fetch('/api/db/users/me', { headers: { Authorization: 'Bearer ' + userToken } })
        .then(async (response) => {
          const data = await response.json();
          if (!response.ok || !data.success) throw new Error(data.error || 'Profilni olib bo?lmadi.');
          if (!active) return;
          const profile = data.user;
          setUser({
            name: profile.name || '', phone: profile.phone || '', email: profile.email || '',
            tcId: profile.tcId, cashback: profile.cashbackBalance || 0,
            passportNumber: profile.passportNumber || '', passportExpiry: profile.passportExpiry || '',
            dob: profile.dob || '', isVerified: Boolean(profile.isVerified),
            telegramId: profile.telegramId, telegramUsername: profile.telegramUsername,
            favoriteTourIds: Array.isArray(profile.favoriteTourIds) ? profile.favoriteTourIds : [],
          });
          setCards(Array.isArray(profile.paymentCards) ? profile.paymentCards : []);
          const favoriteIds = new Set<string>(profile.favoriteTourIds || []);
          setTours((prev) => prev.map((tour) => ({ ...tour, saved: favoriteIds.has(tour.id) })));
        })
        .catch((error) => console.error('User profile load from MongoDB failed:', error));
    }
    return () => { active = false; };
  }, [isAdminAuthenticated, user.tcId]);

  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [activePriceAlertTour, setActivePriceAlertTour] = useState<TourPackage | null>(null);

  const handleSavePriceAlert = async (alertData: {
    tourId: string;
    tourTitle: string;
    tourLocation: string;
    tourImg: string;
    currentPrice: number;
    targetPrice: number;
    notifyViaPush: boolean;
    notifyViaTelegram: boolean;
    userEmail?: string;
  }) => {
    const token = getUserToken();
    if (!token) {
      showToast('Narx signalini saqlash uchun avval tizimga kiring.', 'error');
      return;
    }
    const newAlert: PriceAlert = {
      id: 'alert-' + Date.now(),
      ...alertData,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    try {
      await requestApi('/api/db/price-alerts', {
        method: 'POST', body: JSON.stringify(newAlert),
      }, token);
      setPriceAlerts((prev) => [newAlert, ...prev.filter((alert) => alert.tourId !== newAlert.tourId)]);
      showToast('Narx signali bazaga saqlandi.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Narx signalini saqlab bo?lmadi.', 'error');
    }
  };

  const handleDeletePriceAlert = async (alertId: string) => {
    const token = getUserToken() || getAdminToken();
    try {
      if (!token) throw new Error('Narx signalini o?chirish uchun tizimga kiring.');
      await requestApi('/api/db/price-alerts/' + encodeURIComponent(alertId), { method: 'DELETE' }, token);
      setPriceAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
      showToast('Narx signali o?chirildi.', 'info');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Narx signalini o?chirib bo?lmadi.', 'error');
    }
  };

  // Modals state
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpPhone, setOtpPhone] = useState('');
  const [isTelegramAuthOpen, setIsTelegramAuthOpen] = useState(false);
  const [socialProvider, setSocialProvider] = useState<'google' | null>(null);
  const [tourDetails, setTourDetails] = useState<TourPackage | null>(null);
  const [checkoutTour, setCheckoutTour] = useState<TourPackage | null>(null);
  const [checkoutTravelers, setCheckoutTravelers] = useState<number>(2);
  const [checkoutAdults, setCheckoutAdults] = useState<number>(2);
  const [checkoutChildren, setCheckoutChildren] = useState<number>(0);
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);
  const [cancelBookingTarget, setCancelBookingTarget] = useState<Booking | null>(null);
  const [isEditPassportOpen, setIsEditPassportOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [activeVoucherBooking, setActiveVoucherBooking] = useState<Booking | null>(null);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, text, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);



  // Theme update
  useEffect(() => {
    try {
      localStorage.setItem('sayrhub_theme_mode', themeMode);
      localStorage.setItem('travelway_theme_mode', themeMode);
    } catch (e) {}
    if (themeMode === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, [themeMode]);

  // Tour favorite toggle
  const handleToggleSaveTour = async (tourId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const favoriteTourIds = new Set(user.favoriteTourIds || []);
    const wasSaved = favoriteTourIds.has(tourId);
    if (wasSaved) favoriteTourIds.delete(tourId);
    else favoriteTourIds.add(tourId);
    const nextFavoriteTourIds = [...favoriteTourIds];
    const nextUser = { ...user, favoriteTourIds: nextFavoriteTourIds };
    try {
      await saveUserProfileToDB(nextUser, cards, nextFavoriteTourIds);
      setUser(nextUser);
      setTours((prev) => prev.map((tour) => ({ ...tour, saved: favoriteTourIds.has(tour.id) })));
      showToast(wasSaved ? 'Saqlanganlardan olib tashlandi' : "Turpaket saqlanganlarga qo'shildi", 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Saqlangan turlarni yangilab bo‘lmadi.', 'error');
    }
  };

  // OTP Handlers
  const handleRequestOtp = (_phone: string) => {
    showToast('SMS orqali kirish xizmati sozlanmagan. Telegram orqali kiring.', 'error');
  };

  const handleVerifyOtp = (_code: string) => {
    setIsOtpOpen(false);
    showToast('SMS tasdiqlash xizmati sozlanmagan.', 'error');
  };

  const handleTelegramAuth = () => {
    setIsTelegramAuthOpen(true);
  };

  const handleTelegramAuthSuccess = (tgUser: any) => {
    if (tgUser) {
      const updatedUser: UserProfile = {
        ...user,
        name: tgUser.name || user.name,
        phone: tgUser.phone || user.phone,
        email: tgUser.email || user.email,
        passportNumber: tgUser.passportNumber || user.passportNumber,
        passportExpiry: tgUser.passportExpiry || user.passportExpiry,
        telegramId: tgUser.telegramId || '',
        telegramUsername: tgUser.telegramUsername || '',
        cashback: Math.max(user.cashback, tgUser.cashbackBalance || 30),
        isVerified: true
      };
      setUser(updatedUser);
      showToast(`Xush kelibsiz, ${updatedUser.name}! SayrHub'ga kirdingiz`, 'success');
    } else {
      showToast("Xush kelibsiz! Telegram orqali ro'yxatdan o'tildi", 'success');
    }

    setCurrentTab('search');
  };

  // MongoDB Booking helpers
  const saveBookingToDB = async (booking: Booking) => {
    const token = getUserToken();
    if (!token) throw new Error('Bron qilish uchun avval Telegram orqali tizimga kiring.');
    await requestApi('/api/db/bookings', {
      method: 'POST',
      body: JSON.stringify(booking),
    }, token);
  };

  const persistBooking = async (booking: Booking) => {
    try {
      await saveBookingToDB(booking);
      setBookings((prev) => [booking, ...prev]);
      return true;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Bronni bazaga saqlab bo‘lmadi.', 'error');
      return false;
    }
  };

  const deleteBookingFromDB = async (id: string) => {
    const token = getUserToken() || getAdminToken();
    if (!token) throw new Error('Bronni o‘chirish uchun tizimga kiring.');
    await requestApi('/api/db/bookings/' + encodeURIComponent(id), { method: 'DELETE' }, token);
  };

  // Booking handlers
  const handleConfirmBooking = async (bookingData: {
    tour: TourPackage;
    travelerName: string;
    phone?: string;
    passport: string;
    dob: string;
    payType: string;
    discount: number;
    travelersCount?: number;
    adultsCount?: number;
    childrenCount?: number;
  }) => {
    const travelers = bookingData.travelersCount || checkoutTravelers || 2;
    const adults = bookingData.adultsCount !== undefined ? bookingData.adultsCount : 2;
    const children = bookingData.childrenCount !== undefined ? bookingData.childrenCount : 0;
    const code = `TW-BR-${Date.now()}`;

    const perAdult = bookingData.tour.isLiveKompas
      ? Math.round(bookingData.tour.price / 2)
      : bookingData.tour.price;
    const perChild = perAdult;
    const packageTotal = (adults * perAdult) + (children * perChild);
    const total = Math.max(0, packageTotal - bookingData.discount);

    const depDate = bookingData.tour.departureDate?.trim() || '';
    const nights = bookingData.tour.nightsCount || (bookingData.tour.nights.match(/\d+/) ? parseInt(bookingData.tour.nights.match(/\d+/)![0], 10) : 0);
    const dateParts = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(depDate);
    const startDateObj = new Date(dateParts
      ? `${dateParts[3]}-${dateParts[2]}-${dateParts[1]}T00:00:00.000Z`
      : depDate);
    if (!depDate || Number.isNaN(startDateObj.getTime()) || nights <= 0) {
      showToast('Bron yaratish uchun turda to‘g‘ri jo‘nash sanasi va kechalar soni bo‘lishi kerak.', 'error');
      return;
    }
    const endDateObj = new Date(startDateObj.getTime() + nights * 86400000);
    const endDateStr = endDateObj.toISOString().slice(0, 10);

    const formattedDates = `${startDateObj.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' })} — ${endDateObj.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' })}`;

    const priceText = children > 0
      ? `$${total} (${travelers} kishi: ${adults} katta, ${children} bola)`
      : `$${total} (${travelers} kishi: ${adults} katta)`;

    const newBooking: Booking = {
      id: `b${Date.now()}`,
      tourTitle: bookingData.tour.title,
      dest: bookingData.tour.location,
      dates: formattedDates,
      startDate: depDate,
      endDate: endDateStr,
      status: 'Jarayonda',
      voucherId: code,
      price: priceText,
      totalNumeric: total,
      travelerName: bookingData.travelerName,
      travelerPhone: bookingData.phone || user.phone,
      travelerPassport: bookingData.passport || user.passportNumber,
      type: 'active',
      hotelImg: bookingData.tour.img,
      flight: bookingData.tour.flight,
      airline: bookingData.tour.airline,
      nightsCount: nights,
      guestsCount: travelers,
      adultsCount: adults,
      childrenCount: children
    };

    if (!(await persistBooking(newBooking))) return;
    setCheckoutTour(null);
    setSuccessBooking(newBooking);
    showToast('Bron so‘rovi bazaga saqlandi. Tasdiqlanishini kuting.', 'success');
  };

  const handleBookHotDeal = async (deal: HotSale) => {
    if (!deal.title || !Number.isFinite(deal.priceNumeric)) {
      showToast('Taklif ma’lumotlari noto‘g‘ri, bron yaratilmadi.', 'error');
      return;
    }
    const code = `TW-BR-${Date.now()}`;
    const newBooking: Booking = {
      id: `b${Date.now()}`,
      tourTitle: deal.title,
      dest: deal.location || '—',
      dates: deal.checkinDate || '—',
      status: 'Jarayonda',
      voucherId: code,
      price: `${deal.price} (1 kishi)`,
      totalNumeric: deal.priceNumeric,
      travelerName: user.name,
      type: 'active',
      guestsCount: 1,
      adultsCount: 1,
      childrenCount: 0
    };

    if (!(await persistBooking(newBooking))) return;
    showToast(`"${deal.title}" bron so‘rovi bazaga saqlandi.`, 'success');
    setCurrentTab('trips');
  };

  const handleBookCombo = async (combo: ComboTour) => {
    const code = `TW-BR-${Date.now()}`;
    const newBooking: Booking = {
      id: `combo-${Date.now()}`,
      tourTitle: combo.title,
      dest: combo.routeSummary,
      dates: `${combo.departureDate} (${combo.nightsSplit})`,
      startDate: combo.departureDate,
      endDate: combo.departureDate,
      status: 'Jarayonda',
      voucherId: code,
      price: `$${combo.price} (Combo)`,
      totalNumeric: combo.price,
      travelerName: user.name,
      type: 'active',
      hotelImg: combo.img,
      flight: combo.flight,
      airline: combo.airline,
      nightsCount: combo.nightsTotal,
      guestsCount: 2,
      adultsCount: 2,
      childrenCount: 0
    };
    if (!(await persistBooking(newBooking))) return;
    showToast(`"${combo.title}" bron so‘rovi bazaga saqlandi.`, 'success');
  };

  const handleBookFlight = async (flight: FlightTicket) => {
    const code = `TW-BR-${Date.now()}`;
    const newBooking: Booking = {
      id: `fl-${Date.now()}`,
      tourTitle: `${flight.airline} (${flight.flightNumber}) Aviachipta`,
      dest: `${flight.departureCity} (${flight.departureAirportCode}) ➔ ${flight.arrivalCity} (${flight.arrivalAirportCode})`,
      dates: `${flight.departureDate} (${flight.departureTime})`,
      startDate: flight.departureDate,
      endDate: flight.returnDate || flight.departureDate,
      status: 'Jarayonda',
      voucherId: code,
      price: `$${flight.price} (Aviabilet)`,
      totalNumeric: flight.price,
      travelerName: user.name,
      type: 'active',
      hotelImg: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=80',
      flight: `${flight.airline} ${flight.flightNumber}`,
      airline: flight.airline,
      nightsCount: 0,
      guestsCount: 1,
      adultsCount: 1,
      childrenCount: 0
    };
    if (!(await persistBooking(newBooking))) return;
    showToast(`"${flight.flightNumber}" bron so‘rovi bazaga saqlandi.`, 'success');
  };

  const handleBookHotel = async (hotel: HotelOnly) => {
    const code = `TW-BR-${Date.now()}`;
    const newBooking: Booking = {
      id: `ht-${Date.now()}`,
      tourTitle: hotel.name,
      dest: `${hotel.resort}, ${hotel.country}`,
      dates: `${hotel.nightsCount} kecha (${hotel.roomType})`,
      status: 'Jarayonda',
      voucherId: code,
      price: `$${hotel.totalPrice} (Faqat mehmonxona)`,
      totalNumeric: hotel.totalPrice,
      travelerName: user.name,
      type: 'active',
      hotelImg: hotel.img,
      flight: '',
      airline: '',
      nightsCount: hotel.nightsCount,
      guestsCount: 2,
      adultsCount: 2,
      childrenCount: 0
    };
    if (!(await persistBooking(newBooking))) return;
    showToast(`"${hotel.name}" bron so‘rovi bazaga saqlandi.`, 'success');
  };

  const getAdminToken = () => sessionStorage.getItem('sayrhub_admin_token') || sessionStorage.getItem('travelway_admin_token') || '';
  const getUserToken = () => sessionStorage.getItem('sayrhub_user_token') || sessionStorage.getItem('travelway_user_token') || '';
  const getAuthHeaders = (token = getAdminToken()): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: 'Bearer ' + token } : {}),
  });
  const requestApi = async (url: string, init: RequestInit = {}, token = getAdminToken()) => {
    const response = await fetch(url, {
      ...init,
      headers: { ...getAuthHeaders(token), ...(init.headers as Record<string, string> || {}) },
    });
    const data = await response.json() as { success?: boolean; error?: string };
    if (!response.ok || !data.success) throw new Error(data.error || 'Server so?rovni bajara olmadi.');
    return data;
  };
  const saveUserProfileToDB = async (nextUser: UserProfile, nextCards = cards, favoriteTourIds = nextUser.favoriteTourIds || []) => {
    const token = getUserToken();
    if (!token) throw new Error('Profilni saqlash uchun avval tizimga kiring.');
    await requestApi('/api/db/users', {
      method: 'POST',
      body: JSON.stringify({ ...nextUser, cashbackBalance: nextUser.cashback, paymentCards: nextCards, favoriteTourIds }),
    }, token);
  };

  const handleCancelBooking = (bookingId: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (target) {
      setCancelBookingTarget(target);
    }
  };

  const handleConfirmCancelBooking = async (reason?: string) => {
    if (cancelBookingTarget) {
      const targetId = cancelBookingTarget.id;
      const cancellationReason = reason || "Foydalanuvchi tomonidan bekor qilindi";
      const cancelledAt = new Date().toISOString();
      const token = getUserToken() || getAdminToken();
      try {
        await requestApi('/api/db/bookings/' + encodeURIComponent(targetId), {
          method: 'PUT',
          body: JSON.stringify({
            status: 'Bekor qilingan',
            type: 'cancelled',
            cancellationReason,
            cancelledAt,
          }),
        }, token);
      } catch (error) {
        showToast(error instanceof Error ? error.message : 'Bronni bekor qilib bo‘lmadi.', 'error');
        return;
      }
      setBookings((prev) =>
        prev.map((b) =>
          b.id === targetId
            ? {
                ...b,
                status: 'Bekor qilingan' as const,
                type: 'cancelled' as const,
                cancellationReason,
                cancelledAt
              }
            : b
        )
      );

      showToast(`"${cancelBookingTarget.tourTitle}" buyurtmasi bekor qilindi.`, 'info');
      setCancelBookingTarget(null);
    }
  };

  const handleRemoveBooking = async (bookingId: string) => {
    try {
      await deleteBookingFromDB(bookingId);
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
      showToast("Buyurtma tarixdan o'chirildi.", 'info');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Bronni o‘chirib bo‘lmadi.', 'error');
    }
  };

  // ADMIN OPERATIONS (database-backed CRUD)
  const handleAddTour = async (tour: TourPackage) => {
    await requestApi('/api/db/tours', { method: 'POST', body: JSON.stringify(tour) });
    setTours((prev) => [tour, ...prev.filter((item) => item.id !== tour.id)]);
  };
  const handleUpdateTour = async (tour: TourPackage) => {
    await requestApi('/api/db/tours', { method: 'POST', body: JSON.stringify(tour) });
    setTours((prev) => [tour, ...prev.filter((item) => item.id !== tour.id)]);
  };
  const handleDeleteTour = async (tourId: string) => {
    await requestApi('/api/db/tours/' + encodeURIComponent(tourId), { method: 'DELETE' });
    setTours((prev) => prev.filter((tour) => tour.id !== tourId));
  };

  const handleAddComboTour = async (combo: ComboTour) => {
    await requestApi('/api/db/catalog/combo-tours', { method: 'POST', body: JSON.stringify(combo) });
    setComboTours((prev) => [combo, ...prev.filter((item) => item.id !== combo.id)]);
  };
  const handleUpdateComboTour = handleAddComboTour;
  const handleDeleteComboTour = async (id: string) => {
    await requestApi('/api/db/catalog/combo-tours/' + encodeURIComponent(id), { method: 'DELETE' });
    setComboTours((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddFlight = async (flight: FlightTicket) => {
    await requestApi('/api/db/catalog/flights', { method: 'POST', body: JSON.stringify(flight) });
    setFlights((prev) => [flight, ...prev.filter((item) => item.id !== flight.id)]);
  };
  const handleUpdateFlight = handleAddFlight;
  const handleDeleteFlight = async (id: string) => {
    await requestApi('/api/db/catalog/flights/' + encodeURIComponent(id), { method: 'DELETE' });
    setFlights((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddHotel = async (hotel: HotelOnly) => {
    await requestApi('/api/db/catalog/hotels', { method: 'POST', body: JSON.stringify(hotel) });
    setHotels((prev) => [hotel, ...prev.filter((item) => item.id !== hotel.id)]);
  };
  const handleUpdateHotel = handleAddHotel;
  const handleDeleteHotel = async (id: string) => {
    await requestApi('/api/db/catalog/hotels/' + encodeURIComponent(id), { method: 'DELETE' });
    setHotels((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      await requestApi('/api/db/bookings/' + encodeURIComponent(bookingId), {
        method: 'PUT', body: JSON.stringify({ status }),
      });
      setBookings((prev) => prev.map((booking) => booking.id === bookingId ? { ...booking, status } : booking));
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Bron holatini yangilab bo?lmadi.', 'error');
    }
  };
  const handleAdminCancelBooking = async (bookingId: string) => {
    try {
      await requestApi('/api/db/bookings/' + encodeURIComponent(bookingId), { method: 'DELETE' });
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Bronni o?chirib bo?lmadi.', 'error');
    }
  };

  const handleAddStaff = async (staff: AdminUser) => {
    await requestApi('/api/admin/staff', { method: 'POST', body: JSON.stringify(staff) });
    const safeStaff = { ...staff, password: undefined };
    setAdminStaffList((prev) => [safeStaff, ...prev.filter((item) => item.id !== staff.id)]);
  };
  const handleUpdateStaff = async (staff: AdminUser) => {
    await requestApi('/api/admin/staff', { method: 'POST', body: JSON.stringify(staff) });
    const safeStaff = { ...staff, password: undefined };
    setAdminStaffList((prev) => prev.map((item) => item.id === staff.id ? safeStaff : item));
  };
  const handleRemoveStaff = async (staffId: string) => {
    await requestApi('/api/admin/staff/' + encodeURIComponent(staffId), { method: 'DELETE' });
    setAdminStaffList((prev) => prev.filter((item) => item.id !== staffId));
  };

  const handleUpdateCommissionRate = async (newRate: number) => {
    const cleanRate = Math.max(0, Math.min(100, Number(newRate) || 0));
    const nextTours = tours.map((tour) => {
      if (tour.markupType !== 'percent' || tour.originalCostPrice === undefined) return tour;
      return { ...tour, price: Math.round(tour.originalCostPrice * (1 + cleanRate / 100)), markupValue: cleanRate };
    });
    const nextHotels = hotels.map((hotel) => {
      if (hotel.markupType !== 'percent' || hotel.originalCostPrice === undefined) return hotel;
      const totalPrice = Math.round(hotel.originalCostPrice * (1 + cleanRate / 100));
      return { ...hotel, totalPrice, pricePerNight: Math.round(totalPrice / Math.max(1, hotel.nightsCount)), markupValue: cleanRate };
    });
    const nextFlights = flights.map((flight) => {
      if (flight.markupType !== 'percent' || flight.originalCostPrice === undefined) return flight;
      return { ...flight, price: Math.round(flight.originalCostPrice * (1 + cleanRate / 100)), markupValue: cleanRate };
    });
    try {
      await Promise.all([
        ...nextTours.filter((item, index) => item !== tours[index]).map((item) => requestApi('/api/db/tours', { method: 'POST', body: JSON.stringify(item) })),
        ...nextHotels.filter((item, index) => item !== hotels[index]).map((item) => requestApi('/api/db/catalog/hotels', { method: 'POST', body: JSON.stringify(item) })),
        ...nextFlights.filter((item, index) => item !== flights[index]).map((item) => requestApi('/api/db/catalog/flights', { method: 'POST', body: JSON.stringify(item) })),
      ]);
      await requestApi('/api/admin/commission', {
        method: 'POST', body: JSON.stringify({ commissionRate: cleanRate }),
      });
      setTours(nextTours);
      setHotels(nextHotels);
      setFlights(nextFlights);
      setAgencyCommissionRate(cleanRate);
      showToast('Agentlik komissiyasi va narxlar bazada yangilandi.', 'success');
    } catch (error) {
      throw error instanceof Error ? error : new Error('Komissiya sozlamasini saqlab bo‘lmadi.');
    }
  };

  const handleSavePassport = async (passportNumber: string, passportExpiry: string) => {
    const nextUser = { ...user, passportNumber, passportExpiry };
    try {
      await saveUserProfileToDB(nextUser);
      setUser(nextUser);
      setIsEditPassportOpen(false);
      showToast("Pasport ma'lumotlari bazada yangilandi.", 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Pasport ma’lumotlarini saqlab bo‘lmadi.', 'error');
    }
  };

  const handleConfirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    sessionStorage.removeItem('sayrhub_user_token');
    sessionStorage.removeItem('travelway_user_token');
    setUser({
      name: '', phone: '', email: '', tcId: '', cashback: 0,
      passportNumber: '', passportExpiry: '', dob: '', isVerified: false,
      favoriteTourIds: [],
    });
    setCards([]);
    setBookings([]);
    setPriceAlerts([]);
    setTours((prev) => prev.map((tour) => ({ ...tour, saved: false })));
    setCurrentTab('auth');
    showToast("Profilingizdan xavfsiz chiqildi. Xush kelibsiz!", 'info');
  };

  const handleSaveProfile = async (name: string, phone: string) => {
    const nextUser = { ...user, name, phone };
    try {
      await saveUserProfileToDB(nextUser);
      setUser(nextUser);
      setIsEditProfileOpen(false);
      showToast('Profil ma’lumotlari bazada yangilandi.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Profil ma’lumotlarini saqlab bo‘lmadi.', 'error');
    }
  };

  const handleSaveCard = async (cardData: Omit<PaymentCard, 'id' | 'isPrimary'>) => {
    const newCard: PaymentCard = {
      id: `c${Date.now()}`,
      ...cardData,
      isPrimary: false
    };
    const nextCards = [...cards, newCard];
    try {
      await saveUserProfileToDB(user, nextCards);
      setCards(nextCards);
      setIsAddCardOpen(false);
      showToast("Yangi karta bazada saqlandi.", 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Kartani saqlab bo‘lmadi.', 'error');
    }
  };

  const userInitials = (user.name || 'TW')
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'TW';

  const savedToursList = tours.filter((t) => t.saved);
  const exploreItems = useMemo(() => {
    const categories: ExploreVibe['vibe'][] = ['beach', 'culture', 'mountain', 'luxury'];
    return categories.flatMap((vibe) => {
      const matchingTours = tours.filter((tour) => tour.category === vibe);
      if (matchingTours.length === 0) return [];
      const representative = matchingTours[0];
      return [{
        id: vibe,
        vibe,
        title: representative.country || representative.location,
        badge: representative.tag,
        count: `${matchingTours.length} ta tur`,
        priceFrom: `$${Math.min(...matchingTours.map((tour) => tour.price))}`,
        img: representative.img,
        destQuery: representative.resort || representative.location,
      }];
    });
  }, [tours]);

  // DESKTOP ADMIN PANEL FULLSCREEN VIEW
  if (isAdminMode) {
    if (!isAdminAuthenticated) {
      return (
        <Suspense fallback={<div className="min-h-svh animate-pulse bg-muted" />}>
        <AdminLoginPage
          onLoginSuccess={(role, adminData) => {
            try {
              sessionStorage.setItem('sayrhub_admin_auth', 'true');
              sessionStorage.setItem('travelway_admin_auth', 'true');
              if (adminData) {
                sessionStorage.setItem('sayrhub_active_admin_user', JSON.stringify(adminData));
                sessionStorage.setItem('travelway_active_admin_user', JSON.stringify(adminData));
                setCurrentAdminUser(adminData);
              }
            } catch (e) {}
            setIsAdminAuthenticated(true);
            if (role === 'tour_admin' || role === 'main_admin') {
              setCurrentAdminRole(role as AdminRole);
            }
          }}
          onExitToApp={handleExitAdmin}
          onShowToast={showToast}
        />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<div className="min-h-svh animate-pulse bg-muted" />}>
      <AdminPage
        currentRole={currentAdminRole}
        currentAdminUser={currentAdminUser}
        onSwitchRole={(role) => {
          setCurrentAdminRole(role);
          showToast(`Rol o'zgartirildi: ${role === 'main_admin' ? 'Bosh Admin' : 'Tur Admin'}`, 'info');
        }}
        onExitToApp={handleAdminLogout}
        tours={tours}
        onAddTour={handleAddTour}
        onUpdateTour={handleUpdateTour}
        onDeleteTour={handleDeleteTour}
        comboTours={comboTours}
        onAddComboTour={handleAddComboTour}
        onUpdateComboTour={handleUpdateComboTour}
        onDeleteComboTour={handleDeleteComboTour}
        flights={flights}
        onAddFlight={handleAddFlight}
        onUpdateFlight={handleUpdateFlight}
        onDeleteFlight={handleDeleteFlight}
        hotels={hotels}
        onAddHotel={handleAddHotel}
        onUpdateHotel={handleUpdateHotel}
        onDeleteHotel={handleDeleteHotel}
        bookings={bookings}
        onUpdateBookingStatus={handleUpdateBookingStatus}
        onCancelBooking={handleAdminCancelBooking}
        priceAlerts={priceAlerts}
        onDeletePriceAlert={handleDeletePriceAlert}
        staffList={adminStaffList}
        onAddStaff={handleAddStaff}
        onUpdateStaff={handleUpdateStaff}
        onRemoveStaff={handleRemoveStaff}
        onShowToast={showToast}
        agencyCommissionRate={agencyCommissionRate}
        onUpdateCommissionRate={handleUpdateCommissionRate}
      />
      </Suspense>
    );
  }

  return (
    <div
      id="app-container"
      data-theme={themeMode}
      className="min-h-screen w-full flex flex-col font-sans select-none overflow-x-hidden bg-background text-foreground transition-colors duration-200"
    >
      {/* Dynamic Desktop / Mobile Header */}
      <Header
        currentTab={currentTab}
        onTabSelect={(tab) => setCurrentTab(tab)}
        onOpenQr={() => setIsQrOpen(true)}
        onToggleNotifs={() => {
          setHasUnreadNotifs(false);
          showToast("Yangi bildirishnoma: Maldiv va Dubay turlariga 30% chegirmalar!", 'info');
        }}
        hasUnreadNotifs={hasUnreadNotifs}
        userInitials={userInitials}
        userName={user.name}
        themeMode={themeMode}
        onToggleTheme={() => {
          const next = themeMode === 'light' ? 'dark' : 'light';
          setThemeMode(next);
          showToast(
            next === 'light'
              ? "Kungi rejim (Light Mode) yoqildi"
              : "Tungi rejim (Dark Mode) yoqildi",
            'info'
          );
        }}
        onOpenAdmin={() => setIsAdminMode(true)}
        onAvatarClick={() => {
          if (currentTab !== 'profile') {
            setCurrentTab('profile');
          } else {
            showToast(`Akkaunt: ${user.name} (${user.tcId})`, 'info');
          }
        }}
        activeTripsCount={bookings.length}
      />

      {/* Main Viewport Container */}
      {showFlutterCode ? (
        <div className="flex-1 w-full max-w-4xl mx-auto p-4 flex items-center justify-center">
          <div className="w-full h-[820px] max-h-[90vh]">
            <Suspense fallback={<div className="h-full animate-pulse rounded-2xl bg-muted" />}>
              <FlutterCodeViewer
                onClose={() => setShowFlutterCode(false)}
                onShowToast={showToast}
              />
            </Suspense>
          </div>
        </div>
      ) : (
        <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 relative">
          <Suspense fallback={<div className="min-h-[60vh] animate-pulse rounded-2xl bg-muted" />}>
          {checkoutTour ? (
            <TourBookingPage
              tour={checkoutTour}
              initialAdults={checkoutAdults}
              initialChildren={checkoutChildren}
              initialTravelers={checkoutTravelers}
              currentName={user.name}
              currentPhone={user.phone}
              currentPassport={user.passportNumber}
              onBack={() => setCheckoutTour(null)}
              onConfirmBooking={handleConfirmBooking}
              onShowToast={showToast}
              onOpenPriceAlert={(tour) => setActivePriceAlertTour(tour)}
            />
          ) : (
            <>
              {currentTab === 'auth' && (
                <div className="max-w-md mx-auto py-2 sm:py-6">
                  <AuthScreen
                    currentLang={currentLang}
                    onSelectLang={(lang) => {
                      setCurrentLang(lang);
                      showToast(`Ilova tili ${lang} ga o'zgartirildi`, 'info');
                    }}
                    onBack={() => setCurrentTab('search')}
                    onOpenSupport={() => setIsSupportOpen(true)}
                    onRequestOtp={handleRequestOtp}
                    onTelegramAuth={handleTelegramAuth}
                    onShowToast={showToast}
                  />
                </div>
              )}

              {currentTab === 'search' && (
                <SearchScreen
                  tours={tours}
                  comboTours={comboTours}
                  flights={flights}
                  hotels={hotels}
                  onToggleSave={handleToggleSaveTour}
                  onOpenTourDetails={(tour) => setTourDetails(tour)}
                  onQuickBook={(tour, count, adults, children) => {
                    setCheckoutTravelers(count || 2);
                    setCheckoutAdults(adults !== undefined ? adults : 2);
                    setCheckoutChildren(children !== undefined ? children : 0);
                    setCheckoutTour(tour);
                  }}
                  onShowToast={showToast}
                  priceAlerts={priceAlerts}
                  onSavePriceAlert={handleSavePriceAlert}
                  onDeletePriceAlert={handleDeletePriceAlert}
                  onBookCombo={handleBookCombo}
                  onBookFlight={handleBookFlight}
                  onBookHotel={handleBookHotel}
                  agencyCommissionRate={agencyCommissionRate}
                />
              )}

              {currentTab === 'explore' && (
                <ExploreScreen
                  exploreItems={exploreItems}
                  onSelectVibeItem={(dest) => {
                    showToast(`${dest} tanlandi!`, 'info');
                    setCurrentTab('search');
                  }}
                />
              )}

              {currentTab === 'hot' && (
                <HotDealsScreen
                  hotDeals={hotDeals}
                  onBookHotDeal={handleBookHotDeal}
                  onRefreshHotDeals={fetchLiveHotDeals}
                  isRefreshing={isRefreshingHotDeals}
                />
              )}

              {currentTab === 'trips' && (
                <TripsScreen
                  bookings={bookings}
                  savedTours={savedToursList}
                  onOpenTourModal={(tour) => setTourDetails(tour)}
                  onDownloadVoucher={(id, b) => setActiveVoucherBooking(b)}
                  onCancelBooking={handleCancelBooking}
                  onRemoveBooking={handleRemoveBooking}
                  onRemoveSaved={(id) => handleToggleSaveTour(id)}
                  onNavigateToSearch={() => setCurrentTab('search')}
                />
              )}

              {currentTab === 'profile' && (
                <ProfileScreen
                  user={user}
                  cards={cards}
                  tripsCount={bookings.length}
                  savedCount={savedToursList.length}
                  currentLang={currentLang}
                  themeMode={themeMode}
                  notificationsEnabled={notificationsEnabled}
                  onOpenEditProfile={() => setIsEditProfileOpen(true)}
                  onEditPassport={() => setIsEditPassportOpen(true)}
                  onOpenAddCard={() => setIsAddCardOpen(true)}
                  onSetPrimaryCard={async (cardId) => {
                    const nextCards = cards.map((card) => ({ ...card, isPrimary: card.id === cardId }));
                    try {
                      await saveUserProfileToDB(user, nextCards);
                      setCards(nextCards);
                      showToast("Asosiy karta bazada yangilandi.", 'success');
                    } catch (error) {
                      showToast(error instanceof Error ? error.message : 'Asosiy kartani yangilab bo‘lmadi.', 'error');
                    }
                  }}
                  onDeleteCard={async (cardId) => {
                    if (cards.length <= 1) {
                      showToast("Kamida 1 ta faol karta qolishi kerak!", 'error');
                      return;
                    }
                    const nextCards = cards.filter((card) => card.id !== cardId);
                    try {
                      await saveUserProfileToDB(user, nextCards);
                      setCards(nextCards);
                      showToast("Karta bazadan o'chirildi.", 'info');
                    } catch (error) {
                      showToast(error instanceof Error ? error.message : 'Kartani o‘chirib bo‘lmadi.', 'error');
                    }
                  }}
                  onSelectLang={(lang) => {
                    setCurrentLang(lang);
                    showToast(`Til o'zgartirildi: ${lang}`, 'info');
                  }}
                  onSelectTheme={(theme) => {
                    setThemeMode(theme);
                    showToast(`${theme === 'light' ? 'Kunduzgi' : theme === 'dark' ? 'Tungi' : 'Avtomatik'} rejim yoqildi`, 'info');
                  }}
                  onToggleNotifications={() => {
                    setNotificationsEnabled(!notificationsEnabled);
                    showToast(notificationsEnabled ? "Push bildirishnomalar o'chirildi" : "Push bildirishnomalar yoqildi", 'info');
                  }}
                  onOpenSupport={() => setIsSupportOpen(true)}
                  onLogout={() => setIsLogoutConfirmOpen(true)}
                  onShowToast={showToast}
                />
              )}
            </>
          )}
          </Suspense>
        </main>
      )}

      {/* Mobile-Only Bottom Navigation Dock (Hidden during dedicated checkout page) */}
      {!checkoutTour && (
        <BottomNav
          currentTab={currentTab}
          onTabSelect={(tab) => setCurrentTab(tab)}
          activeTripsCount={bookings.length}
        />
      )}
      <footer className="border-t border-border py-2 text-center text-[10px] text-muted-foreground">
        <a
          href="https://www.flaticon.com/uicons"
          target="_blank"
          rel="noreferrer"
          className="hover:text-primary hover:underline"
        >
          Uicons by Flaticon
        </a>
      </footer>

          {/* Interactive Modals Overlays */}
          {(isOtpOpen ||
            socialProvider !== null ||
            tourDetails !== null ||
            successBooking !== null ||
            isQrOpen ||
            isSupportOpen ||
            isEditProfileOpen ||
            isEditPassportOpen ||
            cancelBookingTarget !== null ||
            isLogoutConfirmOpen ||
            isAddCardOpen ||
            activeVoucherBooking !== null) && (
          <Suspense fallback={null}>
          <Modals
            isOtpOpen={isOtpOpen}
            otpPhone={otpPhone}
            onCloseOtp={() => setIsOtpOpen(false)}
            onVerifyOtp={handleVerifyOtp}
            socialProvider={socialProvider}
            onCloseSocial={() => setSocialProvider(null)}
            tourDetails={tourDetails}
            onCloseTourDetails={() => setTourDetails(null)}
            onProceedToCheckout={(t) => {
              setTourDetails(null);
              setCheckoutTour(t);
            }}
            onOpenPriceAlert={(tour) => setActivePriceAlertTour(tour)}
            checkoutTour={null}
            checkoutTravelers={checkoutTravelers}
            checkoutAdults={checkoutAdults}
            checkoutChildren={checkoutChildren}
            onCloseCheckout={() => setCheckoutTour(null)}
            onConfirmBooking={handleConfirmBooking}
            successBooking={successBooking}
            onCloseSuccess={() => setSuccessBooking(null)}
            onViewInTrips={() => {
              setSuccessBooking(null);
              setCurrentTab('trips');
            }}
            isQrOpen={isQrOpen}
            userName={user.name}
            userId={user.tcId}
            onCloseQr={() => setIsQrOpen(false)}
            isSupportOpen={isSupportOpen}
            onCloseSupport={() => setIsSupportOpen(false)}
            onStartLiveChat={() => {
              setIsSupportOpen(false);
              showToast("SayrHub Support Telegram boti (@sayrhub_support) ochilmoqda...", 'info');
            }}
            isEditProfileOpen={isEditProfileOpen}
            currentName={user.name}
            currentPhone={user.phone}
            onCloseEditProfile={() => setIsEditProfileOpen(false)}
            onSaveProfile={handleSaveProfile}
            isEditPassportOpen={isEditPassportOpen}
            currentPassport={user.passportNumber}
            currentPassportExpiry={user.passportExpiry}
            onCloseEditPassport={() => setIsEditPassportOpen(false)}
            onSavePassport={handleSavePassport}
            cancelBookingTarget={cancelBookingTarget}
            onCloseCancelBooking={() => setCancelBookingTarget(null)}
            onConfirmCancelBooking={handleConfirmCancelBooking}
            isLogoutConfirmOpen={isLogoutConfirmOpen}
            onCloseLogoutConfirm={() => setIsLogoutConfirmOpen(false)}
            onConfirmLogout={handleConfirmLogout}
            isAddCardOpen={isAddCardOpen}
            onCloseAddCard={() => setIsAddCardOpen(false)}
            onSaveCard={handleSaveCard}
            activeVoucherBooking={activeVoucherBooking}
            onCloseVoucherPreview={() => setActiveVoucherBooking(null)}
            onShowToast={showToast}
          />
          </Suspense>
          )}

          {/* Global Price Alert Modal (accessible from Tour Details) */}
          {activePriceAlertTour && <Suspense fallback={null}><PriceAlertModal
            isOpen={Boolean(activePriceAlertTour)}
            tour={activePriceAlertTour}
            existingAlert={priceAlerts.find((a) => a.tourId === activePriceAlertTour?.id)}
            userEmail={user.email}
            onClose={() => setActivePriceAlertTour(null)}
            onSaveAlert={handleSavePriceAlert}
            onDeleteAlert={handleDeletePriceAlert}
          /></Suspense>}

          {/* Telegram Auth & Registration Modal */}
          {isTelegramAuthOpen && <Suspense fallback={null}><TelegramAuthModal
            isOpen={isTelegramAuthOpen}
            onClose={() => setIsTelegramAuthOpen(false)}
            onSuccess={handleTelegramAuthSuccess}
            onShowToast={showToast}
          /></Suspense>}

          {/* In-app Toast Messages Overlay */}
          <div className="fixed top-16 inset-x-4 z-50 pointer-events-none flex flex-col items-center gap-2">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2.5 transform transition-all duration-300 pointer-events-auto border backdrop-blur-md ${
                  t.type === 'success'
                    ? 'bg-emerald-600 text-white border-emerald-500/30'
                    : t.type === 'error'
                    ? 'bg-destructive text-destructive-foreground border-destructive/30'
                    : 'bg-card text-card-foreground border-border'
                }`}
              >
                {t.type === 'success' ? (
                  <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                ) : t.type === 'error' ? (
                  <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <Bell className="size-4 shrink-0" aria-hidden="true" />
                )}
                <span>{t.text}</span>
              </div>
            ))}
          </div>
    </div>
  );
}
