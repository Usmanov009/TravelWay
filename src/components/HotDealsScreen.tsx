import React, { useState, useEffect } from 'react';
import { HotSale } from '../types';

interface HotDealsScreenProps {
  hotDeals: HotSale[];
  onBookHotDeal: (deal: HotSale) => void;
  onRefreshHotDeals?: () => Promise<void> | void;
  isRefreshing?: boolean;
}

export const HotDealsScreen: React.FC<HotDealsScreenProps> = ({
  hotDeals,
  onBookHotDeal,
  onRefreshHotDeals,
  isRefreshing = false
}) => {
  const [secondsLeft, setSecondsLeft] = useState(6 * 3600 + 41 * 60 + 20);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 1 ? 24 * 3600 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSec: number) => {
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="space-y-3.5 pb-20 select-none">
      {/* Flash Deals Header Banner */}
      <div className="bg-gradient-to-r from-red-600/90 via-orange-600/90 to-amber-600/90 rounded-3xl p-4 text-white relative overflow-hidden shadow-lg">
        <div className="flex items-center justify-between mb-1">
          <span className="bg-black/30 backdrop-blur-sm text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-white/20">
            🔥 Cheklangan vaqtli takliflar
          </span>
          <div className="flex items-center gap-1 font-mono text-xs bg-black/40 px-2 py-0.5 rounded-lg border border-white/20">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"></span>
            <span id="flash-timer">{formatTimer(secondsLeft)}</span>
          </div>
        </div>
        <h2 className="text-base font-extrabold tracking-tight mt-2">Qaynoq Turpaketlar — 50% gacha tejash</h2>
        <p className="text-[11px] text-orange-100 mt-1">
          Yaqin 3-5 kun ichida uchadigan chiptalar va eng arzon mehmonxonalar.
        </p>

        {/* Live status & refresh bar */}
        <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-white/90">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-semibold">online.uz.kompastour.com jonli turlari</span>
          </div>
          {onRefreshHotDeals && (
            <button
              type="button"
              onClick={onRefreshHotDeals}
              disabled={isRefreshing}
              className="px-2.5 py-1 bg-white/20 hover:bg-white/30 active:scale-95 text-white text-[10px] font-bold rounded-lg backdrop-blur-md transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <svg className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isRefreshing ? 'Yuklanmoqda...' : 'Jonli yangilash'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Hot Deals List */}
      <div className="space-y-3" id="hot-deals-container">
        {hotDeals.map((deal) => (
          <div
            key={deal.id}
            className="border rounded-2xl overflow-hidden shadow-sm transition hover:shadow-md"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <div className="relative h-36 w-full bg-slate-800">
              <img src={deal.img} alt={deal.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/60"></div>
              
              <span className="absolute top-2.5 left-2.5 bg-red-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                <span>🔥</span> {deal.discount} FLASH
              </span>
              
              <span className="absolute top-2.5 right-2.5 bg-black/75 backdrop-blur-sm text-red-300 font-mono text-[10px] px-2 py-0.5 rounded-md border border-red-500/30">
                ⏳ {deal.timeLeft}
              </span>
              
              <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                <div>
                  <h4 className="text-xs font-black text-white drop-shadow-sm">{deal.title}</h4>
                  <p className="text-[10px] text-slate-200 flex items-center gap-1 mt-0.5">
                    <span>📍</span> {deal.location}
                  </p>
                </div>
                {deal.checkinDate && (
                  <span className="text-[9px] bg-emerald-500/90 text-white font-bold px-2 py-0.5 rounded-md shadow-xs">
                    📅 {deal.checkinDate}
                  </span>
                )}
              </div>
            </div>

            <div className="p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                  <span>⚡</span> {deal.freeSeats}
                </span>
                <div className="text-right">
                  <span className="text-[10px] line-through mr-1.5" style={{ color: 'var(--tw-text-sub)' }}>{deal.oldPrice}</span>
                  <span className="text-base font-black text-red-500">{deal.price}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] pt-1 border-t" style={{ borderColor: 'var(--tw-border)', color: 'var(--tw-text-sub)' }}>
                <span className="truncate max-w-[210px]">✈️ {deal.flight}</span>
                <span className="font-bold text-sky-500">Live Kompas</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-0.5">
                {deal.kompasOnlineUrl && (
                  <a
                    href={deal.kompasOnlineUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-2 rounded-xl text-center text-[11px] font-bold border active:scale-98 transition flex items-center justify-center gap-1 shadow-xs"
                    style={{
                      backgroundColor: 'var(--tw-subtle)',
                      borderColor: 'var(--tw-border)',
                      color: 'var(--tw-text-main)'
                    }}
                  >
                    <span>🌐</span>
                    <span>Saytda ko'rish</span>
                  </a>
                )}
                <button
                  className={`${deal.kompasOnlineUrl ? '' : 'col-span-2'} py-2.5 font-bold text-xs rounded-xl tap-bounce shadow-xs transition`}
                  style={{
                    backgroundColor: 'var(--tw-accent)',
                    color: 'var(--tw-accent-contrast)'
                  }}
                  onClick={() => onBookHotDeal(deal)}
                  type="button"
                >
                  Band qilish
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
