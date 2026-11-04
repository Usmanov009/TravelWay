import React from 'react';
import { AdminRole, AdminTab, AdminUser } from './adminTypes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
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
  Smartphone,
  GalleryVerticalEnd,
  Crown,
  Briefcase
} from '@/lib/flaticon-icons';

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
  const { setOpenMobile } = useSidebar();

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
    setOpenMobile(false);
  };

  return (
    <Sidebar collapsible="offcanvas" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<a href="/" />} size="lg" className="data-[slot=sidebar-menu-button]:p-1.5!">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <GalleryVerticalEnd className="size-4" aria-hidden="true" />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5 leading-none">
                  <span className="text-base font-semibold">SayrHub Admin</span>
                  <span className="text-xs text-muted-foreground">Boshqaruv tizimi</span>
                </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {visibleNavGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        isActive={currentTab === item.id}
                        tooltip={item.label}
                        onClick={() => handleItemClick(item.id)}
                      >
                        <Icon aria-hidden="true" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {typeof item.badge === 'number' && item.badge > 0 && (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-3 px-2 py-1">
          <Avatar>
            <AvatarImage src={currentAdmin.avatar} alt={currentAdmin.name} />
            <AvatarFallback>{currentAdmin.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{currentAdmin.name}</p>
            <Badge variant={isMainAdmin ? 'default' : 'secondary'} className="mt-1 text-[10px]">
              {isMainAdmin ? <><Crown aria-hidden="true" className="mr-1 size-3" /> Bosh Admin</> : <><Briefcase aria-hidden="true" className="mr-1 size-3" /> Tur Admin</>}
            </Badge>
          </div>
        </div>
        <Button variant="outline" onClick={onExitToApp} className="w-full justify-start gap-2">
          <Smartphone className="size-4 text-primary" aria-hidden="true" />
          <span>Ilovani ko'rish</span>
        </Button>
        <a
          href="https://www.flaticon.com/uicons"
          target="_blank"
          rel="noreferrer"
          className="px-2 text-xs text-muted-foreground hover:text-primary hover:underline"
        >
          Uicons by Flaticon
        </a>
      </SidebarFooter>
    </Sidebar>
  );
};
