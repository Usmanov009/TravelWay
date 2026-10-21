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
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  currentTab,
  onSelectTab,
  currentRole,
  currentAdmin,
  totalActiveBookings,
  totalAlerts,
  onExitToApp,
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile
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
      title: 'Boshqaruv',
      items: [
        { id: 'dashboard', label: 'Boshqaruv Paneli', icon: 'dashboard' }
      ]
    },
    {
      title: 'Katalog & Xizmatlar',
      items: [
        { id: 'tours', label: 'Turpaketlar (Katalog)', icon: 'travel_explore' },
        { id: 'combo', label: 'Combo Turlar', icon: 'alt_route' },
        { id: 'flights', label: 'Aviachiptalar (Reyslar)', icon: 'flight_takeoff' },
        { id: 'hotels', label: 'Mehmonxonalar', icon: 'hotel' }
      ]
    },
    {
      title: 'Buyurtmalar & Mijozlar',
      items: [
        { id: 'bookings', label: 'Buyurtmalar & Vaucher', icon: 'receipt_long', badge: totalActiveBookings },
        { id: 'price_alerts', label: 'Narx Signallari', icon: 'notifications_active', badge: totalAlerts },
        { id: 'users', label: 'Mijozlar Bazasi', icon: 'group', restricted: !isMainAdmin }
      ]
    },
    {
      title: 'Tizim & Jamoa',
      items: [
        { id: 'staff', label: 'Adminlar Jamoasi', icon: 'badge', restricted: !isMainAdmin },
        { id: 'settings', label: 'Tizim Sozlamalari', icon: 'tune' }
      ]
    }
  ];

  const visibleNavGroups: NavGroup[] = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => isMainAdmin || !item.restricted)
    }))
    .filter((group) => group.items.length > 0);

  const handleItemClick = (id: AdminTab) => {
    onSelectTab(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 h-screen z-50 lg:z-40 flex flex-col shrink-0 select-none transition-all duration-300 bg-white dark:bg-[#111827] border-r border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-100 shadow-sm lg:shadow-none ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        {/* Brand Header */}
        <div className="h-[70px] px-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-sm font-black text-lg tracking-wider shrink-0">
              SH
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight truncate">
                    SayrHub
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60">
                    ADMIN
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  Boshqaruv Tizimi
                </p>
              </div>
            )}
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Navigation Items Grouped by Category */}
        <div className="flex-1 px-3 py-3 overflow-y-auto custom-scrollbar space-y-4">
          {visibleNavGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {(!isCollapsed || isMobileOpen) && (
                <div className="px-3.5 pt-1.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    title={isCollapsed && !isMobileOpen ? item.label : undefined}
                    className={`w-full flex items-center ${
                      isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'justify-between px-3.5'
                    } py-2.5 rounded-xl font-semibold text-[13px] transition-all my-0.5 tap-bounce ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`material-symbols-outlined text-[20px] shrink-0 transition-transform ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-400 dark:text-slate-400'
                        }`}
                      >
                        {item.icon}
                      </span>
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {(!isCollapsed || isMobileOpen) && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {typeof item.badge === 'number' && item.badge > 0 && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isActive
                                ? 'bg-white text-sky-700'
                                : 'bg-sky-100/80 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/50'
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

        {/* Bottom Profile / Status Card */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 shrink-0">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={currentAdmin.avatar}
                    alt={currentAdmin.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {currentAdmin.name}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    {isMainAdmin ? (
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.2 rounded border border-amber-200/70 dark:border-amber-800/50">
                        👑 Bosh Admin
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 px-1.5 py-0.2 rounded border border-sky-200/70 dark:border-sky-800/50">
                        🧳 Tur Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={onExitToApp}
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-white dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 text-sky-700 dark:text-sky-300 text-[11px] font-bold transition-all border border-slate-200/80 dark:border-slate-600/60 shadow-2xs"
              >
                <span className="material-symbols-outlined text-[16px]">smartphone</span>
                <span>Mobil Ilovani Ko'rish</span>
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
