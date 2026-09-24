import React, { useState, useEffect } from 'react';
import { TourPackage, Booking, PaymentCard } from '../types';
import { SingleTourMap } from './GoogleTourMap';

interface ModalsProps {
  // OTP Modal
  isOtpOpen: boolean;
  otpPhone: string;
  onCloseOtp: () => void;
  onVerifyOtp: (code: string) => void;

  // Social Modal
  socialProvider: 'google' | null;
  onCloseSocial: () => void;
  onSelectSocialAccount: (name: string, email: string) => void;

  // Tour Details Modal
  tourDetails: TourPackage | null;
  onCloseTourDetails: () => void;
  onProceedToCheckout: (tour: TourPackage) => void;
  onOpenPriceAlert?: (tour: TourPackage) => void;

  // Checkout Modal
  checkoutTour: TourPackage | null;
  checkoutTravelers?: number;
  onCloseCheckout: () => void;
  onConfirmBooking: (bookingData: {
    tour: TourPackage;
    travelerName: string;
    passport: string;
    dob: string;
    payType: string;
    discount: number;
    travelersCount?: number;
  }) => void;

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
  onConfirmCancelBooking: () => void;

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
  onSelectSocialAccount,
  tourDetails,
  onCloseTourDetails,
  onProceedToCheckout,
  onOpenPriceAlert,
  checkoutTour,
  checkoutTravelers = 2,
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

  // Checkout state
  const [travelerFirstName, setTravelerFirstName] = useState('JASUR');
  const [travelerLastName, setTravelerLastName] = useState('RAHIMOV');
  const [travelerPassport, setTravelerPassport] = useState('FA 9842104');
  const [travelerDob, setTravelerDob] = useState('1994-08-15');
  const [selectedPayType, setSelectedPayType] = useState('humo');
  const [currentTravelersCount, setCurrentTravelersCount] = useState(checkoutTravelers);

  // Sync checkout travelers count
  useEffect(() => {
    setCurrentTravelersCount(checkoutTravelers);
  }, [checkoutTravelers, checkoutTour]);

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

  const autofillOtp = (code: string) => {
    const arr = code.split('').slice(0, 4);
    setOtpDigits(arr);
    onShowToast("Test kodi avtomatik to'ldirildi ✓", 'success');
    setTimeout(() => onVerifyOtp(code), 400);
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
                  <span className="material-symbols-outlined text-[20px]">sms</span>
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

            {/* Quick Auto-Fill Demo Chip */}
            <div
              className="flex items-center justify-between border rounded-xl p-2 px-3"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs">🔑</span>
                <span className="text-[11px]" style={{ color: 'var(--tw-text-main)' }}>
                  Test SMS kodi: <b className="font-mono" style={{ color: 'var(--tw-accent)' }}>7788</b>
                </span>
              </div>
              <button
                className="text-[11px] font-bold px-2 py-0.5 rounded-lg active:scale-95 transition"
                style={{
                  backgroundColor: 'var(--tw-accent-light)',
                  color: 'var(--tw-accent)'
                }}
                onClick={() => autofillOtp('7788')}
                type="button"
              >
                Nusxa olib qo'yish
              </button>
            </div>

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
                    setOtpSeconds(59);
                    onShowToast("Yangi tasdiqlash kodi jo'natildi! (Test: 7788)", 'success');
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
              <span className="material-symbols-outlined text-[16px]">verified</span>
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
                <span className="text-base">🌐</span>
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

            <div className="space-y-2.5">
              <div
                className="p-3 border rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)'
                }}
                onClick={() => onSelectSocialAccount('Jasur Rahimov', 'jasur.travel@gmail.com')}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs"
                    style={{
                      backgroundColor: 'var(--tw-accent)',
                      color: 'var(--tw-accent-contrast)'
                    }}
                  >
                    JR
                  </div>
                  <div>
                    <h4 className="text-xs font-bold" style={{ color: 'var(--tw-text-main)' }}>Jasur Rahimov</h4>
                    <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>
                      jasur.travel@gmail.com
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--tw-accent)' }}>Ulash</span>
              </div>

              <div
                className="p-3 border rounded-2xl flex items-center justify-between cursor-pointer active:scale-98 transition"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)'
                }}
                onClick={() => onSelectSocialAccount('Jasur R.', 'work.rahimov@company.uz')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                    💼
                  </div>
                  <div>
                    <h4 className="text-xs font-bold" style={{ color: 'var(--tw-text-main)' }}>Jasur R. (Korporativ)</h4>
                    <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>work.rahimov@company.uz</p>
                  </div>
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--tw-text-sub)' }}>Ulash</span>
              </div>
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
                📍 {tourDetails.location}
              </div>
            </div>

            {/* Google Interactive Map */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--tw-text-main)' }}>
                  <span>📍</span>
                  <span>Joylashuv va Xarita (Google Maps)</span>
                </span>
                <span className="text-[10px] font-medium" style={{ color: 'var(--tw-accent)' }}>
                  {tourDetails.resort || tourDetails.location}
                </span>
              </div>
              <SingleTourMap tour={tourDetails} height="190px" />
            </div>

            {/* Inclusions Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div
                className="p-2.5 rounded-xl border flex items-center gap-2.5"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <span className="text-base">✈️</span>
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>To'g'ridan-to'g'ri reys</p>
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
                <span className="text-base">🏨</span>
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>Yashash muddati</p>
                  <p className="font-bold text-[11px]" style={{ color: 'var(--tw-text-main)' }}>{tourDetails.nights} / 8 kun</p>
                </div>
              </div>
              <div
                className="p-2.5 rounded-xl border flex items-center gap-2.5"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <span className="text-base">🚌</span>
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>Transfer xizmati</p>
                  <p className="font-bold text-[11px]" style={{ color: 'var(--tw-text-main)' }}>Aeroport — Mehmonxona</p>
                </div>
              </div>
              <div
                className="p-2.5 rounded-xl border flex items-center gap-2.5"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <span className="text-base">🛡️</span>
                <div>
                  <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>Tibbiy sug'urta</p>
                  <p className="font-bold text-emerald-500 text-[11px]">$30,000 qoplama</p>
                </div>
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
                  {tourDetails.isLiveKompas ? "Kompas Tour 1:1 rasmiy narxi:" : "Turpaket to'liq narxi:"}
                </span>
                <div className="flex items-center gap-1.5">
                  <p className="text-xl font-black" style={{ color: 'var(--tw-accent)' }}>${tourDetails.price}</p>
                  {tourDetails.isLiveKompas && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      online.uz.kompastour.com 1:1
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
                    <span>🔔</span>
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
                  <span>Tur smetasi & Hisob</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TRAVELWAY TOUR SPECIFICATION & CALCULATION SHEET (NO BOOKING REQUIRED) */}
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
                    TRAVELWAY
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500 font-mono">
                    {checkoutTour.kompasTourCode || 'TW-UZ-9021'}
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

            {/* Travelers Count Switcher */}
            <div
              className="p-3 rounded-2xl border flex items-center justify-between"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--tw-text-main)' }}>
                <span>👥</span> Sayohatchilar hisobi:
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCurrentTravelersCount(num)}
                    className="px-3 py-1 rounded-xl text-xs font-bold transition tap-bounce border"
                    style={{
                      backgroundColor: currentTravelersCount === num ? 'var(--tw-accent)' : 'var(--tw-surface)',
                      color: currentTravelersCount === num ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)',
                      borderColor: currentTravelersCount === num ? 'var(--tw-accent)' : 'var(--tw-border)'
                    }}
                  >
                    {num} kishi
                  </button>
                ))}
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
                <span>✈️</span> Parvoz va Transport Spesifikatsiyasi
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
                  <p className="text-[10px]" style={{ color: 'var(--tw-accent)' }}>{checkoutTour.airline || 'Uzbekistan Airways'}</p>
                </div>
                <div
                  className="p-2 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--tw-surface)',
                    borderColor: 'var(--tw-border)'
                  }}
                >
                  <span className="text-[9px] block font-medium" style={{ color: 'var(--tw-text-sub)' }}>Bagaj me'yori</span>
                  <p className="text-emerald-500 font-bold">{checkoutTour.baggage || "20 kg + 8 kg qo'l yuki"}</p>
                  <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>To'g'ridan-to'g'ri charter</p>
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
                <span>🏨</span> Mehmonxona va Ovqatlanish
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
                  <p className="font-bold" style={{ color: 'var(--tw-text-main)' }}>{checkoutTour.roomType || 'Standard Room'}</p>
                  <p className="text-[10px] text-amber-500">★ {checkoutTour.rating} reyting</p>
                </div>
                <div
                  className="p-2 rounded-xl border"
                  style={{
                    backgroundColor: 'var(--tw-surface)',
                    borderColor: 'var(--tw-border)'
                  }}
                >
                  <span className="text-[9px] block font-medium" style={{ color: 'var(--tw-text-sub)' }}>Ovqatlanish rejimi</span>
                  <p className="font-bold" style={{ color: 'var(--tw-accent)' }}>{checkoutTour.mealType || 'AI'} — {checkoutTour.mealDesc || checkoutTour.tag}</p>
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
                Paket tarkibiga to'liq kiritilgan (Inclusions):
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]" style={{ color: 'var(--tw-text-main)' }}>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Charter aviaparvoz</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Aeroport transferi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Mehmonxonada turish</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Sug'urta ($30,000)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>Ovqatlanish rejimi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>TravelWay Gid xizmati</span>
                </div>
              </div>
            </div>

            {/* Official Price Calculation Sheet */}
            {(() => {
              const finalPackagePrice = checkoutTour.isLiveKompas
                ? checkoutTour.price
                : checkoutTour.price * currentTravelersCount;
              const perPersonEstimate = checkoutTour.isLiveKompas
                ? Math.round(checkoutTour.price / (currentTravelersCount || 1))
                : checkoutTour.price;

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
                      <span>{checkoutTour.isLiveKompas ? 'Kompas Tour 1:1 rasmiy narxi:' : '1 kishi uchun narx:'}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold" style={{ color: 'var(--tw-text-main)' }}>
                          ${checkoutTour.isLiveKompas ? finalPackagePrice : checkoutTour.price}
                        </span>
                        {checkoutTour.isLiveKompas && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                            1:1 Aniq
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-xs" style={{ color: 'var(--tw-text-sub)' }}>
                      <span>Sayohatchilar miqdori:</span>
                      <span className="font-bold" style={{ color: 'var(--tw-text-main)' }}>{currentTravelersCount} kishi</span>
                    </div>
                    {checkoutTour.isLiveKompas && currentTravelersCount > 1 && (
                      <div className="flex justify-between items-center text-xs" style={{ color: 'var(--tw-text-sub)' }}>
                        <span>1 kishiga to'g'ri keladi:</span>
                        <span className="font-semibold" style={{ color: 'var(--tw-text-main)' }}>
                          ~${perPersonEstimate} / kishi
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs text-emerald-500">
                      <span>Charter & Aeroport yig'imlari:</span>
                      <span className="font-bold">Kiritilgan (0$)</span>
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
                          {checkoutTour.isLiveKompas ? "Kompas Tour bilan 1:1 bir xil" : "Bron to'lovi shart emas"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Actions (NO BOOKING FLOW / TELEGRAM & ESTIMATE) */}
                  <div className="space-y-2 pt-1">
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent(`https://travelway.uz`)}&text=${encodeURIComponent(
                        `Assalomu alaykum! TravelWay orqali ushbu turpaket bo'yicha ma'lumot olmoqchiman:\n\n🌴 Mehmonxona: ${checkoutTour.title}\n📍 Manzil: ${checkoutTour.location}\n✈️ Reys: ${checkoutTour.flight}\n🌙 Muddat: ${checkoutTour.nights}\n👥 Sayyohlar: ${currentTravelersCount} kishi\n💵 Kompas Tour 1:1 Narxi: $${finalPackagePrice} (~$${perPersonEstimate} / kishi)\n🆔 Kod: ${checkoutTour.kompasTourCode || 'TW-TR'}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-[#24A1DE] hover:bg-[#208fbf] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md flex items-center justify-center gap-2 tap-bounce transition"
                    >
                      <span className="text-base">💬</span>
                      <span>Telegram Orqali Operatorga Yuborish</span>
                    </a>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const smeta = `TRAVELWAY — TUR SPESIFIKATSIYASI\nMehmonxona: ${checkoutTour.title}\nManzil: ${checkoutTour.location}\nReys: ${checkoutTour.flight}\nSayyohlar: ${currentTravelersCount} kishi\nKompas Tour 1:1 Narxi: $${finalPackagePrice}\nKod: ${checkoutTour.kompasTourCode || 'TW-UZ'}`;
                          navigator.clipboard.writeText(smeta);
                          onShowToast("Tur smetasi va hisob-kitobi buferga nusxalandi! 📋", "success");
                        }}
                        className="py-2.5 border text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 tap-bounce transition"
                        style={{
                          backgroundColor: 'var(--tw-surface)',
                          borderColor: 'var(--tw-border)',
                          color: 'var(--tw-text-main)'
                        }}
                      >
                        <span>📋</span>
                        <span>Smetani Nusxalash</span>
                      </button>

                <button
                  type="button"
                  onClick={() => {
                    onConfirmBooking({
                      tour: checkoutTour,
                      travelerName: 'TravelWay Sayohatchi',
                      passport: 'N/A',
                      dob: '',
                      payType: 'saved_estimate',
                      discount: 0,
                      travelersCount: currentTravelersCount
                    });
                  }}
                  className="py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 tap-bounce transition shadow-xs"
                  style={{
                    backgroundColor: 'var(--tw-accent)',
                    color: 'var(--tw-accent-contrast)'
                  }}
                >
                  <span>📌</span>
                  <span>Mening Turlarimga Saqlash</span>
                </button>
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
                  <span>🔔</span>
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
              🎉
            </div>

            <div>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                To'lov Qabul Qilindi
              </span>
              <h3 className="text-base font-black mt-1" style={{ color: 'var(--tw-text-main)' }}>Muvaffaqiyatli Bron Qilindi!</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--tw-text-sub)' }}>
                Elektron turpaket vaucheri rasmiylashtirildi va tizimda saqlandi.
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
                <span className="font-mono text-xs font-black" style={{ color: 'var(--tw-accent)' }}>{successBooking.voucherId}</span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Faol
                </span>
              </div>
              <div className="text-xs">
                <p className="font-bold truncate" style={{ color: 'var(--tw-text-main)' }}>{successBooking.tourTitle}</p>
                <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>
                  Sayohatchi: <span className="font-semibold" style={{ color: 'var(--tw-text-main)' }}>{successBooking.travelerName}</span>
                </p>
                <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>
                  Reys: <span className="font-semibold" style={{ color: 'var(--tw-text-main)' }}>TAS → AYT (Charter)</span>
                </p>
              </div>

              {/* QR Code Graphic */}
              <div className="bg-white rounded-xl p-2 flex items-center justify-center">
                <svg className="w-24 h-24 text-slate-900" fill="currentColor" viewBox="0 0 100 100">
                  <rect fill="none" height="30" rx="4" stroke="currentColor" strokeWidth="6" width="30" x="10" y="10"></rect>
                  <rect height="14" width="14" x="18" y="18"></rect>
                  <rect fill="none" height="30" rx="4" stroke="currentColor" strokeWidth="6" width="30" x="60" y="10"></rect>
                  <rect height="14" width="14" x="68" y="18"></rect>
                  <rect fill="none" height="30" rx="4" stroke="currentColor" strokeWidth="6" width="30" x="10" y="60"></rect>
                  <rect height="14" width="14" x="18" y="68"></rect>
                  <rect height="30" width="6" x="48" y="10"></rect>
                  <rect height="8" width="20" x="48" y="55"></rect>
                  <rect height="15" width="25" x="60" y="70"></rect>
                  <rect height="12" width="8" x="48" y="78"></rect>
                </svg>
              </div>
              <p className="text-[9px] text-center" style={{ color: 'var(--tw-text-sub)' }}>Aeroport registratsiyasida QR kodni taqdim eting</p>
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
            <h3 className="text-sm font-bold" style={{ color: 'var(--tw-text-main)' }}>TravelWay Foydalanuvchi QR</h3>
            <p className="text-xs" style={{ color: 'var(--tw-text-sub)' }}>
              Aeroport va turoperator kassalarida tezkor identifikatsiya uchun
            </p>

            <div className="w-44 h-44 mx-auto bg-white rounded-2xl p-3 flex items-center justify-center shadow-inner">
              <svg className="w-full h-full text-slate-900" fill="currentColor" viewBox="0 0 100 100">
                <rect fill="none" height="30" rx="4" stroke="currentColor" strokeWidth="6" width="30" x="10" y="10"></rect>
                <rect height="14" width="14" x="18" y="18"></rect>
                <rect fill="none" height="30" rx="4" stroke="currentColor" strokeWidth="6" width="30" x="60" y="10"></rect>
                <rect height="14" width="14" x="68" y="18"></rect>
                <rect fill="none" height="30" rx="4" stroke="currentColor" strokeWidth="6" width="30" x="10" y="60"></rect>
                <rect height="14" width="14" x="18" y="68"></rect>
                <rect height="30" width="6" x="48" y="10"></rect>
                <rect height="8" width="20" x="48" y="55"></rect>
                <rect height="15" width="25" x="60" y="70"></rect>
                <rect height="12" width="8" x="48" y="78"></rect>
              </svg>
            </div>

            <p className="text-[11px] font-mono font-bold" style={{ color: 'var(--tw-accent)' }}>
              {userId} • {userName}
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
                  <span className="material-symbols-outlined text-[18px]">support_agent</span>
                </div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--tw-text-main)' }}>TravelWay 24/7 Yordam</h3>
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
                  <span className="text-base">📞</span>
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
                  <span className="text-base">💬</span>
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
                  Elektron Vaucher
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
                  <span className="font-semibold text-emerald-500">✓ Tasdiqlangan</span>
                </div>
              </div>

              <div
                className="p-2.5 rounded-xl border"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <span className="text-[10px] block" style={{ color: 'var(--tw-text-sub)' }}>Parvoz & Transfer:</span>
                <span className="font-semibold" style={{ color: 'var(--tw-text-main)' }}>TAS → AYT Charter reysi kiritilgan</span>
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
                  onShowToast(`📄 ${activeVoucherBooking.voucherId} vaucheri PDF holatida yuklab olindi!`, 'success');
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
            className="border rounded-3xl p-5 max-w-[330px] w-full space-y-3.5 text-center shadow-2xl animate-scaleUp"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <div className="w-12 h-12 mx-auto rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-xl border border-red-500/30">
              ⚠️
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--tw-text-main)' }}>Buyurtmani bekor qilasizmi?</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--tw-text-sub)' }}>
                <span className="font-semibold" style={{ color: 'var(--tw-text-main)' }}>{cancelBookingTarget.tourTitle}</span> ({cancelBookingTarget.voucherId}) buyurtmasi bekor qilinadi.
              </p>
            </div>
            <div
              className="p-3 rounded-xl border text-[11px] text-left space-y-1"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)',
                color: 'var(--tw-text-sub)'
              }}
            >
              <p className="flex justify-between">
                <span>To'langan summa:</span>
                <span className="font-bold" style={{ color: 'var(--tw-text-main)' }}>{cancelBookingTarget.price}</span>
              </p>
              <p className="flex justify-between text-emerald-500">
                <span>Qaytariladigan balans:</span>
                <span className="font-bold">100% Qaytariladi ✓</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onConfirmCancelBooking}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl tap-bounce shadow-xs"
              >
                Ha, bekor qilinsin
              </button>
              <button
                type="button"
                onClick={onCloseCancelBooking}
                className="px-3 py-2.5 text-xs font-semibold rounded-xl tap-bounce border"
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
                <span className="text-lg">🛂</span>
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
              🚪
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: 'var(--tw-text-main)' }}>Akkauntdan chiqish</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--tw-text-sub)' }}>
                TravelWay tizimidan xavfsiz chiqmoqchimisiz? Qayta kirish uchun telefon raqami yoki biometrika kifoya.
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
