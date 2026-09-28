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
        reviewsCount: 142,
        roomType: formRoomType,
        mealType: formMealType,
        pricePerNight: formPricePerNight,
        nightsCount: formNightsCount,
        totalPrice,
        img: formImg,
        badge: 'Top Tanlov'
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
    if (confirm(`"${name}" mehmonxonasini o'chirmoqchimisiz?`)) {
      onDeleteHotel(id);
      onShowToast(`"${name}" o'chirildi!`, 'info');
    }
  };

  const filtered = hotels.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.resort.toLowerCase().includes(search.toLowerCase()) ||
    h.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#11142d] dark:text-white flex items-center gap-2">
            <span>🏨</span> Faqat Mehmonxona Boshqaruvi ({hotels.length})
          </h2>
          <p className="text-xs text-[#777e89] dark:text-[#a39db0] mt-0.5">
            Aviachiptasiz, faqat xona va ovqatlanish paketlari (Hotel Only)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0891b2] hover:bg-[#0e7490] text-white font-extrabold text-xs shadow-md shadow-[#0891b2]/20 transition-all shrink-0 tap-bounce"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Yangi Mehmonxona Qo'shish</span>
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 shadow-sm">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777e89] dark:text-[#726c7f] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mehmonxona nomi yoki kurort bo'yicha..."
            className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white placeholder-[#777e89] dark:placeholder-[#726c7f] pl-9 pr-3 py-2 rounded-xl text-xs border border-transparent focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1a23] rounded-2xl border border-[#e5eaef] dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fafbfb] dark:bg-white/5 border-b border-[#e5eaef] dark:border-white/10 text-[#777e89] dark:text-[#a39db0] text-[10px] font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5">Mehmonxona</th>
                <th className="py-3.5 px-3">Kurort / Davlat</th>
                <th className="py-3.5 px-3">Xona Turi & Ovqat</th>
                <th className="py-3.5 px-3">Narxi (Kuniga / Jami)</th>
                <th className="py-3.5 pr-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f6f9] dark:divide-white/5 text-[#2a3547] dark:text-[#faf9fb]">
              {filtered.map((h) => (
                <tr key={h.id} className="hover:bg-[#f8f9fa] dark:hover:bg-white/5 transition-colors">
                  <td className="py-3.5 pl-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={h.img}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-[#e5eaef] dark:border-white/10 shrink-0 shadow-xs"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-[#11142d] dark:text-white text-xs truncate max-w-[200px]">{h.name}</p>
                        <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/50 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800/40">
                          {h.stars}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="text-xs font-bold text-[#11142d] dark:text-white">{h.resort}</p>
                    <p className="text-[11px] text-[#777e89] dark:text-[#a39db0]">{h.country}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="text-xs font-bold text-[#11142d] dark:text-white truncate max-w-[170px]">{h.roomType}</p>
                    <span className="text-[10px] font-black text-[#0891b2] dark:text-cyan-400 bg-[#e0f7fa] dark:bg-cyan-950/40 px-1.5 py-0.2 rounded">
                      {h.mealType}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-black text-[#0891b2] dark:text-cyan-400">${h.totalPrice}</span>
                      <span className="text-[10px] text-[#777e89] dark:text-[#a39db0]">({h.nightsCount} k)</span>
                    </div>
                    <p className="text-[10px] text-[#777e89] dark:text-[#a39db0]">${h.pricePerNight} / kechasi</p>
                  </td>
                  <td className="py-3.5 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(h)}
                        className="p-1.5 rounded-lg bg-[#f4f6f9] dark:bg-white/10 hover:bg-[#e0f7fa] dark:hover:bg-cyan-950/40 text-[#2a3547] dark:text-white hover:text-[#0891b2]"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(h.id, h.name)}
                        className={`p-1.5 rounded-lg bg-[#f4f6f9] dark:bg-white/10 hover:bg-rose-50 dark:hover:bg-rose-950/40 ${
                          isMainAdmin ? 'text-[#2a3547] dark:text-white hover:text-rose-600' : 'text-[#9993a3] cursor-not-allowed'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5eaef] dark:border-white/10">
              <h3 className="text-lg font-black text-[#11142d] dark:text-white">
                {editingHotel ? "Mehmonxonani Tahrirlash" : "Yangi Mehmonxona Qo'shish"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#777e89] hover:text-[#11142d] dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Mehmonxona Nomi *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Davlat</label>
                  <input
                    type="text"
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Kurort</label>
                  <input
                    type="text"
                    value={formResort}
                    onChange={(e) => setFormResort(e.target.value)}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Yulduzlar</label>
                  <select
                    value={formStars}
                    onChange={(e) => setFormStars(e.target.value)}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700"
                  >
                    <option value="5★ Deluxe">5★ Deluxe</option>
                    <option value="5★">5★ Star</option>
                    <option value="4★+">4★+ Star</option>
                    <option value="4★">4★ Star</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Ovqatlanish</label>
                  <select
                    value={formMealType}
                    onChange={(e) => setFormMealType(e.target.value as any)}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700"
                  >
                    <option value="UAI">UAI — Ultra All Inclusive</option>
                    <option value="AI">AI — All Inclusive</option>
                    <option value="FB">FB — Full Board</option>
                    <option value="HB">HB — Half Board</option>
                    <option value="BB">BB — Bed & Breakfast</option>
                    <option value="RO">RO — Room Only</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Narxi / Kechasi ($)</label>
                  <input
                    type="number"
                    value={formPricePerNight}
                    onChange={(e) => setFormPricePerNight(Number(e.target.value))}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#0891b2] dark:text-cyan-400 font-bold rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Kecha Soni</label>
                  <input
                    type="number"
                    value={formNightsCount}
                    onChange={(e) => setFormNightsCount(Number(e.target.value))}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Xona Turi</label>
                <input
                  type="text"
                  value={formRoomType}
                  onChange={(e) => setFormRoomType(e.target.value)}
                  className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Rasm Havolasi</label>
                <input
                  type="url"
                  value={formImg}
                  onChange={(e) => setFormImg(e.target.value)}
                  className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#e5eaef] dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#f4f6f9] dark:bg-white/10 text-[#2a3547] dark:text-white text-xs font-bold hover:bg-[#e5eaef]"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0891b2] hover:bg-[#0e7490] text-white text-xs font-black shadow-md shadow-[#0891b2]/20"
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
