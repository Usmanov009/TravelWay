import React from 'react';
import { UserProfile, PaymentCard, LanguageCode, ThemeMode } from '../types';

interface ProfileScreenProps {
  user: UserProfile;
  cards: PaymentCard[];
  tripsCount: number;
  savedCount: number;
  currentLang: LanguageCode;
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  onOpenEditProfile: () => void;
  onEditPassport: () => void;
  onOpenAddCard: () => void;
  onSetPrimaryCard: (id: string) => void;
  onDeleteCard: (id: string) => void;
  onSelectLang: (lang: LanguageCode) => void;
  onSelectTheme: (theme: ThemeMode) => void;
  onToggleNotifications: () => void;
  onOpenSupport: () => void;
  onLogout: () => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  cards,
  tripsCount,
  savedCount,
  currentLang,
  themeMode,
  notificationsEnabled,
  onOpenEditProfile,
  onEditPassport,
  onOpenAddCard,
  onSetPrimaryCard,
  onDeleteCard,
  onSelectLang,
  onSelectTheme,
  onToggleNotifications,
  onOpenSupport,
  onLogout,
  onShowToast
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="space-y-3.5 pb-24 select-none">
      {/* 1. User Info Card */}
      <section
        className="rounded-3xl p-4 shadow-lg relative overflow-hidden border transition-colors"
        style={{
          backgroundColor: 'var(--tw-surface)',
          borderColor: 'var(--tw-border)'
        }}
      >
        <div
          className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20"
          style={{ backgroundColor: 'var(--tw-accent)' }}
        ></div>

        <div className="flex items-center gap-3.5 relative z-10">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl p-[2px] shadow-md"
              style={{
                background: 'linear-gradient(135deg, var(--tw-accent), #38BDF8)'
              }}
            >
              <div
                className="w-full h-full rounded-2xl flex items-center justify-center font-black text-2xl tracking-wider"
                id="profile-avatar-letters"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  color: 'var(--tw-accent)'
                }}
              >
                {getInitials(user.name)}
              </div>
            </div>
            <span
              className="absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase border shadow-xs"
              style={{
                backgroundColor: 'var(--tw-accent)',
                color: 'var(--tw-accent-contrast)',
                borderColor: 'var(--tw-surface)'
              }}
            >
              PRO
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <h2
                  className="text-base font-bold truncate"
                  id="profile-display-name"
                  style={{ color: 'var(--tw-text-main)' }}
                >
                  {user.name}
                </h2>
                <svg
                  className="w-4 h-4 shrink-0"
                  style={{ color: 'var(--tw-accent)' }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    clipRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </div>
              <button
                className="text-[11px] font-bold hover:underline tap-bounce px-2.5 py-1 rounded-lg border transition shadow-xs"
                style={{
                  backgroundColor: 'var(--tw-accent-light)',
                  borderColor: 'var(--tw-accent-border)',
                  color: 'var(--tw-accent)'
                }}
                onClick={onOpenEditProfile}
                type="button"
              >
                Tahrirlash
              </button>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-xs font-medium"
                id="profile-display-phone"
                style={{ color: 'var(--tw-text-sub)' }}
              >
                {user.phone}
              </span>
              <span className="font-mono text-[10px]" style={{ color: 'var(--tw-text-muted)' }}>
                ID: {user.tcId}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1 text-[11px] font-medium text-emerald-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Identifikatsiyadan o'tgan</span>
            </div>
          </div>
        </div>

        {/* 3 Quick Metric Blocks */}
        <div
          className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t text-center"
          style={{ borderColor: 'var(--tw-border)' }}
        >
          <div
            className="rounded-xl p-2.5 border"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>Buyurtmalar</p>
            <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--tw-text-main)' }}>{tripsCount} ta</p>
          </div>
          <div
            className="rounded-xl p-2.5 border"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>Saqlanganlar</p>
            <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--tw-text-main)' }}>{savedCount} ta</p>
          </div>
          <div
            className="rounded-xl p-2.5 border relative overflow-hidden cursor-pointer tap-bounce"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)'
            }}
            onClick={() => onShowToast(`Keshbek miqdori: $${user.cashback}. Keyingi bron qilish uchun amal qiladi!`, 'success')}
          >
            <div
              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: 'var(--tw-accent)' }}
            ></div>
            <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>Keshbek</p>
            <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--tw-accent)' }}>
              ${user.cashback} ball
            </p>
          </div>
        </div>
      </section>

      {/* 2. THEME MODE SELECTOR (User-Requested Light / Dark Mode) */}
      <section
        className="rounded-2xl p-3.5 space-y-3 border transition-colors"
        style={{
          backgroundColor: 'var(--tw-surface)',
          borderColor: 'var(--tw-border)',
          boxShadow: 'var(--tw-card-shadow)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🌓</span>
            <h3
              className="text-xs font-bold tracking-wide uppercase"
              style={{ color: 'var(--tw-text-main)' }}
            >
              Ilova Rejimi (Theme Mode)
            </h3>
          </div>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-md border"
            style={{
              backgroundColor: 'var(--tw-accent-light)',
              borderColor: 'var(--tw-accent-border)',
              color: 'var(--tw-accent)'
            }}
          >
            {themeMode === 'light' ? '☀️ Kungi rejim faol' : '🌙 Tungi rejim faol'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* 1. Kungi rejim (Light Mode) */}
          <button
            type="button"
            id="btn-theme-light-mode"
            onClick={() => onSelectTheme('light')}
            className={`w-full p-3 rounded-xl border text-left transition tap-bounce flex items-center justify-between ${
              themeMode === 'light' ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: themeMode === 'light' ? '#0EA5E9' : '#E2E8F0',
              color: '#334155',
              outlineColor: '#0EA5E9'
            }}
          >
            <div className="flex items-center gap-3">
              {/* Color swatches */}
              <div className="flex -space-x-1.5 shrink-0">
                <span className="w-5 h-5 rounded-full border border-slate-300 bg-[#F8FAFC]" title="Fon: #F8FAFC"></span>
                <span className="w-5 h-5 rounded-full border border-slate-200 bg-[#FFFFFF]" title="Kard: #FFFFFF"></span>
                <span className="w-5 h-5 rounded-full bg-[#334155]" title="Matn: #334155"></span>
                <span className="w-5 h-5 rounded-full bg-[#0EA5E9] shadow-xs" title="Accent: #0EA5E9"></span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#334155]">☀️ Kungi rejim (Light Mode)</span>
                  {themeMode === 'light' && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-sky-100 text-sky-700">
                      Faol
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                  Fon: <span className="font-mono text-[9px] font-bold text-slate-700">#F8FAFC</span> • Kardlar: <span className="font-mono text-[9px] font-bold text-slate-700">#FFFFFF</span> • Matn: <span className="font-mono text-[9px] font-bold text-slate-700">#334155</span> • Accent: <span className="font-mono text-[9px] font-bold text-sky-600">#0EA5E9</span>
                </p>
              </div>
            </div>
            {themeMode === 'light' ? (
              <span className="w-5 h-5 rounded-full bg-[#0EA5E9] text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-xs">
                ✓
              </span>
            ) : (
              <span className="w-5 h-5 rounded-full border border-slate-300 shrink-0"></span>
            )}
          </button>

          {/* 2. Tungi rejim (Dark Mode) */}
          <button
            type="button"
            id="btn-theme-dark-mode"
            onClick={() => onSelectTheme('dark')}
            className={`w-full p-3 rounded-xl border text-left transition tap-bounce flex items-center justify-between ${
              themeMode === 'dark' ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: '#1E293B',
              borderColor: themeMode === 'dark' ? '#38BDF8' : '#334155',
              color: '#F1F5F9',
              outlineColor: '#38BDF8'
            }}
          >
            <div className="flex items-center gap-3">
              {/* Color swatches */}
              <div className="flex -space-x-1.5 shrink-0">
                <span className="w-5 h-5 rounded-full border border-slate-700 bg-[#0F172A]" title="Fon: #0F172A"></span>
                <span className="w-5 h-5 rounded-full border border-slate-600 bg-[#1E293B]" title="Kard: #1E293B"></span>
                <span className="w-5 h-5 rounded-full bg-[#F1F5F9]" title="Matn: #F1F5F9"></span>
                <span className="w-5 h-5 rounded-full bg-[#38BDF8] shadow-xs" title="Accent: #38BDF8"></span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-[#F1F5F9]">🌙 Tungi rejim (Dark Mode)</span>
                  {themeMode === 'dark' && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800">
                      Faol
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                  Fon: <span className="font-mono text-[9px] font-bold text-slate-200">#0F172A</span> • Kardlar: <span className="font-mono text-[9px] font-bold text-slate-200">#1E293B</span> • Matn: <span className="font-mono text-[9px] font-bold text-slate-200">#F1F5F9</span> • Accent: <span className="font-mono text-[9px] font-bold text-sky-400">#38BDF8</span>
                </p>
              </div>
            </div>
            {themeMode === 'dark' ? (
              <span className="w-5 h-5 rounded-full bg-[#38BDF8] text-[#0F172A] text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                ✓
              </span>
            ) : (
              <span className="w-5 h-5 rounded-full border border-slate-600 shrink-0"></span>
            )}
          </button>
        </div>
      </section>

      {/* 3. Travel Documents */}
      <section
        className="rounded-2xl p-3.5 border transition-colors"
        style={{
          backgroundColor: 'var(--tw-surface)',
          borderColor: 'var(--tw-border)'
        }}
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: 'var(--tw-accent)' }}>🛂</span>
            <h3
              className="text-xs font-bold tracking-wide uppercase"
              style={{ color: 'var(--tw-text-main)' }}
            >
              Sayohatchi Hujjatlari
            </h3>
          </div>
          <span
            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border"
            style={{
              backgroundColor: 'var(--tw-accent-light)',
              borderColor: 'var(--tw-accent-border)',
              color: 'var(--tw-accent)'
            }}
          >
            Saqlangan
          </span>
        </div>

        <div
          className="rounded-xl p-3 border flex items-center justify-between transition-colors"
          style={{
            backgroundColor: 'var(--tw-subtle)',
            borderColor: 'var(--tw-border)'
          }}
        >
          <div className="space-y-0.5">
            <p className="text-xs font-bold" style={{ color: 'var(--tw-text-main)' }}>
              Xorijga chiqish pasporti (Zagran)
            </p>
            <p
              className="text-[11px] font-mono tracking-wider"
              id="passport-number-text"
              style={{ color: 'var(--tw-text-sub)' }}
            >
              {user.passportNumber}
            </p>
            <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>
              Amal qilish muddati: <span className="font-medium" style={{ color: 'var(--tw-text-main)' }}>{user.passportExpiry} gacha</span>
            </p>
          </div>
          <button
            className="text-xs font-semibold hover:underline tap-bounce p-1"
            style={{ color: 'var(--tw-accent)' }}
            onClick={onEditPassport}
            type="button"
          >
            Yangilash
          </button>
        </div>
      </section>

      {/* 4. Payment Cards Section */}
      <section
        className="rounded-2xl p-3.5 space-y-3 border transition-colors"
        style={{
          backgroundColor: 'var(--tw-surface)',
          borderColor: 'var(--tw-border)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: 'var(--tw-accent)' }}>💳</span>
            <h3
              className="text-xs font-bold tracking-wide uppercase"
              style={{ color: 'var(--tw-text-main)' }}
            >
              Mening To'lov Kartalarim
            </h3>
          </div>
          <span className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>
            {cards.length} ta karta ulandi
          </span>
        </div>

        <div className="space-y-2" id="payment-cards-list">
          {cards.map((card) => {
            const isHumo = card.type === 'HUMO';
            const isVisa = card.type === 'VISA';
            const badgeGradient = isHumo
              ? 'from-emerald-600 to-teal-700'
              : isVisa
              ? 'from-sky-600 to-blue-700'
              : 'from-purple-600 to-indigo-700';

            return (
              <div
                key={card.id}
                className="rounded-xl p-3 border flex items-center justify-between transition-colors"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: card.isPrimary ? 'var(--tw-accent)' : 'var(--tw-border)'
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-7 bg-gradient-to-r ${badgeGradient} rounded-md flex items-center justify-center text-[9px] font-black text-white tracking-widest shadow`}
                  >
                    {card.type}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-bold font-mono" style={{ color: 'var(--tw-text-main)' }}>
                        •••• {card.last4}
                      </p>
                      {card.isPrimary && (
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.2 rounded border"
                          style={{
                            backgroundColor: 'var(--tw-accent-light)',
                            borderColor: 'var(--tw-accent-border)',
                            color: 'var(--tw-accent)'
                          }}
                        >
                          Asosiy
                        </span>
                      )}
                    </div>
                    <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>{card.bank}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!card.isPrimary ? (
                    <button
                      className="text-[10px] px-2 py-0.5 rounded border tap-bounce transition"
                      style={{
                        backgroundColor: 'var(--tw-surface)',
                        borderColor: 'var(--tw-border)',
                        color: 'var(--tw-text-sub)'
                      }}
                      onClick={() => onSetPrimaryCard(card.id)}
                      type="button"
                    >
                      Tanlash
                    </button>
                  ) : (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-xs"
                      style={{
                        backgroundColor: 'var(--tw-accent)',
                        color: 'var(--tw-accent-contrast)'
                      }}
                    >
                      ✓
                    </div>
                  )}
                  <button
                    className="hover:text-rose-500 p-1 text-xs tap-bounce transition"
                    style={{ color: 'var(--tw-text-muted)' }}
                    onClick={() => onDeleteCard(card.id)}
                    type="button"
                    title="O'chirish"
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="w-full py-2.5 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 text-xs font-semibold tap-bounce transition"
          style={{
            borderColor: 'var(--tw-border)',
            color: 'var(--tw-accent)'
          }}
          onClick={onOpenAddCard}
          type="button"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
          <span>Yangi to'lov kartasi qo'shish</span>
        </button>
      </section>

      {/* 5. Language Selector */}
      <section
        className="rounded-2xl p-3.5 space-y-2.5 border transition-colors"
        style={{
          backgroundColor: 'var(--tw-surface)',
          borderColor: 'var(--tw-border)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: 'var(--tw-accent)' }}>🌐</span>
            <h3
              className="text-xs font-bold tracking-wide uppercase"
              style={{ color: 'var(--tw-text-main)' }}
            >
              Ilova Tili (Language)
            </h3>
          </div>
          <span className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>
            {currentLang === 'UZ' ? "O'zbek tili faol" : currentLang === 'RU' ? 'Русский язык активен' : 'English active'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {[
            { code: 'UZ' as LanguageCode, label: "O'zbek tili", flag: '🇺🇿' },
            { code: 'RU' as LanguageCode, label: 'Русский язык', flag: '🇷🇺' },
            { code: 'EN' as LanguageCode, label: 'English', flag: '🇬🇧' }
          ].map((item) => {
            const isSelected = currentLang === item.code;
            return (
              <button
                key={item.code}
                className="w-full rounded-xl px-3 py-2 flex items-center justify-between text-left tap-bounce transition border"
                style={{
                  backgroundColor: isSelected ? 'var(--tw-accent-light)' : 'var(--tw-subtle)',
                  borderColor: isSelected ? 'var(--tw-accent)' : 'var(--tw-border)',
                  color: 'var(--tw-text-main)'
                }}
                onClick={() => onSelectLang(item.code)}
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{item.flag}</span>
                  <span className="text-xs font-bold">{item.label}</span>
                </div>
                {isSelected ? (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-xs"
                    style={{
                      backgroundColor: 'var(--tw-accent)',
                      color: 'var(--tw-accent-contrast)'
                    }}
                  >
                    ✓
                  </div>
                ) : (
                  <div
                    className="w-5 h-5 rounded-full border"
                    style={{ borderColor: 'var(--tw-border)' }}
                  ></div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 6. Security & Support */}
      <section
        className="rounded-2xl p-3.5 space-y-2.5 border transition-colors"
        style={{
          backgroundColor: 'var(--tw-surface)',
          borderColor: 'var(--tw-border)'
        }}
      >
        <h3
          className="text-xs font-bold tracking-wide uppercase mb-1"
          style={{ color: 'var(--tw-text-main)' }}
        >
          Xavfsizlik va Qo'llab-quvvatlash
        </h3>

        <div className="space-y-2">
          {/* Notification Toggle */}
          <div
            className="rounded-xl p-2.5 border flex items-center justify-between transition-colors"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm" style={{ color: 'var(--tw-accent)' }}>🔔</span>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--tw-text-main)' }}>
                  Push bildirishnomalar
                </p>
                <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>
                  Turpaket va narx o'zgarishlari
                </p>
              </div>
            </div>
            <button
              className="w-10 h-5 rounded-full relative p-0.5 transition tap-bounce"
              style={{
                backgroundColor: notificationsEnabled ? 'var(--tw-accent)' : 'var(--tw-border)'
              }}
              onClick={onToggleNotifications}
              type="button"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
                  notificationsEnabled ? 'ml-auto' : 'mr-auto'
                }`}
              ></div>
            </button>
          </div>

          {/* 24/7 Support */}
          <button
            className="w-full text-left rounded-xl p-2.5 border flex items-center justify-between transition tap-bounce"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)'
            }}
            onClick={onOpenSupport}
            type="button"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-emerald-500 text-sm">💬</span>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--tw-text-main)' }}>
                  24/7 Qo'llab-quvvatlash
                </p>
                <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>
                  Onlayn maslahat xizmati
                </p>
              </div>
            </div>
            <svg
              className="w-4 h-4"
              style={{ color: 'var(--tw-text-muted)' }}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
          </button>

          {/* App Version */}
          <div
            className="rounded-xl p-2.5 border flex items-center justify-between transition-colors"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-sm" style={{ color: 'var(--tw-accent)' }}>📱</span>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--tw-text-main)' }}>
                  TravelWay Mobile App
                </p>
                <p className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>
                  iOS / Android / Flutter Edition v3.2.0
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-500 font-bold">
              {user.tcId ? `ID: ${user.tcId}` : 'Mehmon'}
            </span>
          </div>

          {/* Logout */}
          <button
            className="w-full mt-1 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/25 rounded-xl text-rose-500 text-xs font-bold flex items-center justify-center gap-2 tap-bounce transition"
            onClick={onLogout}
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            <span>Ilovadan chiqish (Akkauntni almashtirish)</span>
          </button>
        </div>
      </section>
    </div>
  );
};
