import React from 'react';
import { AdminRole, AdminTab, AdminUser } from './adminTypes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Compass,
  Layers,
  Plane,
  Hotel,
  Receipt,
  Bell,
  Users,
  ShieldCheck,
  Sliders,
  X,
  Smartphone
} from 'lucide-react';

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
    icon: React.ElementType;
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
        { id: 'dashboard', label: 'Boshqaruv Paneli', icon: LayoutDashboard }
      ]
    },
    {
      title: 'Katalog & Xizmatlar',
      items: [
        { id: 'tours', label: 'Turpaketlar (Katalog)', icon: Compass },
        { id: 'combo', label: 'Combo Turlar', icon: Layers },
        { id: 'flights', label: 'Aviachiptalar (Reyslar)', icon: Plane },
        { id: 'hotels', label: 'Mehmonxonalar', icon: Hotel }
      ]
    },
    {
      title: 'Buyurtmalar & Mijozlar',
      items: [
        { id: 'bookings', label: 'Buyurtmalar & Vaucher', icon: Receipt, badge: totalActiveBookings },
        { id: 'price_alerts', label: 'Narx Signallari', icon: Bell, badge: totalAlerts },
        { id: 'users', label: 'Mijozlar Bazasi', icon: Users, restricted: !isMainAdmin }
      ]
    },
    {
      title: 'Tizim & Jamoa',
      items: [
        { id: 'staff', label: 'Adminlar Jamoasi', icon: ShieldCheck, restricted: !isMainAdmin },
        { id: 'settings', label: 'Tizim Sozlamalari', icon: Sliders }
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
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 h-screen z-50 lg:z-40 flex flex-col shrink-0 select-none transition-all duration-300 bg-card border-r border-border text-card-foreground shadow-sm lg:shadow-none ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}`}
      >
        {/* Brand Header */}
        <div className="h-[70px] px-5 border-b border-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary flex items-center justify-center text-primary-foreground shadow-sm shrink-0 relative">
              <img
                src="/logo.png"
                alt="SayrHub"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <span className="font-black text-lg tracking-wider absolute pointer-events-none">SH</span>
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-foreground text-base tracking-tight truncate">
                    SayrHub
                  </span>
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold text-primary px-1.5 py-0 h-4">
                    Admin
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground font-medium truncate">
                  Boshqaruv Tizimi
                </p>
              </div>
            )}
          </div>

          {/* Close button for mobile drawer */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
            type="button"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation Items Grouped by Category */}
        <div className="flex-1 px-3 py-3 overflow-y-auto custom-scrollbar space-y-4">
          {visibleNavGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {(!isCollapsed || isMobileOpen) && (
                <div className="px-3.5 pt-1.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? 'default' : 'ghost'}
                    onClick={() => handleItemClick(item.id)}
                    title={isCollapsed && !isMobileOpen ? item.label : undefined}
                    className={`w-full ${
                      isCollapsed && !isMobileOpen ? 'justify-center px-0' : 'justify-between px-3.5'
                    } h-10 rounded-xl font-semibold text-xs transition-all my-0.5 cursor-pointer`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className="w-4 h-4 shrink-0" />
                      {(!isCollapsed || isMobileOpen) && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {(!isCollapsed || isMobileOpen) && typeof item.badge === 'number' && item.badge > 0 && (
                      <Badge
                        variant={isActive ? 'secondary' : 'default'}
                        className="text-[10px] font-bold px-1.5 py-0 h-4 rounded-full"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Profile / Status Card */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-3 border-t border-border shrink-0">
            <div className="p-3 rounded-2xl bg-muted/40 border border-border">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={currentAdmin.avatar}
                    alt={currentAdmin.name}
                    className="w-10 h-10 rounded-xl object-cover border border-border"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-foreground truncate">
                    {currentAdmin.name}
                  </h4>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Badge variant={isMainAdmin ? 'default' : 'secondary'} className="text-[10px] font-semibold px-1.5 py-0 h-4">
                      {isMainAdmin ? '👑 Bosh Admin' : '🧳 Tur Admin'}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={onExitToApp}
                className="mt-2.5 w-full h-8 text-[11px] font-semibold gap-1.5 rounded-xl border-border bg-card"
              >
                <Smartphone className="w-3.5 h-3.5 text-primary" />
                <span>Mobil Ilovani Ko'rish</span>
              </Button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
