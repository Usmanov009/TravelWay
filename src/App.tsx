import React, { useState, useEffect } from 'react';
import { TabType, LanguageCode, ThemeMode, TourPackage, Booking, PaymentCard, UserProfile, ToastMessage, PriceAlert, ComboTour, FlightTicket, HotelOnly } from './types';
import {
  INITIAL_USER,
  INITIAL_CARDS,
  INITIAL_TOURS,
  INITIAL_BOOKINGS,
  INITIAL_EXPLORE_VIBES,
  INITIAL_HOT_SALES
} from './data/mockData';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { AuthScreen } from './components/AuthScreen';
import { SearchScreen } from './components/SearchScreen';
import { ExploreScreen } from './components/ExploreScreen';
import { HotDealsScreen } from './components/HotDealsScreen';
import { TripsScreen } from './components/TripsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { Modals } from './components/Modals';
import { FlutterCodeViewer } from './components/FlutterCodeViewer';
import { PriceAlertModal } from './components/PriceAlertModal';
import { AdminPage } from './admin/AdminPage';
import { AdminRole, AdminUser } from './admin/adminTypes';
import { INITIAL_ADMIN_STAFF } from './admin/adminMockData';
import { INITIAL_COMBO_TOURS, INITIAL_FLIGHTS, INITIAL_HOTELS_ONLY } from './data/extraServicesData';

export default function App() {
  // Navigation & Screen state
  const [currentTab, setCurrentTab] = useState<TabType>('auth');
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [showFlutterCode, setShowFlutterCode] = useState(false);

  // App settings
  const [currentLang, setCurrentLang] = useState<LanguageCode>('UZ');
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('travelway_theme_mode');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch (e) {}
    return 'light';
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(true);

  // Data state
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [cards, setCards] = useState<PaymentCard[]>(INITIAL_CARDS);
  const [tours, setTours] = useState<TourPackage[]>(INITIAL_TOURS);
  const [comboTours, setComboTours] = useState<ComboTour[]>(INITIAL_COMBO_TOURS);
  const [flights, setFlights] = useState<FlightTicket[]>(INITIAL_FLIGHTS);
  const [hotels, setHotels] = useState<HotelOnly[]>(INITIAL_HOTELS_ONLY);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_BOOKINGS);
  const [hotDeals, setHotDeals] = useState<any[]>(INITIAL_HOT_SALES);
  const [isRefreshingHotDeals, setIsRefreshingHotDeals] = useState<boolean>(false);

  // Desktop Admin Panel State
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [currentAdminRole, setCurrentAdminRole] = useState<AdminRole>('main_admin');
  const [adminStaffList, setAdminStaffList] = useState<AdminUser[]>(INITIAL_ADMIN_STAFF);

  const fetchLiveHotDeals = async () => {
    setIsRefreshingHotDeals(true);
    try {
      const res = await fetch('/api/kompas/hot');
      const data = await res.json();
      if (data.success && Array.isArray(data.hotDeals) && data.hotDeals.length > 0) {
        setHotDeals(data.hotDeals);
      }
    } catch (e) {
      console.warn('Live hot deals error:', e);
    } finally {
      setIsRefreshingHotDeals(false);
    }
  };

  useEffect(() => {
    fetchLiveHotDeals();
  }, []);

  // Price Alerts State
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem('travelway_price_alerts') || localStorage.getItem('tripcraft_price_alerts');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'alert-sample-1',
        tourId: 't1',
        tourTitle: 'Rixos Premium Belek',
        tourLocation: 'Antalya, Turkiya',
        tourImg: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
        currentPrice: 890,
        targetPrice: 790,
        createdAt: '22-may',
        status: 'active',
        notifyViaPush: true,
        notifyViaTelegram: true,
        userEmail: 'jasur.travel@gmail.com'
      }
    ];
  });
  const [activePriceAlertTour, setActivePriceAlertTour] = useState<TourPackage | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('travelway_price_alerts', JSON.stringify(priceAlerts));
    } catch (e) {}
  }, [priceAlerts]);

  const handleSavePriceAlert = (alertData: {
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
    setPriceAlerts((prev) => {
      const filtered = prev.filter((a) => a.tourId !== alertData.tourId);
      const newAlert: PriceAlert = {
        id: `alert-${Date.now()}`,
        tourId: alertData.tourId,
        tourTitle: alertData.tourTitle,
        tourLocation: alertData.tourLocation,
        tourImg: alertData.tourImg,
        currentPrice: alertData.currentPrice,
        targetPrice: alertData.targetPrice,
        createdAt: new Date().toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' }),
        status: 'active',
        notifyViaPush: alertData.notifyViaPush,
        notifyViaTelegram: alertData.notifyViaTelegram,
        userEmail: alertData.userEmail
      };
      return [...filtered, newAlert];
    });

    showToast(
      `🔔 "${alertData.tourTitle}" uchun narx signali (< $${alertData.targetPrice}) muvaffaqiyatli saqlandi!`,
      'success'
    );
  };

  const handleDeletePriceAlert = (alertId: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== alertId));
    showToast("Narx signali o'chirildi", 'info');
  };

  const handleSimulatePriceDrop = (tourId: string, simulatedPrice: number) => {
    setTours((prev) =>
      prev.map((t) => {
        if (t.id === tourId) {
          return {
            ...t,
            oldPrice: t.price,
            price: simulatedPrice
          };
        }
        return t;
      })
    );

    const alert = priceAlerts.find((a) => a.tourId === tourId);
    const targetTour = tours.find((t) => t.id === tourId);
    const title = targetTour ? targetTour.title : 'Tanlangan tur';

    setHasUnreadNotifs(true);
    showToast(
      `🎉 NARX TUSHDI! "${title}" narxi $${simulatedPrice} ga pasaydi (Chegara: < $${alert?.targetPrice || simulatedPrice + 10})!`,
      'success'
    );
  };

  // Modals state
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const [otpPhone, setOtpPhone] = useState('');
  const [socialProvider, setSocialProvider] = useState<'google' | null>(null);
  const [tourDetails, setTourDetails] = useState<TourPackage | null>(null);
  const [checkoutTour, setCheckoutTour] = useState<TourPackage | null>(null);
  const [checkoutTravelers, setCheckoutTravelers] = useState<number>(2);
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

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, text, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };



  // Theme update
  useEffect(() => {
    try {
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
  const handleToggleSaveTour = (tourId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTours((prev) =>
      prev.map((t) => {
        if (t.id === tourId) {
          const newSaved = !t.saved;
          showToast(
            newSaved ? "Turpaket saqlanganlarga qo'shildi ❤️" : "Saqlanganlardan olib tashlandi",
            newSaved ? 'success' : 'info'
          );
          return { ...t, saved: newSaved };
        }
        return t;
      })
    );
  };

  // OTP Handlers
  const handleRequestOtp = (phone: string) => {
    setOtpPhone(phone);
    setIsOtpOpen(true);
    showToast(`SMS kod yuborildi: Test kodi [ 7 7 8 8 ]`, 'info');
  };

  const handleVerifyOtp = (code: string) => {
    setIsOtpOpen(false);
    showToast('SMS tasdiqlash muvaffaqiyatli o\'tdi! ✓', 'success');
    setCurrentTab('search');
  };

  // Social Auth
  const handleSelectSocialAccount = (name: string, email: string) => {
    setSocialProvider(null);
    showToast(`${name} (${email}) orqali muvaffaqiyatli kirdingiz!`, 'success');
    setCurrentTab('search');
  };

  const handleTelegramAuth = () => {
    showToast('Telegram sessiyasi tekshirilmoqda...', 'info');
    setTimeout(() => {
      showToast('Telegram orqali (@jasur_traveler) muvaffaqiyatli ulandi! ✓', 'success');
      setCurrentTab('search');
    }, 600);
  };

  // Booking handlers
  const handleConfirmBooking = (bookingData: {
    tour: TourPackage;
    travelerName: string;
    passport: string;
    dob: string;
    payType: string;
    discount: number;
    travelersCount?: number;
  }) => {
    const travelers = bookingData.travelersCount || checkoutTravelers || 2;
    const code = `TW-VOUCHER-${Math.floor(1000 + Math.random() * 9000)}`;
    const packageTotal = bookingData.tour.isLiveKompas
      ? bookingData.tour.price
      : bookingData.tour.price * travelers;
    const total = Math.max(0, packageTotal - bookingData.discount);

    const depDate = bookingData.tour.departureDate || '2026-10-15';
    const nights = bookingData.tour.nightsCount || (bookingData.tour.nights.match(/\d+/) ? parseInt(bookingData.tour.nights.match(/\d+/)![0], 10) : 7);
    const startDateObj = new Date(depDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setDate(endDateObj.getDate() + nights);
    const endDateStr = endDateObj.toISOString().split('T')[0];

    const formattedDates = `${startDateObj.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short' })} — ${endDateObj.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' })}`;

    const newBooking: Booking = {
      id: `b${Date.now()}`,
      tourTitle: bookingData.tour.title,
      dest: bookingData.tour.location,
      dates: formattedDates,
      startDate: depDate,
      endDate: endDateStr,
      status: 'Tasdiqlangan',
      voucherId: code,
      price: `$${total} (${travelers} kishi)`,
      totalNumeric: total,
      travelerName: bookingData.travelerName,
      type: 'active',
      hotelImg: bookingData.tour.img,
      flight: bookingData.tour.flight,
      airline: bookingData.tour.airline,
      nightsCount: nights
    };

    setBookings((prev) => [newBooking, ...prev]);
    setCheckoutTour(null);
    setSuccessBooking(newBooking);
    showToast(`Tur muvaffaqiyatli saqlandi! Vaucher tayyorlandi.`, 'success');
  };

  const handleBookHotDeal = (deal: any) => {
    const code = `VOUCHER-HOT${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      id: `b${Date.now()}`,
      tourTitle: deal.title,
      dest: deal.location || 'Antalya - Dubay',
      dates: 'Yaqin 3 kun ichida',
      status: 'Tasdiqlangan',
      voucherId: code,
      price: `${deal.price} (1 kishi)`,
      totalNumeric: deal.priceNumeric || 495,
      travelerName: user.name,
      type: 'active'
    };

    setBookings((prev) => [newBooking, ...prev]);
    showToast(`🔥 Qaynoq tur "${deal.title}" muvaffaqiyatli band qilindi!`, 'success');
    setCurrentTab('trips');
  };

  const handleBookCombo = (combo: ComboTour) => {
    const code = `TW-COMBO-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      id: `combo-${Date.now()}`,
      tourTitle: combo.title,
      dest: combo.routeSummary,
      dates: `${combo.departureDate} (${combo.nightsSplit})`,
      startDate: combo.departureDate,
      endDate: combo.departureDate,
      status: 'Tasdiqlangan',
      voucherId: code,
      price: `$${combo.price} (Combo)`,
      totalNumeric: combo.price,
      travelerName: user.name,
      type: 'active',
      hotelImg: combo.img,
      flight: combo.flight,
      airline: combo.airline,
      nightsCount: combo.nightsTotal
    };
    setBookings((prev) => [newBooking, ...prev]);
    showToast(`"${combo.title}" combo turi muvaffaqiyatli band qilindi!`, 'success');
  };

  const handleBookFlight = (flight: FlightTicket) => {
    const code = `TW-ETKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      id: `fl-${Date.now()}`,
      tourTitle: `${flight.airline} (${flight.flightNumber}) Aviachipta`,
      dest: `${flight.departureCity} (${flight.departureAirportCode}) ➔ ${flight.arrivalCity} (${flight.arrivalAirportCode})`,
      dates: `${flight.departureDate} (${flight.departureTime})`,
      startDate: flight.departureDate,
      endDate: flight.returnDate || flight.departureDate,
      status: 'Tasdiqlangan',
      voucherId: code,
      price: `$${flight.price} (Aviabilet)`,
      totalNumeric: flight.price,
      travelerName: user.name,
      type: 'active',
      hotelImg: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&auto=format&fit=crop&q=80',
      flight: `${flight.airline} ${flight.flightNumber}`,
      airline: flight.airline,
      nightsCount: 0
    };
    setBookings((prev) => [newBooking, ...prev]);
    showToast(`"${flight.flightNumber}" reysiga aviachipta band qilindi!`, 'success');
  };

  const handleBookHotel = (hotel: HotelOnly) => {
    const code = `TW-HOTEL-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      id: `ht-${Date.now()}`,
      tourTitle: hotel.name,
      dest: `${hotel.resort}, ${hotel.country}`,
      dates: `${hotel.nightsCount} kecha (${hotel.roomType})`,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + hotel.nightsCount * 86400000).toISOString().split('T')[0],
      status: 'Tasdiqlangan',
      voucherId: code,
      price: `$${hotel.totalPrice} (Faqat mehmonxona)`,
      totalNumeric: hotel.totalPrice,
      travelerName: user.name,
      type: 'active',
      hotelImg: hotel.img,
      flight: "Mehmonxona vaucheri (Aviaparvozsiz)",
      airline: "O'z hisobidan",
      nightsCount: hotel.nightsCount
    };
    setBookings((prev) => [newBooking, ...prev]);
    showToast(`"${hotel.name}" mehmonxonasi muvaffaqiyatli band qilindi!`, 'success');
  };

  const handleCancelBooking = (bookingId: string) => {
    const target = bookings.find((b) => b.id === bookingId);
    if (target) {
      setCancelBookingTarget(target);
    }
  };

  const handleConfirmCancelBooking = () => {
    if (cancelBookingTarget) {
      setBookings((prev) => prev.filter((b) => b.id !== cancelBookingTarget.id));
      showToast(`"${cancelBookingTarget.tourTitle}" buyurtmasi bekor qilindi. Mablag' to'liq qaytarildi.`, 'info');
      setCancelBookingTarget(null);
    }
  };

  // ADMIN OPERATIONS (CRUD FOR TOURS, COMBOS, FLIGHTS, HOTELS, BOOKINGS, STAFF)
  const handleAddTour = (tour: TourPackage) => {
    setTours((prev) => [tour, ...prev]);
  };
  const handleUpdateTour = (tour: TourPackage) => {
    setTours((prev) => prev.map((t) => t.id === tour.id ? tour : t));
  };
  const handleDeleteTour = (tourId: string) => {
    setTours((prev) => prev.filter((t) => t.id !== tourId));
  };

  const handleAddComboTour = (combo: ComboTour) => {
    setComboTours((prev) => [combo, ...prev]);
  };
  const handleUpdateComboTour = (combo: ComboTour) => {
    setComboTours((prev) => prev.map((c) => c.id === combo.id ? combo : c));
  };
  const handleDeleteComboTour = (comboId: string) => {
    setComboTours((prev) => prev.filter((c) => c.id !== comboId));
  };

  const handleAddFlight = (flight: FlightTicket) => {
    setFlights((prev) => [flight, ...prev]);
  };
  const handleUpdateFlight = (flight: FlightTicket) => {
    setFlights((prev) => prev.map((f) => f.id === flight.id ? flight : f));
  };
  const handleDeleteFlight = (flightId: string) => {
    setFlights((prev) => prev.filter((f) => f.id !== flightId));
  };

  const handleAddHotel = (hotel: HotelOnly) => {
    setHotels((prev) => [hotel, ...prev]);
  };
  const handleUpdateHotel = (hotel: HotelOnly) => {
    setHotels((prev) => prev.map((h) => h.id === hotel.id ? hotel : h));
  };
  const handleDeleteHotel = (hotelId: string) => {
    setHotels((prev) => prev.filter((h) => h.id !== hotelId));
  };

  const handleUpdateBookingStatus = (bookingId: string, status: Booking['status']) => {
    setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status } : b));
  };
  const handleAdminCancelBooking = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
  };

  const handleAddStaff = (staff: AdminUser) => {
    setAdminStaffList((prev) => [staff, ...prev]);
  };
  const handleUpdateStaff = (staff: AdminUser) => {
    setAdminStaffList((prev) => prev.map((s) => s.id === staff.id ? staff : s));
  };
  const handleRemoveStaff = (staffId: string) => {
    setAdminStaffList((prev) => prev.filter((s) => s.id !== staffId));
  };

  const handleSavePassport = (passportNumber: string, passportExpiry: string) => {
    setUser((prev) => ({ ...prev, passportNumber, passportExpiry }));
    setIsEditPassportOpen(false);
    showToast("Zagran pasport ma'lumotlari muvaffaqiyatli yangilandi! ✓", 'success');
  };

  const handleConfirmLogout = () => {
    setIsLogoutConfirmOpen(false);
    setCurrentTab('auth');
    showToast("Profilingizdan xavfsiz chiqildi. Xush kelibsiz!", 'info');
  };

  const handleSaveProfile = (name: string, phone: string) => {
    setUser((prev) => ({ ...prev, name, phone }));
    setIsEditProfileOpen(false);
    showToast("Profil ma'lumotlari muvaffaqiyatli yangilandi! ✓", 'success');
  };

  const handleSaveCard = (cardData: Omit<PaymentCard, 'id' | 'isPrimary'>) => {
    const newCard: PaymentCard = {
      id: `c${Date.now()}`,
      ...cardData,
      isPrimary: false
    };
    setCards((prev) => [...prev, newCard]);
    setIsAddCardOpen(false);
    showToast("Yangi to'lov kartasi muvaffaqiyatli saqlandi! 💳", 'success');
  };

  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const savedToursList = tours.filter((t) => t.saved);

  // DESKTOP ADMIN PANEL FULLSCREEN VIEW
  if (isAdminMode) {
    return (
      <AdminPage
        currentRole={currentAdminRole}
        onSwitchRole={(role) => {
          setCurrentAdminRole(role);
          showToast(`Rol o'zgartirildi: ${role === 'main_admin' ? '👑 Bosh Admin' : '🧳 Tur Admin'}`, 'info');
        }}
        onExitToApp={() => setIsAdminMode(false)}
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
        onSimulatePriceDrop={handleSimulatePriceDrop}
        onDeletePriceAlert={handleDeletePriceAlert}
        staffList={adminStaffList}
        onAddStaff={handleAddStaff}
        onUpdateStaff={handleUpdateStaff}
        onRemoveStaff={handleRemoveStaff}
        onShowToast={showToast}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start sm:justify-center p-0 sm:p-4 font-sans select-none overflow-x-hidden">
      {/* Main Container / Mobile Device Frame */}
      {showFlutterCode ? (
        <div className="w-full max-w-2xl h-[820px] max-h-[92vh]">
          <FlutterCodeViewer
            onClose={() => setShowFlutterCode(false)}
            onShowToast={showToast}
          />
        </div>
      ) : (
        <div
          id="app-container"
          data-theme={themeMode}
          style={{
            backgroundColor: 'var(--tw-canvas)',
            color: 'var(--tw-text-main)'
          }}
          className="relative w-full max-w-[420px] h-[900px] max-h-[100vh] sm:max-h-[96vh] rounded-none sm:rounded-[50px] border-0 sm:border-[8px] sm:border-slate-800 phone-shadow flex flex-col overflow-hidden transition-colors duration-200"
        >
          {/* Dynamic Mobile Header */}
          <Header
            currentTab={currentTab}
            onOpenQr={() => setIsQrOpen(true)}
            onToggleNotifs={() => {
              setHasUnreadNotifs(false);
              showToast("Yangi bildirishnoma: Maldiv va Dubay turlariga 30% chegirmalar!", 'info');
            }}
            hasUnreadNotifs={hasUnreadNotifs}
            userInitials={userInitials}
            themeMode={themeMode}
            onToggleTheme={() => {
              const next = themeMode === 'light' ? 'dark' : 'light';
              setThemeMode(next);
              showToast(
                next === 'light'
                  ? "Kungi rejim (Light Mode) yoqildi ☀️"
                  : "Tungi rejim (Dark Mode) yoqildi 🌙",
                'info'
              );
            }}
            onAvatarClick={() => {
              if (currentTab !== 'profile') {
                setCurrentTab('profile');
              } else {
                showToast(`Akkaunt: ${user.name} (${user.tcId})`, 'info');
              }
            }}
          />

          {/* Main Scrollable Viewport */}
          <main className="flex-1 overflow-y-auto no-scrollbar relative p-4 space-y-4">
            {currentTab === 'auth' && (
              <AuthScreen
                currentLang={currentLang}
                onSelectLang={(lang) => {
                  setCurrentLang(lang);
                  showToast(`Ilova tili ${lang} ga o'zgartirildi`, 'info');
                }}
                onBack={() => setCurrentTab('search')}
                onOpenSupport={() => setIsSupportOpen(true)}
                onRequestOtp={handleRequestOtp}
                onOpenSocial={(p) => setSocialProvider(p)}
                onTelegramAuth={handleTelegramAuth}
                onAuthSuccess={(msg) => {
                  showToast(msg, 'success');
                  setCurrentTab('search');
                }}
                onShowToast={showToast}
              />
            )}

            {currentTab === 'search' && (
              <SearchScreen
                tours={tours}
                comboTours={comboTours}
                flights={flights}
                hotels={hotels}
                onToggleSave={handleToggleSaveTour}
                onOpenTourDetails={(tour) => setTourDetails(tour)}
                onQuickBook={(tour, count) => {
                  setCheckoutTravelers(count || 2);
                  setCheckoutTour(tour);
                }}
                onShowToast={showToast}
                priceAlerts={priceAlerts}
                onSavePriceAlert={handleSavePriceAlert}
                onDeletePriceAlert={handleDeletePriceAlert}
                onSimulatePriceDrop={handleSimulatePriceDrop}
                onBookCombo={handleBookCombo}
                onBookFlight={handleBookFlight}
                onBookHotel={handleBookHotel}
              />
            )}

            {currentTab === 'explore' && (
              <ExploreScreen
                exploreItems={INITIAL_EXPLORE_VIBES}
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
                onSetPrimaryCard={(cardId) => {
                  setCards((prev) => prev.map((c) => ({ ...c, isPrimary: c.id === cardId })));
                  showToast("Asosiy to'lov kartasi yangilandi", 'info');
                }}
                onDeleteCard={(cardId) => {
                  if (cards.length <= 1) {
                    showToast("Kamida 1 ta faol karta qolishi kerak!", 'error');
                    return;
                  }
                  setCards((prev) => prev.filter((c) => c.id !== cardId));
                  showToast("Karta o'chirildi", 'info');
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
                  showToast(notificationsEnabled ? "Push bildirishnomalar o'chirildi" : "Push bildirishnomalar yoqildi 🔔", 'info');
                }}
                onOpenSupport={() => setIsSupportOpen(true)}
                onLogout={() => setIsLogoutConfirmOpen(true)}
                onShowToast={showToast}
              />
            )}
          </main>

          {/* Bottom Native Tab Bar */}
          <BottomNav
            currentTab={currentTab}
            onTabSelect={(tab) => setCurrentTab(tab)}
            activeTripsCount={bookings.length}
          />

          {/* Interactive Modals Overlays */}
          <Modals
            isOtpOpen={isOtpOpen}
            otpPhone={otpPhone}
            onCloseOtp={() => setIsOtpOpen(false)}
            onVerifyOtp={handleVerifyOtp}
            socialProvider={socialProvider}
            onCloseSocial={() => setSocialProvider(null)}
            onSelectSocialAccount={handleSelectSocialAccount}
            tourDetails={tourDetails}
            onCloseTourDetails={() => setTourDetails(null)}
            onProceedToCheckout={(t) => {
              setTourDetails(null);
              setCheckoutTour(t);
            }}
            onOpenPriceAlert={(tour) => setActivePriceAlertTour(tour)}
            checkoutTour={checkoutTour}
            checkoutTravelers={checkoutTravelers}
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
              showToast("TravelWay Support Telegram boti (@travelway_support) ochilmoqda...", 'info');
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

          {/* Global Price Alert Modal (accessible from Tour Details) */}
          <PriceAlertModal
            isOpen={Boolean(activePriceAlertTour)}
            tour={activePriceAlertTour}
            existingAlert={priceAlerts.find((a) => a.tourId === activePriceAlertTour?.id)}
            userEmail={user.email}
            onClose={() => setActivePriceAlertTour(null)}
            onSaveAlert={handleSavePriceAlert}
            onDeleteAlert={handleDeletePriceAlert}
            onSimulatePriceDrop={handleSimulatePriceDrop}
          />

          {/* In-app Toast Messages Overlay */}
          <div className="absolute top-16 inset-x-4 z-50 pointer-events-none flex flex-col items-center gap-2">
            {toasts.map((t) => (
              <div
                key={t.id}
                className={`px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 transform transition-all duration-300 pointer-events-auto border ${
                  t.type === 'success'
                    ? 'bg-emerald-600/95 text-white border-emerald-400'
                    : t.type === 'error'
                    ? 'bg-rose-600/95 text-white border-rose-400'
                    : 'bg-[#182740]/95 text-white border-[#2d4268]'
                }`}
              >
                <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '⚠️' : '🔔'}</span>
                <span>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
