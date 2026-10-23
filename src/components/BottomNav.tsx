import React from 'react';
import { TabType } from '../types';
import { Badge } from '@/components/ui/badge';
import { Search, Compass, Flame, Luggage, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: TabType;
  onTabSelect: (tab: TabType) => void;
  activeTripsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabSelect,
  activeTripsCount
}) => {
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border shadow-lg transition-colors select-none">
      <nav className="px-2 pt-2 pb-1 flex items-center justify-around" data-purpose="mobile-bottom-nav">
        {/* 1. Qidiruv */}
        <button
          id="nav-tab-search"
          onClick={() => onTabSelect('search')}
          type="button"
          className={`flex flex-col items-center gap-1 transition-all py-1 px-3 rounded-xl cursor-pointer ${
            currentTab === 'search'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground font-medium'
          }`}
        >
          <div className="relative">
            <Search className="w-5 h-5" />
            {currentTab === 'search' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Qidiruv</span>
        </button>

        {/* 2. Kashf etish */}
        <button
          id="nav-tab-explore"
          onClick={() => onTabSelect('explore')}
          type="button"
          className={`flex flex-col items-center gap-1 transition-all py-1 px-3 rounded-xl cursor-pointer ${
            currentTab === 'explore'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground font-medium'
          }`}
        >
          <div className="relative">
            <Compass className="w-5 h-5" />
            {currentTab === 'explore' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Kashf</span>
        </button>

        {/* 3. Qaynoq */}
        <button
          id="nav-tab-hot"
          onClick={() => onTabSelect('hot')}
          type="button"
          className={`flex flex-col items-center gap-1 transition-all py-1 px-3 rounded-xl cursor-pointer relative ${
            currentTab === 'hot'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground font-medium'
          }`}
        >
          <Badge variant="destructive" className="absolute -top-1 font-extrabold text-[8px] px-1 py-0 h-3.5 uppercase tracking-wider">
            Hot
          </Badge>
          <div className="relative">
            <Flame className={`w-5 h-5 ${currentTab === 'hot' ? 'text-red-500' : ''}`} />
            {currentTab === 'hot' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Qaynoq</span>
        </button>

        {/* 4. Turlarim */}
        <button
          id="nav-tab-trips"
          onClick={() => onTabSelect('trips')}
          type="button"
          className={`flex flex-col items-center gap-1 transition-all py-1 px-3 rounded-xl cursor-pointer relative ${
            currentTab === 'trips'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground font-medium'
          }`}
        >
          {activeTripsCount > 0 && (
            <Badge
              id="bottom-trips-badge"
              variant="default"
              className="absolute -top-1 -right-0.5 text-[9px] font-black px-1.5 py-0 h-4 rounded-full min-w-4 text-center justify-center"
            >
              {activeTripsCount}
            </Badge>
          )}
          <div className="relative">
            <Luggage className="w-5 h-5" />
            {currentTab === 'trips' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Turlarim</span>
        </button>

        {/* 5. Profil / Auth */}
        <button
          id="nav-tab-profile"
          onClick={() => onTabSelect(currentTab === 'auth' ? 'auth' : 'profile')}
          type="button"
          className={`flex flex-col items-center gap-1 transition-all py-1 px-3 rounded-xl cursor-pointer ${
            currentTab === 'profile' || currentTab === 'auth'
              ? 'text-primary font-bold'
              : 'text-muted-foreground hover:text-foreground font-medium'
          }`}
        >
          <div className="relative">
            <User className="w-5 h-5" />
            {(currentTab === 'profile' || currentTab === 'auth') && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Profil</span>
        </button>
      </nav>

      {/* Modern Home Indicator Bar */}
      <div className="pb-1.5 pt-0.5 flex justify-center items-center">
        <div className="w-32 h-1 rounded-full bg-muted-foreground/30" />
      </div>
    </div>
  );
};
