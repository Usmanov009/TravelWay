import React, { useState } from 'react';
import { ComboTour } from '../types';
import { AdminRole, AdminUser } from './adminTypes';

interface AdminComboManagerProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  comboTours: ComboTour[];
  onAddComboTour: (combo: ComboTour) => void;
  onUpdateComboTour: (combo: ComboTour) => void;
  onDeleteComboTour: (comboId: string) => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminComboManager: React.FC<AdminComboManagerProps> = ({
  currentRole,
  currentAdmin,
  comboTours,
  onAddComboTour,
  onUpdateComboTour,
  onDeleteComboTour,
  onShowToast
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
        routeSummary: formRouteSummary.trim() || 'Toshkent ➔ Istanbul ➔ Kapadokya ➔ Toshkent',
        cities: cityArray.length > 0 ? cityArray : ['Istanbul', 'Kapadokya'],
        nightsSplit: formNightsSplit.trim() || '3 kecha + 4 kecha',
        airline: 'Uzbekistan Airways',
        transfersIncluded: true,
        price: Number(formPrice),
        oldPrice: formOldPrice ? Number(formOldPrice) : Math.round(formPrice * 1.25),
        img: formImg || 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800&auto=format&fit=crop&q=80',
        badge: 'Mashhur Combo',
        kompasTourCode: `CMB-${Math.floor(1000 + Math.random() * 9000)}`
      };
      onAddComboTour(newCombo);
      onShowToast(`Yangi "${formTitle}" Combo turi katalogga qo'shildi!`, 'success');
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

  const filteredCombos = comboTours.filter((c) => {
    return (
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.routeSummary.toLowerCase().includes(search.toLowerCase()) ||
      c.cities.some((city) => city.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#11142d] dark:text-white flex items-center gap-2">
            <span>🔄</span> Combo Turlar Boshqaruvi ({comboTours.length})
          </h2>
          <p className="text-xs text-[#777e89] dark:text-[#a39db0] mt-0.5">
            Bitta sayohatda 2 yoki undan ko'p shaharlarni qamrab olgan kombinatsiyalangan turlar
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0891b2] hover:bg-[#0e7490] text-white font-extrabold text-xs shadow-md shadow-[#0891b2]/20 transition-all shrink-0 tap-bounce"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Yangi Combo Qo'shish</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 shadow-sm">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#777e89] dark:text-[#726c7f] text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Combo tur yoki shaharlar bo'yicha qidiruv..."
            className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white placeholder-[#777e89] dark:placeholder-[#726c7f] pl-9 pr-3 py-2 rounded-xl text-xs border border-transparent focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1e1a23] rounded-2xl border border-[#e5eaef] dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fafbfb] dark:bg-white/5 border-b border-[#e5eaef] dark:border-white/10 text-[#777e89] dark:text-[#a39db0] text-[10px] font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5">Combo Tur</th>
                <th className="py-3.5 px-3">Marshrut & Shaharlar</th>
                <th className="py-3.5 px-3">Kechalar Taqsimoti</th>
                <th className="py-3.5 px-3">Aviakompaniya</th>
                <th className="py-3.5 px-3">Narx (USD)</th>
                <th className="py-3.5 pr-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f6f9] dark:divide-white/5 text-[#2a3547] dark:text-[#faf9fb]">
              {filteredCombos.map((combo) => (
                <tr key={combo.id} className="hover:bg-[#f8f9fa] dark:hover:bg-white/5 transition-colors">
                  <td className="py-3 pl-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={combo.img}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-[#e5eaef] dark:border-white/10 shrink-0 shadow-xs"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-[#11142d] dark:text-white text-xs truncate max-w-[200px]">
                          {combo.title}
                        </p>
                        <p className="text-[10px] font-mono text-[#0891b2] dark:text-cyan-400 mt-0.5">
                          {combo.kompasTourCode}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <p className="text-xs font-bold text-[#11142d] dark:text-white">{combo.routeSummary}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {combo.cities.map((ct) => (
                        <span key={ct} className="text-[10px] bg-[#e0f7fa] dark:bg-cyan-950/40 text-[#0891b2] dark:text-cyan-300 px-1.5 py-0.2 rounded border border-[#b2ebf2] dark:border-cyan-800/40">
                          {ct}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs font-bold text-[#11142d] dark:text-white">{combo.nightsSplit}</span>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Transferlar ichida</p>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-xs font-bold text-[#11142d] dark:text-white">{combo.airline}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-sm font-black text-[#0891b2] dark:text-cyan-400">${combo.price}</span>
                    {combo.oldPrice && (
                      <span className="text-[11px] line-through text-[#9993a3] block">
                        ${combo.oldPrice}
                      </span>
                    )}
                  </td>
                  <td className="py-3 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(combo)}
                        className="p-1.5 rounded-lg bg-[#f4f6f9] dark:bg-white/10 hover:bg-[#e0f7fa] dark:hover:bg-cyan-950/40 text-[#2a3547] dark:text-white hover:text-[#0891b2] transition-colors"
                        title="Tahrirlash"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(combo.id, combo.title)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5eaef] dark:border-white/10">
              <h3 className="text-lg font-black text-[#11142d] dark:text-white">
                {editingCombo ? "Combo Turni Tahrirlash" : "Yangi Combo Tur Qo'shish"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-[#f4f6f9] dark:bg-white/10 text-[#777e89] hover:text-[#11142d] dark:hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Combo Tur Nomi *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Istanbul + Kapadokya Combo Safari"
                  className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Marshrut Tavsifi</label>
                <input
                  type="text"
                  value={formRouteSummary}
                  onChange={(e) => setFormRouteSummary(e.target.value)}
                  placeholder="Toshkent ➔ Istanbul (3k) ➔ Kapadokya (4k) ➔ Toshkent"
                  className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Shaharlar (vergul bilan)</label>
                  <input
                    type="text"
                    value={formCities}
                    onChange={(e) => setFormCities(e.target.value)}
                    placeholder="Istanbul, Kapadokya"
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Kechalar Taqsimoti</label>
                  <input
                    type="text"
                    value={formNightsSplit}
                    onChange={(e) => setFormNightsSplit(e.target.value)}
                    placeholder="3 kecha Istanbul + 4 kecha Kapadokya"
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Narxi (USD) *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#0891b2] dark:text-cyan-400 rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 font-bold focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Eski Narxi</label>
                  <input
                    type="number"
                    value={formOldPrice}
                    onChange={(e) => setFormOldPrice(Number(e.target.value))}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Rasm Havolasi</label>
                <input
                  type="url"
                  value={formImg}
                  onChange={(e) => setFormImg(e.target.value)}
                  className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none"
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
