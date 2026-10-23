import React, { useState } from 'react';
import { ExploreVibe } from '../types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Palmtree, Landmark, Mountain, Crown, ArrowRight, Compass } from 'lucide-react';

interface ExploreScreenProps {
  exploreItems: ExploreVibe[];
  onSelectVibeItem: (destQuery: string) => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  exploreItems,
  onSelectVibeItem
}) => {
  const [activeVibe, setActiveVibe] = useState<'all' | 'beach' | 'culture' | 'mountain' | 'luxury'>('all');

  const filteredItems = activeVibe === 'all'
    ? exploreItems
    : exploreItems.filter((i) => i.vibe === activeVibe);

  const vibeCategories = [
    { id: 'all', label: 'Hammasi', icon: Sparkles },
    { id: 'beach', label: 'Plyaj & Dengiz', icon: Palmtree },
    { id: 'culture', label: 'Tarix & Madaniyat', icon: Landmark },
    { id: 'mountain', label: "Tog'lar", icon: Mountain },
    { id: 'luxury', label: 'Hashamat', icon: Crown }
  ] as const;

  return (
    <div className="space-y-4 pb-20 select-none">
      {/* SayrHub Vibes Banner */}
      <Card className="p-5 border-border bg-card shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="gap-1 font-semibold text-primary">
            <Compass className="w-3.5 h-3.5" />
            SayrHub Vibes
          </Badge>
          <span className="text-xs text-muted-foreground">Kayfiyatga mos yo'nalishlar</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
          Qayerga dam olishga boramiz?
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
          Vizasiz mamlakatlar, iliq dengiz sohillari va eng qiziqarli shahar turlari sizni kutmoqda.
        </p>
      </Card>

      {/* Vibe Categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {vibeCategories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeVibe === cat.id;
          return (
            <Button
              key={cat.id}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveVibe(cat.id as any)}
              className="rounded-xl gap-1.5 text-xs font-semibold h-8 shrink-0 cursor-pointer"
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Explore Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="explore-cards-grid">
        {filteredItems.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden border-border bg-card hover:shadow-md transition-all cursor-pointer group"
            onClick={() => onSelectVibeItem(item.destQuery)}
          >
            <div className="h-44 relative overflow-hidden">
              <img
                src={item.img}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                alt={item.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
              
              <Badge variant="default" className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider">
                {item.badge}
              </Badge>

              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                <div>
                  <h4 className="text-base font-bold leading-tight drop-shadow-xs">{item.title}</h4>
                  <p className="text-xs text-white/80 mt-0.5">{item.count}</p>
                </div>
                <div className="text-right bg-black/60 px-2.5 py-1.5 rounded-xl backdrop-blur-md border border-white/10">
                  <span className="text-[10px] text-white/70 block font-medium">Boshlang'ich</span>
                  <span className="text-sm font-black text-primary">{item.priceFrom}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
