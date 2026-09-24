import React, { useState } from 'react';
import { ExploreVibe } from '../types';

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

  return (
    <div className="space-y-3.5 pb-20 select-none">
      {/* TravelWay Vibes Banner */}
      <div
        className="border rounded-3xl p-4 shadow-sm"
        style={{
          backgroundColor: 'var(--tw-surface)',
          borderColor: 'var(--tw-border)'
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-bold px-2.5 py-0.5 rounded-full"
            style={{
              backgroundColor: 'var(--tw-accent-light)',
              color: 'var(--tw-accent)'
            }}
          >
            TravelWay Vibes
          </span>
          <span className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>Kayfiyatga mos yo'nalishlar</span>
        </div>
        <h2 className="text-base font-bold" style={{ color: 'var(--tw-text-main)' }}>Qayerga dam olishga boramiz?</h2>
        <p className="text-xs mt-1" style={{ color: 'var(--tw-text-sub)' }}>
          Vizasiz mamlakatlar, iliq dengizlar va eng qiziqarli shahar turlari.
        </p>
      </div>

      {/* Vibe Categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'all', label: '✨ Hammasi' },
          { id: 'beach', label: '🏖 Plyaj & Dengiz' },
          { id: 'culture', label: '🏛 Tarix & Madaniyat' },
          { id: 'mountain', label: "⛰ Tog'lar" },
          { id: 'luxury', label: '💎 Hashamat' }
        ].map((tab) => (
          <button
            key={tab.id}
            className="text-[11px] font-bold px-3 py-1.5 rounded-xl whitespace-nowrap border transition tap-bounce"
            style={{
              backgroundColor: activeVibe === tab.id ? 'var(--tw-accent)' : 'var(--tw-surface)',
              color: activeVibe === tab.id ? 'var(--tw-accent-contrast)' : 'var(--tw-text-sub)',
              borderColor: activeVibe === tab.id ? 'var(--tw-accent)' : 'var(--tw-border)'
            }}
            onClick={() => setActiveVibe(tab.id as any)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Explore Grid Cards */}
      <div className="grid grid-cols-1 gap-3" id="explore-cards-grid">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="border rounded-2xl overflow-hidden relative shadow-sm transition tap-bounce cursor-pointer"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
            onClick={() => onSelectVibeItem(item.destQuery)}
          >
            <div className="h-36 relative">
              <img src={item.img} className="w-full h-full object-cover" alt={item.title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>
              <span
                className="absolute top-2.5 left-2.5 text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase"
                style={{
                  backgroundColor: 'var(--tw-accent)',
                  color: 'var(--tw-accent-contrast)'
                }}
              >
                {item.badge}
              </span>
              <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between text-white">
                <div>
                  <h4 className="text-sm font-bold leading-tight">{item.title}</h4>
                  <p className="text-[10px] text-slate-300">{item.count}</p>
                </div>
                <div className="text-right bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-sm">
                  <span className="text-[9px] text-slate-300 block">Boshlang'ich</span>
                  <span className="text-xs font-black" style={{ color: 'var(--tw-accent)' }}>{item.priceFrom}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
