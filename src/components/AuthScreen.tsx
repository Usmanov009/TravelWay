import React, { useState } from 'react';
import { LanguageCode } from '../types';

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
        onAuthSuccess(`Xush kelibsiz, ${regFullName}! $30 sayohat vaucheri balansingizga qo'shildi! 🎉`);
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
    <div
      className="flex flex-col w-full font-sans space-y-3.5 select-none pb-8 transition-colors"
      style={{ color: 'var(--tw-text-main)' }}
    >
      {/* Top Bar Controls (Back, Language, Support) */}
      <div className="flex items-center justify-between px-1">
        <button
          id="btn-auth-back"
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition border tap-bounce shadow-xs"
          style={{
            backgroundColor: 'var(--tw-surface)',
            borderColor: 'var(--tw-border)',
            color: 'var(--tw-text-main)'
          }}
          onClick={onBack}
          type="button"
          title="Orqaga"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Language Selector */}
          <div className="relative">
            <button
              id="auth-lang-btn"
              className="h-10 px-3 rounded-xl border flex items-center gap-1.5 text-xs font-semibold shadow-xs tap-bounce transition"
              style={{
                backgroundColor: 'var(--tw-surface)',
                borderColor: 'var(--tw-border)',
                color: 'var(--tw-text-main)'
              }}
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              type="button"
            >
              <span className="text-sm">{getLangFlag(currentLang)}</span>
              <span>{currentLang}</span>
              <span className="material-symbols-outlined text-[16px]" style={{ color: 'var(--tw-text-sub)' }}>expand_more</span>
            </button>

            {isLangMenuOpen && (
              <div
                id="auth-lang-dropdown"
                className="absolute right-0 mt-1.5 w-32 border rounded-xl shadow-xl overflow-hidden z-40 p-1 flex flex-col gap-0.5"
                style={{
                  backgroundColor: 'var(--tw-surface)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <button
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors w-full text-left"
                  style={{ color: 'var(--tw-text-main)' }}
                  onClick={() => {
                    onSelectLang('UZ');
                    setIsLangMenuOpen(false);
                  }}
                  type="button"
                >
                  <span>🇺🇿</span> O'zbek
                </button>
                <button
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors w-full text-left"
                  style={{ color: 'var(--tw-text-main)' }}
                  onClick={() => {
                    onSelectLang('RU');
                    setIsLangMenuOpen(false);
                  }}
                  type="button"
                >
                  <span>🇷🇺</span> Русский
                </button>
                <button
                  className="flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-lg transition-colors w-full text-left"
                  style={{ color: 'var(--tw-text-main)' }}
                  onClick={() => {
                    onSelectLang('EN');
                    setIsLangMenuOpen(false);
                  }}
                  type="button"
                >
                  <span>🇬🇧</span> English
                </button>
              </div>
            )}
          </div>

          {/* Quick Help & Support 24/7 */}
          <button
            id="btn-auth-support"
            className="w-10 h-10 rounded-2xl flex items-center justify-center transition border tap-bounce shadow-xs"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)',
              color: 'var(--tw-text-main)'
            }}
            onClick={onOpenSupport}
            title="24/7 Qo'llab-quvvatlash"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
          </button>
        </div>
      </div>

      {/* Hero Header & App Glow Icon */}
      <div className="text-center pt-0.5 pb-1 flex flex-col items-center">
        <div
          className="relative mb-2.5 group cursor-pointer"
          onClick={() => onShowToast("✈️ TravelWay — Eng unutilmas sayohatlaringiz hamrohi!", 'info')}
        >
          <div
            className="w-16 h-16 rounded-2xl p-[2px] shadow-md transition-transform active:scale-95"
            style={{ backgroundColor: 'var(--tw-accent)' }}
          >
            <div
              className="w-full h-full rounded-[14px] flex items-center justify-center relative overflow-hidden"
              style={{ backgroundColor: 'var(--tw-surface)' }}
            >
              <span className="text-2xl font-black tracking-tight" style={{ color: 'var(--tw-text-main)' }}>TW</span>
            </div>
          </div>
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center shadow-md"
            style={{ backgroundColor: 'var(--tw-accent)', color: 'var(--tw-accent-contrast)' }}
          >
            <span className="material-symbols-outlined text-[12px]">flight</span>
          </div>
        </div>

        <h2
          className="text-xl font-black tracking-tight"
          id="auth-main-title"
          style={{ color: 'var(--tw-text-main)' }}
        >
          {mode === 'register' ? "TravelWay-da ro'yxatdan o'tish" : "TravelWay hisobiga kirish"}
        </h2>
        <p
          className="text-xs max-w-[290px] mt-1 leading-relaxed"
          id="auth-main-subtitle"
          style={{ color: 'var(--tw-text-sub)' }}
        >
          {mode === 'register'
            ? "Yangi akkaunt oching va sayohat takliflarini birinchi bo'lib oling!"
            : "Eng qulay turpaketlar, arzon charterlar va narx signallariga kirish uchun kiring"}
        </p>
      </div>

      {/* Auth Mode Segmented Control (Phone vs Email) */}
      <div
        className="p-1 rounded-2xl flex items-center border transition-colors"
        id="auth-tabs-wrapper"
        style={{
          backgroundColor: 'var(--tw-subtle)',
          borderColor: 'var(--tw-border)'
        }}
      >
        <button
          id="tab-phone-btn"
          className={`flex-1 py-2 text-xs font-bold rounded-xl active:scale-98 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'phone' ? 'shadow-xs' : ''
          }`}
          style={{
            backgroundColor: activeTab === 'phone' ? 'var(--tw-accent)' : 'transparent',
            color: activeTab === 'phone' ? 'var(--tw-accent-contrast)' : 'var(--tw-text-sub)'
          }}
          onClick={() => setActiveTab('phone')}
          type="button"
        >
          <span className="material-symbols-outlined text-[15px]">call</span>
          <span>Telefon raqam</span>
        </button>
        <button
          id="tab-email-btn"
          className={`flex-1 py-2 text-xs font-medium rounded-xl active:scale-98 transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'email' ? 'shadow-xs' : ''
          }`}
          style={{
            backgroundColor: activeTab === 'email' ? 'var(--tw-accent)' : 'transparent',
            color: activeTab === 'email' ? 'var(--tw-accent-contrast)' : 'var(--tw-text-sub)'
          }}
          onClick={() => setActiveTab('email')}
          type="button"
        >
          <span className="material-symbols-outlined text-[15px]">mail</span>
          <span>Email / TW-ID</span>
        </button>
      </div>

      {/* Main Auth Form Card */}
      <form onSubmit={handleSubmit} className="bg-[#111c30] border border-[#1b2b46] rounded-3xl p-4 shadow-xl space-y-3.5">
        {/* REGISTRATION-ONLY FIELDS */}
        {mode === 'register' && (
          <div className="space-y-3 animate-fadeIn" id="section-register-fields">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>To'liq ismingiz</span>
                <span className="text-[10px] text-[#ff5b00] font-bold">Xalqaro pasport bo'yicha</span>
              </label>
              <div className="flex items-center bg-[#16233a] rounded-2xl px-3 py-2 shadow-inner border border-[#1f3150] focus-within:border-[#ff5b00]">
                <span className="material-symbols-outlined text-slate-400 text-[18px] mr-2">badge</span>
                <input
                  id="reg-fullname-input"
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Masalan: Jasur Rahimov"
                  className="w-full bg-transparent border-none text-white text-xs font-semibold focus:outline-none focus:ring-0 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>Promo-kod (Ixtiyoriy)</span>
                <span className="text-[10px] text-amber-400 font-bold">+$30 bonus beradi</span>
              </label>
              <div className="flex items-center bg-[#16233a] rounded-2xl px-3 py-2 shadow-inner border border-[#1f3150] focus-within:border-[#ff5b00]">
                <span className="material-symbols-outlined text-amber-400 text-[18px] mr-2">loyalty</span>
                <input
                  id="reg-promo-input"
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="PROMO: TRIP30BONUS"
                  className="w-full bg-transparent border-none text-amber-300 text-xs font-mono font-bold focus:outline-none focus:ring-0 placeholder:text-slate-500 uppercase"
                />
              </div>
            </div>
          </div>
        )}

        {/* Phone Input Form Section */}
        {activeTab === 'phone' && (
          <div className="space-y-3" id="section-phone-input">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                <span>Telefon raqamingiz</span>
                <span className="text-[10px] text-[#ff5b00] font-bold" id="phone-hint-tag">
                  {isPasswordMode ? 'Akkaunt raqami' : 'SMS orqali kod keladi'}
                </span>
              </label>

              <div className="relative flex items-center bg-[#16233a] rounded-2xl p-1.5 transition-all shadow-inner border border-[#1f3150] focus-within:border-[#ff5b00]">
                {/* Country code pill */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#0f1828] rounded-xl text-xs font-bold text-slate-100 shrink-0 border border-[#1b2b45]">
                  <span className="text-sm">🇺🇿</span>
                  <span>+998</span>
                </div>

                {/* Formatted Input */}
                <input
                  id="phone-input"
                  type="tel"
                  inputMode="numeric"
                  maxLength={12}
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="90 123-45-67"
                  className="w-full bg-transparent border-none text-white text-sm font-semibold tracking-wide px-3 py-1.5 focus:outline-none focus:ring-0 placeholder:text-slate-500"
                />

                {/* Live validation feedback indicator */}
                {isPhoneValid && (
                  <div className="pr-1.5 flex items-center" id="phone-valid-indicator">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[12px] font-bold">
                      ✓
                    </span>
                  </div>
                )}

                {/* Clear Button */}
                {phoneNumber.length > 0 && (
                  <button
                    id="phone-clear-btn"
                    className="pr-2 text-slate-500 hover:text-slate-300 active:scale-90"
                    onClick={() => setPhoneNumber('')}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[16px]">cancel</span>
                  </button>
                )}
              </div>
            </div>

            {/* Verification Type Option (OTP vs Password) */}
            {mode === 'login' && (
              <div className="flex items-center justify-between pt-0.5" id="phone-switch-row">
                <button
                  id="auth-method-toggle"
                  className="text-[11px] font-semibold text-[#ff5b00] hover:text-[#e55200] active:scale-95 transition-transform flex items-center gap-1"
                  onClick={() => setIsPasswordMode(!isPasswordMode)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[14px]">lock_reset</span>
                  <span id="auth-method-label">
                    {isPasswordMode ? 'SMS kod bilan kirish' : 'Parol bilan kirish'}
                  </span>
                </button>
                <span className="text-[10px] text-slate-500">Tezkor & xavfsiz</span>
              </div>
            )}

            {/* Hidden Password Field for Phone Account if enabled */}
            {(isPasswordMode || mode === 'register') && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">Maxfiy parol</label>
                <div className="relative flex items-center bg-[#16233a] rounded-2xl px-3 py-2 shadow-inner border border-[#1f3150] focus-within:border-[#ff5b00]">
                  <input
                    id="phone-pass-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kamida 8 ta belgi"
                    className="w-full bg-transparent border-none text-white text-xs font-semibold focus:outline-none focus:ring-0 placeholder:text-slate-500"
                  />
                  <button
                    className="text-slate-400 hover:text-slate-200"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Email & TC-ID Input Form Section */}
        {activeTab === 'email' && (
          <div className="space-y-3" id="section-email-input">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300">Email manzili yoki TC-ID</label>
              <div className="flex items-center bg-[#16233a] rounded-2xl px-3 py-2.5 shadow-inner border border-[#1f3150] focus-within:border-[#ff5b00]">
                <span className="material-symbols-outlined text-slate-400 text-[18px] mr-2">alternate_email</span>
                <input
                  id="email-input"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jasur@travelway.uz yoki #TW-884291"
                  className="w-full bg-transparent border-none text-white text-xs font-semibold focus:outline-none focus:ring-0 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-300">Parol</label>
                <button
                  className="text-[11px] font-semibold text-[#ff5b00] hover:underline"
                  onClick={() => onShowToast("Parolni qayta tiklash havolasi emailingizga yuborildi", 'info')}
                  type="button"
                >
                  Parolni unutdingizmi?
                </button>
              </div>
              <div className="flex items-center bg-[#16233a] rounded-2xl px-3 py-2.5 shadow-inner border border-[#1f3150] focus-within:border-[#ff5b00]">
                <span className="material-symbols-outlined text-slate-400 text-[18px] mr-2">key</span>
                <input
                  id="email-pass-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kamida 8 ta belgi"
                  className="w-full bg-transparent border-none text-white text-xs font-semibold focus:outline-none focus:ring-0 placeholder:text-slate-500"
                />
                <button
                  className="text-slate-400 hover:text-slate-200"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Remember Me & Terms Acceptance Switch */}
        <div className="flex items-center justify-between pt-1">
          <label
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => setRememberMe(!rememberMe)}
          >
            <div
              id="remember-switch-box"
              className={`w-5 h-5 rounded-lg flex items-center justify-center text-white text-xs font-bold transition-colors shadow ${
                rememberMe ? 'bg-[#ff5b00]' : 'bg-[#16233a] border border-[#233550]'
              }`}
            >
              {rememberMe && <span className="material-symbols-outlined text-[14px]">check</span>}
            </div>
            <span className="text-xs text-slate-300 font-medium">Meni eslab qol</span>
          </label>
          <span className="text-[10px] text-slate-400">30 kunlik faollik</span>
        </div>

        {/* Primary Action Button with Spinner state */}
        <button
          id="submit-auth-btn"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#ff5b00] via-[#ff6a1a] to-[#ff7d36] hover:brightness-110 active:scale-98 transition-all text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 relative overflow-hidden"
          type="submit"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" d="M4 12a8 8 0 018-8v8H4z" fill="currentColor"></path>
              </svg>
              <span>Tekshirilmoqda...</span>
            </>
          ) : (
            <>
              <span id="submit-auth-label">
                {mode === 'register'
                  ? "Ro'yxatdan o'tish"
                  : activeTab === 'phone' && !isPasswordMode
                  ? 'Tasdiqlash kodini olish'
                  : 'Tizimga kirish'}
              </span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Social Fast Login Divider */}
      <div className="relative flex items-center justify-center my-0.5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full h-[1px] border-t" style={{ borderColor: 'var(--tw-border)' }}></div>
        </div>
        <span
          className="relative px-3 text-[11px] font-semibold"
          style={{
            backgroundColor: 'var(--tw-canvas)',
            color: 'var(--tw-text-muted)'
          }}
        >
          Yoki tezkor usulda kiring
        </span>
      </div>

      {/* Social & Fast Login Grid */}
      <div className="space-y-2">
        {/* Telegram 1-Tap Login */}
        <button
          id="btn-login-telegram"
          className="w-full py-2.5 px-3 rounded-2xl bg-[#2AABEE]/15 hover:bg-[#2AABEE]/25 border border-[#2AABEE]/30 active:scale-98 transition-all text-[#2AABEE] text-xs font-bold flex items-center justify-between shadow-sm"
          onClick={onTelegramAuth}
          type="button"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#2AABEE] text-white flex items-center justify-center shadow-md">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"></path>
              </svg>
            </div>
            <span className="font-semibold" style={{ color: 'var(--tw-text-main)' }}>Telegram orqali tezkor kirish</span>
          </div>
          <span className="text-[10px] bg-[#2AABEE]/20 px-2 py-0.5 rounded-md font-bold text-[#2AABEE]">1 soniya</span>
        </button>

        {/* Google 1-Tap Login */}
        <button
          id="btn-login-google"
          className="w-full py-2.5 px-3 rounded-2xl border active:scale-98 transition-all flex items-center justify-between shadow-sm"
          style={{
            backgroundColor: 'var(--tw-surface)',
            borderColor: 'var(--tw-border)',
            color: 'var(--tw-text-main)'
          }}
          onClick={() => onOpenSocial('google')}
          type="button"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" fill="#4285F4"></path>
                <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z" fill="#34A853"></path>
                <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" fill="#FBBC05"></path>
                <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335"></path>
              </svg>
            </div>
            <span className="font-semibold text-xs" style={{ color: 'var(--tw-text-main)' }}>Google orqali tezkor kirish</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-md font-bold text-slate-400">1 soniya</span>
        </button>
      </div>

      {/* Value-Add Micro Perk Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-[#ff5b00]/15 to-amber-500/10 border border-[#ff5b00]/20 rounded-2xl p-3 flex items-center gap-3 shadow-md">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-[#ff5b00] flex items-center justify-center shrink-0 shadow-md">
          <span className="text-lg">🎁</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-black tracking-wider text-amber-400 bg-amber-400/20 px-1.5 py-0.2 rounded">
              Bonus
            </span>
            <p className="text-xs font-bold text-white truncate">$30 vaucher kutmoqda!</p>
          </div>
          <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
            Ro'yxatdan o'ting va ilk turpaket uchun $30 chegirmaga ega bo'ling.
          </p>
        </div>
      </div>

      {/* Bottom Toggle: Register vs Login Flow */}
      <div className="pt-1 text-center space-y-2">
        <div className="text-xs text-slate-400" id="auth-switch-footer">
          <span id="footer-switch-prompt">
            {mode === 'login' ? "Hisobingiz yo'qmi?" : "Hisobingiz bormi?"}
          </span>
          <button
            id="footer-switch-link"
            className="font-bold text-[#ff5b00] hover:text-[#e55200] underline ml-1 active:scale-95 transition"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            type="button"
          >
            {mode === 'login' ? "Ro'yxatdan o'tish" : 'Tizimga kirish'}
          </button>
        </div>
        <p className="text-[10px] leading-relaxed px-4" style={{ color: 'var(--tw-text-muted)' }}>
          Kirish orqali siz TravelWay-ning{' '}
          <button
            type="button"
            className="underline hover:opacity-80"
            onClick={() => onShowToast("Foydalanish shartlari va qoidalari hujjati yuklanmoqda", 'info')}
          >
            Foydalanish qoidalari
          </button>{' '}
          va{' '}
          <button
            type="button"
            className="underline hover:opacity-80"
            onClick={() => onShowToast("Maxfiylik va ma'lumotlar xavfsizligi siyosati yuklanmoqda", 'info')}
          >
            Maxfiylik siyosatiga
          </button>{' '}
          rozilik bildirasiz.
        </p>
      </div>
    </div>
  );
};
