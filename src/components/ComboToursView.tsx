import React, { useState, useMemo } from 'react';
import { ComboTour } from '../types';

interface ComboToursViewProps {
  comboTours: ComboTour[];
  onSelectComboTour: (combo: ComboTour) => void;
  onQuickBookCombo: (combo: ComboTour) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ComboToursView: React.FC<ComboToursViewProps> = ({
  comboTours,
  onSelectComboTour,
  onQuickBookCombo,
  onShowToast
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('Barchasi');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departureCity, setDepartureCity] = useState<string>('Toshkent (TAS)');

  const cityOptions = [
    'Barchasi',
    'Istanbul',
    'Kapadokya',
    'Dubay',
    'Abu-Dhabi',
    'Sharm El-Sheikh',
    'Qohira',
    'Phuket',
    'Bangkok',
    'Rim',
    'Venetsiya'
  ];

  const filteredCombos = useMemo(() => {
    return comboTours.filter((combo) => {
      const matchCity = selectedCity === 'Barchasi' || combo.cities.includes(selectedCity);
      const matchQuery = !searchQuery.trim() ||
        combo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        combo.routeSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        combo.hotels.some(h => h.hotelName.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCity && matchQuery;
    });
  }, [comboTours, selectedCity, searchQuery]);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Combo Banner */}
      <div
        className="p-4 rounded-3xl border relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(14, 165, 233, 0.12) 100%)',
          borderColor: 'var(--tw-border)'
        }}
      >
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold text-[10px] uppercase tracking-wider mb-1.5">
              <span>🔄 Multi-City</span>
              <span>•</span>
              <span>1:1 Kompas Paketlar</span>
            </div>
            <h3 className="text-base font-black leading-tight" style={{ color: 'var(--tw-text-main)' }}>
              Kombinatsiyalashgan Combo Turlar
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--tw-text-sub)' }}>
              Bitta sayohatda 2 yoki undan ortiq afsonaviy shaharlar. Ichki reyslar, VIP transferlar, 5* mehmonxonalar va qiziqarli ekskursiyalar to'liq kiritilgan.
            </p>
          </div>
          <span className="text-3xl">🎈</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="p-3.5 rounded-3xl border space-y-3"
        style={{
          backgroundColor: 'var(--tw-surface)',
          borderColor: 'var(--tw-border)',
          boxShadow: 'var(--tw-card-shadow)'
        }}
      >
        {/* City Filter Chips */}
        <div>
          <span className="text-[10px] font-bold uppercase block mb-1.5" style={{ color: 'var(--tw-text-sub)' }}>
            Shaharlar bo'yicha saralash:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {cityOptions.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className="px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition tap-bounce border"
                style={{
                  backgroundColor: selectedCity === city ? 'var(--tw-accent)' : 'var(--tw-subtle)',
                  color: selectedCity === city ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)',
                  borderColor: selectedCity === city ? 'var(--tw-accent)' : 'var(--tw-border)'
                }}
              >
                {city === 'Barchasi' ? '🌍 Barcha Combo turlar' : `📍 ${city}`}
              </button>
            ))}
          </div>
        </div>

        {/* Search input & Departure City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          <div
            className="p-2.5 rounded-2xl border flex items-center gap-2"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <span className="text-xs">🔍</span>
            <input
              type="text"
              placeholder="Shahar yoki mehmonxona qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs border-0 p-0 focus:ring-0"
              style={{ color: 'var(--tw-text-main)' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs px-1 tap-bounce"
                style={{ color: 'var(--tw-text-sub)' }}
              >
                ✕
              </button>
            )}
          </div>

          <div
            className="p-2.5 rounded-2xl border"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <label className="text-[10px] block font-semibold mb-0.5" style={{ color: 'var(--tw-text-sub)' }}>
              🛫 Jo'nash shahri:
            </label>
            <select
              value={departureCity}
              onChange={(e) => setDepartureCity(e.target.value)}
              className="w-full bg-transparent text-xs font-bold border-0 p-0 focus:ring-0 cursor-pointer"
              style={{ color: 'var(--tw-text-main)' }}
            >
              <option value="Toshkent (TAS)" style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}>
                Toshkent (TAS)
              </option>
              <option value="Samarqand (SKD)" style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}>
                Samarqand (SKD)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Combo Tour Cards List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--tw-text-main)' }}>
            Mavjud Combo Paketlar ({filteredCombos.length})
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            Kompas Tour 1:1 Narxlar
          </span>
        </div>

        {filteredCombos.map((combo) => (
          <div
            key={combo.id}
            className="rounded-3xl border overflow-hidden transition-all duration-200 hover:shadow-lg flex flex-col"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)',
              boxShadow: 'var(--tw-card-shadow)'
            }}
          >
            {/* Card Banner */}
            <div
              className="relative h-44 cursor-pointer overflow-hidden group"
              onClick={() => onSelectComboTour(combo)}
            >
              <img
                src={combo.img}
                alt={combo.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                  🔄 Combo {combo.cities.length} ta shahar
                </span>
                <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full border border-white/20">
                  1:1 Narx
                </span>
              </div>

              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                <span className="text-xs font-bold bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-lg text-amber-300">
                  ★ {combo.rating} Reyting
                </span>
                <span className="text-[10px] bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-lg font-medium">
                  🌙 {combo.nightsSplit}
                </span>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-3.5 space-y-3">
              <div>
                <h4
                  onClick={() => onSelectComboTour(combo)}
                  className="text-sm font-extrabold leading-tight cursor-pointer hover:underline"
                  style={{ color: 'var(--tw-text-main)' }}
                >
                  {combo.title}
                </h4>
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  📍 {combo.routeSummary}
                </p>
              </div>

              {/* Hotels Snapshot */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {combo.hotels.map((h, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl border truncate"
                    style={{
                      backgroundColor: 'var(--tw-subtle)',
                      borderColor: 'var(--tw-border)'
                    }}
                  >
                    <span className="text-[9px] font-bold text-amber-500 block truncate">
                      {h.city} ({h.nights}k)
                    </span>
                    <span className="text-[10px] font-bold truncate block" style={{ color: 'var(--tw-text-main)' }}>
                      {h.hotelName}
                    </span>
                    <span className="text-[8px]" style={{ color: 'var(--tw-text-sub)' }}>
                      {h.meal}
                    </span>
                  </div>
                ))}
              </div>

              {/* Inclusions pill */}
              <div
                className="p-2 rounded-xl border flex items-center justify-between text-[10px]"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)',
                  color: 'var(--tw-text-sub)'
                }}
              >
                <span>✈️ Ichki reys / VIP transfer kiritilgan</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Barchasi ichida</span>
              </div>

              {/* Price & Actions */}
              <div className="pt-1 flex items-center justify-between gap-2 border-t" style={{ borderColor: 'var(--tw-border)' }}>
                <div>
                  <span className="text-[9px] block" style={{ color: 'var(--tw-text-sub)' }}>
                    To'liq Combo paket narxi:
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black" style={{ color: 'var(--tw-accent)' }}>
                      ${combo.price}
                    </span>
                    {combo.oldPrice && (
                      <span className="text-[10px] line-through" style={{ color: 'var(--tw-text-muted)' }}>
                        ${combo.oldPrice}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectComboTour(combo)}
                    className="py-2 px-3 border text-xs font-bold rounded-xl tap-bounce transition"
                    style={{
                      backgroundColor: 'var(--tw-surface)',
                      borderColor: 'var(--tw-border)',
                      color: 'var(--tw-text-main)'
                    }}
                  >
                    📋 Dastur
                  </button>

                  <button
                    type="button"
                    onClick={() => onQuickBookCombo(combo)}
                    className="py-2 px-3 text-xs font-bold rounded-xl tap-bounce shadow-xs transition"
                    style={{
                      backgroundColor: 'var(--tw-accent)',
                      color: 'var(--tw-accent-contrast)'
                    }}
                  >
                    📌 Band qilish
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
