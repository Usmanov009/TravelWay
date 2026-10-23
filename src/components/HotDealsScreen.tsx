import React, { useState, useEffect } from 'react';
import { HotSale } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, Clock, MapPin, Calendar, Plane, RefreshCw, ExternalLink, Zap } from 'lucide-react';

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
    <div className="space-y-4 pb-20 select-none">
      {/* Flash Deals Header Banner */}
      <Card className="p-5 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 border-none text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="bg-black/30 border-white/20 text-white font-bold gap-1 text-[10px] uppercase">
            <Flame className="w-3.5 h-3.5 text-yellow-300" />
            Cheklangan vaqtli takliflar
          </Badge>
          <div className="flex items-center gap-1.5 font-mono text-xs bg-black/40 px-2.5 py-1 rounded-lg border border-white/20">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            <Clock className="w-3.5 h-3.5 text-white/80" />
            <span id="flash-timer">{formatTimer(secondsLeft)}</span>
          </div>
        </div>
        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
          Qaynoq Turpaketlar — 50% gacha tejash
        </h2>
        <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-lg">
          Yaqin 3-5 kun ichida uchadigan chiptalar va eng arzon 4-5 yulduzli mehmonxonalar.
        </p>

        {/* Live status & refresh bar */}
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-white/95">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="font-semibold">Jonli rasmiy Kompas turlari</span>
          </div>
          {onRefreshHotDeals && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRefreshHotDeals}
              disabled={isRefreshing}
              className="bg-white/20 hover:bg-white/30 text-white border-none h-7 px-2.5 text-xs font-semibold gap-1.5"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Yuklanmoqda...' : 'Jonli yangilash'}</span>
            </Button>
          )}
        </div>
      </Card>

      {/* Hot Deals List */}
      <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4" id="hot-deals-container">
        {hotDeals.map((deal) => (
          <Card key={deal.id} className="overflow-hidden border-border bg-card hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="relative h-44 w-full bg-muted">
                <img src={deal.img} alt={deal.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/60" />
                
                <Badge variant="destructive" className="absolute top-3 left-3 font-extrabold text-[10px] px-2 py-0.5 gap-1">
                  <Flame className="w-3 h-3" />
                  {deal.discount} FLASH
                </Badge>
                
                <Badge variant="outline" className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-red-300 font-mono text-[10px] border-red-500/30 gap-1">
                  <Clock className="w-3 h-3" />
                  {deal.timeLeft}
                </Badge>
                
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                  <div>
                    <h4 className="text-sm font-bold drop-shadow-xs">{deal.title}</h4>
                    <p className="text-[11px] text-white/80 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-red-400" /> {deal.location}
                    </p>
                  </div>
                  {deal.checkinDate && (
                    <Badge variant="secondary" className="bg-emerald-500/90 text-white font-bold text-[10px] gap-1">
                      <Calendar className="w-3 h-3" />
                      {deal.checkinDate}
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    {deal.freeSeats}
                  </span>
                  <div className="text-right">
                    <span className="text-xs line-through text-muted-foreground mr-1.5">{deal.oldPrice}</span>
                    <span className="text-lg font-black text-destructive">{deal.price}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-border text-muted-foreground">
                  <span className="truncate max-w-[210px] flex items-center gap-1">
                    <Plane className="w-3.5 h-3.5 text-primary" /> {deal.flight}
                  </span>
                  <span className="font-semibold text-primary">Jonli Narx</span>
                </div>
              </CardContent>
            </div>

            <div className="p-4 pt-0 grid grid-cols-2 gap-2">
              {deal.kompasOnlineUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-xl font-semibold text-xs h-9"
                >
                  <a href={deal.kompasOnlineUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Saytda</span>
                  </a>
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={() => onBookHotDeal(deal)}
                className={`${deal.kompasOnlineUrl ? '' : 'col-span-2'} rounded-xl font-bold text-xs h-9`}
              >
                Band qilish
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
