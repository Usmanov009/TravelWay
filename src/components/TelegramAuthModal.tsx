import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  X,
  Check,
  Phone,
  User,
  FileText,
  Sparkles,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

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

  const formatPhoneDisplay = (phone: string) => {
    if (!phone) return '+998 (**) ***-**-**';
    const clean = phone.trim();
    const digits = clean.replace(/\D/g, '');
    if (digits.startsWith('998') && digits.length === 12) {
      return `+998 (${digits.slice(3, 5)}) ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10, 12)}`;
    }
    return clean.startsWith('+') ? clean : `+${clean}`;
  };

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
          startPolling(data.sessionToken);
        } else {
          onShowToast("Telegram sessiya yaratishda xatolik yuz berdi", 'error');
        }
      })
      .catch((err) => {
        console.warn('Telegram session error:', err);
        onShowToast("Server bilan ulanishda xatolik", 'error');
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
        const res = await fetch(`/api/auth/telegram/check-session?token=${token}`);
        const data = await res.json();

        if (data.success && data.status === 'verified' && data.user) {
          clearInterval(pollIntervalRef.current);
          if (data.token) {
            try {
              sessionStorage.setItem('sayrhub_user_token', data.token);
              sessionStorage.setItem('travelway_user_token', data.token);
            } catch (e) {}
          }
          handleAuthVerified(data.user);
        }
      } catch (e) {
        console.warn('Poll error:', e);
      }
    }, 2000);
  };

  const handleAuthVerified = (userData: any) => {
    setVerifiedUserData(userData);
    setIsSuccess(true);

    let fn = '';
    let ln = '';
    const rawName = (userData.name || '').trim();
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
    const trimmedPassport = passportSeries.trim();

    if (!trimmedFirst || !trimmedLast) {
      onShowToast("Iltimos, ism va familiyangizni to'liq kiriting", 'error');
      return;
    }

    if (!trimmedPassport || trimmedPassport.length < 9) {
      onShowToast("Pasport seriya va raqamini to'liq kiriting (masalan, AA 1234567)", 'error');
      return;
    }

    setIsSubmittingProfile(true);

    const completeUser = {
      ...verifiedUserData,
      name: `${trimmedFirst} ${trimmedLast}`,
      passportNumber: trimmedPassport,
      passportExpiry: passportExpiry || '2034-12-31'
    };

    try {
      const token = sessionStorage.getItem('sayrhub_user_token') || sessionStorage.getItem('travelway_user_token');
      await fetch('/api/auth/telegram/update-profile', {
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-fadeIn">
      <Card className="w-full max-w-md rounded-t-[28px] sm:rounded-2xl p-6 shadow-2xl border-border bg-card text-card-foreground flex flex-col space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* ================= STEP 1: TELEGRAM BOT AUTH ================= */}
        {step === 'auth' && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-base font-bold text-foreground">
                      Telegram orqali kirish
                    </h3>
                    <Badge variant="secondary" className="text-[10px] text-sky-600 bg-sky-500/10">
                      Rasmiy Bot
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    @{botUsername} orqali 1 soniyada
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Success Banner */}
            {isSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">Muvaffaqiyatli Tasdiqlandi!</h4>
                <p className="text-xs text-muted-foreground">Profil ma'lumotlarini to'ldirishga o'tilmoqda...</p>
              </div>
            ) : (
              <>
                {/* Steps Visual Guide */}
                <div className="p-4 rounded-xl border border-border bg-muted/40 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Badge variant="default" className="w-5 h-5 p-0 flex items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5">
                      1
                    </Badge>
                    <p className="text-xs text-foreground">
                      Quyidagi tugmani bosib, Telegramdagi <b>@{botUsername}</b> botimizni oching.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Badge variant="default" className="w-5 h-5 p-0 flex items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5">
                      2
                    </Badge>
                    <p className="text-xs text-foreground">
                      Botda <b>Start</b> bosib, <b>"Telefon raqamni ulashish"</b> tugmasini bosing.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Badge variant="default" className="w-5 h-5 p-0 flex items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5">
                      3
                    </Badge>
                    <p className="text-xs text-foreground">
                      Bot bergan 4 xonali kodni kiriting yoki botda tasdiqlangach avtomatik ochiladi.
                    </p>
                  </div>
                </div>

                {/* Direct Open Button */}
                <Button
                  variant="default"
                  size="lg"
                  asChild
                  className="w-full rounded-xl h-12 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs gap-2"
                >
                  <a href={deepLink} target="_blank" rel="noopener noreferrer">
                    <Send className="w-4 h-4" />
                    <span>Telegram Botni Ochish (@{botUsername})</span>
                  </a>
                </Button>

                {/* Waiting indicator */}
                <div className="flex items-center justify-center gap-2 text-xs font-medium py-1 text-sky-500">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                  <span>Telegram botdan tasdiqlash kutilmoqda...</span>
                </div>

                {/* Manual Code Input Divider */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-border" />
                  <span className="flex-shrink mx-3 text-[10px] font-bold text-muted-foreground uppercase">
                    Yoki kodni kiriting
                  </span>
                  <div className="flex-grow border-t border-border" />
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
                        className="w-12 h-14 text-center text-xl font-black rounded-xl border border-input bg-background text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition font-mono"
                      />
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="default"
                    onClick={() => submitManualCode()}
                    disabled={isVerifying || codeDigits.join('').length < 4}
                    className="w-full h-10 rounded-xl text-xs font-bold"
                  >
                    {isVerifying ? 'Tekshirilmoqda...' : 'Kodni Tasdiqlash'}
                  </Button>
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
                <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    Profilni to'ldirish
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Ism, familiya va pasport ma'lumotlari
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                disabled={isSubmittingProfile}
                className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Telegram Verified Status Badge */}
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                <Check className="w-4 h-4" />
                <span>Telegram orqali tasdiqlandi</span>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                2-bosqich: Shaxsiy ma'lumot
              </Badge>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Tasdiqlangan telefon raqamingiz
              </label>
              <div className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted/40 flex items-center justify-between font-mono text-xs font-bold">
                <div className="flex items-center gap-2">
                  <span>🇺🇿</span>
                  <span>{formatPhoneDisplay(verifiedUserData?.phone || '')}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] text-emerald-600 bg-emerald-500/10">
                  ✓ Ulangan
                </Badge>
              </div>
            </div>

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Ism <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Masalan: Jasur"
                  className="h-10 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Familiya <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Masalan: Rahimov"
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Passport */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">
                  Pasport seriya va raqami <span className="text-destructive">*</span>
                </label>
                <span className="text-[10px] text-muted-foreground font-mono">Namuna: AA 1234567</span>
              </div>
              <Input
                type="text"
                required
                maxLength={10}
                value={passportSeries}
                onChange={(e) => handlePassportChange(e.target.value)}
                placeholder="AA 1234567"
                className="h-10 text-xs font-mono font-bold tracking-wider uppercase rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Aviachipta, turpaket bron qilish va vaucherlar uchun kerak bo'ladi.
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmittingProfile}
              variant="default"
              size="lg"
              className="w-full rounded-xl h-11 text-xs font-bold gap-2 mt-2"
            >
              {isSubmittingProfile ? (
                <span>Saqlanmoqda...</span>
              ) : (
                <>
                  <span>Saqlash va SayrHub'ga kirish</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};
