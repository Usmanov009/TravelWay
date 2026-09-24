import React from 'react';
import { TabType } from '../types';

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
    <div
      className="absolute bottom-0 inset-x-0 backdrop-blur-xl border-t z-30 flex flex-col justify-between transition-colors"
      style={{
        backgroundColor: 'var(--tw-surface)',
        borderColor: 'var(--tw-border)',
        boxShadow: 'var(--tw-card-shadow)'
      }}
    >
      <nav className="px-2 pt-2 pb-0.5 flex items-center justify-around" data-purpose="mobile-bottom-nav">
        {/* 1. Qidiruv */}
        <button
          id="nav-tab-search"
          className="flex flex-col items-center gap-1 transition tap-bounce px-2 py-0.5"
          style={{
            color: currentTab === 'search' ? 'var(--tw-accent)' : 'var(--tw-text-muted)'
          }}
          onClick={() => onTabSelect('search')}
          type="button"
        >
          <div className="relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            {currentTab === 'search' && (
              <span
                className="active-dot absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'var(--tw-accent)' }}
              ></span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">Qidiruv</span>
        </button>

        {/* 2. Kashf etish */}
        <button
          id="nav-tab-explore"
          className="flex flex-col items-center gap-1 transition tap-bounce px-2 py-0.5"
          style={{
            color: currentTab === 'explore' ? 'var(--tw-accent)' : 'var(--tw-text-muted)'
          }}
          onClick={() => onTabSelect('explore')}
          type="button"
        >
          <div className="relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M16 8l-4 8-4-8z" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>
            {currentTab === 'explore' && (
              <span
                className="active-dot absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'var(--tw-accent)' }}
              ></span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight">Kashf etish</span>
        </button>

        {/* 3. Qaynoq */}
        <button
          id="nav-tab-hot"
          className="flex flex-col items-center gap-1 transition tap-bounce px-2 py-0.5 relative"
          style={{
            color: currentTab === 'hot' ? 'var(--tw-accent)' : 'var(--tw-text-muted)'
          }}
          onClick={() => onTabSelect('hot')}
          type="button"
        >
          <span
            className="absolute -top-1 font-black text-[8px] px-1 rounded-full uppercase tracking-wider text-white shadow-xs"
            style={{ backgroundColor: '#EF4444' }}
          >
            Hot
          </span>
          <div className="relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path
                d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
            {currentTab === 'hot' && (
              <span
                className="active-dot absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'var(--tw-accent)' }}
              ></span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight">Qaynoq</span>
        </button>

        {/* 4. Turlarim */}
        <button
          id="nav-tab-trips"
          className="flex flex-col items-center gap-1 transition tap-bounce px-2 py-0.5 relative"
          style={{
            color: currentTab === 'trips' ? 'var(--tw-accent)' : 'var(--tw-text-muted)'
          }}
          onClick={() => onTabSelect('trips')}
          type="button"
        >
          {activeTripsCount > 0 && (
            <span
              id="bottom-trips-badge"
              className="absolute -top-0.5 right-1.5 w-4 h-4 font-bold text-[9px] rounded-full flex items-center justify-center shadow-xs"
              style={{
                backgroundColor: 'var(--tw-accent)',
                color: 'var(--tw-accent-contrast)'
              }}
            >
              {activeTripsCount}
            </span>
          )}
          <div className="relative">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
            {currentTab === 'trips' && (
              <span
                className="active-dot absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'var(--tw-accent)' }}
              ></span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight">Turlarim</span>
        </button>

        {/* 5. Profil / Auth */}
        <button
          id="nav-tab-profile"
          className="flex flex-col items-center gap-1 transition tap-bounce px-2 py-0.5"
          style={{
            color: currentTab === 'profile' || currentTab === 'auth' ? 'var(--tw-accent)' : 'var(--tw-text-muted)'
          }}
          onClick={() => onTabSelect(currentTab === 'auth' ? 'auth' : 'profile')}
          type="button"
        >
          <div className="relative">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path clipRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" fillRule="evenodd"></path>
            </svg>
            {(currentTab === 'profile' || currentTab === 'auth') && (
              <span
                className="active-dot absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: 'var(--tw-accent)' }}
              ></span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">Profil</span>
        </button>
      </nav>

      {/* iOS Native Home Indicator Bar */}
      <div className="pb-1.5 pt-0.5 flex justify-center items-center">
        <div
          className="w-32 h-1 rounded-full opacity-40"
          style={{ backgroundColor: 'var(--tw-text-muted)' }}
        ></div>
      </div>
    </div>
  );
};
