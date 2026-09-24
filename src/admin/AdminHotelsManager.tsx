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
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminHotelsManager: React.FC<AdminHotelsManagerProps> = ({
  currentRole,
  currentAdmin,
  hotels,
  onAddHotel,
  onUpdateHotel,
  onDeleteHotel,
  onShowToast
}) => {
  const isMainAdmin = currentRole === 'main_admin';
  const [search, setSearch] = useState('');
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
        name: formName,
        resort: formResort,
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
        name: formName,
        resort: formResort,
        country: formCountry,
        stars: formStars,
        rating: 9.6,
        reviewsCount: 38,
        roomType: formRoomType,
        mealType: formMealType,
        mealDesc: formMealType === 'UAI' ? 'Ultra All Inclusive' : 'All Inclusive',
        pricePerNight: formPricePerNight,
        nightsCount: formNightsCount,
        totalPrice,
        amenities: ["Xususiy qumli plyaj", "Aquapark", "SPA & Fitness", "Wi-Fi"],
        img: formImg,
        kompasHotelCode: `KMP-HTL-${Math.floor(1000 + Math.random() * 9000)}`
      };
      onAddHotel(newHotel);
      onShowToast(`Yangi "${formName}" mehmonxonasi qo'shildi!`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!isMainAdmin && !currentAdmin.canDeleteTours) {
      onShowToast("Mehmonxonalarni butunlay o'chirish faqat Bosh Admin huquqida!", 'error');
      return;
    }
    if (confirm(`"${name}" mehmonxonasini katalogdan o'chirmoqchimisiz?`)) {
      onDeleteHotel(id);
      onShowToast(`"${name}" o'chirildi!`, 'info');
    }
  };

  const filtered = hotels.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.resort.toLowerCase().includes(search.toLowerCase()) ||
    h.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>🏨</span> Faqat Mehmonxona Boshqaruvi ({hotels.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Parvozsiz faqat yashash uchun to'g'ridan-to'g'ri mehmonxona xonalari (1:1 Kompas narxlar)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all shrink-0 tap-bounce"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Yangi Mehmonxona Qo'shish</span>
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mehmonxona, kurort yoki davlat..."
            className="w-full bg-slate-800 text-slate-100 placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-700 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/80 border-b border-slate-800 text-slate-400 text-xs font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-4">Mehmonxona</th>
                <th className="py-3.5">Joylashuv</th>
                <th className="py-3.5">Xona & Taom</th>
                <th className="py-3.5">Kechasiga ($)</th>
                <th className="py-3.5">Jami Narx</th>
                <th className="py-3.5 pr-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((h) => (
                <tr key={h.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pl-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={h.img}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs truncate max-w-[200px]">
                          {h.name}
                        </p>
                        <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                          {h.stars}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <p className="text-xs font-bold text-slate-200">{h.country}</p>
                    <p className="text-[10px] text-slate-400">{h.resort}</p>
                  </td>
                  <td className="py-3">
                    <p className="text-xs text-slate-300 font-semibold">{h.roomType}</p>
                    <span className="text-[10px] font-bold text-cyan-400">{h.mealType}</span>
                  </td>
                  <td className="py-3">
                    <span className="text-xs font-bold text-slate-200">${h.pricePerNight} / kecha</span>
                    <p className="text-[10px] text-slate-400">{h.nightsCount} kecha</p>
                  </td>
                  <td className="py-3">
                    <span className="text-sm font-black text-emerald-400">${h.totalPrice}</span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(h)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(h.id, h.name)}
                        className={`p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 ${
                          isMainAdmin ? 'text-slate-300 hover:text-rose-400' : 'text-slate-500 cursor-not-allowed'
                        }`}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">
                {editingHotel ? "Mehmonxonani Tahrirlash" : "Yangi Mehmonxona Qo'shish"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Mehmonxona Nomi *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Davlat</label>
                  <input
                    type="text"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Kurort</label>
                  <input
                    type="text"
                    value={formResort}
                    onChange={(e) => setFormResort(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Yulduz</label>
                  <input
                    type="text"
                    value={formStars}
                    onChange={(e) => setFormStars(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Kechasiga ($)</label>
                  <input
                    type="number"
                    value={formPricePerNight}
                    onChange={(e) => setFormPricePerNight(Number(e.target.value))}
                    className="w-full bg-slate-800 text-emerald-400 font-bold rounded-xl px-3 py-2 text-sm border border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Kechalar Soni</label>
                  <input
                    type="number"
                    value={formNightsCount}
                    onChange={(e) => setFormNightsCount(Number(e.target.value))}
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Rasm URL</label>
                <input
                  type="url"
                  value={formImg}
                  onChange={(e) => setFormImg(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black shadow-lg shadow-cyan-500/20"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
