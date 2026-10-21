import React, { useState } from 'react';
import { TourPackage } from '../types';
import { AdminRole, AdminUser } from './adminTypes';

interface AdminToursManagerProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  tours: TourPackage[];
  onAddTour: (tour: TourPackage) => void;
  onUpdateTour: (tour: TourPackage) => void;
  onDeleteTour: (tourId: string) => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  globalSearch?: string;
}

export const AdminToursManager: React.FC<AdminToursManagerProps> = ({
  currentRole,
  currentAdmin,
  tours,
  onAddTour,
  onUpdateTour,
  onDeleteTour,
  onShowToast,
  globalSearch = ''
}) => {
  const isMainAdmin = currentRole === 'main_admin';

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedStars, setSelectedStars] = useState('ALL');

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

  // Filtered tours
  const filteredTours = tours.filter((t) => {
    const matchSearch =
      !effectiveSearch ||
      t.title.toLowerCase().includes(effectiveSearch) ||
      t.location.toLowerCase().includes(effectiveSearch) ||
      (t.airline && t.airline.toLowerCase().includes(effectiveSearch)) ||
      (t.resort && t.resort.toLowerCase().includes(effectiveSearch));
    const matchCountry = selectedCountry === 'ALL' || t.country === selectedCountry;
    const matchStars =
      selectedStars === 'ALL' || (t.hotelStars && t.hotelStars.includes(selectedStars));
    return matchSearch && matchCountry && matchStars;
  });

  const countriesList = ['ALL', 'Turkiya', 'BAA', 'Misr', 'Tailand', 'Maldiv', 'Vyetnam'];

  return (
    <div className="space-y-6">
      {/* 1. Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🏖️</span> Turpaketlar Katalogi ({tours.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kompas Tour va SayrHub tizimidagi barcha faol turpaketlar
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs transition-all tap-bounce shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Yangi Turpaket Qo'shish</span>
        </button>
      </div>

      {/* 2. Country Filter Pills & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-3">
        {/* Country Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {countriesList.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCountry(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCountry === c
                  ? 'bg-sky-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {c === 'ALL' ? 'Barcha Davlatlar' : c}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mehmonxona, kurort yoki aviakompaniya..."
              className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 pl-9 pr-7 py-2 rounded-xl text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-medium text-slate-400">Yulduzlar:</span>
            <select
              value={selectedStars}
              onChange={(e) => setSelectedStars(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">Barchasi</option>
              <option value="5">5★ Deluxe</option>
              <option value="4">4★ Standart</option>
              <option value="3">3★ Qulay</option>
            </select>
          </div>
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
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.2 rounded border border-amber-200/70 dark:border-amber-800/50">
                              {tour.hotelStars || '5★'}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {tour.kompasTourCode || `#${tour.id.slice(0, 8)}`}
                            </span>
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
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-sky-600 dark:text-sky-400">${tour.price}</span>
                        {tour.oldPrice && (
                          <span className="text-[11px] line-through text-slate-400">
                            ${tour.oldPrice}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Kafolatlangan</span>
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
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
    </div>
  );
};
