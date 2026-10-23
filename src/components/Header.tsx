import React from 'react';
import { TabType, ThemeMode } from '../types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Search,
  Compass,
  Flame,
  Luggage,
  User,
  Sun,
  Moon,
  QrCode,
  Bell,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface HeaderProps {
  currentTab: TabType;
  onTabSelect?: (tab: TabType) => void;
  onOpenQr: () => void;
  onToggleNotifs: () => void;
  hasUnreadNotifs: boolean;
  userInitials: string;
  userName?: string;
  onAvatarClick: () => void;
  themeMode?: ThemeMode;
  onToggleTheme?: () => void;
  onOpenAdmin?: () => void;
  activeTripsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabSelect,
  onOpenQr,
  onToggleNotifs,
  hasUnreadNotifs,
  userInitials,
  userName = 'Mehmon',
  onAvatarClick,
  themeMode = 'light',
  onToggleTheme,
  onOpenAdmin,
  activeTripsCount = 0
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Brand Logo */}
        <div
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none shrink-0 group"
          onClick={() => onTabSelect && onTabSelect('search')}
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-primary shadow-xs shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
            <img
              src="/logo.png"
              alt="SayrHub"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <span className="text-primary-foreground font-black text-xs sm:text-sm tracking-wider absolute pointer-events-none">
              SH
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground leading-none">
                SayrHub
              </h1>
              <Badge variant="secondary" className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0 h-4">
                Travel
              </Badge>
              <Badge variant="outline" className="hidden sm:inline-flex text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0 h-4">
                <CheckCircle2 className="w-2.5 h-2.5 mr-0.5 inline" /> 1:1 Kompas
              </Badge>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-tight mt-0.5">
              Arzon turpaketlar, charter reyslar & onlayn qidiruv
            </p>
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs (Visible on md and larger) */}
        {onTabSelect && (
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-muted/60 border border-border/80">
            <Button
              variant={currentTab === 'search' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabSelect('search')}
              className="rounded-xl gap-1.5 text-xs font-semibold h-8 px-3.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Qidiruv</span>
            </Button>

            <Button
              variant={currentTab === 'explore' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabSelect('explore')}
              className="rounded-xl gap-1.5 text-xs font-semibold h-8 px-3.5 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Kashf etish</span>
            </Button>

            <Button
              variant={currentTab === 'hot' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabSelect('hot')}
              className="rounded-xl gap-1.5 text-xs font-semibold h-8 px-3.5 cursor-pointer relative"
            >
              <Flame className="w-3.5 h-3.5 text-red-500" />
              <span>Qaynoq</span>
              <Badge variant="destructive" className="text-[8px] font-black px-1 py-0 h-3.5 uppercase ml-0.5">
                HOT
              </Badge>
            </Button>

            <Button
              variant={currentTab === 'trips' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabSelect('trips')}
              className="rounded-xl gap-1.5 text-xs font-semibold h-8 px-3.5 cursor-pointer"
            >
              <Luggage className="w-3.5 h-3.5" />
              <span>Turlarim</span>
              {activeTripsCount > 0 && (
                <Badge variant="default" className="text-[10px] font-bold px-1.5 py-0 h-4 rounded-full ml-0.5">
                  {activeTripsCount}
                </Badge>
              )}
            </Button>

            <Button
              variant={currentTab === 'profile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onTabSelect('profile')}
              className="rounded-xl gap-1.5 text-xs font-semibold h-8 px-3.5 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Profil</span>
            </Button>
          </nav>
        )}

        {/* Right Header Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Desktop Admin Portal Quick Link */}
          {onOpenAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAdmin}
              className="hidden lg:flex items-center gap-1.5 rounded-xl text-xs font-semibold h-8 px-2.5 cursor-pointer"
              title="Boshqaruv tizimiga o'tish (Admin Portal)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>Admin Portal</span>
            </Button>
          )}

          {/* Light / Dark Mode Toggle */}
          {onToggleTheme && (
            <Button
              variant="outline"
              size="icon"
              id="btn-header-theme-toggle"
              aria-label={themeMode === 'light' ? "Tungi rejimga o'tish" : "Kungi rejimga o'tish"}
              title={themeMode === 'light' ? "Tungi rejim (Dark Mode)" : "Kungi rejim (Light Mode)"}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl cursor-pointer"
              onClick={onToggleTheme}
            >
              {themeMode === 'light' ? (
                <Moon className="w-4 h-4 text-foreground" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </Button>
          )}

          {/* QR Passport Scanner */}
          <Button
            variant="outline"
            size="icon"
            id="btn-header-qr"
            aria-label="QR kod"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={onOpenQr}
            title="QR Identifikator"
          >
            <QrCode className="w-4 h-4" />
          </Button>

          {/* Notification Bell */}
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              id="btn-header-notifs"
              aria-label="Bildirishnomalar"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl cursor-pointer text-muted-foreground hover:text-foreground"
              onClick={onToggleNotifs}
              title="Bildirishnomalar"
            >
              <Bell className="w-4 h-4" />
            </Button>
            {hasUnreadNotifs && (
              <span
                id="notif-badge"
                className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary ring-2 ring-background pointer-events-none"
              />
            )}
          </div>

          {/* User Avatar & Name Quick Action */}
          <Button
            variant="outline"
            size="sm"
            id="btn-header-avatar"
            className="h-8 sm:h-9 rounded-xl pl-1 pr-2.5 gap-2 cursor-pointer shadow-2xs"
            onClick={onAvatarClick}
            title="Foydalanuvchi profili va sozlamalar"
          >
            <Avatar className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg">
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-[11px]">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline-block text-xs font-semibold max-w-[100px] truncate text-foreground">
              {userName}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
};
