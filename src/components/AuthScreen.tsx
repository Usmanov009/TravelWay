import React, { useState } from 'react';
import { LanguageCode } from '../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Headphones,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Tag,
  Globe,
  ChevronDown,
  Check,
  Plane,
  Gift,
  ArrowRight
} from 'lucide-react';

interface AuthScreenProps {
  currentLang: LanguageCode;
  onSelectLang: (lang: LanguageCode) => void;
  onBack: () => void;
  onOpenSupport: () => void;
  onRequestOtp: (phone: string) => void;
  onOpenSocial: (provider: 'google') => void;
  onTelegramAuth: () => void;
  onAuthSuccess: (welcomeMsg: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  currentLang,
  onSelectLang,
  onBack,
  onOpenSupport,
  onRequestOtp,
  onOpenSocial,
  onTelegramAuth,
  onAuthSuccess,
  onShowToast
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [promoCode, setPromoCode] = useState('');

  // Phone formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.startsWith('998')) {
      raw = raw.substring(3);
    }
    raw = raw.substring(0, 9);

    let formatted = '';
    if (raw.length > 0) formatted += raw.substring(0, 2);
    if (raw.length >= 3) formatted += ' ' + raw.substring(2, 5);
    if (raw.length >= 6) formatted += '-' + raw.substring(5, 7);
    if (raw.length >= 8) formatted += '-' + raw.substring(7, 9);

    setPhoneNumber(formatted);
  };

  const rawDigits = phoneNumber.replace(/\D/g, '');
  const isPhoneValid = rawDigits.length === 9;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'phone' && !isPhoneValid) {
      onShowToast("Iltimos, telefon raqamingizni to'liq kiriting (90 123-45-67)", 'error');
      return;
    }

    if (activeTab === 'email' && (!email || !password)) {
      onShowToast("Email va maxfiy parolni kiriting", 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      if (mode === 'register') {
        onAuthSuccess(`Xush kelibsiz, ${regFullName || 'Foydalanuvchi'}! $30 sayohat vaucheri balansingizga qo'shildi! 🎉`);
        return;
      }

      if (activeTab === 'phone') {
        if (isPasswordMode) {
          onAuthSuccess("Parol muvaffaqiyatli tasdiqlandi. Tizimga xush kelibsiz!");
        } else {
          onRequestOtp(`+998 ${phoneNumber}`);
        }
      } else {
        onAuthSuccess(`${email || 'Foydalanuvchi'} hisobiga muvaffaqiyatli kirildi!`);
      }
    }, 650);
  };

  const getLangFlag = (code: LanguageCode) => {
    switch (code) {
      case 'UZ':
        return '🇺🇿';
      case 'RU':
        return '🇷🇺';
      case 'EN':
        return '🇬🇧';
    }
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto space-y-4 select-none pb-8 transition-colors">
      {/* Top Bar Controls */}
      <div className="flex items-center justify-between px-1">
        <Button
          id="btn-auth-back"
          variant="outline"
          size="icon"
          onClick={onBack}
          className="rounded-xl w-9 h-9"
          title="Orqaga"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative">
            <Button
              id="auth-lang-btn"
              variant="outline"
              size="sm"
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="rounded-xl h-9 px-3 gap-1.5 text-xs font-semibold"
            >
              <span className="text-sm">{getLangFlag(currentLang)}</span>
              <span>{currentLang}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </Button>

            {isLangMenuOpen && (
              <div
                id="auth-lang-dropdown"
                className="absolute right-0 mt-1.5 w-32 border border-border bg-popover text-popover-foreground rounded-xl shadow-xl overflow-hidden z-40 p-1 flex flex-col gap-0.5"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => {
                    onSelectLang('UZ');
                    setIsLangMenuOpen(false);
                  }}
                >
                  🇺🇿 O'zbek
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => {
                    onSelectLang('RU');
                    setIsLangMenuOpen(false);
                  }}
                >
                  🇷🇺 Русский
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => {
                    onSelectLang('EN');
                    setIsLangMenuOpen(false);
                  }}
                >
                  🇬🇧 English
                </Button>
              </div>
            )}
          </div>

          {/* Quick Help & Support 24/7 */}
          <Button
            id="btn-auth-support"
            variant="outline"
            size="icon"
            onClick={onOpenSupport}
            className="rounded-xl w-9 h-9 text-muted-foreground hover:text-foreground"
            title="24/7 Qo'llab-quvvatlash"
          >
            <Headphones className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Hero Header & Brand Icon */}
      <div className="text-center pt-1 pb-1 flex flex-col items-center">
        <div
          className="relative mb-3 group cursor-pointer"
          onClick={() => onShowToast("SayrHub — Unutilmas sayohatlar onlayn platformasi", 'info')}
        >
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary shadow-sm flex items-center justify-center relative transition-transform group-hover:scale-105">
            <img
              src="/logo.png"
              alt="SayrHub"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-2xl font-black text-primary-foreground tracking-tight absolute pointer-events-none">
              SH
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <Plane className="w-3 h-3" />
          </div>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-foreground" id="auth-main-title">
          {mode === 'register' ? "SayrHub-da ro'yxatdan o'tish" : "SayrHub hisobiga kirish"}
        </h2>
        <p className="text-xs text-muted-foreground max-w-xs mt-1" id="auth-main-subtitle">
          {mode === 'register'
            ? "Yangi akkaunt oching va sayohat chegirmalarini birinchi bo'lib oling!"
            : "Eng qulay turpaketlar, charter reyslar va narx signallariga kirish uchun kiring"}
        </p>
      </div>

      {/* Segmented Control (Phone vs Email) */}
      <div className="p-1 rounded-2xl flex items-center bg-muted/60 border border-border/80" id="auth-tabs-wrapper">
        <Button
          id="tab-phone-btn"
          variant={activeTab === 'phone' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('phone')}
          className="flex-1 rounded-xl text-xs font-semibold h-8 gap-1.5 cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Telefon raqam</span>
        </Button>
        <Button
          id="tab-email-btn"
          variant={activeTab === 'email' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('email')}
          className="flex-1 rounded-xl text-xs font-semibold h-8 gap-1.5 cursor-pointer"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Email / TW-ID</span>
        </Button>
      </div>

      {/* Featured Telegram Registration */}
      {mode === 'register' && (
        <Button
          variant="outline"
          onClick={onTelegramAuth}
          className="w-full h-auto py-3 px-3.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30 text-sky-600 dark:text-sky-400 justify-between cursor-pointer"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0">
              <span className="font-bold text-xs">TG</span>
            </div>
            <div>
              <span className="font-bold text-xs block text-foreground">Telegram orqali ro'yxatdan o'tish</span>
              <span className="text-[10px] text-muted-foreground">@sayrhub_bot orqali 1 soniyada</span>
            </div>
          </div>
          <Badge variant="secondary" className="bg-sky-500/20 text-sky-600 dark:text-sky-400 text-xs font-bold">
            +$30 bonus
          </Badge>
        </Button>
      )}

      {/* Main Auth Form Card */}
      <Card className="border-border bg-card shadow-xs p-5 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* REGISTRATION-ONLY FIELDS */}
          {mode === 'register' && (
            <div className="space-y-3" id="section-register-fields">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>To'liq ismingiz</span>
                  <span className="text-[10px] text-primary font-bold">Pasport bo'yicha</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="reg-fullname-input"
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Masalan: Jasur Rahimov"
                    className="pl-9 h-10 rounded-xl bg-background text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Promo-kod (Ixtiyoriy)</span>
                  <span className="text-[10px] text-amber-500 font-bold">+$30 bonus</span>
                </label>
                <div className="relative">
                  <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                  <Input
                    id="reg-promo-input"
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="PROMO: TRIP30BONUS"
                    className="pl-9 h-10 rounded-xl bg-background text-xs uppercase font-mono font-bold text-amber-600 dark:text-amber-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Phone Input Form Section */}
          {activeTab === 'phone' && (
            <div className="space-y-3" id="section-phone-input">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Telefon raqamingiz</span>
                  <span className="text-[10px] text-primary font-bold" id="phone-hint-tag">
                    {isPasswordMode ? 'Akkaunt raqami' : 'SMS orqali kod keladi'}
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 h-10 bg-muted/60 rounded-xl text-xs font-bold text-foreground shrink-0 border border-border">
                    <span>🇺🇿</span>
                    <span>+998</span>
                  </div>
                  <Input
                    id="phone-input"
                    type="tel"
                    inputMode="numeric"
                    maxLength={12}
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="90 123-45-67"
                    className="h-10 rounded-xl bg-background text-xs font-semibold tracking-wide flex-1"
                  />
                  {isPhoneValid && (
                    <Badge variant="secondary" className="h-10 px-2 rounded-xl text-emerald-600 bg-emerald-500/10">
                      <Check className="w-4 h-4" />
                    </Badge>
                  )}
                </div>
              </div>

              {/* Verification Type Option */}
              {mode === 'login' && (
                <div className="flex items-center justify-between pt-0.5" id="phone-switch-row">
                  <Button
                    variant="link"
                    size="sm"
                    id="auth-method-toggle"
                    onClick={() => setIsPasswordMode(!isPasswordMode)}
                    type="button"
                    className="p-0 h-auto text-xs font-semibold text-primary"
                  >
                    <span id="auth-method-label">
                      {isPasswordMode ? 'SMS kod bilan kirish' : 'Parol bilan kirish'}
                    </span>
                  </Button>
                  <span className="text-[10px] text-muted-foreground">Tezkor & xavfsiz</span>
                </div>
              )}

              {/* Password Field */}
              {(isPasswordMode || mode === 'register') && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Maxfiy parol</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="phone-pass-input"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Kamida 8 ta belgi"
                      className="pl-9 pr-9 h-10 rounded-xl bg-background text-xs"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Email & TW-ID Section */}
          {activeTab === 'email' && (
            <div className="space-y-3" id="section-email-input">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Email manzili yoki SH-ID</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email-input"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jasur@sayrhub.uz yoki #SH-884291"
                    className="pl-9 h-10 rounded-xl bg-background text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">Parol</label>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => onShowToast("Parolni qayta tiklash havolasi emailingizga yuborildi", 'info')}
                    type="button"
                    className="p-0 h-auto text-[11px] text-primary"
                  >
                    Parolni unutdingizmi?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email-pass-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kamida 8 ta belgi"
                    className="pl-9 pr-9 h-10 rounded-xl bg-background text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label
              className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-foreground"
              onClick={() => setRememberMe(!rememberMe)}
            >
              <div
                id="remember-switch-box"
                className={`w-4 h-4 rounded flex items-center justify-center text-primary-foreground text-xs font-bold transition-colors ${
                  rememberMe ? 'bg-primary' : 'border border-input'
                }`}
              >
                {rememberMe && <Check className="w-3 h-3 text-white" />}
              </div>
              <span>Meni eslab qol</span>
            </label>
            <span className="text-[10px] text-muted-foreground">30 kunlik faollik</span>
          </div>

          {/* Primary Action Button */}
          <Button
            id="submit-auth-btn"
            disabled={isSubmitting}
            variant="default"
            size="lg"
            className="w-full rounded-xl h-11 text-xs font-bold gap-2 cursor-pointer"
            type="submit"
          >
            {isSubmitting ? (
              <span>Tekshirilmoqda...</span>
            ) : (
              <>
                <span id="submit-auth-label">
                  {mode === 'register'
                    ? "Ro'yxatdan o'tish"
                    : activeTab === 'phone' && !isPasswordMode
                    ? 'Tasdiqlash kodini olish'
                    : 'Tizimga kirish'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </Card>

      {/* Social Fast Login Divider */}
      <div className="relative flex items-center justify-center my-1">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative px-3 text-[11px] font-medium bg-background text-muted-foreground">
          Yoki tezkor usulda kiring
        </span>
      </div>

      {/* Social Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          id="btn-login-telegram"
          variant="outline"
          onClick={onTelegramAuth}
          className="rounded-xl h-10 text-xs font-semibold gap-2 border-border"
          type="button"
        >
          <span className="font-bold text-sky-500">TG</span>
          <span>Telegram</span>
        </Button>

        <Button
          id="btn-login-google"
          variant="outline"
          onClick={() => onOpenSocial('google')}
          className="rounded-xl h-10 text-xs font-semibold gap-2 border-border"
          type="button"
        >
          <span className="font-bold text-red-500">G</span>
          <span>Google</span>
        </Button>
      </div>

      {/* Bonus Perk Banner */}
      <Card className="border-border bg-muted/40 p-3.5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Gift className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-[9px] uppercase font-bold text-primary">
              Bonus
            </Badge>
            <p className="text-xs font-bold text-foreground truncate">$30 vaucher kutmoqda!</p>
          </div>
          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
            Ro'yxatdan o'ting va ilk turpaket uchun $30 chegirmaga ega bo'ling.
          </p>
        </div>
      </Card>

      {/* Bottom Switch Footer */}
      <div className="pt-1 text-center space-y-2">
        <div className="text-xs text-muted-foreground" id="auth-switch-footer">
          <span id="footer-switch-prompt">
            {mode === 'login' ? "Hisobingiz yo'qmi?" : "Hisobingiz bormi?"}
          </span>
          <Button
            variant="link"
            size="sm"
            id="footer-switch-link"
            className="font-bold text-primary p-0 h-auto ml-1 text-xs"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' ? "Ro'yxatdan o'tish" : 'Tizimga kirish'}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground px-4 leading-relaxed">
          Kirish orqali siz SayrHub-ning Foydalanish qoidalari va Maxfiylik siyosatiga rozilik bildirasiz.
        </p>
      </div>
    </div>
  );
};
