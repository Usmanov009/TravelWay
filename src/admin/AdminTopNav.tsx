import React from 'react';
import { AdminRole, AdminTab, AdminUser } from './adminTypes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  Plus,
  Smartphone,
  Sun,
  Moon,
  X,
  Crown,
  Luggage
} from '@/lib/flaticon-icons';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface AdminTopNavProps {
  currentRole: AdminRole;
  currentTab: AdminTab;
  currentAdmin: AdminUser;
  onSwitchRole: (role: AdminRole) => void;
  onQuickAddTour: () => void;
  onExitToApp: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  adminTheme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const AdminTopNav: React.FC<AdminTopNavProps> = ({
  currentRole,
  currentTab,
  currentAdmin,
  onQuickAddTour,
  onExitToApp,
  searchTerm,
  onSearchChange,
  adminTheme = 'light',
  onToggleTheme
}) => {
  const isMainAdmin = currentRole === 'main_admin';
  const pageTitles: Record<AdminTab, string> = {
    dashboard: 'Boshqaruv paneli',
    tours: 'Turpaketlar',
    combo: 'Combo turlar',
    flights: 'Aviachiptalar',
    hotels: 'Mehmonxonalar',
    bookings: 'Buyurtmalar',
    users: 'Mijozlar',
    staff: 'Adminlar jamoasi',
    price_alerts: 'Narx signallari',
    settings: 'Tizim sozlamalari'
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="truncate text-sm font-medium">{pageTitles[currentTab]}</h1>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="relative hidden w-[min(34vw,20rem)] md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Qidirish..."
              aria-label="Admin bo‘limlaridan qidirish"
              className="h-8 rounded-md bg-muted/50 pl-9 pr-9 text-xs"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onSearchChange('')}
                className="absolute right-1 top-1/2 size-6 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                title="Qidiruvni tozalash"
                type="button"
              >
                <X className="size-3.5" />
              </Button>
            )}
          </div>

          <Badge variant="secondary" className="hidden items-center gap-1.5 border border-border px-2 py-1 text-xs font-semibold sm:flex">
            {isMainAdmin ? <Crown className="w-3.5 h-3.5 text-amber-500" /> : <Luggage className="w-3.5 h-3.5 text-primary" />}
            <span>{isMainAdmin ? 'Bosh admin' : 'Tur admin'}</span>
          </Badge>

          {onToggleTheme && (
            <Button
              variant="outline"
              size="icon"
              onClick={onToggleTheme}
              className="size-8"
              title={adminTheme === 'light' ? "Tungi rejimga o'tish" : "Kunduzgi rejimga o'tish"}
              type="button"
            >
              {adminTheme === 'light' ? <Moon className="size-4 text-foreground" /> : <Sun className="size-4 text-amber-400" />}
            </Button>
          )}

          <Button
            variant="default"
            size="sm"
            onClick={onQuickAddTour}
            className="h-8 text-xs font-semibold"
            type="button"
          >
            <Plus className="size-4" />
            <span className="hidden lg:inline">Yangi tur</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onExitToApp}
            className="h-8 text-xs font-semibold"
            title="Foydalanuvchi ilovasi rejimiga o'tish"
            type="button"
          >
            <Smartphone className="size-4 text-primary" />
            <span className="hidden xl:inline">Ilovani ko‘rish</span>
          </Button>

          <div className="flex shrink-0 items-center gap-2 border-l border-border pl-2">
            <div className="relative">
              <img
                src={currentAdmin.avatar}
                alt={currentAdmin.name}
                className="size-8 rounded-full border border-border object-cover shadow-2xs"
              />
              <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-background bg-emerald-500" />
            </div>
            <div className="hidden text-left xl:block">
              <p className="max-w-[120px] truncate text-xs font-medium text-foreground">
                {currentAdmin.name}
              </p>
              <p className="text-[10px] font-medium text-muted-foreground">
                {currentAdmin.roleTitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
