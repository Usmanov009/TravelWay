import React from 'react';
import { AdminRole, AdminUser } from './adminTypes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Menu,
  Search,
  Plus,
  Smartphone,
  Sun,
  Moon,
  X,
  Crown,
  Luggage
} from 'lucide-react';

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
    <header className="h-[70px] bg-card/95 backdrop-blur-md border-b border-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* 1. Left: Hamburger & Search Input */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-lg">
        {onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="w-10 h-10 rounded-xl text-foreground"
            title={isSidebarCollapsed ? "Menyuni kengaytirish" : "Menyuni ixchamlashtirish"}
            type="button"
          >
            <Menu className="w-5 h-5" />
          </Button>
        )}

        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Turpaket, mijoz yoki vaucherni tezkor qidirish..."
            className="pl-10 pr-9 h-10 rounded-xl text-xs bg-muted/60 border-border"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSearchChange('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full text-muted-foreground hover:text-foreground"
              title="Qidiruvni tozalash"
              type="button"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* 2. Right: Role Badge, Quick Actions, Theme Toggle, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Role Status Badge */}
        <Badge variant="secondary" className="px-3 py-1.5 rounded-xl border border-border flex items-center gap-1.5 text-xs font-semibold">
          {isMainAdmin ? <Crown className="w-3.5 h-3.5 text-amber-500" /> : <Luggage className="w-3.5 h-3.5 text-primary" />}
          <span>{isMainAdmin ? 'Bosh Admin' : 'Tur Admin'}</span>
        </Badge>

        {/* Theme Toggle */}
        {onToggleTheme && (
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleTheme}
            className="w-9 h-9 rounded-xl cursor-pointer"
            title={adminTheme === 'light' ? "Tungi rejimga o'tish" : "Kunduzgi rejimga o'tish"}
            type="button"
          >
            {adminTheme === 'light' ? <Moon className="w-4 h-4 text-foreground" /> : <Sun className="w-4 h-4 text-amber-400" />}
          </Button>
        )}

        {/* Quick Add Button */}
        <Button
          variant="default"
          size="sm"
          onClick={onQuickAddTour}
          className="rounded-xl h-9 text-xs font-semibold gap-1.5"
          type="button"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Yangi Tur</span>
        </Button>

        {/* Exit to User App View */}
        <Button
          variant="outline"
          size="sm"
          onClick={onExitToApp}
          className="rounded-xl h-9 text-xs font-semibold gap-1.5"
          title="Foydalanuvchi ilovasi rejimiga o'tish"
          type="button"
        >
          <Smartphone className="w-4 h-4 text-primary" />
          <span className="hidden xl:inline">Ilovani Ko'rish</span>
        </Button>

        {/* User Avatar badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-border shrink-0">
          <div className="relative">
            <img
              src={currentAdmin.avatar}
              alt={currentAdmin.name}
              className="w-9 h-9 rounded-full object-cover border border-border shadow-2xs"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
          </div>
          <div className="hidden 2xl:block text-left">
            <p className="text-xs font-bold text-foreground truncate max-w-[120px]">
              {currentAdmin.name}
            </p>
            <p className="text-[10px] text-muted-foreground font-medium">
              {currentAdmin.roleTitle}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
