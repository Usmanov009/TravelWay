import React from 'react';
import { AdminRole, AdminUser } from './adminTypes';

interface AdminTopNavProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  onSwitchRole: (role: AdminRole) => void;
  onQuickAddTour: () => void;
  onExitToApp: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
  adminTheme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const AdminTopNav: React.FC<AdminTopNavProps> = ({
  currentRole,
  currentAdmin,
  onSwitchRole,
  onQuickAddTour,
  onExitToApp,
  searchTerm,
  onSearchChange,
  onToggleSidebar,
  isSidebarCollapsed = false,
  adminTheme = 'light',
  onToggleTheme
}) => {
  const isMainAdmin = currentRole === 'main_admin';

  return (
    <header className="h-[70px] bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* 1. Left: Hamburger & Search Input */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-lg">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-colors tap-bounce shrink-0"
            title={isSidebarCollapsed ? "Menyuni kengaytirish" : "Menyuni ixchamlashtirish"}
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">
              {isSidebarCollapsed ? 'menu_open' : 'menu'}
            </span>
          </button>
        )}

        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[19px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Turpaket, mijoz yoki vaucherni tezkor qidirish..."
            className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 pl-10 pr-9 py-2 rounded-xl text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs"
              title="Qidiruvni tozalash"
              type="button"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Right: Role Switcher, Quick Actions, Theme Toggle, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Switcher Pill */}
        <div className="bg-slate-100/90 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-1 shadow-2xs">
          <button
            onClick={() => onSwitchRole('main_admin')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isMainAdmin
                ? 'bg-white dark:bg-sky-600 text-sky-700 dark:text-white shadow-2xs font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Barcha huquqlarga ega Super Admin"
            type="button"
          >
            <span>👑</span>
            <span className="hidden md:inline">Bosh Admin</span>
          </button>

          <button
            onClick={() => onSwitchRole('tour_admin')}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !isMainAdmin
                ? 'bg-white dark:bg-sky-600 text-sky-700 dark:text-white shadow-2xs font-extrabold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Operatsion Tur Admin (Katalog & Bronlar)"
            type="button"
          >
            <span>🧳</span>
            <span className="hidden md:inline">Tur Admin</span>
          </button>
        </div>

        {/* Theme Toggle (Kunduzgi / Tungi rejim) */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center transition-all tap-bounce shrink-0"
            title={adminTheme === 'light' ? "Tungi rejimga o'tish (ko'zga qulay)" : "Kunduzgi rejimga o'tish"}
            type="button"
          >
            <span className="text-base">{adminTheme === 'light' ? '🌙' : '☀️'}</span>
          </button>
        )}

        {/* Quick Add Button */}
        <button
          onClick={onQuickAddTour}
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3 sm:px-3.5 py-2 rounded-xl shadow-xs transition-all tap-bounce shrink-0"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span className="hidden sm:inline">Yangi Tur</span>
        </button>

        {/* Exit to User App View */}
        <button
          onClick={onExitToApp}
          className="flex items-center gap-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition-all tap-bounce shrink-0"
          title="Foydalanuvchi ilovasi rejimiga o'tish"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] text-sky-600 dark:text-sky-400">devices</span>
          <span className="hidden xl:inline">Ilovani Ko'rish</span>
        </button>

        {/* User Avatar badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 shrink-0">
          <div className="relative">
            <img
              src={currentAdmin.avatar}
              alt={currentAdmin.name}
              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-2xs"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
          </div>
          <div className="hidden 2xl:block text-left">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
              {currentAdmin.name}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {currentAdmin.roleTitle}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
