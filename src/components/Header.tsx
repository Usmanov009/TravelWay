import React from 'react';
import { TabType, ThemeMode } from '../types';

interface HeaderProps {
  currentTab: TabType;
  onOpenQr: () => void;
  onToggleNotifs: () => void;
  hasUnreadNotifs: boolean;
  userInitials: string;
  onAvatarClick: () => void;
  themeMode?: ThemeMode;
  onToggleTheme?: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenQr,
  onToggleNotifs,
  hasUnreadNotifs,
  userInitials,
  onAvatarClick,
  themeMode = 'light',
  onToggleTheme,
  onOpenAdmin
}) => {
  const getTitles = () => {
    switch (currentTab) {
      case 'auth':
        return {
          title: 'TravelWay',
          sub: 'Arzon turlar & Charter reyslar'
        };
      case 'search':
        return {
          title: 'TravelWay',
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
          title: 'TravelWay',
          sub: 'Arzon turlar & Charter reyslar'
        };
    }
  };

  const { title, sub } = getTitles();

  return (
    <header
      className="px-4 py-2.5 backdrop-blur-md flex items-center justify-between shrink-0 border-b z-20 transition-colors"
      style={{
        backgroundColor: 'var(--tw-surface)',
        borderColor: 'var(--tw-border)',
        boxShadow: 'var(--tw-card-shadow)'
      }}
    >
      <div className="flex items-center gap-2.5">
        {/* App Brand Logo Icon */}
        <div
          className="w-9 h-9 rounded-2xl p-[1.5px] shadow-sm flex items-center justify-center transition-colors"
          style={{ backgroundColor: 'var(--tw-accent)' }}
        >
          <div
            className="w-full h-full rounded-[14px] flex items-center justify-center font-black text-xs tracking-wider"
            style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-accent)' }}
          >
            TW
          </div>
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1
              className="text-base font-extrabold tracking-tight leading-none"
              id="app-nav-title"
              style={{ color: 'var(--tw-text-main)' }}
            >
              {title}
            </h1>
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border"
              style={{
                backgroundColor: 'var(--tw-accent-light)',
                color: 'var(--tw-accent)',
                borderColor: 'var(--tw-accent-border)'
              }}
            >
              Travel
            </span>
          </div>
          <p
            className="text-[10px] leading-tight mt-0.5"
            id="app-nav-subtitle"
            style={{ color: 'var(--tw-text-sub)' }}
          >
            {sub}
          </p>
        </div>
      </div>

      {/* Right Header Action Tools */}
      <div className="flex items-center gap-1.5">
        {/* Admin Panel Desktop Button */}
        {onOpenAdmin && (
          <button
            id="btn-header-admin-panel"
            aria-label="Desktop Admin Panel"
            title="Desktop Admin Panel (Boshqaruv)"
            className="h-8 px-2 rounded-xl flex items-center gap-1 tap-bounce transition border text-xs font-black shadow-xs bg-slate-900 text-cyan-400 border-cyan-500/30 hover:bg-slate-800"
            onClick={onOpenAdmin}
            type="button"
          >
            <span className="text-xs">🛡️</span>
            <span className="text-[10px] font-extrabold hidden xs:inline tracking-tight">Admin</span>
          </button>
        )}

        {/* Light / Dark Mode Toggle */}
        {onToggleTheme && (
          <button
            id="btn-header-theme-toggle"
            aria-label={themeMode === 'light' ? "Tungi rejimga o'tish" : "Kungi rejimga o'tish"}
            title={themeMode === 'light' ? "Tungi rejim (Dark Mode)" : "Kungi rejim (Light Mode)"}
            className="w-8 h-8 rounded-xl flex items-center justify-center tap-bounce transition border shadow-xs"
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
          className="w-8 h-8 rounded-xl flex items-center justify-center tap-bounce transition border"
          style={{
            backgroundColor: 'var(--tw-subtle)',
            borderColor: 'var(--tw-border)',
            color: 'var(--tw-text-sub)'
          }}
          onClick={onOpenQr}
          type="button"
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
            className="w-8 h-8 rounded-xl flex items-center justify-center tap-bounce transition border"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)',
              color: 'var(--tw-text-sub)'
            }}
            onClick={onToggleNotifs}
            type="button"
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

        {/* User Avatar Quick Action */}
        <button
          id="btn-header-avatar"
          className="w-8 h-8 rounded-xl p-[1.5px] tap-bounce shadow-xs"
          style={{ backgroundColor: 'var(--tw-accent)' }}
          onClick={onAvatarClick}
          type="button"
          title="Foydalanuvchi profili"
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
        </button>
      </div>
    </header>
  );
};
