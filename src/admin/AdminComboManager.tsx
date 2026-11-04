import React, { useState } from 'react';
import { ComboTour } from '../types';
import { AdminRole, AdminUser } from './adminTypes';
import { Map } from '@/lib/flaticon-icons';

interface AdminComboManagerProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  comboTours: ComboTour[];
  onAddComboTour: (combo: ComboTour) => void;
  onUpdateComboTour: (combo: ComboTour) => void;
  onDeleteComboTour: (comboId: string) => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  globalSearch?: string;
}

export const AdminComboManager: React.FC<AdminComboManagerProps> = ({
  currentRole,
  currentAdmin,
  comboTours,
  onAddComboTour,
  onUpdateComboTour,
  onDeleteComboTour,
  onShowToast,
  globalSearch = ''
}) => {
  const isMainAdmin = currentRole === 'main_admin';

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<ComboTour | null>(null);

  // Form
  const [formTitle, setFormTitle] = useState('');
  const [formRouteSummary, setFormRouteSummary] = useState('');
  const [formCities, setFormCities] = useState('');
  const [formNightsSplit, setFormNightsSplit] = useState('');
  const [formPrice, setFormPrice] = useState<number>(850);
  const [formOldPrice, setFormOldPrice] = useState<number>(1050);
  const [formImg, setFormImg] = useState('https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&auto=format&fit=crop&q=80');

  const openAddModal = () => {
    setEditingCombo(null);
    setFormTitle('');
    setFormRouteSummary('Toshkent ➔ Istanbul (3k) ➔ Kapadokya (4k) ➔ Toshkent');
    setFormCities('Istanbul, Kapadokya');
    setFormNightsSplit('3 kecha Istanbul + 4 kecha Kapadokya');
    setFormPrice(850);
    setFormOldPrice(1050);
    setFormImg('https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&auto=format&fit=crop&q=80');
    setIsModalOpen(true);
  };

  const openEditModal = (c: ComboTour) => {
    setEditingCombo(c);
    setFormTitle(c.title);
    setFormRouteSummary(c.routeSummary);
    setFormCities(c.cities.join(', '));
    setFormNightsSplit(c.nightsSplit);
    setFormPrice(c.price);
    setFormOldPrice(c.oldPrice || Math.round(c.price * 1.2));
    setFormImg(c.img);
    setIsModalOpen(true);
  };

  const handleDuplicateCombo = (c: ComboTour) => {
    const duplicated: ComboTour = {
      ...c,
      id: `combo-${Date.now()}`,
      title: `${c.title} (Nusxa)`
    };
    onAddComboTour(duplicated);
    onShowToast(`"${c.title}" combo turi nusxalandi!`, 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      onShowToast("Iltimos, Combo tur nomini kiriting!", 'error');
      return;
    }

    const cityArray = formCities.split(',').map((s) => s.trim()).filter(Boolean);

    if (editingCombo) {
      const updated: ComboTour = {
        ...editingCombo,
        title: formTitle.trim(),
        routeSummary: formRouteSummary.trim(),
        cities: cityArray.length > 0 ? cityArray : ['Istanbul', 'Kapadokya'],
        nightsSplit: formNightsSplit.trim() || '3 kecha + 4 kecha',
        price: Number(formPrice),
        oldPrice: formOldPrice ? Number(formOldPrice) : undefined,
        img: formImg || 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&auto=format&fit=crop&q=80'
      };
      onUpdateComboTour(updated);
      onShowToast(`"${formTitle}" Combo turi yangilandi!`, 'success');
    } else {
      const newCombo: ComboTour = {
        id: `combo-${Date.now()}`,
        title: formTitle.trim(),
        route: cityArray.length > 0 ? cityArray : ['Istanbul', 'Kapadokya'],
        routeSummary: formRouteSummary.trim() || 'Toshkent ➔ Istanbul ➔ Kapadokya ➔ Toshkent',
        cities: cityArray.length > 0 ? cityArray : ['Istanbul', 'Kapadokya'],
        nightsTotal: 7,
        nightsSplit: formNightsSplit.trim() || '3 kecha + 4 kecha',
        hotels: [],
        transfersIncluded: true,
        excursionsIncluded: ['Kapadokya havo shari', 'Bosfor safari'],
        price: Number(formPrice),
        oldPrice: formOldPrice ? Number(formOldPrice) : Math.round(formPrice * 1.25),
        departureCity: 'Toshkent (TAS)',
        departureDate: '2026-10-15',
        airline: 'Uzbekistan Airways',
        flight: 'HY-271 / HY-272',
        img: formImg || 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&auto=format&fit=crop&q=80',
        rating: 4.9,
        kompasTourCode: `CMB-${Math.floor(1000 + Math.random() * 9000)}`,
        itinerary: []
      };
      onAddComboTour(newCombo);
      onShowToast(`Yangi "${formTitle}" combo turi qo'shildi!`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (!isMainAdmin && !currentAdmin.canDeleteTours) {
      onShowToast("Combo turlarni o'chirish faqat Bosh Admin huquqida!", 'error');
      return;
    }
    if (confirm(`"${title}" combo turini o'chirmoqchimisiz?`)) {
      onDeleteComboTour(id);
      onShowToast(`"${title}" o'chirildi!`, 'info');
    }
  };

  const effectiveSearch = (search || globalSearch).trim().toLowerCase();

  const filtered = comboTours.filter((c) =>
    !effectiveSearch ||
    c.title.toLowerCase().includes(effectiveSearch) ||
    c.routeSummary.toLowerCase().includes(effectiveSearch) ||
    c.cities.some((city) => city.toLowerCase().includes(effectiveSearch))
  );

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Map aria-hidden="true" className="h-4 w-4" /> Combo Turlar Boshqaruvi ({comboTours.length})
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Bir nechta shaharlarni o'z ichiga olgan kombinatsiyalashgan turpaketlar
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-all shrink-0 tap-bounce"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Yangi Combo Tur</span>
        </button>
      </div>

      {/* 2. Search */}
      <div className="p-4 rounded-2xl bg-card border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Shahar yoki marshrut bo'yicha..."
            className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white placeholder-slate-400 pl-9 pr-7 py-2 rounded-xl text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 3. Table */}
      <div className="bg-card rounded-2xl border border-zinc-200/90 dark:border-zinc-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-400 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5">Combo Tur & Shaharlar</th>
                <th className="py-3.5 px-3">Marshrut Sxemasi</th>
                <th className="py-3.5 px-3">Kechalar Taqsimoti</th>
                <th className="py-3.5 px-3">Narx (USD)</th>
                <th className="py-3.5 pr-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-zinc-800 dark:text-zinc-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-zinc-400">
                    Combo turlar topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.img}
                          alt={c.title}
                          className="w-12 h-12 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-900 dark:text-white text-xs truncate max-w-[200px]">{c.title}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {c.cities.map((city, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50"
                              >
                                {city}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 max-w-[250px] leading-relaxed">
                        {c.routeSummary}
                      </p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Barcha transferlar ichida</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{c.nightsSplit}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">${c.price}</span>
                        {c.oldPrice && (
                          <span className="text-[11px] line-through text-zinc-400">${c.oldPrice}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDuplicateCombo(c)}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-600 dark:text-zinc-300 transition-colors"
                          title="Nusxalash"
                        >
                          <span className="material-symbols-outlined text-[17px]">content_copy</span>
                        </button>
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-600 dark:text-zinc-300 transition-colors"
                          title="Tahrirlash"
                        >
                          <span className="material-symbols-outlined text-[17px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.title)}
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
                <Map aria-hidden="true" className="h-4 w-4" />
                <span>{editingCombo ? 'Combo Turni Tahrirlash' : "Yangi Combo Tur Qo'shish"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Combo Tur Nomi *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Masalan: Istanbul + Kapadokya Erta Bahor"
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                    Shaharlar (Vergul bilan ajrating)
                  </label>
                  <input
                    type="text"
                    value={formCities}
                    onChange={(e) => setFormCities(e.target.value)}
                    placeholder="Istanbul, Kapadokya"
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Marshrut Sxemasi</label>
                  <input
                    type="text"
                    value={formRouteSummary}
                    onChange={(e) => setFormRouteSummary(e.target.value)}
                    placeholder="Toshkent ➔ Istanbul (3k) ➔ Kapadokya (4k) ➔ Toshkent"
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Kechalar Taqsimoti</label>
                  <input
                    type="text"
                    value={formNightsSplit}
                    onChange={(e) => setFormNightsSplit(e.target.value)}
                    placeholder="3 kecha Istanbul + 4 kecha Kapadokya"
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Narx ($)</label>
                    <input
                      type="number"
                      min="1"
                      value={formPrice}
                      onChange={(e) => setFormPrice(Number(e.target.value))}
                      className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none font-bold text-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Eski Narx ($)</label>
                    <input
                      type="number"
                      min="1"
                      value={formOldPrice}
                      onChange={(e) => setFormOldPrice(Number(e.target.value))}
                      className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Rasm (URL)</label>
                  <input
                    type="url"
                    value={formImg}
                    onChange={(e) => setFormImg(e.target.value)}
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
                  {editingCombo ? 'Yangilashni Saqlash' : "Combo Turni Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
