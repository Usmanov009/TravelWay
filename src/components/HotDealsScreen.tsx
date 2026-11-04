import React from 'react';
import { HotSale } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flame, MapPin, Calendar, Plane, RefreshCw, Building2, ShieldCheck } from '@/lib/flaticon-icons';

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
  return (
    <div className="space-y-4 pb-20 select-none">
      {/* Live offers header */}
      <Card className="p-5 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 border-none text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="bg-black/30 border-white/20 text-white font-bold gap-1 text-[10px] uppercase">
            <Flame className="w-3.5 h-3.5 text-violet-100" />
            Jonli takliflar
          </Badge>
        </div>
        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
          Mavjud turpaket takliflari
        </h2>
        <p className="text-xs sm:text-sm text-white/90 mt-1 max-w-lg">
          Narxlar Kompas Tour qidiruv natijalaridan olinadi.
        </p>

        {/* Live status & refresh bar */}
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-white/95">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="font-semibold">SayrHub Qaynoq Takliflari</span>
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
                
                {deal.discount && (
                  <Badge className="absolute top-3 left-3 gap-1 bg-indigo-600 font-extrabold text-[10px] text-white hover:bg-indigo-600">
                    <Flame className="w-3 h-3" />
                    {deal.discount}
                  </Badge>
                )}
                
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
                  <span className="text-xs text-muted-foreground">{deal.nights || 'Turpaket'}</span>
                  <div className="text-right">
                    {deal.oldPrice && <span className="text-xs line-through text-muted-foreground mr-1.5">{deal.oldPrice}</span>}
                    <span className="text-lg font-black text-primary">{deal.price}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-border text-muted-foreground">
                  <span className="truncate max-w-[210px] flex items-center gap-1">
                    <Plane className="w-3.5 h-3.5 text-primary" /> {deal.flight || 'Parvoz tafsilotlari mavjud emas'}
                  </span>
                  <span className="font-semibold text-primary">SayrHub</span>
                </div>

                {/* Operator & Agency Badges */}
                <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20">
                  <span className="font-semibold truncate inline-flex items-center gap-1"><Building2 className="w-3 h-3" /> SayrHub</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0 text-[10px] inline-flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> SayrHub Agentligi</span>
                </div>
              </CardContent>
            </div>

            <div className="p-4 pt-0 grid grid-cols-1 gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => onBookHotDeal(deal)}
                className="rounded-xl font-bold text-xs h-9"
              >
                Band qilish
              </Button>
            </div>
          </Card>
        ))}
        {hotDeals.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground md:col-span-2 lg:col-span-3">
            Hozircha jonli takliflar topilmadi.
          </Card>
        )}
      </div>
    </div>
  );
};
