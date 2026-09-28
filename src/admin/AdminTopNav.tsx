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
    <header className="h-[70px] bg-white/95 dark:bg-[#1e1a23]/95 backdrop-blur-md border-b border-[#e5eaef] dark:border-white/10 px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* 1. Left: Hamburger & Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-xl hover:bg-[#f4f6f9] dark:hover:bg-white/5 flex items-center justify-center text-[#2a3547] dark:text-[#faf9fb] transition-colors tap-bounce shrink-0"
            title={isSidebarCollapsed ? "Menyuni kengaytirish" : "Menyuni ixchamlashtirish"}
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">
              {isSidebarCollapsed ? 'menu_open' : 'menu'}
            </span>
          </button>
        )}

        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#777e89] dark:text-[#726c7f] text-[19px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Turpaket, mijoz yoki bron vaucherini qidirish..."
            className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-[#faf9fb] placeholder-[#777e89] dark:placeholder-[#726c7f] pl-10 pr-4 py-2 rounded-xl text-xs border border-transparent focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* 2. Right: Role Switcher, Quick Actions, Theme Toggle, Profile */}
      <div className="flex items-center gap-3">
        {/* Role Switcher Pill */}
        <div className="bg-[#f4f6f9] dark:bg-white/5 p-1 rounded-xl border border-[#e5eaef] dark:border-white/10 flex items-center gap-1 shadow-xs">
          <button
            onClick={() => onSwitchRole('main_admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isMainAdmin
                ? 'bg-white dark:bg-[#0891b2] text-[#0891b2] dark:text-white shadow-xs font-black'
                : 'text-[#777e89] dark:text-[#a39db0] hover:text-[#11142d] dark:hover:text-white'
            }`}
            title="Barcha huquqlarga ega Super Admin"
            type="button"
          >
            <span>👑</span>
            <span className="hidden sm:inline">Bosh Admin</span>
          </button>

          <button
            onClick={() => onSwitchRole('tour_admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              !isMainAdmin
                ? 'bg-white dark:bg-[#0891b2] text-[#0891b2] dark:text-white shadow-xs font-black'
                : 'text-[#777e89] dark:text-[#a39db0] hover:text-[#11142d] dark:hover:text-white'
            }`}
            title="Operatsion Tur Admin (Katalog & Bronlar)"
            type="button"
          >
            <span>🧳</span>
            <span className="hidden sm:inline">Tur Admin</span>
          </button>
        </div>

        {/* Theme Toggle (Kunduzgi / Tungi rejim) */}
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-xl bg-[#f4f6f9] dark:bg-white/5 hover:bg-[#e0f7fa] dark:hover:bg-white/10 text-[#2a3547] dark:text-amber-400 border border-[#e5eaef] dark:border-white/10 flex items-center justify-center transition-all tap-bounce"
            title={adminTheme === 'light' ? "Tungi rejimga o'tish" : "Kunduzgi rejimga o'tish"}
            type="button"
          >
            <span className="text-base">{adminTheme === 'light' ? '🌙' : '☀️'}</span>
          </button>
        )}

        {/* Quick Add Button */}
        <button
          onClick={onQuickAddTour}
          className="flex items-center gap-1.5 bg-[#0891b2] hover:bg-[#0e7490] text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md shadow-[#0891b2]/20 transition-all tap-bounce"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span className="hidden md:inline">Yangi Tur</span>
        </button>

        {/* Exit to User App View */}
        <button
          onClick={onExitToApp}
          className="flex items-center gap-1.5 bg-white dark:bg-white/5 hover:bg-[#f4f6f9] text-[#2a3547] dark:text-white border border-[#e5eaef] dark:border-white/10 px-3 py-2 rounded-xl text-xs font-bold transition-all tap-bounce"
          title="Foydalanuvchi ilovasi rejimiga o'tish"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px] text-[#0891b2] dark:text-cyan-400">devices</span>
          <span className="hidden lg:inline">Ilovani Ko'rish</span>
        </button>

        {/* User Avatar badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#e5eaef] dark:border-white/10">
          <div className="relative">
            <img
              src={currentAdmin.avatar}
              alt={currentAdmin.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#0891b2]/30 shadow-xs"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1e1a23]" />
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-[#11142d] dark:text-white truncate max-w-[130px]">
              {currentAdmin.name}
            </p>
            <p className="text-[10px] text-[#777e89] dark:text-[#a39db0] font-semibold">
              {currentAdmin.roleTitle}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
