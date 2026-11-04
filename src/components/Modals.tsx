import React, { lazy, Suspense, useState, useEffect } from 'react';
import { TourPackage, Booking, PaymentCard } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  X,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Headphones,
  Bell,
  Star,
  MapPin,
  Plane,
  Download,
  Trash2,
  ShieldCheck,
  CreditCard,
  User,
  AlertTriangle,
  Globe2,
  BriefcaseBusiness,
  Building2,
  Hotel,
  Users,
  Baby,
  FileText,
  PartyPopper,
  Phone,
  DoorOpen
} from '@/lib/flaticon-icons';

const SingleTourMap = lazy(() =>
  import('./GoogleTourMap').then((module) => ({ default: module.SingleTourMap }))
);

interface ModalsProps {
  // OTP Modal
  isOtpOpen: boolean;
  otpPhone: string;
  onCloseOtp: () => void;
  onVerifyOtp: (code: string) => void;

  // Social Modal
  socialProvider: 'google' | null;
  onCloseSocial: () => void;

  // Tour Details Modal
  tourDetails: TourPackage | null;
  onCloseTourDetails: () => void;
  onProceedToCheckout: (tour: TourPackage) => void;
  onOpenPriceAlert?: (tour: TourPackage) => void;

  // Checkout Modal
  checkoutTour: TourPackage | null;
  checkoutTravelers?: number;
  checkoutAdults?: number;
  checkoutChildren?: number;
  onCloseCheckout: () => void;
  onConfirmBooking: (bookingData: {
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
  }) => Promise<void>;

  // Booking Success Modal
  successBooking: Booking | null;
  onCloseSuccess: () => void;
  onViewInTrips: () => void;

  // QR Modal
  isQrOpen: boolean;
  userName: string;
  userId: string;
  onCloseQr: () => void;

  // Support Modal
  isSupportOpen: boolean;
  onCloseSupport: () => void;
  onStartLiveChat: () => void;

  // Edit Profile Modal
  isEditProfileOpen: boolean;
  currentName: string;
  currentPhone: string;
  onCloseEditProfile: () => void;
  onSaveProfile: (name: string, phone: string) => void;

  // Edit Passport Modal
  isEditPassportOpen: boolean;
  currentPassport: string;
  currentPassportExpiry: string;
  onCloseEditPassport: () => void;
  onSavePassport: (passportNumber: string, passportExpiry: string) => void;

  // Cancel Booking Modal
  cancelBookingTarget: Booking | null;
  onCloseCancelBooking: () => void;
  onConfirmCancelBooking: (reason?: string) => void;

  // Logout Modal
  isLogoutConfirmOpen: boolean;
  onCloseLogoutConfirm: () => void;
  onConfirmLogout: () => void;

  // Add Card Modal
  isAddCardOpen: boolean;
  onCloseAddCard: () => void;
  onSaveCard: (card: Omit<PaymentCard, 'id' | 'isPrimary'>) => void;

  // Voucher Preview Modal
  activeVoucherBooking: Booking | null;
  onCloseVoucherPreview: () => void;

  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const Modals: React.FC<ModalsProps> = ({
  isOtpOpen,
  otpPhone,
  onCloseOtp,
  onVerifyOtp,
  socialProvider,
  onCloseSocial,
  tourDetails,
  onCloseTourDetails,
  onProceedToCheckout,
  onOpenPriceAlert,
  checkoutTour,
  checkoutTravelers = 2,
  checkoutAdults = 2,
  checkoutChildren = 0,
  onCloseCheckout,
  onConfirmBooking,
  successBooking,
  onCloseSuccess,
  onViewInTrips,
  isQrOpen,
  userName,
  userId,
  onCloseQr,
  isSupportOpen,
  onCloseSupport,
  onStartLiveChat,
  isEditProfileOpen,
  currentName,
  currentPhone,
  onCloseEditProfile,
  onSaveProfile,
  isEditPassportOpen,
  currentPassport,
  currentPassportExpiry,
  onCloseEditPassport,
  onSavePassport,
  cancelBookingTarget,
  onCloseCancelBooking,
  onConfirmCancelBooking,
  isLogoutConfirmOpen,
  onCloseLogoutConfirm,
  onConfirmLogout,
  isAddCardOpen,
  onCloseAddCard,
  onSaveCard,
  activeVoucherBooking,
  onCloseVoucherPreview,
  onShowToast
}) => {
  // OTP state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpSeconds, setOtpSeconds] = useState(59);

  // Checkout & Travelers state
  const [adultsCount, setAdultsCount] = useState<number>(checkoutAdults || 2);
  const [childrenCount, setChildrenCount] = useState<number>(checkoutChildren || 0);
  const [bookingTravelerName, setBookingTravelerName] = useState<string>(currentName || '');
  const [bookingPhone, setBookingPhone] = useState<string>(currentPhone || '');
  const [bookingPassport, setBookingPassport] = useState<string>(currentPassport || '');
  const [selectedPayType, setSelectedPayType] = useState('humo');
  const [cancelReason, setCancelReason] = useState<string>("Rejalarim o'zgardi");

  // Sync checkout travelers count & user data
  useEffect(() => {
    if (checkoutAdults !== undefined) setAdultsCount(checkoutAdults);
    if (checkoutChildren !== undefined) setChildrenCount(checkoutChildren);
    setBookingTravelerName(currentName || '');
    setBookingPhone(currentPhone || '');
    setBookingPassport(currentPassport || '');
  }, [checkoutAdults, checkoutChildren, checkoutTour, currentName, currentPhone, currentPassport]);

  // Edit profile state
  const [editName, setEditName] = useState(currentName);
  const [editPhone, setEditPhone] = useState(currentPhone);

  // Edit passport state
  const [editPassNumber, setEditPassNumber] = useState(currentPassport);
  const [editPassExpiry, setEditPassExpiry] = useState(currentPassportExpiry);

  useEffect(() => {
    setEditPassNumber(currentPassport);
    setEditPassExpiry(currentPassportExpiry);
  }, [currentPassport, currentPassportExpiry]);

  // Add card state
  const [newCardType, setNewCardType] = useState<'HUMO' | 'UZCARD' | 'VISA'>('HUMO');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardBank, setNewCardBank] = useState('');

  // Sync profile edits
  useEffect(() => {
    setEditName(currentName);
    setEditPhone(currentPhone);
  }, [currentName, currentPhone]);

  // OTP Countdown timer
  useEffect(() => {
    if (!isOtpOpen) return;
    setOtpDigits(['', '', '', '']);
    setOtpSeconds(59);
    const interval = setInterval(() => {
      setOtpSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOtpOpen]);

  const handleOtpInput = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const copy = [...otpDigits];
    copy[index] = clean;
    setOtpDigits(copy);

    if (clean && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    if (index === 3 && clean) {
      const fullCode = copy.join('');
      if (fullCode.length === 4) {
        setTimeout(() => onVerifyOtp(fullCode), 300);
      }
    }
  };

  return (
    <>
      {/* 1. OTP SMS CODE VERIFICATION MODAL */}
      {isOtpOpen && (
        <div
          id="otp-modal"
          className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end p-0"
        >
          <div
            className="border-t rounded-t-[32px] p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-2xl flex items-center justify-center shadow-inner"
                  style={{
                    backgroundColor: 'var(--tw-accent-light)',
                    color: 'var(--tw-accent)'
                  }}
                >
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold" style={{ color: 'var(--tw-text-main)' }}>Tasdiqlash kodi</h3>
                  <p className="text-[11px]" style={{ color: 'var(--tw-text-sub)' }} id="otp-phone-label">
                    {otpPhone} ga 4 xonali kod yuborildi
                  </p>
                </div>
              </div>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold active:scale-90 border"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
                onClick={onCloseOtp}
                type="button"
              >
                ✕
              </button>
            </div>

            <p className="rounded-xl border p-3 text-xs text-muted-foreground" style={{ borderColor: 'var(--tw-border)' }}>
              SMS tasdiqlash xizmati hozircha sozlanmagan. Telegram orqali kiring.
            </p>

            {/* 4-digit OTP Inputs */}
            <div className="flex justify-center gap-3 py-2">
              {[0, 1, 2, 3].map((idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otpDigits[idx]}
                  onChange={(e) => handleOtpInput(idx, e.target.value)}
                  className="w-12 h-14 border rounded-2xl text-center text-xl font-black focus:outline-none shadow-xs"
                  style={{
                    backgroundColor: 'var(--tw-subtle)',
                    borderColor: 'var(--tw-border)',
                    color: 'var(--tw-text-main)'
                  }}
                />
              ))}
            </div>

            {/* Resend Timer */}
            <div className="text-center py-1">
              {otpSeconds > 0 ? (
                <p className="text-xs" style={{ color: 'var(--tw-text-sub)' }} id="otp-countdown-container">
                  Kodni qayta yuborish:{' '}
                  <span className="font-bold font-mono" style={{ color: 'var(--tw-accent)' }}>
                    00:{otpSeconds < 10 ? `0${otpSeconds}` : otpSeconds}
                  </span>
                </p>
              ) : (
                <button
                  className="text-xs font-bold hover:underline active:scale-95"
                  style={{ color: 'var(--tw-accent)' }}
                  onClick={() => {
                    onShowToast('SMS tasdiqlash xizmati hozircha sozlanmagan.', 'error');
                  }}
                  type="button"
                >
                  Kodni qayta jo'natish
                </button>
              )}
            </div>

            {/* Confirm Button */}
            <button
              className="w-full py-3 font-bold text-xs rounded-xl shadow-md active:scale-98 transition-all flex items-center justify-center gap-1.5"
              style={{
                backgroundColor: 'var(--tw-accent)',
                color: 'var(--tw-accent-contrast)'
              }}
              onClick={() => onVerifyOtp(otpDigits.join(''))}
              type="button"
            >
              <span>Tasdiqlash va Kirish</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. GOOGLE SIGN-IN CHOOSER MODAL */}
      {socialProvider && (
        <div
          id="social-modal"
          className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end p-0"
        >
          <div
            className="border-t rounded-t-[32px] p-5 space-y-4 shadow-2xl"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <div className="flex items-center justify-between pb-1 border-b" style={{ borderColor: 'var(--tw-border)' }}>
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold" style={{ color: 'var(--tw-text-main)' }}>
                  Google akkauntini tanlang
                </h3>
              </div>
              <button
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
                onClick={onCloseSocial}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="rounded-xl border p-3 text-xs text-muted-foreground" style={{ borderColor: 'var(--tw-border)' }}>
              Google orqali kirish hozircha sozlanmagan. Ma’lumotlar bazasiga ulangan kirish uchun Telegramdan foydalaning.
            </div>

            <button
              className="w-full py-2.5 text-xs font-semibold rounded-xl border"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)',
                color: 'var(--tw-text-main)'
              }}
              onClick={onCloseSocial}
              type="button"
            >
              Boshqa hisobdan foydalanish
            </button>
          </div>
        </div>
      )}

      {/* 4. TOUR DETAILS MODAL */}
      {tourDetails && (
        <div
          id="modal-tour-details"
          className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end"
        >
          <div
            className="border-t rounded-t-[32px] p-5 max-h-[85vh] overflow-y-auto no-scrollbar space-y-4 shadow-2xl"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--tw-border)' }}>
              <div>
                <span
                  className="text-[10px] font-bold px-2.5 py-0.5 rounded uppercase"
                  style={{
                    backgroundColor: 'var(--tw-accent)',
                    color: 'var(--tw-accent-contrast)'
                  }}
                >
                  {tourDetails.tag}
                </span>
                <h3 className="text-base font-bold mt-1" style={{ color: 'var(--tw-text-main)' }}>{tourDetails.title}</h3>
              </div>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold border"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
                onClick={onCloseTourDetails}
                type="button"
              >
                ✕
              </button>
            </div>

            {/* Hotel Cover preview banner */}
            <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-800">
              <img src={tourDetails.img} alt={tourDetails.title} className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-0.5 rounded-lg text-xs font-bold text-amber-400">
                ★ {tourDetails.rating} A'lo
              </div>
              <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-[11px] text-white">
                <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {tourDetails.location}</span>
              </div>
            </div>

            {/* Google Interactive Map */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--tw-text-main)' }}>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Joylashuv va Xarita (Google Maps)</span>
                </span>
                <span className="text-[10px] font-medium" style={{ color: 'var(--tw-accent)' }}>
                  {tourDetails.resort || tourDetails.location}
                </span>
              </div>
              <Suspense fallback={<div className="h-[190px] animate-pulse rounded-xl bg-muted" />}>
                <SingleTourMap tour={tourDetails} height="190px" />
              </Suspense>
            </div>

            {/* Uchish / Jo'nab ketish sanasi - faqat olib kirilgan tur paket ichida ko'rinadi */}
            {tourDetails.departureDate && (
              <div
                className="p-3 rounded-2xl border flex items-center justify-between"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider" style={{ color: 'var(--tw-text-sub)' }}>
                      Uchish / Jo'nab ketish sanasi
                    </span>
                    <p className="font-extrabold text-xs sm:text-sm" style={{ color: 'var(--tw-accent)' }}>
                      {tourDetails.departureDate}
                    </p>
                  </div>
                </div>
                {(tourDetails.isLiveKompas || !!tourDetails.kompasTourCode) && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    ✓ Olib kirilgan paket
                  </span>
                )}
              </div>
            )}

            {/* Inclusions Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className="p-2.5 rounded-xl border flex items-center gap-2.5"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <Plane className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>Reys</p>
                  <p className="font-bold text-[11px] truncate" style={{ color: 'var(--tw-text-main)' }}>{tourDetails.flight}</p>
                </div>
              </div>
              <div
                className="p-2.5 rounded-xl border flex items-center gap-2.5"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <Hotel className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>Yashash muddati</p>
                  <p className="font-bold text-[11px]" style={{ color: 'var(--tw-text-main)' }}>{tourDetails.nights || '—'}</p>
                </div>
              </div>
            </div>

            {/* Operator and Agency Trust Block */}
            <div
              className="p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="w-5 h-5 text-primary" />
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold block" style={{ color: 'var(--tw-text-sub)' }}>
                    Bosh Turoperator
                  </span>
                  <span className="font-extrabold text-sky-600 dark:text-sky-400 truncate block">
                    {tourDetails.tourOperator || (tourDetails.isLiveKompas ? 'Kompas Tour' : '—')}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold block" style={{ color: 'var(--tw-text-sub)' }}>
                  Bronlash Agentligi
                </span>
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  <span className="inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> {tourDetails.agencyName || 'SayrHub Agentligi'}</span>
                </span>
              </div>
            </div>

            {/* Price Transparency Breakdown */}
            <div
              className="p-3 rounded-2xl border text-xs space-y-1.5"
              style={{
                backgroundColor: 'var(--tw-surface)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <div className="flex items-center justify-between text-[11px] font-semibold" style={{ color: 'var(--tw-text-sub)' }}>
                <span>Asl turoperator narxi:</span>
                <span className="font-mono font-bold">
                  ${tourDetails.originalCostPrice ?? tourDetails.price}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">
                <span className="flex items-center gap-1">
                  <span className="inline-flex items-center gap-1"><BriefcaseBusiness className="w-3 h-3" /> Agentlik xizmati</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 border border-cyan-500/30">
                    +{tourDetails.markupValue ?? 0}%
                  </span>
                </span>
                <span className="font-mono font-bold">
                  +${Math.max(0, tourDetails.price - (tourDetails.originalCostPrice ?? tourDetails.price))}
                </span>
              </div>
              <div className="pt-1.5 border-t flex items-center justify-between font-bold" style={{ borderColor: 'var(--tw-border)' }}>
                <span className="text-[11px]" style={{ color: 'var(--tw-text-sub)' }}>Mijoz uchun to'liq narx:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                  ${tourDetails.price}
                </span>
              </div>
            </div>

            {/* Price & Action */}
            <div
              className="p-3.5 rounded-2xl border flex items-center justify-between gap-2"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <div>
                <span className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>
                  {tourDetails.isLiveKompas ? 'Kompas manbasidan olingan narx:' : 'Turpaket narxi:'}
                </span>
                <div className="flex items-center gap-1.5">
                  <p className="text-xl font-black" style={{ color: 'var(--tw-accent)' }}>${tourDetails.price}</p>
                  {tourDetails.isLiveKompas && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      Kompas
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onOpenPriceAlert && (
                  <button
                    id="btn-tour-detail-price-alert"
                    className="px-3 py-2.5 border font-bold text-xs rounded-xl tap-bounce flex items-center gap-1.5 transition"
                    style={{
                      backgroundColor: 'var(--tw-surface)',
                      borderColor: 'var(--tw-border)',
                      color: 'var(--tw-accent)'
                    }}
                    onClick={() => {
                      onOpenPriceAlert(tourDetails);
                      onCloseTourDetails();
                    }}
                    type="button"
                    title="Narx tushishiga signal o'rnatish"
                  >
                    <Bell className="w-4 h-4" />
                    <span className="hidden sm:inline">Signal</span>
                  </button>
                )}
                <button
                  className="px-5 py-2.5 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 tap-bounce transition"
                  style={{
                    backgroundColor: 'var(--tw-accent)',
                    color: 'var(--tw-accent-contrast)'
                  }}
                  onClick={() => onProceedToCheckout(tourDetails)}
                  type="button"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Turni Bron Qilish</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. SAYRHUB TOUR SPECIFICATION & CALCULATION SHEET (NO BOOKING REQUIRED) */}
      {checkoutTour && (
        <div
          id="modal-checkout"
          className="absolute inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col justify-end"
        >
          <div
            className="border-t rounded-t-[32px] p-5 max-h-[92vh] overflow-y-auto no-scrollbar space-y-4 shadow-2xl animate-slideUp"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--tw-border)' }}>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider"
                    style={{
                      backgroundColor: 'var(--tw-accent-light)',
                      color: 'var(--tw-accent)'
                    }}
                  >
                    SAYRHUB
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-mono">
                    {checkoutTour.kompasTourCode || '—'}
                  </span>
                </div>
                <h3 className="text-base font-extrabold mt-1" style={{ color: 'var(--tw-text-main)' }}>{checkoutTour.title}</h3>
                <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>
                  {checkoutTour.location} • {checkoutTour.nights}
                </p>
              </div>
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold tap-bounce border"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
                onClick={onCloseCheckout}
                type="button"
              >
                ✕
              </button>
            </div>

            {/* Sayohatchilar va odamlar soni (Kattalar va Yosh Bolalar) */}
            <div
              className="p-3.5 rounded-2xl border space-y-3"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--tw-text-main)' }}>
                  <Users className="w-4 h-4" /> Sayohatchilar tarkibi va soni:
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  Jami: {adultsCount + childrenCount} kishi
                </span>
              </div>

              {/* 1. Katta Odamlar (Adults 12+) */}
              <div
                className="p-2.5 rounded-xl border flex items-center justify-between gap-2"
                style={{
                  backgroundColor: 'var(--tw-surface)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--tw-text-main)' }}><User className="w-3.5 h-3.5" /> Katta odamlar</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-sky-500/10 text-sky-600 dark:text-sky-400">12+ yosh</span>
                  </div>
                  <span className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>To'liq tarif bo'yicha</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setAdultsCount(num)}
                        className="w-7 h-7 rounded-lg text-xs font-bold transition tap-bounce border"
                        style={{
                          backgroundColor: adultsCount === num ? 'var(--tw-accent)' : 'var(--tw-subtle)',
                          color: adultsCount === num ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)',
                          borderColor: adultsCount === num ? 'var(--tw-accent)' : 'var(--tw-border)'
                        }}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <div
                    className="flex items-center border rounded-lg overflow-hidden ml-0.5"
                    style={{ borderColor: 'var(--tw-border)' }}
                  >
                    <button
                      type="button"
                      onClick={() => setAdultsCount((prev) => Math.max(1, prev - 1))}
                      className="w-7 h-7 flex items-center justify-center font-bold text-sm tap-bounce hover:opacity-80 transition"
                      style={{ backgroundColor: 'var(--tw-subtle)', color: 'var(--tw-text-main)' }}
                      title="Kamaytirish"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-xs font-bold" style={{ color: 'var(--tw-text-main)' }}>
                      {adultsCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdultsCount((prev) => Math.min(10, prev + 1))}
                      className="w-7 h-7 flex items-center justify-center font-bold text-sm tap-bounce hover:opacity-80 transition"
                      style={{ backgroundColor: 'var(--tw-subtle)', color: 'var(--tw-text-main)' }}
                      title="Ko'paytirish"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Yosh Bolalar (Children 0-11) */}
              <div
                className="p-2.5 rounded-xl border flex items-center justify-between gap-2"
                style={{
                  backgroundColor: 'var(--tw-surface)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold flex items-center gap-1" style={{ color: 'var(--tw-text-main)' }}><Baby className="w-3.5 h-3.5" /> Yosh bolalar</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">Bola</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">Hisoblangan tarif</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setChildrenCount(num)}
                        className="w-7 h-7 rounded-lg text-xs font-bold transition tap-bounce border"
                        style={{
                          backgroundColor: childrenCount === num ? 'var(--tw-accent)' : 'var(--tw-subtle)',
                          color: childrenCount === num ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)',
                          borderColor: childrenCount === num ? 'var(--tw-accent)' : 'var(--tw-border)'
                        }}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <div
                    className="flex items-center border rounded-lg overflow-hidden ml-0.5"
                    style={{ borderColor: 'var(--tw-border)' }}
                  >
                    <button
                      type="button"
                      onClick={() => setChildrenCount((prev) => Math.max(0, prev - 1))}
                      className="w-7 h-7 flex items-center justify-center font-bold text-sm tap-bounce hover:opacity-80 transition"
                      style={{ backgroundColor: 'var(--tw-subtle)', color: 'var(--tw-text-main)' }}
                      title="Kamaytirish"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-xs font-bold" style={{ color: 'var(--tw-text-main)' }}>
                      {childrenCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setChildrenCount((prev) => Math.min(6, prev + 1))}
                      className="w-7 h-7 flex items-center justify-center font-bold text-sm tap-bounce hover:opacity-80 transition"
                      style={{ backgroundColor: 'var(--tw-subtle)', color: 'var(--tw-text-main)' }}
                      title="Ko'paytirish"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Jami Xulosa Banner */}
              <div
                className="p-2 rounded-xl text-[11px] flex items-center justify-between"
                style={{
                  backgroundColor: 'var(--tw-surface)',
                  color: 'var(--tw-text-sub)'
                }}
              >
                <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Sayohatchilar hisobi:</span>
                <span className="font-bold" style={{ color: 'var(--tw-text-main)' }}>
                  {adultsCount} ta katta odam{childrenCount > 0 ? `, ${childrenCount} ta yosh bola` : ''}
                </span>
              </div>
            </div>

            {/* Asosiy Sayohatchi Ma'lumotlarini To'ldirish */}
            <div
              className="p-3.5 rounded-2xl border space-y-2.5"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <h4 className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--tw-text-main)' }}>
                <FileText className="w-3.5 h-3.5" /> Asosiy sayohatchi ma'lumotlari:
              </h4>

              <div className="space-y-2 text-[11px]">
                <div>
                  <label className="text-[10px] block font-semibold mb-1" style={{ color: 'var(--tw-text-sub)' }}>
                    F.I.SH (Ism va Familiya)
                  </label>
                  <input
                    type="text"
                    value={bookingTravelerName}
                    onChange={(e) => setBookingTravelerName(e.target.value)}
                    placeholder="Ism va familiya"
                    className="w-full px-3 py-2 text-xs rounded-xl border font-medium focus:outline-none focus:ring-1"
                    style={{
                      backgroundColor: 'var(--tw-surface)',
                      borderColor: 'var(--tw-border)',
                      color: 'var(--tw-text-main)'
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] block font-semibold mb-1" style={{ color: 'var(--tw-text-sub)' }}>
                      Telefon raqami
                    </label>
                    <input
                      type="text"
                      value={bookingPhone}
                      onChange={(e) => setBookingPhone(e.target.value)}
                      placeholder="+998 00 000 00 00"
                      className="w-full px-3 py-2 text-xs rounded-xl border font-medium focus:outline-none focus:ring-1"
                      style={{
                        backgroundColor: 'var(--tw-surface)',
                        borderColor: 'var(--tw-border)',
                        color: 'var(--tw-text-main)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] block font-semibold mb-1" style={{ color: 'var(--tw-text-sub)' }}>
                      Pasport / ID seriya
                    </label>
                    <input
                      type="text"
                      value={bookingPassport}
                      onChange={(e) => setBookingPassport(e.target.value)}
                      placeholder="Pasport seriya va raqami"
                      className="w-full px-3 py-2 text-xs rounded-xl border font-medium focus:outline-none focus:ring-1"
                      style={{
                        backgroundColor: 'var(--tw-surface)',
                        borderColor: 'var(--tw-border)',
                        color: 'var(--tw-text-main)'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Flight & Transfer Specifications */}
            <div
              className="p-3 rounded-2xl border space-y-2"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <h4 className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--tw-text-main)' }}>
                <Plane className="w-3.5 h-3.5" /> Parvoz va Transport Spesifikatsiyasi
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div
                  className="p-2 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--tw-surface)',
                    borderColor: 'var(--tw-border)'
                  }}
                >
                  <span className="text-[9px] block font-medium" style={{ color: 'var(--tw-text-sub)' }}>Reys & Aviakompaniya</span>
                  <p className="font-bold truncate" style={{ color: 'var(--tw-text-main)' }}>{checkoutTour.flightNumber || checkoutTour.flight}</p>
                  <p className="text-[10px]" style={{ color: 'var(--tw-accent)' }}>{checkoutTour.airline || '—'}</p>
                </div>
                <div
                  className="p-2 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--tw-surface)',
                    borderColor: 'var(--tw-border)'
                  }}
                >
                  <span className="text-[9px] block font-medium" style={{ color: 'var(--tw-text-sub)' }}>Bagaj me'yori</span>
                  <p className="text-emerald-500 font-bold">{checkoutTour.baggage || '—'}</p>
                  <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>Tur ma'lumotlarida ko'rsatilgan yuk me'yori</p>
                </div>
              </div>
            </div>

            {/* Hotel & Meal Plan Details */}
            <div
              className="p-3 rounded-2xl border space-y-2"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <h4 className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--tw-text-main)' }}>
                <Hotel className="w-3.5 h-3.5" /> Mehmonxona va Ovqatlanish
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div
                  className="p-2 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--tw-surface)',
                    borderColor: 'var(--tw-border)'
                  }}
                >
                  <span className="text-[9px] block font-medium" style={{ color: 'var(--tw-text-sub)' }}>Xona toifasi</span>
                  <p className="font-bold" style={{ color: 'var(--tw-text-main)' }}>{checkoutTour.roomType || '—'}</p>
                  {checkoutTour.rating > 0 && <p className="text-[10px] text-amber-500">★ {checkoutTour.rating} reyting</p>}
                </div>
                <div
                  className="p-2 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--tw-surface)',
                    borderColor: 'var(--tw-border)'
                  }}
                >
                  <span className="text-[9px] block font-medium" style={{ color: 'var(--tw-text-sub)' }}>Ovqatlanish rejimi</span>
                  <p className="font-bold" style={{ color: 'var(--tw-accent)' }}>{checkoutTour.mealType || '—'} — {checkoutTour.mealDesc || checkoutTour.tag || '—'}</p>
                  <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>{checkoutTour.nights}</p>
                </div>
              </div>
            </div>

            {/* Package Inclusions Checklist */}
            <div
              className="p-3 rounded-2xl border space-y-1.5"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--tw-text-sub)' }}>
                Paket tarkibi:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]" style={{ color: 'var(--tw-text-main)' }}>
                {checkoutTour.inclusions?.length
                  ? checkoutTour.inclusions.map((inclusion) => (
                    <div className="flex items-center gap-1.5" key={inclusion}>
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>{inclusion}</span>
                    </div>
                  ))
                  : <span className="text-muted-foreground">Paket tarkibi haqida ma’lumot berilmagan.</span>}
              </div>
            </div>

            {/* Official Price Calculation Sheet */}
            {(() => {
              const totalTravelers = adultsCount + childrenCount;
              const perAdult = checkoutTour.isLiveKompas
                ? Math.round(checkoutTour.price / 2)
                : checkoutTour.price;
              const perChild = perAdult;
              const finalPackagePrice = (adultsCount * perAdult) + (childrenCount * perChild);
              const perPersonEstimate = Math.round(finalPackagePrice / (totalTravelers || 1));

              return (
                <>
                  <div
                    className="p-3.5 rounded-2xl border space-y-2"
                    style={{
                      backgroundColor: 'var(--tw-subtle)',
                      borderColor: 'var(--tw-border)'
                    }}
                  >
                    <div className="flex justify-between items-center text-xs" style={{ color: 'var(--tw-text-sub)' }}>
                      <span>Katta odamlar ({adultsCount} kishi):</span>
                      <span className="font-bold" style={{ color: 'var(--tw-text-main)' }}>
                        {adultsCount} × ${perAdult} = ${adultsCount * perAdult}
                      </span>
                    </div>

                    {childrenCount > 0 && (
                      <div className="flex justify-between items-center text-xs" style={{ color: 'var(--tw-text-sub)' }}>
                        <span>Yosh bolalar ({childrenCount} bola):</span>
                        <span className="font-bold text-emerald-500">
                          {childrenCount} × ${perChild} = ${childrenCount * perChild}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs" style={{ color: 'var(--tw-text-sub)' }}>
                      <span>Jami sayohatchilar:</span>
                      <span className="font-bold" style={{ color: 'var(--tw-text-main)' }}>
                        {totalTravelers} kishi ({adultsCount} katta, {childrenCount} bola)
                      </span>
                    </div>

                    {totalTravelers > 1 && (
                      <div className="flex justify-between items-center text-xs" style={{ color: 'var(--tw-text-sub)' }}>
                        <span>1 kishiga to'g'ri keladi:</span>
                        <span className="font-semibold" style={{ color: 'var(--tw-text-main)' }}>
                          ~${perPersonEstimate} / kishi
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs pt-1 border-t" style={{ borderColor: 'var(--tw-border)' }}>
                      <span className="inline-flex items-center gap-1" style={{ color: 'var(--tw-text-sub)' }}><Building2 className="w-3 h-3" /> Turoperator:</span>
                      <span className="font-bold text-sky-600 dark:text-sky-400">
                        {checkoutTour.tourOperator || (checkoutTour.isLiveKompas ? 'Kompas Tour' : '—')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="inline-flex items-center gap-1" style={{ color: 'var(--tw-text-sub)' }}><ShieldCheck className="w-3 h-3" /> Bronlash Agentligi:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {checkoutTour.agencyName || 'SayrHub Agentligi'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-cyan-600 dark:text-cyan-400">
                      <span className="flex items-center gap-1">
                        <span className="inline-flex items-center gap-1"><BriefcaseBusiness className="w-3 h-3" /> Agentlik xizmati:</span>
                        <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-cyan-500/10 border border-cyan-500/30">
                          +{checkoutTour.markupValue ?? 0}%
                        </span>
                      </span>
                      <span className="font-bold">
                        Narxga kiritilgan (+${Math.max(0, finalPackagePrice - Math.round(finalPackagePrice / (1 + (checkoutTour.markupValue ?? 0) / 100)))})
                      </span>
                    </div>

                    <div className="border-t pt-2 flex justify-between items-end" style={{ borderColor: 'var(--tw-border)' }}>
                      <div>
                        <span className="text-[10px] block" style={{ color: 'var(--tw-text-sub)' }}>Jami yakuniy narx:</span>
                        <span className="text-xs text-emerald-500 font-bold font-mono">
                          ~{(finalPackagePrice * 12950).toLocaleString()} UZS
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black leading-none" style={{ color: 'var(--tw-accent)' }}>
                          ${finalPackagePrice}
                        </span>
                        <span className="text-[9px] block text-emerald-600 dark:text-emerald-400 font-bold">
                          {checkoutTour.isLiveKompas ? 'Kompas manbasidan olingan' : 'Bron so‘rovi'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Actions: Turni Bron Qilish */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      id="btn-confirm-tour-booking"
                      onClick={async () => {
                        const travelerName = bookingTravelerName.trim() || currentName.trim();
                        if (!travelerName) {
                          onShowToast("Iltimos, asosiy sayohatchining ism va familiyasini kiriting.", 'error');
                          return;
                        }
                        try {
                          await onConfirmBooking({
                          tour: checkoutTour,
                          travelerName,
                          phone: bookingPhone.trim() || currentPhone || '',
                          passport: bookingPassport.trim() || currentPassport || '',
                          dob: '',
                          payType: 'online_booking',
                          discount: 0,
                          travelersCount: totalTravelers,
                          adultsCount: adultsCount,
                          childrenCount: childrenCount
                        });
                        } catch (error) {
                          onShowToast(error instanceof Error ? error.message : 'Bron yaratib bo‘lmadi.', 'error');
                        }
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 tap-bounce transition cursor-pointer active:scale-98"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Turni Bron Qilish</span>
                      <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold ml-1">${finalPackagePrice}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const smeta = `SAYRHUB — TUR SPESIFIKATSIYASI\nMehmonxona: ${checkoutTour.title}\nManzil: ${checkoutTour.location}\nReys: ${checkoutTour.flight}\nSayyohlar: ${totalTravelers} kishi (${adultsCount} katta, ${childrenCount} bola)\nSayyoh: ${bookingTravelerName}\nTel: ${bookingPhone}\nPasport: ${bookingPassport}\nJonli Narx: $${finalPackagePrice}\nKod: ${checkoutTour.kompasTourCode || 'SH-UZ'}`;
                          navigator.clipboard.writeText(smeta);
                          onShowToast("Tur smetasi va hisob-kitobi buferga nusxalandi!", "success");
                        }}
                        className="py-2.5 border text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 tap-bounce transition"
                        style={{
                          backgroundColor: 'var(--tw-surface)',
                          borderColor: 'var(--tw-border)',
                          color: 'var(--tw-text-main)'
                        }}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Smetani Nusxalash</span>
                      </button>

                      <a
                        href={`https://t.me/share/url?url=${encodeURIComponent(`https://sayrhub.uz`)}&text=${encodeURIComponent(
                          `Assalomu alaykum! SayrHub orqali ushbu tur bo'yicha savolim bor edi:\n\nMehmonxona: ${checkoutTour.title}\nManzil: ${checkoutTour.location}\nReys: ${checkoutTour.flight}\nMuddat: ${checkoutTour.nights}\nSayyohlar: ${totalTravelers} kishi (${adultsCount} katta, ${childrenCount} bola)\nSayyoh: ${bookingTravelerName}\nNarx: $${finalPackagePrice}\nKod: ${checkoutTour.kompasTourCode || '—'}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 border text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 tap-bounce transition text-[#24A1DE]"
                        style={{
                          backgroundColor: 'var(--tw-surface)',
                          borderColor: 'var(--tw-border)'
                        }}
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Operatorga Yozish</span>
                      </a>
                    </div>

                    {onOpenPriceAlert && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenPriceAlert(checkoutTour);
                          onCloseCheckout();
                        }}
                        className="w-full py-2 border text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 tap-bounce transition"
                        style={{
                          backgroundColor: 'var(--tw-subtle)',
                          borderColor: 'var(--tw-border)',
                          color: 'var(--tw-accent)'
                        }}
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Ushbu tur narxi tushganda xabar berish (Signal)</span>
                      </button>
                    )}
                  </div>
                </>
              );
      })()}
    </div>
  </div>
)}

      {/* 6. BOOKING SUCCESS CONFIRMATION MODAL */}
      {successBooking && (
        <div
          id="modal-booking-success"
          className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            className="border rounded-3xl p-5 max-w-[340px] w-full space-y-3.5 text-center shadow-2xl animate-scaleUp"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-2xl border border-emerald-500/30 animate-bounce">
              <PartyPopper className="w-7 h-7" />
            </div>

            <div>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Bron so‘rovi saqlandi
              </span>
              <h3 className="text-base font-black mt-1" style={{ color: 'var(--tw-text-main)' }}>Bron so‘rovi qabul qilindi</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--tw-text-sub)' }}>
                Bron raqami bazaga saqlandi. Turoperator tasdig‘idan keyin safar hujjatlari beriladi.
              </p>
            </div>

            <div
              className="rounded-2xl p-3 border text-left space-y-2"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <div className="flex justify-between items-center pb-1.5 border-b" style={{ borderColor: 'var(--tw-border)' }}>
                <span>
                  <span className="block text-[9px] text-muted-foreground">Bron raqami</span>
                  <span className="font-mono text-xs font-black" style={{ color: 'var(--tw-accent)' }}>{successBooking.voucherId}</span>
                </span>
                <span className="text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {successBooking.status}
                </span>
              </div>
              <div className="text-xs">
                <p className="font-bold truncate" style={{ color: 'var(--tw-text-main)' }}>{successBooking.tourTitle}</p>
                <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>
                  Sayohatchi: <span className="font-semibold" style={{ color: 'var(--tw-text-main)' }}>{successBooking.travelerName}</span>
                </p>
                <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>
                  Sayohatchilar: <span className="font-semibold" style={{ color: 'var(--tw-text-main)' }}>
                    {successBooking.guestsCount || 1} kishi
                    {successBooking.adultsCount ? ` (${successBooking.adultsCount} katta${successBooking.childrenCount ? `, ${successBooking.childrenCount} bola` : ''})` : ''}
                  </span>
                </p>
                <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>
                  Reys: <span className="font-semibold" style={{ color: 'var(--tw-text-main)' }}>{successBooking.flight || '—'}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                className="flex-1 py-2.5 font-bold text-xs rounded-xl tap-bounce shadow-xs"
                style={{
                  backgroundColor: 'var(--tw-accent)',
                  color: 'var(--tw-accent-contrast)'
                }}
                onClick={onViewInTrips}
                type="button"
              >
                Turlarimda ko'rish
              </button>
              <button
                className="px-3 py-2.5 text-xs font-semibold rounded-xl tap-bounce border"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
                onClick={onCloseSuccess}
                type="button"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. QR CODE PASSPORT IDENTIFICATION MODAL */}
      {isQrOpen && (
        <div
          id="modal-qr"
          className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            className="border rounded-3xl p-6 text-center max-w-[320px] w-full space-y-3.5 shadow-2xl animate-scaleUp"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <h3 className="text-sm font-bold" style={{ color: 'var(--tw-text-main)' }}>Foydalanuvchi identifikatori</h3>
            <p className="text-xs" style={{ color: 'var(--tw-text-sub)' }}>
              Hisob ma’lumotlari
            </p>

            <div className="rounded-2xl border bg-muted p-5 space-y-2" style={{ borderColor: 'var(--tw-border)' }}>
              <p className="text-[10px] uppercase text-muted-foreground">Akkaunt ID</p>
              <p className="font-mono font-bold text-primary break-all">{userId || '—'}</p>
              <p className="text-xs text-muted-foreground">{userName || '—'}</p>
            </div>

            <p className="text-[11px] text-muted-foreground">
              QR orqali identifikatsiya xizmati hozircha mavjud emas.
            </p>

            <button
              className="w-full py-2.5 text-xs font-semibold rounded-xl tap-bounce border"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)',
                color: 'var(--tw-text-main)'
              }}
              onClick={onCloseQr}
              type="button"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* 8. 24/7 SUPPORT CONCIERGE MODAL */}
      {isSupportOpen && (
        <div
          id="support-modal"
          className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end p-0"
        >
          <div
            className="border-t rounded-t-[32px] p-5 space-y-3.5 shadow-2xl"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <div className="flex items-center justify-between pb-1 border-b" style={{ borderColor: 'var(--tw-border)' }}>
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--tw-accent-light)',
                    color: 'var(--tw-accent)'
                  }}
                >
                  <Headphones className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--tw-text-main)' }}>SayrHub 24/7 Yordam</h3>
              </div>
              <button
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
                onClick={onCloseSupport}
                type="button"
              >
                ✕
              </button>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: 'var(--tw-text-sub)' }}>
              Savollaringiz bormi? Charter reyslar va hisob-kitob masalasida mutaxassislarimiz 24/7 aloqada.
            </p>

            <div className="space-y-2">
              <a
                href="tel:+998712000000"
                onClick={() => onShowToast("Call-markazga qo'ng'iroq qilinmoqda...", 'info')}
                className="flex items-center justify-between p-3 rounded-xl border text-xs font-bold active:scale-98"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
              >
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4" />
                  <span>+998 (71) 200-00-00 (Koll-markaz)</span>
                </div>
                <span className="text-emerald-500 text-[10px]">Bepul</span>
              </a>

              <button
                className="w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold active:scale-98"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
                onClick={onStartLiveChat}
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4" />
                  <span>Telegram Online Operator bilan chat</span>
                </div>
                <span className="text-[10px] font-bold" style={{ color: 'var(--tw-accent)' }}>Onlayn</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. EDIT PROFILE MODAL */}
      {isEditProfileOpen && (
        <div
          id="modal-edit-profile"
          className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end"
        >
          <div
            className="border-t rounded-t-[32px] p-5 space-y-3.5 shadow-2xl"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--tw-border)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--tw-text-main)' }}>Profil Ma'lumotlarini Tahrirlash</h3>
              <button
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold border"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
                onClick={onCloseEditProfile}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] block mb-1" style={{ color: 'var(--tw-text-sub)' }}>Ism va Familiya</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                  style={{
                    backgroundColor: 'var(--tw-subtle)',
                    borderColor: 'var(--tw-border)',
                    color: 'var(--tw-text-main)'
                  }}
                />
              </div>

              <div>
                <label className="text-[11px] block mb-1" style={{ color: 'var(--tw-text-sub)' }}>Telefon raqam</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                  style={{
                    backgroundColor: 'var(--tw-subtle)',
                    borderColor: 'var(--tw-border)',
                    color: 'var(--tw-text-main)'
                  }}
                />
              </div>
            </div>

            <button
              className="w-full py-3 font-bold text-xs rounded-xl shadow-md tap-bounce transition"
              style={{
                backgroundColor: 'var(--tw-accent)',
                color: 'var(--tw-accent-contrast)'
              }}
              onClick={() => onSaveProfile(editName, editPhone)}
              type="button"
            >
              Saqlash
            </button>
          </div>
        </div>
      )}

      {/* 10. ADD PAYMENT CARD MODAL */}
      {isAddCardOpen && (
        <div
          id="modal-add-card"
          className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end"
        >
          <div
            className="border-t rounded-t-[32px] p-5 space-y-3.5 shadow-2xl"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--tw-border)' }}>
              <h3 className="text-sm font-bold" style={{ color: 'var(--tw-text-main)' }}>Yangi To'lov Kartasi Qo'shish</h3>
              <button
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold border"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
                onClick={onCloseAddCard}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] block mb-1" style={{ color: 'var(--tw-text-sub)' }}>Karta turi</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['HUMO', 'UZCARD', 'VISA'] as const).map((ct) => (
                    <button
                      key={ct}
                      className="py-1.5 text-xs font-bold rounded-lg border transition"
                      style={{
                        backgroundColor: newCardType === ct ? 'var(--tw-accent-light)' : 'var(--tw-subtle)',
                        borderColor: newCardType === ct ? 'var(--tw-accent)' : 'var(--tw-border)',
                        color: newCardType === ct ? 'var(--tw-accent)' : 'var(--tw-text-main)'
                      }}
                      onClick={() => setNewCardType(ct)}
                      type="button"
                    >
                      {ct}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] block mb-1" style={{ color: 'var(--tw-text-sub)' }}>Karta raqami (16 xonali)</label>
                <input
                  type="text"
                  maxLength={19}
                  placeholder="8600 •••• •••• ••••"
                  value={newCardNumber}
                  onChange={(e) => setNewCardNumber(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none"
                  style={{
                    backgroundColor: 'var(--tw-subtle)',
                    borderColor: 'var(--tw-border)',
                    color: 'var(--tw-text-main)'
                  }}
                />
              </div>

              <div>
                <label className="text-[11px] block mb-1" style={{ color: 'var(--tw-text-sub)' }}>Bank nomi</label>
                <input
                  type="text"
                  placeholder="Masalan: Ipak Yo'li Bank, Kapitalbank"
                  value={newCardBank}
                  onChange={(e) => setNewCardBank(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 text-xs focus:outline-none"
                  style={{
                    backgroundColor: 'var(--tw-subtle)',
                    borderColor: 'var(--tw-border)',
                    color: 'var(--tw-text-main)'
                  }}
                />
              </div>
            </div>

            <button
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg tap-bounce"
              onClick={() => {
                const digits = newCardNumber.replace(/\D/g, '');
                if (digits.length < 4) {
                  onShowToast("Iltimos, to'g'ri karta raqamini kiriting", 'error');
                  return;
                }
                onSaveCard({
                  type: newCardType,
                  last4: digits.slice(-4),
                  bank: newCardBank.trim() || `${newCardType} Card`
                });
              }}
              type="button"
            >
              Kartani Bog'lash (Xavfsiz 3D Secure)
            </button>
          </div>
        </div>
      )}

      {/* 11. VOUCHER PREVIEW / DOWNLOAD MODAL */}
      {activeVoucherBooking && (
        <div
          id="modal-voucher-preview"
          className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            className="border rounded-3xl p-5 max-w-[340px] w-full space-y-3.5 shadow-2xl text-left"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--tw-border)' }}>
              <div>
                <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  Bron tafsilotlari
                </span>
                <h3 className="text-sm font-bold mt-1" style={{ color: 'var(--tw-text-main)' }}>{activeVoucherBooking.voucherId}</h3>
              </div>
              <button
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold border"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
                onClick={onCloseVoucherPreview}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs" style={{ color: 'var(--tw-text-sub)' }}>
              <div
                className="p-3 rounded-xl border space-y-1"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <p className="text-[10px] uppercase" style={{ color: 'var(--tw-text-sub)' }}>Mehmonxona & Paket</p>
                <p className="font-bold text-sm" style={{ color: 'var(--tw-text-main)' }}>{activeVoucherBooking.tourTitle}</p>
                <p className="text-[11px]" style={{ color: 'var(--tw-text-sub)' }}>{activeVoucherBooking.dest}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div
                  className="p-2.5 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--tw-subtle)',
                    borderColor: 'var(--tw-border)'
                  }}
                >
                  <span className="text-[10px] block" style={{ color: 'var(--tw-text-sub)' }}>Sayohatchi:</span>
                  <span className="font-semibold" style={{ color: 'var(--tw-text-main)' }}>{activeVoucherBooking.travelerName}</span>
                </div>
                <div
                  className="p-2.5 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--tw-subtle)',
                    borderColor: 'var(--tw-border)'
                  }}
                >
                  <span className="text-[10px] block" style={{ color: 'var(--tw-text-sub)' }}>Holati:</span>
                  <span className="font-semibold text-muted-foreground">{activeVoucherBooking.status}</span>
                </div>
              </div>

              <div
                className="p-2.5 rounded-xl border"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <span className="text-[10px] block" style={{ color: 'var(--tw-text-sub)' }}>Sayohatchilar tarkibi:</span>
                <span className="font-semibold" style={{ color: 'var(--tw-text-main)' }}>
                  <Users className="w-3.5 h-3.5 mr-1 inline" />{activeVoucherBooking.guestsCount || 1} kishi
                  {activeVoucherBooking.adultsCount ? ` (${activeVoucherBooking.adultsCount} katta${activeVoucherBooking.childrenCount ? `, ${activeVoucherBooking.childrenCount} bola` : ''})` : ''}
                </span>
              </div>

              <div
                className="p-2.5 rounded-xl border"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <span className="text-[10px] block" style={{ color: 'var(--tw-text-sub)' }}>Parvoz & Transfer:</span>
                <span className="font-semibold" style={{ color: 'var(--tw-text-main)' }}>{activeVoucherBooking.flight || '—'}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                className="flex-1 py-2.5 font-bold text-xs rounded-xl tap-bounce shadow-xs flex items-center justify-center gap-1.5"
                style={{
                  backgroundColor: 'var(--tw-accent)',
                  color: 'var(--tw-accent-contrast)'
                }}
                onClick={() => {
                  onShowToast(`${activeVoucherBooking.voucherId} vaucheri PDF holatida yuklab olindi!`, 'success');
                  onCloseVoucherPreview();
                }}
                type="button"
              >
                <span>Yuklab olish (PDF)</span>
              </button>
              <button
                className="px-3 py-2.5 text-xs font-semibold rounded-xl tap-bounce border"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
                onClick={onCloseVoucherPreview}
                type="button"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 12. CANCEL BOOKING CONFIRMATION MODAL */}
      {cancelBookingTarget && (
        <div
          id="modal-cancel-booking"
          className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            className="border rounded-3xl p-5 max-w-[340px] w-full space-y-3.5 text-center shadow-2xl animate-scaleUp"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-xl border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--tw-text-main)' }}>Turni bekor qilasizmi?</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--tw-text-sub)' }}>
                <span className="font-semibold" style={{ color: 'var(--tw-text-main)' }}>{cancelBookingTarget.tourTitle}</span> ({cancelBookingTarget.voucherId}) buyurtmasi bekor qilinadi.
              </p>
            </div>

            <div
              className="p-3 rounded-xl border text-[11px] text-left space-y-1.5"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)',
                color: 'var(--tw-text-sub)'
              }}
            >
              <p className="flex justify-between">
                <span>Sayohatchilar:</span>
                <span className="font-semibold" style={{ color: 'var(--tw-text-main)' }}>
                  {cancelBookingTarget.guestsCount || 1} kishi
                  {cancelBookingTarget.adultsCount ? ` (${cancelBookingTarget.adultsCount} katta${cancelBookingTarget.childrenCount ? `, ${cancelBookingTarget.childrenCount} bola` : ''})` : ''}
                </span>
              </p>
              <p className="flex justify-between">
                <span>To'langan summa:</span>
                <span className="font-bold" style={{ color: 'var(--tw-text-main)' }}>{cancelBookingTarget.price}</span>
              </p>
              <p className="flex justify-between text-emerald-500 font-medium">
                <span>Qaytariladigan mablag':</span>
                <span className="font-bold">100% Qaytariladi ✓</span>
              </p>
            </div>

            {/* Cancellation reason selector */}
            <div className="text-left space-y-1.5">
              <label className="text-[10px] font-bold block" style={{ color: 'var(--tw-text-sub)' }}>
                Bekor qilish sababi:
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  "Rejalarim o'zgardi",
                  "Boshqa sanaga",
                  "Boshqa turpaket",
                  "Shaxsiy sabab"
                ].map((reason) => (
                  <button
                    key={reason}
                    type="button"
                    onClick={() => setCancelReason(reason)}
                    className="px-2 py-1.5 text-[10px] font-semibold rounded-lg border text-left truncate transition tap-bounce"
                    style={{
                      backgroundColor: cancelReason === reason ? 'var(--tw-accent)' : 'var(--tw-subtle)',
                      color: cancelReason === reason ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)',
                      borderColor: cancelReason === reason ? 'var(--tw-accent)' : 'var(--tw-border)'
                    }}
                  >
                    {reason}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => onConfirmCancelBooking(cancelReason)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl tap-bounce shadow-xs transition"
              >
                Ha, bekor qilinsin
              </button>
              <button
                type="button"
                onClick={onCloseCancelBooking}
                className="px-3 py-2.5 text-xs font-semibold rounded-xl tap-bounce border transition"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
              >
                Qaytish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 13. EDIT PASSPORT MODAL */}
      {isEditPassportOpen && (
        <div
          id="modal-edit-passport"
          className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end"
        >
          <div
            className="border-t rounded-t-[32px] p-5 space-y-3.5 shadow-2xl"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--tw-border)' }}>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold" style={{ color: 'var(--tw-text-main)' }}>Zagran Pasport Ma'lumotlari</h3>
              </div>
              <button
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold border"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
                onClick={onCloseEditPassport}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[11px] block mb-1" style={{ color: 'var(--tw-text-sub)' }}>Xorijga chiqish pasport seriya va raqami</label>
                <input
                  type="text"
                  value={editPassNumber}
                  onChange={(e) => setEditPassNumber(e.target.value.toUpperCase())}
                  placeholder="FA 1234567"
                  className="w-full border rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase focus:outline-none"
                  style={{
                    backgroundColor: 'var(--tw-subtle)',
                    borderColor: 'var(--tw-border)',
                    color: 'var(--tw-text-main)'
                  }}
                />
              </div>

              <div>
                <label className="text-[11px] block mb-1" style={{ color: 'var(--tw-text-sub)' }}>Amal qilish muddati (Gacha)</label>
                <input
                  type="text"
                  value={editPassExpiry}
                  onChange={(e) => setEditPassExpiry(e.target.value)}
                  placeholder="2032-05-15"
                  className="w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
                  style={{
                    backgroundColor: 'var(--tw-subtle)',
                    borderColor: 'var(--tw-border)',
                    color: 'var(--tw-text-main)'
                  }}
                />
              </div>
            </div>

            <button
              className="w-full py-3 font-bold text-xs rounded-xl shadow-md tap-bounce transition"
              style={{
                backgroundColor: 'var(--tw-accent)',
                color: 'var(--tw-accent-contrast)'
              }}
              onClick={() => {
                if (!editPassNumber.trim()) {
                  onShowToast("Iltimos, pasport raqamini kiriting", 'error');
                  return;
                }
                onSavePassport(editPassNumber.trim(), editPassExpiry.trim() || '2032-12-31');
              }}
              type="button"
            >
              Pasportni Saqlash ✓
            </button>
          </div>
        </div>
      )}

      {/* 14. LOGOUT CONFIRMATION MODAL */}
      {isLogoutConfirmOpen && (
        <div
          id="modal-logout-confirm"
          className="absolute inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            className="border rounded-3xl p-5 max-w-[320px] w-full space-y-3.5 text-center shadow-2xl animate-scaleUp"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <div
              className="w-12 h-12 mx-auto rounded-full flex items-center justify-center text-xl border"
              style={{
                backgroundColor: 'var(--tw-accent-light)',
                borderColor: 'var(--tw-accent)',
                color: 'var(--tw-accent)'
              }}
            >
              <DoorOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--tw-text-main)' }}>Akkauntdan chiqish</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--tw-text-sub)' }}>
                SayrHub tizimidan xavfsiz chiqmoqchimisiz? Qayta kirish uchun telefon raqami yoki biometrika kifoya.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onConfirmLogout}
                className="flex-1 py-2.5 text-xs font-bold rounded-xl tap-bounce shadow-xs"
                style={{
                  backgroundColor: 'var(--tw-accent)',
                  color: 'var(--tw-accent-contrast)'
                }}
              >
                Chiqish
              </button>
              <button
                type="button"
                onClick={onCloseLogoutConfirm}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl tap-bounce border"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
              >
                Bekor qilish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
