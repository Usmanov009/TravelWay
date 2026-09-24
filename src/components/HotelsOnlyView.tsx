import React, { useState, useMemo } from 'react';
import { HotelOnly } from '../types';

interface HotelsOnlyViewProps {
  hotels: HotelOnly[];
  onSelectHotel: (hotel: HotelOnly) => void;
  onQuickBookHotel: (hotel: HotelOnly) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const HotelsOnlyView: React.FC<HotelsOnlyViewProps> = ({
  hotels,
  onSelectHotel,
  onQuickBookHotel,
  onShowToast
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('Barchasi');
  const [selectedMeal, setSelectedMeal] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [nightsCount, setNightsCount] = useState<number>(7);

  const countryOptions = [
    'Barchasi',
    'Turkiya',
    'BAA',
    'Misr',
    'Tailand',
    'Maldiv'
  ];

  const mealOptions = [
    { code: 'ALL', name: 'Barcha ovqatlanish' },
    { code: 'UAI', name: 'Ultra All Inclusive' },
    { code: 'AI', name: 'All Inclusive' },
    { code: 'HB', name: 'Half Board (2 mahal)' },
    { code: 'BB', name: 'Bed & Breakfast (Nonushta)' },
    { code: 'FB', name: 'Full Board (3 mahal)' }
  ];

  const filteredHotels = useMemo(() => {
    return hotels.filter((hotel) => {
      const matchCountry = selectedCountry === 'Barchasi' || hotel.country.toLowerCase().includes(selectedCountry.toLowerCase());
      const matchMeal = selectedMeal === 'ALL' || hotel.mealType === selectedMeal;
      const matchQuery = !searchQuery.trim() ||
        hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.resort.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCountry && matchMeal && matchQuery;
    });
  }, [hotels, selectedCountry, selectedMeal, searchQuery]);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Banner */}
      <div
        className="p-4 rounded-3xl border relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.15) 0%, rgba(236, 72, 153, 0.12) 100%)',
          borderColor: 'var(--tw-border)'
        }}
      >
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-extrabold text-[10px] uppercase tracking-wider mb-1.5">
              <span>🏨 Faqat Mehmonxona</span>
              <span>•</span>
              <span>1:1 Rasmiy Narxlar</span>
            </div>
            <h3 className="text-base font-black leading-tight" style={{ color: 'var(--tw-text-main)' }}>
              Mehmonxona Bron Qilish
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--tw-text-sub)' }}>
              Aviabiletsiz, faqat mehmonxonada qolish. Luxury 5* Deluxe kurortlar, Ultra All Inclusive va xususiy plyajli mehmonxonalar.
            </p>
          </div>
          <span className="text-3xl">🌴</span>
        </div>
      </div>

      {/* Filter Controls */}
      <div
        className="p-3.5 rounded-3xl border space-y-3"
        style={{
          backgroundColor: 'var(--tw-surface)',
          borderColor: 'var(--tw-border)',
          boxShadow: 'var(--tw-card-shadow)'
        }}
      >
        {/* Country Selector */}
        <div>
          <span className="text-[10px] font-bold uppercase block mb-1.5" style={{ color: 'var(--tw-text-sub)' }}>
            Davlat / Kurort bo'yicha:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {countryOptions.map((country) => (
              <button
                key={country}
                type="button"
                onClick={() => setSelectedCountry(country)}
                className="px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition tap-bounce border"
                style={{
                  backgroundColor: selectedCountry === country ? 'var(--tw-accent)' : 'var(--tw-subtle)',
                  color: selectedCountry === country ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)',
                  borderColor: selectedCountry === country ? 'var(--tw-accent)' : 'var(--tw-border)'
                }}
              >
                {country === 'Barchasi' ? '🌍 Barcha mehmonxonalar' : `🏖️ ${country}`}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Nights count */}
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
              placeholder="Mehmonxona nomi yoki kurort..."
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
              🍽️ Ovqatlanish turi:
            </label>
            <select
              value={selectedMeal}
              onChange={(e) => setSelectedMeal(e.target.value)}
              className="w-full bg-transparent text-xs font-bold border-0 p-0 focus:ring-0 cursor-pointer"
              style={{ color: 'var(--tw-text-main)' }}
            >
              {mealOptions.map((m) => (
                <option
                  key={m.code}
                  value={m.code}
                  style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}
                >
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Nights Selector */}
        <div className="flex items-center justify-between text-xs pt-1 border-t" style={{ borderColor: 'var(--tw-border)' }}>
          <span style={{ color: 'var(--tw-text-sub)' }}>🌙 Tunlar soni:</span>
          <div className="flex items-center gap-1">
            {[3, 5, 7, 10, 14].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setNightsCount(num)}
                className="px-2 py-0.5 rounded text-[11px] font-bold tap-bounce"
                style={{
                  backgroundColor: nightsCount === num ? 'var(--tw-accent)' : 'var(--tw-subtle)',
                  color: nightsCount === num ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)'
                }}
              >
                {num} kecha
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hotel Cards List */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--tw-text-main)' }}>
            Topilgan Mehmonxonalar ({filteredHotels.length})
          </span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            Kompas Tour 1:1 Narxlar
          </span>
        </div>

        {filteredHotels.map((hotel) => {
          const dynamicTotalPrice = hotel.pricePerNight * nightsCount;

          return (
            <div
              key={hotel.id}
              className="rounded-3xl border overflow-hidden transition-all duration-200 hover:shadow-lg flex flex-col"
              style={{
                backgroundColor: 'var(--tw-surface)',
                borderColor: 'var(--tw-border)',
                boxShadow: 'var(--tw-card-shadow)'
              }}
            >
              {/* Hotel Image Banner */}
              <div
                className="relative h-44 cursor-pointer overflow-hidden group"
                onClick={() => onSelectHotel(hotel)}
              >
                <img
                  src={hotel.img}
                  alt={hotel.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="bg-indigo-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    {hotel.stars}
                  </span>
                  <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full border border-white/20">
                    1:1 Narx
                  </span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                  <span className="text-xs font-bold bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-lg text-amber-300">
                    ★ {hotel.rating} ({hotel.reviewsCount} sharh)
                  </span>
                  <span className="text-[10px] bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-lg font-bold text-emerald-400">
                    {hotel.mealType}
                  </span>
                </div>
              </div>

              {/* Hotel Body */}
              <div className="p-3.5 space-y-2.5">
                <div>
                  <h4
                    onClick={() => onSelectHotel(hotel)}
                    className="text-sm font-extrabold leading-tight cursor-pointer hover:underline"
                    style={{ color: 'var(--tw-text-main)' }}
                  >
                    {hotel.name}
                  </h4>
                  <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--tw-text-sub)' }}>
                    📍 {hotel.resort}, {hotel.country}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs pt-0.5">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    🛏 {hotel.roomType}
                  </span>
                  {hotel.distanceToBeach && (
                    <span className="text-[10px] text-sky-500 font-medium">
                      🏖️ {hotel.distanceToBeach}
                    </span>
                  )}
                </div>

                {/* Amenities pills */}
                <div className="flex flex-wrap gap-1">
                  {hotel.amenities.slice(0, 3).map((amenity, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg text-[9px] font-medium border"
                      style={{
                        backgroundColor: 'var(--tw-subtle)',
                        borderColor: 'var(--tw-border)',
                        color: 'var(--tw-text-sub)'
                      }}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Price & Actions */}
                <div className="pt-2 flex items-center justify-between gap-2 border-t" style={{ borderColor: 'var(--tw-border)' }}>
                  <div>
                    <span className="text-[9px] block" style={{ color: 'var(--tw-text-sub)' }}>
                      ${hotel.pricePerNight} / kecha • {nightsCount} kechaga jami:
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-black" style={{ color: 'var(--tw-accent)' }}>
                        ${dynamicTotalPrice}
                      </span>
                      {hotel.oldPrice && (
                        <span className="text-[10px] line-through" style={{ color: 'var(--tw-text-muted)' }}>
                          ${Math.round(hotel.oldPrice * (nightsCount / 7))}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectHotel(hotel)}
                      className="py-2 px-3 border text-xs font-bold rounded-xl tap-bounce transition"
                      style={{
                        backgroundColor: 'var(--tw-surface)',
                        borderColor: 'var(--tw-border)',
                        color: 'var(--tw-text-main)'
                      }}
                    >
                      🏨 Vaucher
                    </button>

                    <button
                      type="button"
                      onClick={() => onQuickBookHotel({ ...hotel, nightsCount, totalPrice: dynamicTotalPrice })}
                      className="py-2 px-3 text-xs font-bold rounded-xl tap-bounce shadow-xs transition"
                      style={{
                        backgroundColor: 'var(--tw-accent)',
                        color: 'var(--tw-accent-contrast)'
                      }}
                    >
                      Band qilish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
