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
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminToursManager: React.FC<AdminToursManagerProps> = ({
  currentRole,
  currentAdmin,
  tours,
  onAddTour,
  onUpdateTour,
  onDeleteTour,
  onShowToast
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
    setFormFlight("Charter HY-3501 (Toshkent — Antalya)");
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
        dates: 'Har kuni parvoz'
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
        dates: 'Har kuni qatnov',
        isSaved: false,
        source: 'manual',
        seatsStatus: 'guaranteed'
      };
      onAddTour(newTour);
      onShowToast(`Yangi "${formTitle}" turpaketi qo'shildi va ilovaga uzatildi!`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (tourId: string, title: string) => {
    if (!isMainAdmin && !currentAdmin.canDeleteTours) {
      onShowToast("Tur paketlarni butunlay o'chirish faqat Bosh Admin huquqida!", 'error');
      return;
    }
    if (confirm(`Rostdan ham "${title}" turini katalogdan o'chirmoqchimisiz?`)) {
      onDeleteTour(tourId);
      onShowToast(`"${title}" muvaffaqiyatli o'chirildi!`, 'info');
    }
  };

  // Filtered tours
  const filteredTours = tours.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.location.toLowerCase().includes(search.toLowerCase()) ||
      (t.airline && t.airline.toLowerCase().includes(search.toLowerCase()));
    const matchCountry = selectedCountry === 'ALL' || t.country === selectedCountry;
    const matchStars =
      selectedStars === 'ALL' || (t.hotelStars && t.hotelStars.includes(selectedStars));
    return matchSearch && matchCountry && matchStars;
  });

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#11142d] dark:text-white flex items-center gap-2">
            <span>🏖️</span> Turpaketlar Katalogi ({tours.length})
          </h2>
          <p className="text-xs text-[#777e89] dark:text-[#a39db0] mt-0.5">
            Kompas Tour va TravelWay tizimidagi barcha faol turpaketlar
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0891b2] hover:bg-[#0e7490] text-white font-extrabold text-xs shadow-md shadow-[#0891b2]/20 transition-all tap-bounce shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Yangi Turpaket Qo'shish</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777e89] dark:text-[#726c7f] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Mehmonxona yoki shahar bo'yicha..."
              className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white placeholder-[#777e89] dark:placeholder-[#726c7f] pl-9 pr-3 py-2 rounded-xl text-xs border border-transparent focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white text-xs font-bold px-3 py-2 rounded-xl border border-[#e5eaef] dark:border-white/10 focus:outline-none focus:border-[#0891b2]"
          >
            <option value="ALL">Barcha Davlatlar</option>
            <option value="Turkiya">Turkiya</option>
            <option value="BAA">BAA (Dubay)</option>
            <option value="Misr">Misr</option>
            <option value="Tailand">Tailand</option>
            <option value="Maldiv">Maldiv</option>
            <option value="Vyetnam">Vyetnam</option>
          </select>

          <select
            value={selectedStars}
            onChange={(e) => setSelectedStars(e.target.value)}
            className="bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white text-xs font-bold px-3 py-2 rounded-xl border border-[#e5eaef] dark:border-white/10 focus:outline-none focus:border-[#0891b2]"
          >
            <option value="ALL">Barcha Yulduzlar</option>
            <option value="5">5★ Yulduzli</option>
            <option value="4">4★ Yulduzli</option>
            <option value="3">3★ Yulduzli</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1e1a23] rounded-2xl border border-[#e5eaef] dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fafbfb] dark:bg-white/5 border-b border-[#e5eaef] dark:border-white/10 text-[#777e89] dark:text-[#a39db0] text-[10px] font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5">Mehmonxona & Tur</th>
                <th className="py-3.5 px-3">Joylashuv</th>
                <th className="py-3.5 px-3">Toifa / Ovqat</th>
                <th className="py-3.5 px-3">Parvoz / Aviakompaniya</th>
                <th className="py-3.5 px-3">Narx (USD)</th>
                <th className="py-3.5 pr-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f6f9] dark:divide-white/5 text-[#2a3547] dark:text-[#faf9fb]">
              {filteredTours.map((tour) => (
                <tr key={tour.id} className="hover:bg-[#f8f9fa] dark:hover:bg-white/5 transition-colors">
                  <td className="py-3.5 pl-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={tour.img}
                        alt={tour.title}
                        className="w-12 h-12 rounded-xl object-cover border border-[#e5eaef] dark:border-white/10 shrink-0 shadow-xs"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-[#11142d] dark:text-white text-xs truncate max-w-[220px]">
                          {tour.title}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800/40">
                            {tour.hotelStars || '5★'}
                          </span>
                          <span className="text-[11px] text-[#777e89] dark:text-[#a39db0] font-mono">
                            {tour.kompasTourCode || `#${tour.id.slice(0, 8)}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-[#11142d] dark:text-white text-xs">{tour.country}</p>
                    <p className="text-[11px] text-[#777e89] dark:text-[#a39db0]">{tour.resort || tour.location}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-xs font-black text-[#0891b2] dark:text-cyan-300 bg-[#e0f7fa] dark:bg-cyan-950/40 px-2 py-0.5 rounded-md border border-[#b2ebf2] dark:border-cyan-800/40">
                      {tour.mealType || 'AI'}
                    </span>
                    <p className="text-[10px] text-[#777e89] dark:text-[#a39db0] mt-1">{tour.nights}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="font-bold text-[#11142d] dark:text-white text-xs">{tour.airline || 'Uzbekistan Airways'}</p>
                    <p className="text-[11px] text-[#777e89] dark:text-[#a39db0] truncate max-w-[180px]">{tour.flight}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-[#0891b2] dark:text-cyan-400">${tour.price}</span>
                      {tour.oldPrice && (
                        <span className="text-[11px] line-through text-[#9993a3]">
                          ${tour.oldPrice}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">1:1 Rasmiy narx</span>
                  </td>
                  <td className="py-3.5 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(tour)}
                        className="p-1.5 rounded-lg bg-[#f4f6f9] dark:bg-white/10 hover:bg-[#e0f7fa] dark:hover:bg-cyan-950/40 text-[#2a3547] dark:text-white hover:text-[#0891b2] transition-colors"
                        title="Tahrirlash"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(tour.id, tour.title)}
                        className={`p-1.5 rounded-lg bg-[#f4f6f9] dark:bg-white/10 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ${
                          isMainAdmin
                            ? 'text-[#2a3547] dark:text-white hover:text-rose-600'
                            : 'text-[#9993a3] cursor-not-allowed'
                        }`}
                        title={isMainAdmin ? "O'chirish" : "Faqat Bosh Admin o'chira oladi"}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT TOUR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5eaef] dark:border-white/10">
              <h3 className="text-lg font-black text-[#11142d] dark:text-white flex items-center gap-2">
                <span>{editingTour ? '✏️' : '✨'}</span>
                <span>{editingTour ? 'Turpaketni Tahrirlash' : "Yangi Turpaket Qo'shish"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f4f6f9] dark:bg-white/10 text-[#777e89] hover:text-[#11142d] dark:hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">
                    Mehmonxona / Tur Nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Masalan: Rixos Premium Belek 5* Deluxe"
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Davlat</label>
                  <select
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none"
                  >
                    <option value="Turkiya">Turkiya</option>
                    <option value="BAA">BAA (Dubay)</option>
                    <option value="Misr">Misr</option>
                    <option value="Tailand">Tailand</option>
                    <option value="Maldiv">Maldiv</option>
                    <option value="Vyetnam">Vyetnam</option>
                    <option value="Gruziya">Gruziya</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Kurort / Shahar</label>
                  <input
                    type="text"
                    value={formResort}
                    onChange={(e) => setFormResort(e.target.value)}
                    placeholder="Masalan: Belek yoki Antalya"
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Yulduzlar Toifasi</label>
                  <select
                    value={formHotelStars}
                    onChange={(e) => setFormHotelStars(e.target.value)}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none"
                  >
                    <option value="5★ Deluxe">5★ Deluxe</option>
                    <option value="5★">5★ Star</option>
                    <option value="4★+">4★+ Star</option>
                    <option value="4★">4★ Star</option>
                    <option value="3★">3★ Star</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Ovqatlanish Turi</label>
                  <select
                    value={formMealType}
                    onChange={(e) => setFormMealType(e.target.value as any)}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none"
                  >
                    <option value="UAI">UAI — Ultra All Inclusive</option>
                    <option value="AI">AI — All Inclusive</option>
                    <option value="FB">FB — Full Board (3 mahal)</option>
                    <option value="HB">HB — Half Board (Nonushta+Kechki)</option>
                    <option value="BB">BB — Bed & Breakfast (Nonushta)</option>
                    <option value="RO">RO — Room Only (Faqat xona)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Narxi (USD) *</label>
                  <input
                    type="number"
                    required
                    min={50}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#0891b2] dark:text-cyan-400 rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Eski Narxi (Aksiya uchun)</label>
                  <input
                    type="number"
                    min={50}
                    value={formOldPrice}
                    onChange={(e) => setFormOldPrice(Number(e.target.value))}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Kecha Soni</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={formNightsCount}
                    onChange={(e) => setFormNightsCount(Number(e.target.value))}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Aviakompaniya</label>
                  <input
                    type="text"
                    value={formAirline}
                    onChange={(e) => setFormAirline(e.target.value)}
                    placeholder="Uzbekistan Airways"
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Parvoz Tavsifi</label>
                  <input
                    type="text"
                    value={formFlight}
                    onChange={(e) => setFormFlight(e.target.value)}
                    placeholder="Charter HY 3501 (Toshkent — Antalya)"
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Rasm Havolasi (URL)</label>
                  <input
                    type="url"
                    value={formImg}
                    onChange={(e) => setFormImg(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5eaef] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#f4f6f9] dark:bg-white/10 hover:bg-[#e5eaef] text-[#2a3547] dark:text-white text-xs font-bold transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0891b2] hover:bg-[#0e7490] text-white text-xs font-black shadow-md shadow-[#0891b2]/20 transition-all"
                >
                  {editingTour ? "O'zgarishlarni Saqlash" : "Katalogga Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
