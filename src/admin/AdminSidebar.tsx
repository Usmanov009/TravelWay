import React from 'react';
import { AdminRole, AdminTab, AdminUser } from './adminTypes';

interface AdminSidebarProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  totalActiveBookings: number;
  totalAlerts: number;
  onExitToApp: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  currentRole,
  currentAdmin,
  totalActiveBookings,
  totalAlerts,
  onExitToApp
}) => {
  const isMainAdmin = currentRole === 'main_admin';

  const navItems: { id: AdminTab; label: string; icon: string; badge?: number; restricted?: boolean }[] = [
    { id: 'dashboard', label: "Boshqaruv Paneli", icon: 'dashboard' },
    { id: 'tours', label: "Turpaketlar (Katalog)", icon: 'travel_explore' },
    { id: 'combo', label: "Combo Turlar", icon: 'alt_route' },
    { id: 'flights', label: "Aviachiptalar (Charter)", icon: 'flight_takeoff' },
    { id: 'hotels', label: "Faqat Mehmonxona", icon: 'hotel' },
    { id: 'bookings', label: "Buyurtmalar & Bronlar", icon: 'receipt_long', badge: totalActiveBookings },
    { id: 'price_alerts', label: "Narx Signallari", icon: 'notifications_active', badge: totalAlerts },
    { id: 'users', label: "Mijozlar Bazasi", icon: 'group', restricted: !isMainAdmin },
    { id: 'staff', label: "Tur Adminlar Jamoasi", icon: 'badge', restricted: !isMainAdmin },
    { id: 'settings', label: "Tizim & Kompas API", icon: 'tune' }
  ];

  return (
    <aside className="w-72 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col shrink-0 select-none h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 font-black text-xl tracking-wider">
            TW
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base tracking-tight">TravelWay</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Desktop Web Admin</p>
          </div>
        </div>
      </div>

      {/* Admin Profile Box */}
      <div className="p-4 mx-3 my-3 rounded-2xl bg-slate-800/60 border border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={currentAdmin.avatar}
              alt={currentAdmin.name}
              className="w-11 h-11 rounded-xl object-cover border-2 border-slate-600"
            />
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-white truncate">{currentAdmin.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isMainAdmin ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                  <span>👑</span> Bosh Admin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-black text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full border border-indigo-400/20">
                  <span>🧳</span> Tur Admin
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Destination assignment for tour admin */}
        {!isMainAdmin && currentAdmin.assignedDestinations && (
          <div className="mt-2.5 pt-2 border-t border-slate-700/50 flex flex-wrap gap-1">
            <span className="text-[10px] text-slate-400 font-medium">Mas'ul:</span>
            {currentAdmin.assignedDestinations.map((d) => (
              <span key={d} className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded font-semibold">
                {d}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          Asosiy Bo'limlar
        </div>

        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-sm transition-all ${
                isActive
                  ? 'bg-cyan-500 text-white shadow-md shadow-cyan-500/25 font-extrabold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.restricted && (
                  <span className="material-symbols-outlined text-[16px] text-slate-400" title="Faqat Bosh Admin ruxsati">
                    lock
                  </span>
                )}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white text-cyan-600'
                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Exit to Client App */}
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button
          onClick={onExitToApp}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 text-xs font-bold transition-all border border-slate-700 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">smartphone</span>
          <span>Mobil Ilovaga Qaytish</span>
        </button>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-1">
          <span>Kompas v3.4 Engine</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync
          </span>
        </div>
      </div>
    </aside>
  );
};
