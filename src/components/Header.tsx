import React from 'react';
import { TabType, ThemeMode } from '../types';

interface HeaderProps {
  currentTab: TabType;
  onTabSelect?: (tab: TabType) => void;
  onOpenQr: () => void;
  onToggleNotifs: () => void;
  hasUnreadNotifs: boolean;
  userInitials: string;
  userName?: string;
  onAvatarClick: () => void;
  themeMode?: ThemeMode;
  onToggleTheme?: () => void;
  onOpenAdmin?: () => void;
  activeTripsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabSelect,
  onOpenQr,
  onToggleNotifs,
  hasUnreadNotifs,
  userInitials,
  userName = 'Mehmon',
  onAvatarClick,
  themeMode = 'light',
  onToggleTheme,
  onOpenAdmin,
  activeTripsCount = 0
}) => {
  const getTitles = () => {
    switch (currentTab) {
      case 'auth':
        return {
          title: 'SayrHub',
          sub: 'Arzon turlar & Charter reyslar'
        };
      case 'search':
        return {
          title: 'SayrHub',
          sub: 'Turpaketlar qidiruvi & Charter reyslar'
        };
      case 'explore':
        return {
          title: 'Kashf etish',
          sub: "Sayohat g'oyalari va yo'nalishlar"
        };
      case 'hot':
        return {
          title: 'Qaynoq Takliflar',
          sub: '50% gacha tejash • Cheklangan vaqt'
        };
      case 'trips':
        return {
          title: 'Mening Turlarim',
          sub: 'Buyurtmalar, vaucherlar va hisob'
        };
      case 'profile':
        return {
          title: 'Mening Profilim',
          sub: 'Sozlamalar va shaxsiy kabinet'
        };
      default:
        return {
          title: 'SayrHub',
          sub: 'Arzon turlar & Charter reyslar'
        };
    }
  };

  const { title, sub } = getTitles();

  return (
    <header
      className="w-full backdrop-blur-md shrink-0 border-b z-30 sticky top-0 transition-colors"
      style={{
        backgroundColor: 'var(--tw-surface)',
        borderColor: 'var(--tw-border)',
        boxShadow: 'var(--tw-card-shadow)'
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand Logo */}
        <div
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer shrink-0"
          onClick={() => onTabSelect && onTabSelect('search')}
        >
          {/* App Brand Logo Icon */}
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden shadow-sm shrink-0 bg-[#0038E2] flex items-center justify-center">
            <img
              src="/logo.png"
              alt="SayrHub"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-white font-black text-xs sm:text-sm tracking-wider absolute pointer-events-none">
              SH
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1
                className="text-base sm:text-lg font-black tracking-tight leading-none"
                id="app-nav-title"
                style={{ color: 'var(--tw-text-main)' }}
              >
                SayrHub
              </h1>
              <span
                className="text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md border"
                style={{
                  backgroundColor: 'var(--tw-accent-light)',
                  color: 'var(--tw-accent)',
                  borderColor: 'var(--tw-accent-border)'
                }}
              >
                TRAVEL
              </span>
              <span className="hidden sm:inline-flex text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                1:1 Kompas Jonli
              </span>
            </div>
            <p
              className="text-[10px] sm:text-[11px] leading-tight mt-0.5"
              id="app-nav-subtitle"
              style={{ color: 'var(--tw-text-sub)' }}
            >
              Arzon turpaketlar, charter reyslar va qaynoq takliflar
            </p>
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs (Visible on md and larger) */}
        {onTabSelect && (
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 bg-slate-100 dark:bg-slate-900/70 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => onTabSelect('search')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer tap-bounce ${
                currentTab === 'search' ? 'shadow-xs' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: currentTab === 'search' ? 'var(--tw-accent)' : 'transparent',
                color: currentTab === 'search' ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)'
              }}
              type="button"
            >
              <span>🔍</span>
              <span>Qidiruv</span>
            </button>

            <button
              onClick={() => onTabSelect('explore')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer tap-bounce ${
                currentTab === 'explore' ? 'shadow-xs' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: currentTab === 'explore' ? 'var(--tw-accent)' : 'transparent',
                color: currentTab === 'explore' ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)'
              }}
              type="button"
            >
              <span>✨</span>
              <span>Kashf etish</span>
            </button>

            <button
              onClick={() => onTabSelect('hot')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer tap-bounce relative ${
                currentTab === 'hot' ? 'shadow-xs' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: currentTab === 'hot' ? 'var(--tw-accent)' : 'transparent',
                color: currentTab === 'hot' ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)'
              }}
              type="button"
            >
              <span>🔥</span>
              <span>Qaynoq</span>
              <span className="text-[8px] bg-red-500 text-white font-extrabold px-1 rounded-full uppercase">HOT</span>
            </button>

            <button
              onClick={() => onTabSelect('trips')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer tap-bounce ${
                currentTab === 'trips' ? 'shadow-xs' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: currentTab === 'trips' ? 'var(--tw-accent)' : 'transparent',
                color: currentTab === 'trips' ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)'
              }}
              type="button"
            >
              <span>🧳</span>
              <span>Mening Turlarim</span>
              {activeTripsCount > 0 && (
                <span className="text-[10px] bg-emerald-500 text-white font-black px-1.5 rounded-full">
                  {activeTripsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabSelect('profile')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer tap-bounce ${
                currentTab === 'profile' ? 'shadow-xs' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: currentTab === 'profile' ? 'var(--tw-accent)' : 'transparent',
                color: currentTab === 'profile' ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)'
              }}
              type="button"
            >
              <span>👤</span>
              <span>Profil</span>
            </button>
          </nav>
        )}

        {/* Right Header Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Desktop Admin Portal Quick Link */}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all tap-bounce cursor-pointer"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)',
                color: 'var(--tw-accent)'
              }}
              title="Boshqaruv tizimiga o'tish (Admin Portal)"
              type="button"
            >
              <span>🛡️</span>
              <span>Admin Portal</span>
            </button>
          )}

          {/* Light / Dark Mode Toggle */}
          {onToggleTheme && (
            <button
              id="btn-header-theme-toggle"
              aria-label={themeMode === 'light' ? "Tungi rejimga o'tish" : "Kungi rejimga o'tish"}
              title={themeMode === 'light' ? "Tungi rejim (Dark Mode)" : "Kungi rejim (Light Mode)"}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center tap-bounce transition border shadow-xs cursor-pointer"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)',
                color: 'var(--tw-text-main)'
              }}
              onClick={onToggleTheme}
              type="button"
            >
              <span className="text-sm">{themeMode === 'light' ? '🌙' : '☀️'}</span>
            </button>
          )}

          {/* QR Passport Scanner */}
          <button
            id="btn-header-qr"
            aria-label="QR kod"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center tap-bounce transition border cursor-pointer"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)',
              color: 'var(--tw-text-sub)'
            }}
            onClick={onOpenQr}
            type="button"
            title="QR Identifikator"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect height="6" rx="1" width="6" x="3" y="3"></rect>
              <rect height="6" rx="1" width="6" x="15" y="3"></rect>
              <rect height="6" rx="1" width="6" x="15" y="15"></rect>
              <rect height="6" rx="1" width="6" x="3" y="15"></rect>
              <path d="M7 7h.01M19 7h.01M7 19h.01M17 19h.01"></path>
            </svg>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              id="btn-header-notifs"
              aria-label="Bildirishnomalar"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center tap-bounce transition border cursor-pointer"
              style={{
                backgroundColor: 'var(--tw-subtle)',
                borderColor: 'var(--tw-border)',
                color: 'var(--tw-text-sub)'
              }}
              onClick={onToggleNotifs}
              type="button"
              title="Bildirishnomalar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </button>
            {hasUnreadNotifs && (
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full border"
                style={{
                  backgroundColor: 'var(--tw-accent)',
                  borderColor: 'var(--tw-surface)'
                }}
                id="notif-badge"
              ></span>
            )}
          </div>

          {/* User Avatar & Name Quick Action */}
          <button
            id="btn-header-avatar"
            className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-2xl border transition-all tap-bounce cursor-pointer shadow-2xs"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)'
            }}
            onClick={onAvatarClick}
            type="button"
            title="Foydalanuvchi profili va sozlamalar"
          >
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl p-[1.5px] shadow-xs shrink-0"
              style={{ backgroundColor: 'var(--tw-accent)' }}
            >
              <div
                className="w-full h-full rounded-[10px] flex items-center justify-center text-[11px] font-black"
                style={{
                  backgroundColor: 'var(--tw-surface)',
                  color: 'var(--tw-accent)'
                }}
              >
                {userInitials}
              </div>
            </div>
            <span
              className="hidden sm:inline-block text-xs font-bold max-w-[100px] truncate"
              style={{ color: 'var(--tw-text-main)' }}
            >
              {userName}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
