import React, { useState, useEffect, useRef } from 'react';

interface TelegramAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const TelegramAuthModal: React.FC<TelegramAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onShowToast
}) => {
  const [step, setStep] = useState<'auth' | 'profile'>('auth');
  const [sessionToken, setSessionToken] = useState<string>('');
  const [deepLink, setDeepLink] = useState<string>('https://t.me/sayrhub_bot');
  const [botUsername, setBotUsername] = useState<string>('sayrhub_bot');
  const [isLoadingSession, setIsLoadingLoadingSession] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Authenticated user payload from Telegram
  const [verifiedUserData, setVerifiedUserData] = useState<any>(null);

  // Profile completion form states
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [passportSeries, setPassportSeries] = useState<string>('');
  const [passportExpiry, setPassportExpiry] = useState<string>('2034-12-31');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState<boolean>(false);

  // 4-digit manual code input
  const [codeDigits, setCodeDigits] = useState<string[]>(['', '', '', '']);
  const pollIntervalRef = useRef<any>(null);

  // Format phone display nicely: +998 (90) 123-45-67
  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return '+998 (**) ***-**-**';
    const clean = phone.trim();
    const digits = clean.replace(/\D/g, '');
    if (digits.startsWith('998') && digits.length === 12) {
      return `+998 (${digits.slice(3, 5)}) ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10, 12)}`;
    }
    return clean.startsWith('+') ? clean : `+${clean}`;
  };

  // Initialize session whenever modal opens
  useEffect(() => {
    if (!isOpen) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      setCodeDigits(['', '', '', '']);
      setIsSuccess(false);
      setStep('auth');
      setVerifiedUserData(null);
      setFirstName('');
      setLastName('');
      setPassportSeries('');
      setPassportExpiry('2034-12-31');
      return;
    }

    setIsLoadingLoadingSession(true);
    fetch('/api/auth/telegram/create-session', { method: 'POST' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSessionToken(data.sessionToken);
          setDeepLink(data.deepLink);
          if (data.botUsername) setBotUsername(data.botUsername);

          // Start polling check-session
          startPolling(data.sessionToken);
        }
      })
      .catch((err) => {
        console.warn('Failed to create Telegram auth session:', err);
      })
      .finally(() => {
        setIsLoadingLoadingSession(false);
      });

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen]);

  const startPolling = (token: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/telegram/check-session?sessionToken=${token}`);
        const data = await res.json();
        if (data.authenticated && data.user) {
          clearInterval(pollIntervalRef.current);
          if (data.token) {
            try {
              sessionStorage.setItem('sayrhub_user_token', data.token);
              sessionStorage.setItem('travelway_user_token', data.token);
            } catch (e) {}
          }
          handleAuthVerified(data.user);
        }
      } catch (err) {
        // Silent poll error
      }
    }, 2000);
  };

  const handleAuthVerified = (userData: any) => {
    setVerifiedUserData(userData);
    setIsSuccess(true);

    // Extract first and last name if available
    const rawName = (userData.name || '').trim();
    let fn = '';
    let ln = '';
    if (
      rawName &&
      !rawName.toLowerCase().includes('mijoz') &&
      !rawName.toLowerCase().includes('sayrhub') &&
      !rawName.toLowerCase().includes('user')
    ) {
      const parts = rawName.split(' ');
      fn = parts[0] || '';
      ln = parts.slice(1).join(' ') || '';
    }
    setFirstName(fn);
    setLastName(ln);
    if (userData.passportNumber) {
      setPassportSeries(userData.passportNumber);
    }
    if (userData.passportExpiry) {
      setPassportExpiry(userData.passportExpiry);
    }

    onShowToast(`Telegram orqali tasdiqlandi! Shaxsiy ma'lumotlarni to'ldiring.`, 'success');

    // Switch to Profile Completion Step
    setTimeout(() => {
      setStep('profile');
      setIsSuccess(false);
    }, 800);
  };

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '').slice(-1);
    const updated = [...codeDigits];
    updated[index] = clean;
    setCodeDigits(updated);

    if (clean && index < 3) {
      const nextInput = document.getElementById(`tg-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    if (index === 3 && clean) {
      const fullCode = updated.join('');
      if (fullCode.length === 4) {
        submitManualCode(fullCode);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      e.preventDefault();
      setCodeDigits(pasted.split(''));
      submitManualCode(pasted);
    }
  };

  const submitManualCode = async (codeToVerify?: string) => {
    const code = codeToVerify || codeDigits.join('');
    if (code.length < 4) {
      onShowToast("4 xonali tasdiqlash kodini to'liq kiriting", 'error');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch('/api/auth/telegram/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, sessionToken })
      });
      const data = await res.json();

      if (data.success && data.user) {
        if (data.token) {
          try {
            sessionStorage.setItem('sayrhub_user_token', data.token);
            sessionStorage.setItem('travelway_user_token', data.token);
          } catch (e) {}
        }
        handleAuthVerified(data.user);
      } else {
        onShowToast(data.error || "Tasdiqlash kodi noto'g'ri!", 'error');
      }
    } catch (err) {
      onShowToast("Server bilan ulanishda xatolik", 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePassportChange = (val: string) => {
    const clean = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (clean.length <= 2) {
      setPassportSeries(clean);
    } else {
      setPassportSeries(`${clean.slice(0, 2)} ${clean.slice(2, 9)}`);
    }
  };

  const handleProfileSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const cleanPassport = passportSeries.trim().toUpperCase();

    if (!trimmedFirst || trimmedFirst.length < 2) {
      onShowToast("Iltimos, ismingizni to'liq kiriting", 'error');
      return;
    }

    if (!trimmedLast || trimmedLast.length < 2) {
      onShowToast("Iltimos, familiyangizni to'liq kiriting", 'error');
      return;
    }

    const passportLettersOnly = cleanPassport.replace(/[^A-Z]/g, '');
    const passportDigitsOnly = cleanPassport.replace(/[^0-9]/g, '');

    if (passportLettersOnly.length < 2 || passportDigitsOnly.length < 7) {
      onShowToast("Iltimos, pasport seriya va raqamini to'g'ri kiriting (Masalan: AA 1234567)", 'error');
      return;
    }

    setIsSubmittingProfile(true);

    const fullName = `${trimmedFirst} ${trimmedLast}`;
    const completeUser = {
      ...verifiedUserData,
      name: fullName,
      phone: verifiedUserData?.phone || '',
      passportNumber: cleanPassport,
      passportExpiry: passportExpiry.trim() || '2034-12-31',
      isVerified: true
    };

    // Save to Backend Database
    try {
      let token = '';
      try {
        token =
          sessionStorage.getItem('sayrhub_user_token') ||
          sessionStorage.getItem('travelway_user_token') ||
          '';
      } catch (e) {}

      await fetch('/api/db/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(completeUser)
      });
    } catch (err) {
      console.warn('Backend user profile update warning:', err);
    }

    // Persist to Local Storage
    try {
      localStorage.setItem('sayrhub_user_profile', JSON.stringify(completeUser));
      localStorage.setItem('travelway_user_profile', JSON.stringify(completeUser));
    } catch (e) {}

    setIsSubmittingProfile(false);
    onShowToast(`Xush kelibsiz, ${trimmedFirst}! Ro'yxatdan o'tish muvaffaqiyatli yakunlandi! 🎉`, 'success');
    onSuccess(completeUser);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fadeIn">
      <div
        className="w-full max-w-md rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border flex flex-col space-y-4 max-h-[92vh] overflow-y-auto"
        style={{
          backgroundColor: 'var(--tw-surface)',
          borderColor: 'var(--tw-border)',
          color: 'var(--tw-text-main)'
        }}
      >
        {/* ================= STEP 1: TELEGRAM BOT AUTH ================= */}
        {step === 'auth' && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#2AABEE] text-white flex items-center justify-center shadow-lg shadow-[#2AABEE]/25">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"></path>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-black tracking-tight" style={{ color: 'var(--tw-text-main)' }}>
                      Telegram orqali kirish
                    </h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#2AABEE]/15 text-[#2AABEE]">
                      Rasmiy Bot
                    </span>
                  </div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--tw-text-sub)' }}>
                    @{botUsername} orqali 1 soniyada
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold transition active:scale-95"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
              >
                ✕
              </button>
            </div>

            {/* Success Banner */}
            {isSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2 animate-bounce">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h4 className="font-bold text-emerald-400 text-sm">Muvaffaqiyatli Tasdiqlandi!</h4>
                <p className="text-xs text-slate-300">Profil ma'lumotlarini to'ldirishga o'tilmoqda...</p>
              </div>
            ) : (
              <>
                {/* Steps Visual Guide */}
                <div
                  className="p-4 rounded-2xl border space-y-3"
                  style={{
                    backgroundColor: 'var(--tw-canvas)',
                    borderColor: 'var(--tw-border)'
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#2AABEE] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="text-xs" style={{ color: 'var(--tw-text-main)' }}>
                      Quyidagi tugmani bosib, Telegramdagi <b>@{botUsername}</b> botimizni oching.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#2AABEE] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="text-xs" style={{ color: 'var(--tw-text-main)' }}>
                      Botda <b>Start</b> bosib, <b>"📱 Telefon raqamni ulashish"</b> tugmasini bosing.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#2AABEE] text-white flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="text-xs" style={{ color: 'var(--tw-text-main)' }}>
                      Bot bergan 4 xonali tasdiqlash kodini kiriting <i>(yoki botda tasdiqlangach, avtomatik ochiladi)</i>.
                    </p>
                  </div>
                </div>

                {/* Direct Open Button */}
                <a
                  href={deepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-[#2AABEE] hover:bg-[#229ED9] text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#2AABEE]/30 active:scale-98 transition tap-bounce"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"></path>
                  </svg>
                  <span>Telegram Botni Ochish (@{botUsername})</span>
                </a>

                {/* Waiting indicator */}
                <div className="flex items-center justify-center gap-2 text-xs font-semibold py-1 text-[#2AABEE]">
                  <span className="w-2 h-2 rounded-full bg-[#2AABEE] animate-ping" />
                  <span>Telegram botdan tasdiqlash kutilmoqda...</span>
                </div>

                {/* Manual Code Input Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t" style={{ borderColor: 'var(--tw-border)' }} />
                  <span className="flex-shrink mx-3 text-[11px] font-bold" style={{ color: 'var(--tw-text-muted)' }}>
                    YOKI KODNI KIRITING
                  </span>
                  <div className="flex-grow border-t" style={{ borderColor: 'var(--tw-border)' }} />
                </div>

                {/* 4-digit code fields */}
                <div className="space-y-3">
                  <div className="flex justify-center gap-3" onPaste={handlePaste}>
                    {codeDigits.map((digit, index) => (
                      <input
                        key={index}
                        id={`tg-otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleDigitChange(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !digit && index > 0) {
                            const prevInput = document.getElementById(`tg-otp-${index - 1}`);
                            if (prevInput) prevInput.focus();
                          }
                        }}
                        className="w-13 h-14 text-center text-xl font-black rounded-2xl border focus:border-[#2AABEE] focus:ring-2 focus:ring-[#2AABEE]/30 focus:outline-none transition shadow-sm font-mono"
                        style={{
                          backgroundColor: 'var(--tw-canvas)',
                          borderColor: digit ? '#2AABEE' : 'var(--tw-border)',
                          color: 'var(--tw-text-main)'
                        }}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => submitManualCode()}
                    disabled={isVerifying || codeDigits.join('').length < 4}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2AABEE] to-blue-600 hover:from-[#229ED9] text-white font-bold text-xs shadow-md transition tap-bounce disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {isVerifying ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Tekshirilmoqda...</span>
                      </>
                    ) : (
                      <span>Kodni Tasdiqlash</span>
                    )}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ================= STEP 2: PROFILE DATA COMPLETION ================= */}
        {step === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-4 animate-fadeIn">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight" style={{ color: 'var(--tw-text-main)' }}>
                    Profilni to'ldirish
                  </h3>
                  <p className="text-xs font-semibold" style={{ color: 'var(--tw-text-sub)' }}>
                    Ism, familiya va pasport ma'lumotlari
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmittingProfile}
                className="w-8 h-8 rounded-full border flex items-center justify-center text-sm font-bold transition active:scale-95 disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
              >
                ✕
              </button>
            </div>

            {/* Telegram Verified Status Badge */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                  ✓
                </span>
                <span>Telegram orqali tasdiqlandi</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                2-bosqich: Shaxsiy ma'lumot
              </span>
            </div>

            {/* 1. TELEFON RAQAM (KO'RINIB TURADI - READONLY) */}
            <div>
              <label className="text-[11px] font-bold block mb-1" style={{ color: 'var(--tw-text-sub)' }}>
                📱 Tasdiqlangan telefon raqamingiz
              </label>
              <div
                className="w-full px-3.5 py-2.5 rounded-xl border flex items-center justify-between font-mono text-xs font-bold select-text"
                style={{
                  backgroundColor: 'var(--tw-canvas)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
              >
                <div className="flex items-center gap-2">
                  <span>🇺🇿</span>
                  <span className="text-sm tracking-wide">
                    {formatPhoneDisplay(verifiedUserData?.phone || '')}
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-500 flex items-center gap-1">
                  <span>✓</span> Ulangan
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                * Bu raqam Telegram bot orqali rasman tasdiqlandi va o'zgartirilmaydi.
              </p>
            </div>

            {/* 2. ISM VA FAMILIYA QATORI */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold block mb-1" style={{ color: 'var(--tw-text-sub)' }}>
                  Ism <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Masalan: Jasur"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2AABEE] transition"
                  style={{
                    backgroundColor: 'var(--tw-canvas)',
                    borderColor: 'var(--tw-border)',
                    color: 'var(--tw-text-main)'
                  }}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold block mb-1" style={{ color: 'var(--tw-text-sub)' }}>
                  Familiya <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Masalan: Rahimov"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2AABEE] transition"
                  style={{
                    backgroundColor: 'var(--tw-canvas)',
                    borderColor: 'var(--tw-border)',
                    color: 'var(--tw-text-main)'
                  }}
                />
              </div>
            </div>

            {/* 3. PASPORT SERIYA VA RAQAMI */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold" style={{ color: 'var(--tw-text-sub)' }}>
                  🛂 Pasport seriya va raqami <span className="text-rose-500">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">Namuna: AA 1234567</span>
              </div>
              <input
                type="text"
                required
                maxLength={10}
                value={passportSeries}
                onChange={(e) => handlePassportChange(e.target.value)}
                placeholder="AA 1234567"
                className="w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-[#2AABEE] transition"
                style={{
                  backgroundColor: 'var(--tw-canvas)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Aviachipta, turpaket bron qilish va vaucherlar uchun kerak bo'ladi.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmittingProfile}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#2AABEE] to-blue-600 hover:from-[#229ED9] text-white font-black text-sm shadow-lg shadow-[#2AABEE]/30 active:scale-98 transition tap-bounce disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isSubmittingProfile ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saqlanmoqda...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Saqlash va SayrHub'ga kirish</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
