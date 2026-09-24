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
  const [formCities, setFormCities] = useState('Istanbul, Kapadokya');
  const [formNightsTotal, setFormNightsTotal] = useState(7);
  const [formNightsSplit, setFormNightsSplit] = useState('3 kecha Istanbul + 4 kecha Kapadokya');
  const [formPrice, setFormPrice] = useState(1290);
  const [formOldPrice, setFormOldPrice] = useState(1550);
  const [formAirline, setFormAirline] = useState('Uzbekistan Airways + Turkish Airlines');
  const [formFlight, setFormFlight] = useState('HY-271 & TK-2010');
  const [formImg, setFormImg] = useState('https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?w=800&auto=format&fit=crop&q=80');

  const openAddModal = () => {
    setEditingCombo(null);
    setFormTitle('');
    setFormRouteSummary('Toshkent ➔ Istanbul (3k) ➔ Kapadokya (4k) ➔ Toshkent');
    setFormCities('Istanbul, Kapadokya');
    setFormNightsTotal(7);
    setFormNightsSplit('3 kecha Istanbul + 4 kecha Kapadokya');
    setFormPrice(1290);
    setFormOldPrice(1550);
    setFormAirline('Uzbekistan Airways');
    setFormFlight('HY-271 & TK-2010');
    setFormImg('https://images.unsplash.com/photo-1641128324972-af3212f0f6bd?w=800&auto=format&fit=crop&q=80');
    setIsModalOpen(true);
  };

  const openEditModal = (c: ComboTour) => {
    setEditingCombo(c);
    setFormTitle(c.title);
    setFormRouteSummary(c.routeSummary);
    setFormCities(c.cities.join(', '));
    setFormNightsTotal(c.nightsTotal);
    setFormNightsSplit(c.nightsSplit);
    setFormPrice(c.price);
    setFormOldPrice(c.oldPrice || Math.round(c.price * 1.2));
    setFormAirline(c.airline);
    setFormFlight(c.flight);
    setFormImg(c.img);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      onShowToast("Iltimos, Combo tur nomini kiriting!", 'error');
      return;
    }

    const cityList = formCities.split(',').map(c => c.trim()).filter(Boolean);

    if (editingCombo) {
      const updated: ComboTour = {
        ...editingCombo,
        title: formTitle,
        routeSummary: formRouteSummary,
        cities: cityList,
        nightsTotal: formNightsTotal,
        nightsSplit: formNightsSplit,
        price: formPrice,
        oldPrice: formOldPrice > formPrice ? formOldPrice : undefined,
        airline: formAirline,
        flight: formFlight,
        img: formImg
      };
      onUpdateComboTour(updated);
      onShowToast(`"${formTitle}" combo turi yangilandi!`, 'success');
    } else {
      const newCombo: ComboTour = {
        id: `combo-adm-${Date.now()}`,
        title: formTitle,
        route: ['Toshkent', ...cityList, 'Toshkent'],
        routeSummary: formRouteSummary,
        cities: cityList,
        nightsTotal: formNightsTotal,
        nightsSplit: formNightsSplit,
        hotels: [
          { city: cityList[0] || 'Shahar 1', hotelName: 'Radisson Blu 5*', stars: '5★', nights: 3, meal: 'BB (Nonushta)' },
          { city: cityList[1] || 'Shahar 2', hotelName: 'Deluxe Cave Suites 5*', stars: '5★', nights: 4, meal: 'BB (Nonushta)' }
        ],
        transfersIncluded: true,
        excursionsIncluded: ["Shahar ekskursiyasi va VIP transfer", "Tarixiy obidalar sayri"],
        price: formPrice,
        oldPrice: formOldPrice > formPrice ? formOldPrice : undefined,
        departureCity: 'Toshkent (TAS)',
        departureDate: '2026-10-01',
        airline: formAirline,
        flight: formFlight,
        img: formImg,
        rating: 9.7,
        kompasTourCode: `KMP-CMB-${Math.floor(1000 + Math.random() * 9000)}`,
        itinerary: [
          { day: 1, title: `${cityList[0]}ga parvoz`, desc: "Yetib borish va 5* mehmonxonaga joylashish." },
          { day: 2, title: "Tarixiy markaz ekskursiyasi", desc: "Mashhur qadamjolar va diqqatga sazovor joylar sayohati." },
          { day: 4, title: `${cityList[1] || 'Keyingi shahar'}ga transfer`, desc: "Ichki qulay transfer va yangi shahar safari." }
        ]
      };
      onAddComboTour(newCombo);
      onShowToast(`Yangi "${formTitle}" combo turi katalogga qo'shildi!`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (!isMainAdmin && !currentAdmin.canDeleteTours) {
      onShowToast("Combo turlarni butunlay o'chirish faqat Bosh Admin huquqida!", 'error');
      return;
    }
    if (confirm(`"${title}" combo turini o'chirishni xohlaysizmi?`)) {
      onDeleteComboTour(id);
      onShowToast(`"${title}" o'chirildi!`, 'info');
    }
  };

  const filteredCombos = comboTours.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.routeSummary.toLowerCase().includes(search.toLowerCase()) ||
    c.cities.some(ct => ct.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>🔄</span> Combo Turlar Boshqaruvi ({comboTours.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Bitta sayohatda 2 yoki undan ko'p shaharlarni qamrab olgan kombinatsiyalangan turlar
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all shrink-0 tap-bounce"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Yangi Combo Qo'shish</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Combo tur yoki shaharlar bo'yicha qidiruv..."
            className="w-full bg-slate-800 text-slate-100 placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-700 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/80 border-b border-slate-800 text-slate-400 text-xs font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-4">Combo Tur</th>
                <th className="py-3.5">Marshrut & Shaharlar</th>
                <th className="py-3.5">Kechalar Taqsimoti</th>
                <th className="py-3.5">Aviakompaniya</th>
                <th className="py-3.5">Narx (USD)</th>
                <th className="py-3.5 pr-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCombos.map((combo) => (
                <tr key={combo.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pl-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={combo.img}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-white text-xs truncate max-w-[200px]">
                          {combo.title}
                        </p>
                        <p className="text-[10px] font-mono text-cyan-400 mt-0.5">
                          {combo.kompasTourCode}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <p className="text-xs font-bold text-slate-200">{combo.routeSummary}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {combo.cities.map((ct) => (
                        <span key={ct} className="text-[10px] bg-slate-800 text-cyan-300 px-1.5 py-0.2 rounded border border-slate-700">
                          {ct}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3">
                    <span className="text-xs font-bold text-purple-300">
                      {combo.nightsTotal} kecha jami
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">{combo.nightsSplit}</p>
                  </td>
                  <td className="py-3">
                    <p className="text-xs font-bold text-slate-200">{combo.airline}</p>
                    <p className="text-[10px] text-slate-400">{combo.flight}</p>
                  </td>
                  <td className="py-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-sm font-black text-emerald-400">${combo.price}</span>
                      {combo.oldPrice && (
                        <span className="text-[11px] line-through text-slate-400">
                          ${combo.oldPrice}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(combo)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400"
                        title="Tahrirlash"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(combo.id, combo.title)}
                        className={`p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 ${
                          isMainAdmin ? 'text-slate-300 hover:text-rose-400' : 'text-slate-500 cursor-not-allowed'
                        }`}
                        title={isMainAdmin ? "O'chirish" : "Faqat Bosh Admin"}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-black text-white">
                {editingCombo ? "Combo Turni Tahrirlash" : "Yangi Combo Tur Qo'shish"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Combo Tur Nomi *</label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Istanbul + Kapadokya Combo Safari"
                  className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Marshrut Tavsifi</label>
                <input
                  type="text"
                  value={formRouteSummary}
                  onChange={(e) => setFormRouteSummary(e.target.value)}
                  placeholder="Toshkent ➔ Istanbul (3k) ➔ Kapadokya (4k) ➔ Toshkent"
                  className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Shaharlar (vergul bilan)</label>
                  <input
                    type="text"
                    value={formCities}
                    onChange={(e) => setFormCities(e.target.value)}
                    placeholder="Istanbul, Kapadokya"
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Kechalar Taqsimoti</label>
                  <input
                    type="text"
                    value={formNightsSplit}
                    onChange={(e) => setFormNightsSplit(e.target.value)}
                    placeholder="3 kecha Istanbul + 4 kecha Kapadokya"
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Narxi (USD) *</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700 font-bold text-emerald-400 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Eski Narxi</label>
                  <input
                    type="number"
                    value={formOldPrice}
                    onChange={(e) => setFormOldPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700 focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">Rasm Havolasi</label>
                <input
                  type="url"
                  value={formImg}
                  onChange={(e) => setFormImg(e.target.value)}
                  className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700 focus:border-cyan-500 focus:outline-none"
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
