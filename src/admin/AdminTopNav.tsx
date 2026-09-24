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
}

export const AdminTopNav: React.FC<AdminTopNavProps> = ({
  currentRole,
  currentAdmin,
  onSwitchRole,
  onQuickAddTour,
  onExitToApp,
  searchTerm,
  onSearchChange
}) => {
  const isMainAdmin = currentRole === 'main_admin';

  return (
    <header className="h-18 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tur, mehmonxona, mijoz yoki vaucher qidirish..."
            className="w-full bg-slate-800/90 text-slate-100 placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl text-sm border border-slate-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
        </div>
      </div>

      {/* Role Switcher & Actions */}
      <div className="flex items-center gap-4">
        {/* ROLE SWITCHER PILL */}
        <div className="bg-slate-800 p-1 rounded-xl border border-slate-700 flex items-center gap-1 shadow-inner">
          <button
            onClick={() => onSwitchRole('main_admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              isMainAdmin
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Barcha huquqlarga ega Super Admin"
          >
            <span>👑</span>
            <span>Bosh Admin</span>
          </button>

          <button
            onClick={() => onSwitchRole('tour_admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
              !isMainAdmin
                ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Operatsion Tur Admin (Katalog & Bronlar)"
          >
            <span>🧳</span>
            <span>Tur Admin</span>
          </button>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={onQuickAddTour}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all tap-bounce"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Yangi Tur</span>
        </button>

        {/* Exit to User App View */}
        <button
          onClick={onExitToApp}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition-all"
          title="Foydalanuvchi ilovasi rejimiga o'tish"
        >
          <span className="material-symbols-outlined text-[18px] text-cyan-400">devices</span>
          <span className="hidden md:inline">Ilovani Ko'rish</span>
        </button>

        {/* User Avatar badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <img
            src={currentAdmin.avatar}
            alt={currentAdmin.name}
            className="w-9 h-9 rounded-xl object-cover border border-slate-700"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-white truncate max-w-[120px]">{currentAdmin.name}</p>
            <p className="text-[10px] text-slate-400 font-semibold">{currentAdmin.roleTitle}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
