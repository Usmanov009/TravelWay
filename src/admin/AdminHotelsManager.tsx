import React, { useState } from 'react';
import { HotelOnly } from '../types';
import { AdminRole, AdminUser } from './adminTypes';

interface AdminHotelsManagerProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  hotels: HotelOnly[];
  onAddHotel: (hotel: HotelOnly) => void;
  onUpdateHotel: (hotel: HotelOnly) => void;
  onDeleteHotel: (hotelId: string) => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  globalSearch?: string;
}

export const AdminHotelsManager: React.FC<AdminHotelsManagerProps> = ({
  currentRole,
  currentAdmin,
  hotels,
  onAddHotel,
  onUpdateHotel,
  onDeleteHotel,
  onShowToast,
  globalSearch = ''
}) => {
  const isMainAdmin = currentRole === 'main_admin';
  const [search, setSearch] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<HotelOnly | null>(null);

  // Form
  const [formName, setFormName] = useState('');
  const [formResort, setFormResort] = useState('Belek');
  const [formCountry, setFormCountry] = useState('Turkiya');
  const [formStars, setFormStars] = useState('5★ Deluxe');
  const [formRoomType, setFormRoomType] = useState('Deluxe Sea View Room');
  const [formMealType, setFormMealType] = useState<'UAI' | 'AI' | 'FB' | 'HB' | 'BB' | 'RO'>('UAI');
  const [formPricePerNight, setFormPricePerNight] = useState(130);
  const [formNightsCount, setFormNightsCount] = useState(7);
  const [formImg, setFormImg] = useState('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80');

  const openAddModal = () => {
    setEditingHotel(null);
    setFormName('');
    setFormResort('Belek');
    setFormCountry('Turkiya');
    setFormStars('5★ Deluxe');
    setFormRoomType('Deluxe Sea View Room');
    setFormMealType('UAI');
    setFormPricePerNight(130);
    setFormNightsCount(7);
    setFormImg('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80');
    setIsModalOpen(true);
  };

  const openEditModal = (h: HotelOnly) => {
    setEditingHotel(h);
    setFormName(h.name);
    setFormResort(h.resort);
    setFormCountry(h.country);
    setFormStars(h.stars);
    setFormRoomType(h.roomType);
    setFormMealType(h.mealType);
    setFormPricePerNight(h.pricePerNight);
    setFormNightsCount(h.nightsCount);
    setFormImg(h.img);
    setIsModalOpen(true);
  };

  const handleDuplicateHotel = (h: HotelOnly) => {
    const duplicated: HotelOnly = {
      ...h,
      id: `hot-adm-${Date.now()}`,
      name: `${h.name} (Nusxa)`
    };
    onAddHotel(duplicated);
    onShowToast(`"${h.name}" mehmonxonasi nusxalandi! 📋`, 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      onShowToast("Mehmonxona nomini kiriting!", 'error');
      return;
    }

    const totalPrice = formPricePerNight * formNightsCount;

    if (editingHotel) {
      const updated: HotelOnly = {
        ...editingHotel,
        name: formName.trim(),
        resort: formResort.trim(),
        country: formCountry,
        stars: formStars,
        roomType: formRoomType,
        mealType: formMealType,
        pricePerNight: formPricePerNight,
        nightsCount: formNightsCount,
        totalPrice,
        img: formImg
      };
      onUpdateHotel(updated);
      onShowToast(`"${formName}" mehmonxonasi yangilandi!`, 'success');
    } else {
      const newHotel: HotelOnly = {
        id: `hot-adm-${Date.now()}`,
        name: formName.trim(),
        resort: formResort.trim(),
        country: formCountry,
        stars: formStars,
        rating: 9.6,
        reviewsCount: 140,
        roomType: formRoomType,
        mealType: formMealType,
        mealDesc: formMealType === 'UAI' ? 'Ultra All Inclusive' : 'All Inclusive',
        pricePerNight: formPricePerNight,
        nightsCount: formNightsCount,
        totalPrice,
        amenities: ['Wi-Fi', 'Basseyn', 'SPA', 'Plyaj', 'Restoran'],
        distanceToBeach: '1-qator (Dengiz bo\'yida)',
        img: formImg,
        kompasHotelCode: `HTL-${Date.now().toString().slice(-5)}`
      };
      onAddHotel(newHotel);
      onShowToast(`Yangi "${formName}" mehmonxonasi qo'shildi!`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!isMainAdmin && !currentAdmin.canDeleteTours) {
      onShowToast("Mehmonxonalarni o'chirish faqat Bosh Admin huquqida!", 'error');
      return;
    }
    if (confirm(`"${name}" mehmonxonasini ro'yxatdan o'chirmoqchimisiz?`)) {
      onDeleteHotel(id);
      onShowToast(`"${name}" o'chirildi!`, 'info');
    }
  };

  const effectiveSearch = (search || globalSearch).trim().toLowerCase();

  const filtered = hotels.filter((h) => {
    const matchSearch =
      !effectiveSearch ||
      h.name.toLowerCase().includes(effectiveSearch) ||
      h.resort.toLowerCase().includes(effectiveSearch) ||
      h.country.toLowerCase().includes(effectiveSearch);

    const matchCountry = selectedCountry === 'ALL' || h.country === selectedCountry;
    return matchSearch && matchCountry;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>🏨</span> Mehmonxonalar Boshqaruvi ({hotels.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Faqat mehmonxona (hotel-only) bron qilish xizmati katalogi
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs transition-all shrink-0 tap-bounce"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Yangi Mehmonxona Qo'shish</span>
        </button>
      </div>

      {/* 2. Filters */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {['ALL', 'Turkiya', 'BAA', 'Misr', 'Maldiv', 'Tailand'].map((c) => (
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

        <div className="relative w-full sm:max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mehmonxona, shahar..."
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
      </div>

      {/* 3. Table */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5">Mehmonxona</th>
                <th className="py-3.5 px-3">Shahar & Kurort</th>
                <th className="py-3.5 px-3">Xona & Ovqat</th>
                <th className="py-3.5 px-3">1 kecha narxi</th>
                <th className="py-3.5 px-3">Jami ({formNightsCount}k)</th>
                <th className="py-3.5 pr-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    Mehmonxonalar topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={h.img}
                          alt={h.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white text-xs truncate max-w-[200px]">{h.name}</p>
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.2 rounded border border-amber-200/70 dark:border-amber-800/50">
                            {h.stars}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{h.country}</p>
                      <p className="text-[11px] text-slate-400">{h.resort}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{h.roomType}</p>
                      <span className="text-[10px] text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 px-1.5 py-0.2 rounded font-medium">
                        {h.mealType}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                        ${h.pricePerNight} <span className="text-[10px] font-normal text-slate-400">/ kecha</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-sm font-bold font-mono text-sky-600 dark:text-sky-400">
                        ${h.totalPrice || h.pricePerNight * (h.nightsCount || 7)}
                      </span>
                      <p className="text-[10px] text-slate-400">{h.nightsCount || 7} kecha uchun</p>
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDuplicateHotel(h)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 hover:text-sky-600 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Nusxalash"
                        >
                          <span className="material-symbols-outlined text-[17px]">content_copy</span>
                        </button>
                        <button
                          onClick={() => openEditModal(h)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 hover:text-sky-600 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Tahrirlash"
                        >
                          <span className="material-symbols-outlined text-[17px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(h.id, h.name)}
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

      {/* 4. Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>🏨</span>
                <span>{editingHotel ? 'Mehmonxonani Tahrirlash' : "Yangi Mehmonxona Qo'shish"}</span>
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
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Mehmonxona Nomi *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Masalan: Rixos Sungate"
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
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
                    <option value="Maldiv">Maldiv</option>
                    <option value="Tailand">Tailand</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Kurort / Tuman</label>
                  <input
                    type="text"
                    value={formResort}
                    onChange={(e) => setFormResort(e.target.value)}
                    placeholder="Belek, Kemer, Palm..."
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Yulduzlar Toifasi</label>
                  <select
                    value={formStars}
                    onChange={(e) => setFormStars(e.target.value)}
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  >
                    <option value="5★ Deluxe">5★ Deluxe</option>
                    <option value="5★">5★ Standard</option>
                    <option value="4★">4★ Standard</option>
                    <option value="3★">3★ Qulay</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Xona Turi</label>
                  <input
                    type="text"
                    value={formRoomType}
                    onChange={(e) => setFormRoomType(e.target.value)}
                    placeholder="Standard Sea View, Deluxe..."
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
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
                    <option value="FB">FB (3 mahal)</option>
                    <option value="HB">HB (2 mahal)</option>
                    <option value="BB">BB (Nonushta)</option>
                    <option value="RO">RO (Faqat xona)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">1 Kecha Narxi ($)</label>
                  <input
                    type="number"
                    min="1"
                    value={formPricePerNight}
                    onChange={(e) => setFormPricePerNight(Number(e.target.value))}
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none font-bold text-sky-600"
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
                  {editingHotel ? 'Yangilashni Saqlash' : "Mehmonxonani Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
