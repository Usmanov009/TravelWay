import React, { useState, useMemo } from 'react';
import { TourPackage } from '../types';
import { AdminRole, AdminUser } from './adminTypes';
import { PriceMarkupModal } from './PriceMarkupModal';
import { KOMPAS_COUNTRIES, KOMPAS_DEPARTURE_CITIES } from '../components/SearchScreen';
import { CountrySelectCombobox } from '../components/CountrySelectCombobox';

interface AdminToursManagerProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  tours: TourPackage[];
  onAddTour: (tour: TourPackage) => void;
  onUpdateTour: (tour: TourPackage) => void;
  onDeleteTour: (tourId: string) => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  globalSearch?: string;
  agencyCommissionRate?: number;
  onUpdateCommissionRate?: (rate: number) => void;
}

export const AdminToursManager: React.FC<AdminToursManagerProps> = ({
  currentRole,
  currentAdmin,
  tours,
  onAddTour,
  onUpdateTour,
  onDeleteTour,
  onShowToast,
  globalSearch = '',
  agencyCommissionRate = 8,
  onUpdateCommissionRate
}) => {
  const isMainAdmin = currentRole === 'main_admin';

  // Filters (matching user-facing SearchScreen)
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL'); // Tour Type / Category
  const [selectedResort, setSelectedResort] = useState('Barcha kurortlar');
  const [selectedDeparture, setSelectedDeparture] = useState('26'); // 26 = Toshkent
  const [selectedMeal, setSelectedMeal] = useState('ALL');
  const [selectedStars, setSelectedStars] = useState('ALL');
  const [nightsFilter, setNightsFilter] = useState('ALL');
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(99999);
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'KOMPAS' | 'ADMIN'>('ALL');

  // Active country object & resorts
  const currentCountryObj = useMemo(() => {
    return KOMPAS_COUNTRIES.find((c) => c.code === selectedCountry) || KOMPAS_COUNTRIES[0];
  }, [selectedCountry]);

  const availableResorts = useMemo(() => {
    return currentCountryObj.resorts;
  }, [currentCountryObj]);

  const handleCountrySelect = (code: string) => {
    setSelectedCountry(code);
    setSelectedResort('Barcha kurortlar');
  };

  // Live Sync & Markup Modal State
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [markupModalTour, setMarkupModalTour] = useState<TourPackage | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<TourPackage | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCountry, setFormCountry] = useState('Turkiya');
  const [formResort, setFormResort] = useState('Antalya');
  const [formDepartureCity, setFormDepartureCity] = useState('Toshkent (TAS)');
  const [formHotelStars, setFormHotelStars] = useState('5★ Deluxe');
  const [formMealType, setFormMealType] = useState<'UAI' | 'AI' | 'FB' | 'HB' | 'BB' | 'RO'>('UAI');
  const [formPrice, setFormPrice] = useState<number>(750);
  const [formOldPrice, setFormOldPrice] = useState<number>(950);
  const [formNightsCount, setFormNightsCount] = useState<number>(7);
  const [formAirline, setFormAirline] = useState('Uzbekistan Airways');
  const [formFlight, setFormFlight] = useState('Charter HY-3501 (Toshkent — Antalya)');
  const [formImg, setFormImg] = useState('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80');

  const openAddModal = () => {
    setEditingTour(null);
    setFormTitle('');
    setFormCountry('Turkiya');
    setFormResort('Antalya');
    setFormDepartureCity('Toshkent (TAS)');
    setFormHotelStars('5★ Deluxe');
    setFormMealType('UAI');
    setFormPrice(750);
    setFormOldPrice(950);
    setFormNightsCount(7);
    setFormAirline('Uzbekistan Airways');
    setFormFlight('Charter HY-3501 (Toshkent — Antalya)');
    setFormImg('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80');
    setIsModalOpen(true);
  };

  const openEditModal = (tour: TourPackage) => {
    setEditingTour(tour);
    setFormTitle(tour.title);
    setFormCountry(tour.country || 'Turkiya');
    setFormResort(tour.resort || 'Antalya');
    setFormDepartureCity(tour.departureCity || 'Toshkent (TAS)');
    setFormHotelStars(tour.hotelStars || '5★');
    setFormMealType(tour.mealType || 'AI');
    setFormPrice(tour.price);
    setFormOldPrice(tour.oldPrice || Math.round(tour.price * 1.2));
    setFormNightsCount(tour.nightsCount || 7);
    setFormAirline(tour.airline || 'Uzbekistan Airways');
    setFormFlight(tour.flight);
    setFormImg(tour.img);
    setIsModalOpen(true);
  };

  const handleDuplicateTour = (tour: TourPackage) => {
    const duplicated: TourPackage = {
      ...tour,
      id: `tw-tour-${Date.now()}`,
      title: `${tour.title} (Nusxa)`
    };
    onAddTour(duplicated);
    onShowToast(`"${tour.title}" turlar katalogida nusxalandi! 📋`, 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      onShowToast("Iltimos, turpaket nomini to'liq kiriting!", 'error');
      return;
    }

    if (editingTour) {
      const updated: TourPackage = {
        ...editingTour,
        title: formTitle.trim(),
        country: formCountry,
        resort: formResort,
        location: `${formCountry}, ${formResort}`,
        departureCity: formDepartureCity,
        hotelStars: formHotelStars,
        mealType: formMealType,
        price: Number(formPrice),
        oldPrice: formOldPrice ? Number(formOldPrice) : undefined,
        nightsCount: Number(formNightsCount),
        nights: `${formNightsCount} kecha`,
        airline: formAirline,
        flight: formFlight,
        img: formImg || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
        is5Star: formHotelStars.includes('5'),
        departureDate: 'Har kuni parvoz'
      };
      onUpdateTour(updated);
      onShowToast(`"${formTitle}" muvaffaqiyatli yangilandi!`, 'success');
    } else {
      const newTour: TourPackage = {
        id: `tw-tour-${Date.now()}`,
        title: formTitle.trim(),
        country: formCountry,
        resort: formResort,
        location: `${formCountry}, ${formResort}`,
        departureCity: formDepartureCity,
        hotelStars: formHotelStars,
        mealType: formMealType,
        price: Number(formPrice),
        oldPrice: formOldPrice ? Number(formOldPrice) : Math.round(formPrice * 1.2),
        nightsCount: Number(formNightsCount),
        nights: `${formNightsCount} kecha`,
        airline: formAirline,
        flight: formFlight,
        img: formImg || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=80',
        tag: 'Kafolatlangan Charter',
        rating: 4.9,
        is5Star: formHotelStars.includes('5'),
        departureDate: 'Har kuni qatnov',
        saved: false,
        category: 'All Inclusive',
        badgeType: 'luxury',
        seatsStatus: 'guaranteed'
      };
      onAddTour(newTour);
      onShowToast(`Yangi "${formTitle}" turpaketi qo'shildi!`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleLiveKompasSync = async () => {
    setIsLiveSyncing(true);
    try {
      let nights_from = '5';
      let nights_till = '14';
      if (nightsFilter && nightsFilter !== 'ALL') {
        if (nightsFilter === '5-6') {
          nights_from = '5';
          nights_till = '6';
        } else if (nightsFilter === '7-8') {
          nights_from = '7';
          nights_till = '8';
        } else if (nightsFilter === '9-11') {
          nights_from = '9';
          nights_till = '11';
        } else if (nightsFilter === '12+') {
          nights_from = '12';
          nights_till = '21';
        }
      }

      const params = new URLSearchParams();
      if (selectedCountry !== 'ALL') params.set('country', selectedCountry);
      if (selectedDeparture) params.set('departure', selectedDeparture);
      if (selectedResort && selectedResort !== 'Barcha kurortlar') params.set('resort', selectedResort);
      params.set('nights_from', nights_from);
      params.set('nights_till', nights_till);
      params.set('adult', String(adultsCount));
      params.set('child', String(childrenCount));
      if (search.trim()) params.set('q', search.trim());

      const res = await fetch(`/api/kompas/search?${params.toString()}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.tours) && data.tours.length > 0) {
        data.tours.forEach((newT: TourPackage) => {
          onUpdateTour(newT);
        });
        onShowToast(`Kompas Tour tizimidan ${data.tours.length} ta turpaket admin panelga jonli olib kirildi! 🔄`, 'success');
      } else {
        onShowToast("Kompas Tour tizimidan ma'lumot olib bo'lmadi yoki turpaketlar topilmadi", 'info');
      }
    } catch (e: any) {
      onShowToast("Kompas Tour bilan aloqa xatosi: " + (e?.message || 'Tarmoq xatosi'), 'error');
    } finally {
      setIsLiveSyncing(false);
    }
  };

  const handleSaveMarkup = (newPrice: number, markupType: 'percent' | 'manual', markupValue: number) => {
    if (!markupModalTour) return;

    const originalCost = markupModalTour.originalCostPrice || Math.round(markupModalTour.price / 1.08);
    const updatedTour: TourPackage = {
      ...markupModalTour,
      price: newPrice,
      originalCostPrice: originalCost,
      markupType,
      markupValue,
      tourOperator: markupModalTour.tourOperator || 'Kompas Tour',
      agencyName: markupModalTour.agencyName || 'SayrHub',
      operatorBadge: 'Kompas Tour Rasmiy'
    };

    onUpdateTour(updatedTour);
    onShowToast(`"${updatedTour.title}" narxi $${newPrice} qilib belgilandi! Mobil ilovada yangilandi. ✨`, 'success');
    setMarkupModalTour(null);
  };

  const handleDelete = (tourId: string, title: string) => {
    if (!isMainAdmin && !currentAdmin.canDeleteTours) {
      onShowToast("Tur paketlarni o'chirish faqat Bosh Admin huquqida!", 'error');
      return;
    }
    if (confirm(`Rostdan ham "${title}" turini katalogdan o'chirmoqchimisiz?`)) {
      onDeleteTour(tourId);
      onShowToast(`"${title}" muvaffaqiyatli o'chirildi!`, 'info');
    }
  };

  const effectiveSearch = (search || globalSearch).trim().toLowerCase();

  // Filtered tours with comprehensive filters
  const filteredTours = tours.filter((t) => {
    const matchSearch =
      !effectiveSearch ||
      t.title.toLowerCase().includes(effectiveSearch) ||
      t.location.toLowerCase().includes(effectiveSearch) ||
      (t.airline && t.airline.toLowerCase().includes(effectiveSearch)) ||
      (t.resort && t.resort.toLowerCase().includes(effectiveSearch)) ||
      (t.kompasTourCode && t.kompasTourCode.toLowerCase().includes(effectiveSearch));

    // Match country
    const matchCountry =
      selectedCountry === 'ALL' ||
      t.country === selectedCountry ||
      (currentCountryObj && (
        t.country?.toLowerCase() === currentCountryObj.name.toLowerCase() ||
        t.location?.toLowerCase().includes(currentCountryObj.name.toLowerCase())
      ));

    // Match resort
    const matchResort =
      selectedResort === 'Barcha kurortlar' ||
      !selectedResort ||
      (t.resort && t.resort.toLowerCase().includes(selectedResort.toLowerCase())) ||
      t.location.toLowerCase().includes(selectedResort.toLowerCase());

    // Match stars
    const matchStars =
      selectedStars === 'ALL' || (t.hotelStars && t.hotelStars.includes(selectedStars));

    // Match meal
    const matchMeal =
      selectedMeal === 'ALL' || t.mealType === selectedMeal;

    // Match nights
    const matchNights = nightsFilter === 'ALL' || (() => {
      const n = t.nightsCount || (parseInt(t.nights || '0', 10) || 7);
      if (nightsFilter === '5-6') return n >= 5 && n <= 6;
      if (nightsFilter === '7-8') return n >= 7 && n <= 8;
      if (nightsFilter === '9-11') return n >= 9 && n <= 11;
      if (nightsFilter === '12+') return n >= 12;
      return true;
    })();

    // Match price
    const matchPrice = t.price >= minPrice && t.price <= maxPrice;

    // Match type / category
    const matchType =
      selectedType === 'ALL' ||
      (t.badgeType && t.badgeType.toLowerCase() === selectedType.toLowerCase()) ||
      (t.category && t.category.toLowerCase().includes(selectedType.toLowerCase())) ||
      (t.tag && t.tag.toLowerCase().includes(selectedType.toLowerCase()));

    // Match source
    const matchSource =
      sourceFilter === 'ALL' ||
      (sourceFilter === 'KOMPAS' && (t.isLiveKompas || !!t.kompasTourCode)) ||
      (sourceFilter === 'ADMIN' && !t.isLiveKompas && !t.kompasTourCode);

    return matchSearch && matchCountry && matchResort && matchStars && matchMeal && matchNights && matchPrice && matchType && matchSource;
  });

  const resetFilters = () => {
    setSelectedCountry('ALL');
    setSelectedType('ALL');
    setSelectedResort('Barcha kurortlar');
    setSelectedDeparture('26');
    setSelectedMeal('ALL');
    setSelectedStars('ALL');
    setNightsFilter('ALL');
    setAdultsCount(2);
    setChildrenCount(0);
    setMinPrice(0);
    setMaxPrice(99999);
    setSourceFilter('ALL');
    setSearch('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>🏖️</span> Turpaketlar Katalogi ({tours.length})
            </h2>
            <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-[10px] px-2.5 py-1 rounded-full font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Kompas Tour Live (1:1)</span>
            </span>

            {/* Active Agency Commission Pill */}
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-200 text-[11px] px-3 py-1 rounded-full font-bold">
              <span>💼 Komissiya:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{agencyCommissionRate}%</span>
              {onUpdateCommissionRate && (
                <button
                  type="button"
                  onClick={() => {
                    const input = prompt("Yangi umumiy agentlik komissiyasi foizini kiriting (0 - 100%):", String(agencyCommissionRate));
                    if (input !== null) {
                      const val = Number(input);
                      if (!isNaN(val) && val >= 0 && val <= 100) {
                        onUpdateCommissionRate(val);
                      }
                    }
                  }}
                  className="ml-1 text-[10px] underline hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer"
                >
                  O'zgartirish ✏️
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            online.uz.kompastour.com va SayrHub tizimidagi barcha faol turpaketlar • Komissiya: {agencyCommissionRate}%
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleLiveKompasSync}
            disabled={isLiveSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
            title="Kompas Tour onlayn tizimidan eng so'nggi jonli narxlar va turlarni yuklash"
          >
            <span className={`material-symbols-outlined text-[16px] ${isLiveSyncing ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isLiveSyncing ? 'Kompasdan yuklanmoqda...' : 'Kompasdan Jonli Yuklash 🔄'}</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs transition-all tap-bounce shrink-0 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Yangi Turpaket</span>
          </button>
        </div>
      </div>

      {/* 2. Advanced User-Style Filter Form & Kompas Live Search */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-4">
        {/* Filter Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-base">🔎</span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Qidiruv va Saralash Filtrlari
            </span>
            <span className="text-[10px] bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full font-bold">
              {filteredTours.length} ta natija
            </span>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] text-slate-500 hover:text-sky-600 dark:text-slate-400 dark:hover:text-sky-400 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>🔄</span> Filtrlarni tozalash
          </button>
        </div>

        {/* 1. Davlat (Select va Type), Tur Toifasi (Type), Kurort, va Uchish shahri */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          {/* Davlat Combobox (Select ham, Type ham) */}
          <div>
            <CountrySelectCombobox
              id="admin-country-combobox"
              countries={KOMPAS_COUNTRIES}
              selectedCode={selectedCountry}
              onSelectCountry={handleCountrySelect}
              label="🌍 Borish Davlati (Select / Type):"
              placeholder="Davlatni qidirish..."
            />
          </div>

          {/* Tur Toifasi (Type) Select */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
              🏷️ Tur Toifasi (Type):
            </label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-sky-500 h-[42px]"
            >
              <option value="ALL">Barcha Turlar (Hammasi)</option>
              <option value="beach">🏖️ Plyaj (Beach)</option>
              <option value="luxury">💎 Premium / Deluxe</option>
              <option value="ultra">✨ Ultra All Inclusive</option>
              <option value="family">👨‍👩‍👦 Oilaviy (Family)</option>
              <option value="culture">🏛️ Ekskursiya / Tarixiy</option>
              <option value="cheap">🔥 Hamyonbop / Qaynoq</option>
            </select>
          </div>

          {/* Kurort / Shahar Select */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
              🏖️ Kurort / Shahar:
            </label>
            <select
              value={selectedResort}
              onChange={(e) => setSelectedResort(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-sky-500 h-[42px]"
            >
              {availableResorts.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Uchish shahri Select */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
              ✈️ Uchish shahri:
            </label>
            <select
              value={selectedDeparture}
              onChange={(e) => setSelectedDeparture(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-sky-500 h-[42px]"
            >
              <option value="26">Toshkent (TAS)</option>
              <option value="917">Samarqand (SKD)</option>
              <option value="915">Namangan (NMA)</option>
              <option value="916">Farg'ona (FEG)</option>
              <option value="913">Buxoro (BHK)</option>
              <option value="918">Urganch (UGC)</option>
            </select>
          </div>
        </div>

        {/* 3. Nights and Travelers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Nights filter */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
              🌙 Kechalar soni:
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {['ALL', '5-6', '7-8', '9-11', '12+'].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNightsFilter(n)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    nightsFilter === n
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {n === 'ALL' ? 'Barchasi' : `${n} kecha`}
                </button>
              ))}
            </div>
          </div>

          {/* Adults count */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
              👤 Kattalar soni:
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setAdultsCount(cnt)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    adultsCount === cnt
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>

          {/* Children count */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
              🧒 Bolalar soni:
            </span>
            <div className="flex items-center gap-1">
              {[0, 1, 2, 3, 4].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setChildrenCount(cnt)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    childrenCount === cnt
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cnt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Meal Type, Hotel Stars & Tour Source */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Meal Type */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
              🍽️ Ovqatlanish turi:
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {['ALL', 'UAI', 'AI', 'FB', 'HB', 'BB', 'RO'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMeal(m)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedMeal === m
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Hotel Stars */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
              ⭐ Yulduzlar:
            </span>
            <div className="flex items-center gap-1">
              {[
                { code: 'ALL', label: 'Barchasi' },
                { code: '5', label: '5★' },
                { code: '4', label: '4★' },
                { code: '3', label: '3★' }
              ].map((s) => (
                <button
                  key={s.code}
                  type="button"
                  onClick={() => setSelectedStars(s.code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedStars === s.code
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tour Source Filter */}
          <div>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1.5">
              🏷️ Tur manbasi:
            </span>
            <div className="flex items-center gap-1">
              {[
                { code: 'ALL', label: 'Barchasi' },
                { code: 'KOMPAS', label: 'Kompas Live' },
                { code: 'ADMIN', label: 'Admin' }
              ].map((src) => (
                <button
                  key={src.code}
                  type="button"
                  onClick={() => setSourceFilter(src.code as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    sourceFilter === src.code
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {src.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Search Bar, Price Range and Live Kompas Sync Button */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Search Input */}
          <div className="relative w-full lg:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mehmonxona, kurort yoki kod bo'yicha qidirish..."
              className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 pl-9 pr-7 py-2 rounded-xl text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Price Range */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 w-full lg:w-auto">
            <span className="font-semibold shrink-0">💵 Narx ($):</span>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={minPrice === 0 ? '' : minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
              className="w-18 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1.5 rounded-lg text-xs font-mono text-center border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-sky-500"
            />
            <span>—</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={maxPrice === 99999 ? '' : maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value) || 99999)}
              className="w-20 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-2 py-1.5 rounded-lg text-xs font-mono text-center border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Kompas Live Sync Button */}
          <button
            type="button"
            onClick={handleLiveKompasSync}
            disabled={isLiveSyncing}
            className="w-full lg:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer shrink-0"
            title="Tanlangan filtrlarga asosan Kompas Tour onlayn tizimidan jonli turlarni katalogga olib kirish"
          >
            <span className={`material-symbols-outlined text-[16px] ${isLiveSyncing ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>
              {isLiveSyncing
                ? 'Kompasdan yuklanmoqda...'
                : 'Kompasdan Jonli Olib Kirish 🔄'}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Tours Table */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5">Mehmonxona & Tur</th>
                <th className="py-3.5 px-3">Joylashuv</th>
                <th className="py-3.5 px-3">Toifa & Ovqat</th>
                <th className="py-3.5 px-3">Parvoz & Charter</th>
                <th className="py-3.5 px-3">Narx (USD)</th>
                <th className="py-3.5 pr-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredTours.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    Qidiruv bo'yicha hech qanday turpaket topilmadi
                  </td>
                </tr>
              ) : (
                filteredTours.map((tour) => (
                  <tr key={tour.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={tour.img}
                          alt={tour.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[220px]">
                            {tour.title}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.2 rounded border border-amber-200/70 dark:border-amber-800/50">
                              {tour.hotelStars || '5★'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {tour.kompasTourCode || `#${tour.id.slice(0, 8)}`}
                            </span>
                            {(tour.isLiveKompas || !!tour.kompasTourCode) && tour.departureDate && (
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-200/70 dark:border-emerald-800/50 flex items-center gap-1" title="Kompasdan olib kirilgan sana">
                                <span>📅</span> {tour.departureDate}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{tour.country}</p>
                      <p className="text-[11px] text-slate-400">{tour.resort || tour.location}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200/70 dark:border-sky-800/60">
                        {tour.mealType || 'AI'}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-1">{tour.nights}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{tour.airline || 'Uzbekistan Airways'}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{tour.flight}</p>
                      {(tour.isLiveKompas || !!tour.kompasTourCode) && tour.departureDate && (
                        <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5" title="Kompasdan olib kirilgan reys sanasi">
                          <span>📅 Olib kirilgan sana:</span> <strong className="font-bold">{tour.departureDate}</strong>
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-slate-400">Asl (Kompas):</span>
                          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                            ${tour.originalCostPrice || Math.round(tour.price / 1.08)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {tour.markupType === 'manual' ? "Qo'lda:" : "Ustama:"}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {tour.markupType === 'manual'
                              ? `$${tour.price}`
                              : `+${tour.markupValue || 8}%`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] font-extrabold text-sky-600 dark:text-sky-400">Mijozga:</span>
                          <span className="text-sm font-black font-mono text-sky-600 dark:text-sky-400">
                            ${tour.price}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setMarkupModalTour(tour)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 transition-colors border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 text-xs font-bold cursor-pointer"
                          title="Narxni sozlash (% ustama yoki qo'lda kiritish)"
                        >
                          <span>💵</span>
                          <span className="text-[11px]">Narx</span>
                        </button>
                        <button
                          onClick={() => handleDuplicateTour(tour)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 hover:text-sky-600 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Nusxasini yaratish (Duplicate)"
                        >
                          <span className="material-symbols-outlined text-[17px]">content_copy</span>
                        </button>
                        <button
                          onClick={() => openEditModal(tour)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 hover:text-sky-600 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Tahrirlash"
                        >
                          <span className="material-symbols-outlined text-[17px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(tour.id, tour.title)}
                          className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 transition-colors ${
                            isMainAdmin ? 'text-slate-600 dark:text-slate-300' : 'text-slate-300 cursor-not-allowed'
                          }`}
                          title={isMainAdmin ? "O'chirish" : "Faqat Bosh Admin huquqida"}
                        >
                          <span className="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. ADD / EDIT TOUR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{editingTour ? '✏️' : '✨'}</span>
                <span>{editingTour ? 'Turpaketni Tahrirlash' : "Yangi Turpaket Qo'shish"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Mehmonxona & Tur Nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Masalan: Rixos Premium Belek 5* Deluxe"
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Davlat</label>
                  <select
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  >
                    <option value="Turkiya">Turkiya</option>
                    <option value="BAA">BAA (Dubay)</option>
                    <option value="Misr">Misr</option>
                    <option value="Tailand">Tailand</option>
                    <option value="Maldiv">Maldiv</option>
                    <option value="Vyetnam">Vyetnam</option>
                    <option value="Xitoy">Xitoy</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Kurort / Shahar</label>
                  <input
                    type="text"
                    value={formResort}
                    onChange={(e) => setFormResort(e.target.value)}
                    placeholder="Masalan: Antalya, Belek, Dubay..."
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mehmonxona Toifasi</label>
                  <select
                    value={formHotelStars}
                    onChange={(e) => setFormHotelStars(e.target.value)}
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  >
                    <option value="5★ Deluxe">5★ Deluxe</option>
                    <option value="5★">5★ Standard</option>
                    <option value="4★+">4★+ Superior</option>
                    <option value="4★">4★ Standard</option>
                    <option value="3★">3★ Qulay</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Ovqatlanish Turi</label>
                  <select
                    value={formMealType}
                    onChange={(e) => setFormMealType(e.target.value as any)}
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  >
                    <option value="UAI">UAI (Ultra All Inclusive)</option>
                    <option value="AI">AI (All Inclusive)</option>
                    <option value="FB">FB (Full Board - 3 mahal)</option>
                    <option value="HB">HB (Half Board - 2 mahal)</option>
                    <option value="BB">BB (Bed & Breakfast)</option>
                    <option value="RO">RO (Room Only)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Narx ($)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none font-bold text-sky-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Eski Narx ($) (Chegirma uchun)</label>
                  <input
                    type="number"
                    min="1"
                    value={formOldPrice}
                    onChange={(e) => setFormOldPrice(Number(e.target.value))}
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Kechalar Soni</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={formNightsCount}
                    onChange={(e) => setFormNightsCount(Number(e.target.value))}
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Aviakompaniya</label>
                  <input
                    type="text"
                    value={formAirline}
                    onChange={(e) => setFormAirline(e.target.value)}
                    placeholder="Uzbekistan Airways, Turkish Airlines..."
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Reys & Parvoz Yo'nalishi</label>
                  <input
                    type="text"
                    value={formFlight}
                    onChange={(e) => setFormFlight(e.target.value)}
                    placeholder="Charter HY-3501 (Toshkent ➔ Antalya)"
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mehmonxona Rasmi (URL)</label>
                  <input
                    type="url"
                    value={formImg}
                    onChange={(e) => setFormImg(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                  {formImg && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={formImg}
                        alt="Preview"
                        className="w-16 h-12 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                        onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                      />
                      <span className="text-[11px] text-slate-400">Rasm oldindan ko'rinishi</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-2xs"
                >
                  {editingTour ? 'Yangilashni Saqlash' : "Turpaketni Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. PRICE & MARKUP MODAL (% yoki qo'lda) */}
      {markupModalTour && (
        <PriceMarkupModal
          isOpen={!!markupModalTour}
          onClose={() => setMarkupModalTour(null)}
          itemTitle={markupModalTour.title}
          itemSubtitle={`${markupModalTour.resort || ''}, ${markupModalTour.country || ''} (${markupModalTour.nights})`}
          itemImage={markupModalTour.img}
          originalCostPrice={markupModalTour.originalCostPrice || Math.round(markupModalTour.price / 1.08)}
          currentPrice={markupModalTour.price}
          currentMarkupType={markupModalTour.markupType || 'percent'}
          currentMarkupValue={markupModalTour.markupValue || agencyCommissionRate}
          tourOperator={markupModalTour.tourOperator || 'Kompas Tour'}
          agencyName={markupModalTour.agencyName || 'SayrHub'}
          agencyCommissionRate={agencyCommissionRate}
          onApplyToAllCommission={onUpdateCommissionRate}
          onSave={(newPrice, markupType, markupVal) => {
            handleSaveMarkup(newPrice, markupType, markupVal);
          }}
        />
      )}
    </div>
  );
};
