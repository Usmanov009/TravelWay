import React, { useState } from 'react';
import { HotelOnly } from '../types';
import { AdminRole, AdminUser } from './adminTypes';
import { PriceMarkupModal } from './PriceMarkupModal';
import { Briefcase, DollarSign, Globe, Hotel, Pencil, RefreshCw, Star, Tag, Utensils } from '@/lib/flaticon-icons';

interface AdminHotelsManagerProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  hotels: HotelOnly[];
  onAddHotel: (hotel: HotelOnly) => Promise<void>;
  onUpdateHotel: (hotel: HotelOnly) => Promise<void>;
  onDeleteHotel: (hotelId: string) => Promise<void>;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  globalSearch?: string;
  agencyCommissionRate?: number;
  onUpdateCommissionRate?: (rate: number) => Promise<void>;
}

export const AdminHotelsManager: React.FC<AdminHotelsManagerProps> = ({
  currentRole,
  currentAdmin,
  hotels,
  onAddHotel,
  onUpdateHotel,
  onDeleteHotel,
  onShowToast,
  globalSearch = '',
  agencyCommissionRate = 0,
  onUpdateCommissionRate
}) => {
  const isMainAdmin = currentRole === 'main_admin';
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedStars, setSelectedStars] = useState('ALL');
  const [selectedMeal, setSelectedMeal] = useState('ALL');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(99999);
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'KOMPAS' | 'ADMIN'>('ALL');
  const [markupModalHotel, setMarkupModalHotel] = useState<HotelOnly | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelOnly | null>(null);

  // Form
  const [formName, setFormName] = useState('');
  const [formResort, setFormResort] = useState('');
  const [formCountry, setFormCountry] = useState('');
  const [formStars, setFormStars] = useState('');
  const [formRoomType, setFormRoomType] = useState('');
  const [formMealType, setFormMealType] = useState<'UAI' | 'AI' | 'FB' | 'HB' | 'BB' | 'RO' | ''>('');
  const [formPricePerNight, setFormPricePerNight] = useState(0);
  const [formNightsCount, setFormNightsCount] = useState(0);
  const [formImg, setFormImg] = useState('');

  const openAddModal = () => {
    setEditingHotel(null);
    setFormName('');
    setFormResort('');
    setFormCountry('');
    setFormStars('');
    setFormRoomType('');
    setFormMealType('');
    setFormPricePerNight(0);
    setFormNightsCount(0);
    setFormImg('');
    setIsModalOpen(true);
  };

  const openEditModal = (h: HotelOnly) => {
    setEditingHotel(h);
    setFormName(h.name);
    setFormResort(h.resort || '');
    setFormCountry(h.country || '');
    setFormStars(h.stars || '');
    setFormRoomType(h.roomType || '');
    setFormMealType(h.mealType || '');
    setFormPricePerNight(h.pricePerNight);
    setFormNightsCount(h.nightsCount);
    setFormImg(h.img || '');
    setIsModalOpen(true);
  };

  const handleDuplicateHotel = async (h: HotelOnly) => {
    const duplicated: HotelOnly = {
      ...h,
      id: `hot-adm-${Date.now()}`,
      name: `${h.name} (Nusxa)`
    };
    try {
      await onAddHotel(duplicated);
      onShowToast(`"${h.name}" mehmonxonasi nusxalandi!`, 'success');
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Mehmonxonani nusxalab bo‘lmadi.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      onShowToast("Mehmonxona nomini kiriting!", 'error');
      return;
    }
    if (!formResort.trim() || !formCountry.trim() || !formStars.trim() || !formRoomType.trim() ||
      !formMealType || formPricePerNight <= 0 || formNightsCount <= 0 || !formImg.trim()) {
      onShowToast("Mehmonxona ma’lumotlarining barcha majburiy maydonlarini to‘ldiring.", 'error');
      return;
    }

    const totalPrice = formPricePerNight * formNightsCount;

    try {
    if (editingHotel) {
      const updated: HotelOnly = {
        ...editingHotel,
        name: formName.trim(),
        resort: formResort.trim(),
        country: formCountry,
        stars: formStars,
        roomType: formRoomType,
        mealType: formMealType as HotelOnly['mealType'],
        mealDesc: formMealType === 'UAI' ? 'Ultra All Inclusive' : formMealType === 'AI' ? 'All Inclusive' : formMealType,
        pricePerNight: formPricePerNight,
        nightsCount: formNightsCount,
        totalPrice,
        img: formImg
      };
      await onUpdateHotel(updated);
      onShowToast(`"${formName}" mehmonxonasi yangilandi!`, 'success');
    } else {
      const newHotel: HotelOnly = {
        id: `hot-adm-${Date.now()}`,
        name: formName.trim(),
        resort: formResort.trim(),
        country: formCountry,
        stars: formStars,
        rating: 0,
        reviewsCount: 0,
        roomType: formRoomType,
        mealType: formMealType as HotelOnly['mealType'],
        mealDesc: formMealType === 'UAI' ? 'Ultra All Inclusive' : formMealType === 'AI' ? 'All Inclusive' : formMealType,
        pricePerNight: formPricePerNight,
        nightsCount: formNightsCount,
        totalPrice,
        amenities: [],
        distanceToBeach: '',
        img: formImg,
        kompasHotelCode: ''
      };
      await onAddHotel(newHotel);
      onShowToast(`Yangi "${formName}" mehmonxonasi qo'shildi!`, 'success');
    }

    setIsModalOpen(false);
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Mehmonxonani saqlab bo‘lmadi.', 'error');
    }
  };

  const handleSaveMarkup = async (newTotalPrice: number, markupType: 'percent' | 'manual', markupValue: number): Promise<boolean> => {
    if (!markupModalHotel) return false;
    const nights = markupModalHotel.nightsCount;
    if (nights <= 0) {
      onShowToast('Mehmonxonada kechalar soni ko‘rsatilmagan.', 'error');
      return false;
    }
    const perNight = Math.round(newTotalPrice / nights);
    const originalCost = markupModalHotel.originalCostPrice ?? (markupModalHotel.totalPrice ?? markupModalHotel.pricePerNight * nights);

    const updated: HotelOnly = {
      ...markupModalHotel,
      totalPrice: newTotalPrice,
      pricePerNight: perNight,
      originalCostPrice: originalCost,
      markupType,
      markupValue,
      tourOperator: markupModalHotel.tourOperator,
      agencyName: markupModalHotel.agencyName
    };

    try {
    await onUpdateHotel(updated);
    onShowToast(`"${updated.name}" narxi $${newTotalPrice} ($${perNight}/kecha) qilib belgilandi!`, 'success');
    setMarkupModalHotel(null);
    return true;
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Mehmonxona narxini saqlab bo‘lmadi.', 'error');
      return false;
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!isMainAdmin && !currentAdmin.canDeleteTours) {
      onShowToast("Mehmonxonalarni o'chirish faqat Bosh Admin huquqida!", 'error');
      return;
    }
    if (confirm(`"${name}" mehmonxonasini ro'yxatdan o'chirmoqchimisiz?`)) {
      try {
        await onDeleteHotel(id);
        onShowToast(`"${name}" o'chirildi!`, 'info');
      } catch (error) {
        onShowToast(error instanceof Error ? error.message : 'Mehmonxonani o‘chirib bo‘lmadi.', 'error');
      }
    }
  };

  const effectiveSearch = (search || globalSearch).trim().toLowerCase();

  const filtered = hotels.filter((h) => {
    const matchSearch =
      !effectiveSearch ||
      h.name.toLowerCase().includes(effectiveSearch) ||
      h.resort.toLowerCase().includes(effectiveSearch) ||
      h.country.toLowerCase().includes(effectiveSearch) ||
      (h.kompasHotelCode && h.kompasHotelCode.toLowerCase().includes(effectiveSearch));

    const matchCountry = selectedCountry === 'ALL' || h.country === selectedCountry;
    const matchStars = selectedStars === 'ALL' || (h.stars && h.stars.includes(selectedStars));
    const matchMeal = selectedMeal === 'ALL' || h.mealType === selectedMeal;
    const matchPrice = h.totalPrice >= minPrice && h.totalPrice <= maxPrice;
    const matchSource =
      sourceFilter === 'ALL' ||
      (sourceFilter === 'KOMPAS' && !!h.kompasHotelCode) ||
      (sourceFilter === 'ADMIN' && !h.kompasHotelCode);

    return matchSearch && matchCountry && matchStars && matchMeal && matchPrice && matchSource;
  });

  const resetFilters = () => {
    setSelectedCountry('ALL');
    setSelectedStars('ALL');
    setSelectedMeal('ALL');
    setMinPrice(0);
    setMaxPrice(99999);
    setSourceFilter('ALL');
    setSearch('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Hotel aria-hidden="true" className="h-4 w-4" /> Mehmonxonalar Boshqaruvi ({hotels.length})
            </h2>
            <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-[10px] px-2.5 py-1 rounded-full font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Kompas Live</span>
            </span>

            {/* Active Commission Badge */}
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-200 text-[11px] px-3 py-1 rounded-full font-bold">
              <Briefcase aria-hidden="true" className="h-3 w-3" /> Komissiya:
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{agencyCommissionRate}%</span>
              {onUpdateCommissionRate && (
                <button
                  type="button"
                  onClick={() => {
                    const input = prompt("Yangi umumiy agentlik komissiyasi foizini kiriting (0 - 100%):", String(agencyCommissionRate));
                    if (input !== null) {
                      const val = Number(input);
                      if (!isNaN(val) && val >= 0 && val <= 100) {
                        void onUpdateCommissionRate(val).catch((error) =>
                          onShowToast(error instanceof Error ? error.message : 'Komissiyani saqlab bo‘lmadi.', 'error')
                        );
                      }
                    }
                  }}
                  className="ml-1 text-[10px] underline hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer"
                >
                  <Pencil aria-hidden="true" className="inline h-3 w-3" /> O'zgartirish
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Kompas Tour va SayrHub tizimidagi barcha faol mehmonxonalar • Komissiya: {agencyCommissionRate}%
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-all shrink-0 tap-bounce cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Yangi Mehmonxona</span>
          </button>
        </div>
      </div>

      {/* 2. Filters */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-3">
        {/* Header and Reset */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Mehmonxonalar Filtrlari
            </span>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
              {filtered.length} ta natija
            </span>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw aria-hidden="true" className="h-3 w-3" /> Filtrlarni tozalash
          </button>
        </div>

        {/* Country Pills */}
        <div>
          <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1">
            <Globe aria-hidden="true" className="inline h-3 w-3" /> Davlat:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'Turkiya', 'BAA', 'Misr', 'Maldiv', 'Tailand', 'Vyetnam'].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCountry(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCountry === c
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {c === 'ALL' ? 'Barcha Davlatlar' : c}
              </button>
            ))}
          </div>
        </div>

        {/* Stars, Meal, and Source Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          {/* Stars */}
          <div>
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1">
              <Star aria-hidden="true" className="inline h-3 w-3" /> Yulduzlar:
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
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Meal Type */}
          <div>
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1">
              <Utensils aria-hidden="true" className="inline h-3 w-3" /> Ovqat:
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {['ALL', 'UAI', 'AI', 'FB', 'HB', 'BB', 'RO'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMeal(m)}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                    selectedMeal === m
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Source */}
          <div>
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1">
              <Tag aria-hidden="true" className="inline h-3 w-3" /> Manba:
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
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {src.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Price Range */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mehmonxona, kurort yoki shahar..."
              className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white placeholder-slate-400 pl-9 pr-7 py-2 rounded-xl text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 w-full sm:w-auto">
            <span className="font-semibold shrink-0 inline-flex items-center gap-1"><DollarSign aria-hidden="true" className="h-3 w-3" /> Jami narx ($):</span>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={minPrice === 0 ? '' : minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
              className="w-18 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-2 py-1.5 rounded-lg text-xs font-mono text-center border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-indigo-500"
            />
            <span>—</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={maxPrice === 99999 ? '' : maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value) || 99999)}
              className="w-20 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-2 py-1.5 rounded-lg text-xs font-mono text-center border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Table */}
      <div className="bg-card rounded-2xl border border-zinc-200/90 dark:border-zinc-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-400 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5">Mehmonxona</th>
                <th className="py-3.5 px-3">Shahar & Kurort</th>
                <th className="py-3.5 px-3">Xona & Ovqat</th>
                <th className="py-3.5 px-3">1 kecha narxi</th>
                <th className="py-3.5 px-3">Jami ({formNightsCount}k)</th>
                <th className="py-3.5 pr-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-zinc-800 dark:text-zinc-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-zinc-400">
                    Mehmonxonalar topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((h) => (
                  <tr key={h.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={h.img}
                          alt={h.name}
                          className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 dark:text-white text-xs truncate max-w-[200px]">{h.name}</p>
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.2 rounded border border-amber-200/70 dark:border-amber-800/50">
                            {h.stars}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">{h.country}</p>
                      <p className="text-[11px] text-zinc-400">{h.resort}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{h.roomType}</p>
                      <span className="text-[10px] text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-1.5 py-0.2 rounded font-medium">
                        {h.mealType}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-xs font-bold font-mono text-zinc-900 dark:text-white">
                        ${h.pricePerNight} <span className="text-[10px] font-normal text-zinc-400">/ kecha</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-zinc-400">Asl (Kompas):</span>
                          <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                            ${h.originalCostPrice ?? (h.totalPrice ?? h.pricePerNight * (h.nightsCount || 1))}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {h.markupType === 'manual' ? "Qo'lda:" : "Ustama:"}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {h.markupType === 'manual'
                              ? `$${h.totalPrice}`
                              : `+${h.markupValue ?? agencyCommissionRate}%`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">Mijozga:</span>
                          <span className="text-sm font-black font-mono text-indigo-600 dark:text-indigo-400">
                            ${h.totalPrice || h.pricePerNight * (h.nightsCount || 7)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setMarkupModalHotel(h)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 transition-colors border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 text-xs font-bold cursor-pointer"
                          title="Narxni sozlash (% ustama yoki qo'lda kiritish)"
                        >
                          <DollarSign aria-hidden="true" className="h-3 w-3" />
                          <span className="text-[11px]">Narx</span>
                        </button>
                        <button
                          onClick={() => handleDuplicateHotel(h)}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-600 dark:text-zinc-300 transition-colors"
                          title="Nusxalash"
                        >
                          <span className="material-symbols-outlined text-[17px]">content_copy</span>
                        </button>
                        <button
                          onClick={() => openEditModal(h)}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-600 dark:text-zinc-300 transition-colors"
                          title="Tahrirlash"
                        >
                          <span className="material-symbols-outlined text-[17px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(h.id, h.name)}
                          className={`p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-rose-50 hover:text-rose-600 transition-colors ${
                            isMainAdmin ? 'text-zinc-600 dark:text-zinc-300' : 'text-zinc-300 cursor-not-allowed'
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

      {/* 4. Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Hotel aria-hidden="true" className="h-4 w-4" />
                <span>{editingHotel ? 'Mehmonxonani Tahrirlash' : "Yangi Mehmonxona Qo'shish"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Mehmonxona Nomi *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Masalan: Rixos Sungate"
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Davlat</label>
                  <select
                    required
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  >
                    <option value="">Davlatni tanlang</option>
                    <option value="Turkiya">Turkiya</option>
                    <option value="BAA">BAA (Dubay)</option>
                    <option value="Misr">Misr</option>
                    <option value="Maldiv">Maldiv</option>
                    <option value="Tailand">Tailand</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Kurort / Tuman</label>
                  <input
                    type="text"
                    required
                    value={formResort}
                    onChange={(e) => setFormResort(e.target.value)}
                    placeholder="Belek, Kemer, Palm..."
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Yulduzlar Toifasi</label>
                  <select
                    required
                    value={formStars}
                    onChange={(e) => setFormStars(e.target.value)}
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  >
                    <option value="">Toifani tanlang</option>
                    <option value="5★ Deluxe">5★ Deluxe</option>
                    <option value="5★">5★ Standard</option>
                    <option value="4★">4★ Standard</option>
                    <option value="3★">3★ Qulay</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Xona Turi</label>
                  <input
                    type="text"
                    required
                    value={formRoomType}
                    onChange={(e) => setFormRoomType(e.target.value)}
                    placeholder="Standard Sea View, Deluxe..."
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Ovqatlanish Turi</label>
                  <select
                    required
                    value={formMealType}
                    onChange={(e) => setFormMealType(e.target.value as typeof formMealType)}
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  >
                    <option value="">Ovqatlanish turini tanlang</option>
                    <option value="UAI">UAI (Ultra All Inclusive)</option>
                    <option value="AI">AI (All Inclusive)</option>
                    <option value="FB">FB (3 mahal)</option>
                    <option value="HB">HB (2 mahal)</option>
                    <option value="BB">BB (Nonushta)</option>
                    <option value="RO">RO (Faqat xona)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">1 Kecha Narxi ($)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formPricePerNight}
                    onChange={(e) => setFormPricePerNight(Number(e.target.value))}
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none font-bold text-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Kechalar Soni</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={formNightsCount}
                    onChange={(e) => setFormNightsCount(Number(e.target.value))}
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Mehmonxona Rasmi (URL)</label>
                  <input
                    type="url"
                    required
                    value={formImg}
                    onChange={(e) => setFormImg(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  />
                  {formImg && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={formImg}
                        alt="Preview"
                        className="w-16 h-12 object-cover rounded-lg border border-zinc-200 dark:border-zinc-700"
                        onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                      />
                      <span className="text-[11px] text-zinc-400">Rasm oldindan ko'rinishi</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-semibold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs"
                >
                  {editingHotel ? 'Yangilashni Saqlash' : "Mehmonxonani Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRICE & MARKUP MODAL */}
      {markupModalHotel && (
        <PriceMarkupModal
          isOpen={!!markupModalHotel}
          onClose={() => setMarkupModalHotel(null)}
          itemTitle={markupModalHotel.name}
          itemSubtitle={`${markupModalHotel.resort}, ${markupModalHotel.country} (${markupModalHotel.nightsCount || 7} kecha)`}
          itemImage={markupModalHotel.img}
          originalCostPrice={markupModalHotel.originalCostPrice ?? (markupModalHotel.totalPrice ?? markupModalHotel.pricePerNight * (markupModalHotel.nightsCount || 1))}
          currentPrice={markupModalHotel.totalPrice || markupModalHotel.pricePerNight * (markupModalHotel.nightsCount || 7)}
          currentMarkupType={markupModalHotel.markupType || 'percent'}
          currentMarkupValue={markupModalHotel.markupValue || agencyCommissionRate}
          tourOperator={markupModalHotel.tourOperator || ''}
          agencyName={markupModalHotel.agencyName || ''}
          agencyCommissionRate={agencyCommissionRate}
          onApplyToAllCommission={onUpdateCommissionRate ? async (rate) => {
            try {
              await onUpdateCommissionRate(rate);
            } catch (error) {
              onShowToast(error instanceof Error ? error.message : 'Komissiyani saqlab bo‘lmadi.', 'error');
            }
          } : undefined}
          onSave={handleSaveMarkup}
        />
      )}
    </div>
  );
};
