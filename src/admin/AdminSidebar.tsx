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
  isCollapsed?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  currentRole,
  currentAdmin,
  totalActiveBookings,
  totalAlerts,
  onExitToApp,
  isCollapsed = false
}) => {
  const isMainAdmin = currentRole === 'main_admin';

  interface NavItem {
    id: AdminTab;
    label: string;
    icon: string;
    badge?: number;
    restricted?: boolean;
  }

  interface NavGroup {
    title: string;
    items: NavItem[];
  }

  const navGroups: NavGroup[] = [
    {
      title: 'Boshqaruv (Dashboard)',
      items: [
        { id: 'dashboard', label: 'Boshqaruv Paneli', icon: 'dashboard' }
      ]
    },
    {
      title: 'Xizmatlar & Katalog',
      items: [
        { id: 'tours', label: 'Turpaketlar (Katalog)', icon: 'travel_explore' },
        { id: 'combo', label: 'Combo Turlar', icon: 'alt_route' },
        { id: 'flights', label: 'Aviachiptalar (Charter)', icon: 'flight_takeoff' },
        { id: 'hotels', label: 'Faqat Mehmonxona', icon: 'hotel' }
      ]
    },
    {
      title: 'Amaliyotlar & Mijozlar',
      items: [
        { id: 'bookings', label: 'Buyurtmalar & Bronlar', icon: 'receipt_long', badge: totalActiveBookings },
        { id: 'price_alerts', label: 'Narx Signallari', icon: 'notifications_active', badge: totalAlerts },
        { id: 'users', label: 'Mijozlar Bazasi', icon: 'group', restricted: !isMainAdmin }
      ]
    },
    {
      title: 'Tizim & Jamoa',
      items: [
        { id: 'staff', label: 'Tur Adminlar Jamoasi', icon: 'badge', restricted: !isMainAdmin },
        { id: 'settings', label: 'Tizim & Kompas API', icon: 'tune' }
      ]
    }
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-72'
      } bg-white dark:bg-[#1e1a23] border-r border-[#e5eaef] dark:border-white/10 text-[#11142d] dark:text-[#faf9fb] flex flex-col shrink-0 select-none h-screen sticky top-0 transition-all duration-300 z-40`}
    >
      {/* 1. Flexy Brand Header */}
      <div className="h-[70px] px-5 border-b border-[#e5eaef] dark:border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0891b2] to-[#0284c7] flex items-center justify-center text-white shadow-md shadow-[#0891b2]/25 font-black text-xl tracking-wider shrink-0">
            TW
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[#11142d] dark:text-white text-base tracking-tight truncate">
                  TravelWay
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#e0f7fa] dark:bg-cyan-950/60 text-[#0891b2] dark:text-cyan-400 border border-[#b2ebf2] dark:border-cyan-800/40">
                  FLEXY
                </span>
              </div>
              <p className="text-[11px] text-[#777e89] dark:text-[#a39db0] font-medium truncate">
                Material UI Admin
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Navigation Items Grouped by Category */}
      <div className="flex-1 px-3 py-3 overflow-y-auto custom-scrollbar space-y-4">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!isCollapsed && (
              <div className="px-3.5 pt-1 pb-1 text-[11px] font-extrabold uppercase tracking-wider text-[#777e89] dark:text-[#726c7f]">
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-0' : 'justify-between px-3.5'
                  } py-2.5 rounded-xl font-bold text-[13px] transition-all my-0.5 tap-bounce ${
                    isActive
                      ? 'bg-[#0891b2] text-white shadow-md shadow-[#0891b2]/25 font-extrabold'
                      : 'text-[#2a3547] dark:text-[#a39db0] hover:bg-[#ecf2ff] dark:hover:bg-white/5 hover:text-[#0891b2] dark:hover:text-cyan-400'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[20px] shrink-0 transition-transform ${
                        isActive
                          ? 'text-white'
                          : 'text-[#777e89] dark:text-[#726c7f]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    {!isCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </div>

                  {!isCollapsed && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.restricted && (
                        <span
                          className="material-symbols-outlined text-[16px] text-[#9993a3]"
                          title="Faqat Bosh Admin ruxsati"
                        >
                          lock
                        </span>
                      )}
                      {typeof item.badge === 'number' && item.badge > 0 && (
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-white text-[#0891b2]'
                              : 'bg-[#e0f7fa] dark:bg-cyan-950/60 text-[#0891b2] dark:text-cyan-400 border border-[#b2ebf2] dark:border-cyan-800/40'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* 3. Bottom Flexy Profile / Status Card */}
      {!isCollapsed && (
        <div className="p-3 border-t border-[#e5eaef] dark:border-white/10 shrink-0">
          <div className="p-3 rounded-2xl bg-[#f0f9ff] dark:bg-white/5 border border-[#bae6fd] dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <img
                  src={currentAdmin.avatar}
                  alt={currentAdmin.name}
                  className="w-10 h-10 rounded-xl object-cover border-2 border-white dark:border-[#1e1a23] shadow-xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1e1a23]" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-[#11142d] dark:text-white truncate">
                  {currentAdmin.name}
                </h4>
                <div className="flex items-center gap-1 mt-0.5">
                  {isMainAdmin ? (
                    <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800/40">
                      👑 Bosh Admin
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/50 px-1.5 py-0.2 rounded border border-indigo-200 dark:border-indigo-800/40">
                      🧳 Tur Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onExitToApp}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-white dark:bg-white/10 hover:bg-[#e0f7fa] dark:hover:bg-cyan-950/40 text-[#0891b2] dark:text-cyan-400 text-[11px] font-bold transition-all border border-[#bae6fd] dark:border-white/10 shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">smartphone</span>
              <span>Mobil Ilovani Ko'rish</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
