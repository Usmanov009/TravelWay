import React, { useState } from 'react';
import { FlightTicket } from '../types';
import { AdminRole, AdminUser } from './adminTypes';

interface AdminFlightsManagerProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  flights: FlightTicket[];
  onAddFlight: (flight: FlightTicket) => void;
  onUpdateFlight: (flight: FlightTicket) => void;
  onDeleteFlight: (flightId: string) => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminFlightsManager: React.FC<AdminFlightsManagerProps> = ({
  currentRole,
  currentAdmin,
  flights,
  onAddFlight,
  onUpdateFlight,
  onDeleteFlight,
  onShowToast
}) => {
  const isMainAdmin = currentRole === 'main_admin';
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightTicket | null>(null);

  // Form
  const [formAirline, setFormAirline] = useState('Uzbekistan Airways');
  const [formFlightNumber, setFormFlightNumber] = useState('HY-271');
  const [formDepCity, setFormDepCity] = useState('Toshkent');
  const [formDepCode, setFormDepCode] = useState('TAS');
  const [formArrCity, setFormArrCity] = useState('Istanbul');
  const [formArrCode, setFormArrCode] = useState('IST');
  const [formDepTime, setFormDepTime] = useState('08:30');
  const [formArrTime, setFormArrTime] = useState('11:50');
  const [formDate, setFormDate] = useState('2026-09-28');
  const [formPrice, setFormPrice] = useState(380);
  const [formBaggage, setFormBaggage] = useState('23 kg + 8 kg');
  const [formSeatsLeft, setFormSeatsLeft] = useState(9);
  const [formIsCharter, setFormIsCharter] = useState(true);

  const openAddModal = () => {
    setEditingFlight(null);
    setFormAirline('Uzbekistan Airways');
    setFormFlightNumber('HY-271');
    setFormDepCity('Toshkent');
    setFormDepCode('TAS');
    setFormArrCity('Antalya');
    setFormArrCode('AYT');
    setFormDepTime('07:00');
    setFormArrTime('10:15');
    setFormDate('2026-10-05');
    setFormPrice(320);
    setFormBaggage('20 kg + 7 kg');
    setFormSeatsLeft(14);
    setFormIsCharter(true);
    setIsModalOpen(true);
  };

  const openEditModal = (f: FlightTicket) => {
    setEditingFlight(f);
    setFormAirline(f.airline);
    setFormFlightNumber(f.flightNumber);
    setFormDepCity(f.departureCity);
    setFormDepCode(f.departureAirportCode);
    setFormArrCity(f.arrivalCity);
    setFormArrCode(f.arrivalAirportCode);
    setFormDepTime(f.departureTime);
    setFormArrTime(f.arrivalTime);
    setFormDate(f.departureDate);
    setFormPrice(f.price);
    setFormBaggage(f.baggage);
    setFormSeatsLeft(f.seatsLeft);
    setFormIsCharter(f.isCharter);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFlightNumber.trim()) {
      onShowToast("Reys raqamini kiriting!", 'error');
      return;
    }

    if (editingFlight) {
      const updated: FlightTicket = {
        ...editingFlight,
        airline: formAirline,
        flightNumber: formFlightNumber,
        departureCity: formDepCity,
        departureAirportCode: formDepCode,
        arrivalCity: formArrCity,
        arrivalAirportCode: formArrCode,
        departureTime: formDepTime,
        arrivalTime: formArrTime,
        departureDate: formDate,
        price: formPrice,
        baggage: formBaggage,
        seatsLeft: formSeatsLeft,
        isCharter: formIsCharter
      };
      onUpdateFlight(updated);
      onShowToast(`"${formFlightNumber}" reysi yangilandi!`, 'success');
    } else {
      const newFlight: FlightTicket = {
        id: `fl-${Date.now()}`,
        airline: formAirline,
        flightNumber: formFlightNumber,
        departureCity: formDepCity,
        departureAirportCode: formDepCode,
        arrivalCity: formArrCity,
        arrivalAirportCode: formArrCode,
        departureTime: formDepTime,
        arrivalTime: formArrTime,
        departureDate: formDate,
        price: formPrice,
        baggage: formBaggage,
        seatsLeft: formSeatsLeft,
        isCharter: formIsCharter,
        cabinClass: 'Ekonom'
      };
      onAddFlight(newFlight);
      onShowToast(`Yangi "${formFlightNumber}" reysi qo'shildi!`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, flightNumber: string) => {
    if (!isMainAdmin && !currentAdmin.canDeleteTours) {
      onShowToast("Reyslarni o'chirish faqat Bosh Admin huquqida!", 'error');
      return;
    }
    if (confirm(`"${flightNumber}" reysini jadvaldan o'chirmoqchimisiz?`)) {
      onDeleteFlight(id);
      onShowToast(`"${flightNumber}" o'chirildi!`, 'info');
    }
  };

  const filtered = flights.filter((f) =>
    f.flightNumber.toLowerCase().includes(search.toLowerCase()) ||
    f.airline.toLowerCase().includes(search.toLowerCase()) ||
    f.arrivalCity.toLowerCase().includes(search.toLowerCase()) ||
    f.departureCity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#11142d] dark:text-white flex items-center gap-2">
            <span>✈️</span> Aviachiptalar Boshqaruvi ({flights.length})
          </h2>
          <p className="text-xs text-[#777e89] dark:text-[#a39db0] mt-0.5">
            Charter va doimiy GDS reyslariga aviachiptalar savdosi
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0891b2] hover:bg-[#0e7490] text-white font-extrabold text-xs shadow-md shadow-[#0891b2]/20 transition-all shrink-0 tap-bounce"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Yangi Reys Qo'shish</span>
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
            placeholder="Reys raqami, aviakompaniya yoki shahar..."
            className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white placeholder-[#777e89] dark:placeholder-[#726c7f] pl-9 pr-3 py-2 rounded-xl text-xs border border-transparent focus:border-[#0891b2] focus:bg-white dark:focus:bg-[#1e1a23] focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-[#1e1a23] rounded-2xl border border-[#e5eaef] dark:border-white/10 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fafbfb] dark:bg-white/5 border-b border-[#e5eaef] dark:border-white/10 text-[#777e89] dark:text-[#a39db0] text-[10px] font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5">Reys & Aviakompaniya</th>
                <th className="py-3.5 px-3">Yo'nalish</th>
                <th className="py-3.5 px-3">Vaqt & Sana</th>
                <th className="py-3.5 px-3">Bagaj & O'rin</th>
                <th className="py-3.5 px-3">Narx (USD)</th>
                <th className="py-3.5 pr-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f6f9] dark:divide-white/5 text-[#2a3547] dark:text-[#faf9fb]">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-[#f8f9fa] dark:hover:bg-white/5 transition-colors">
                  <td className="py-3.5 pl-5">
                    <p className="font-bold text-[#11142d] dark:text-white text-xs">{f.flightNumber}</p>
                    <p className="text-[11px] text-[#0891b2] dark:text-cyan-400 font-semibold">{f.airline}</p>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#e0f7fa] dark:bg-cyan-950/40 text-[#0891b2] dark:text-cyan-300 font-medium">
                      {f.isCharter ? 'Charter' : 'Doimiy GDS'}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="text-xs font-bold text-[#11142d] dark:text-white">
                      {f.departureCity} ({f.departureAirportCode}) ➔ {f.arrivalCity} ({f.arrivalAirportCode})
                    </p>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">To'g'ridan-to'g'ri</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="text-xs font-bold text-[#11142d] dark:text-white">{f.departureTime} – {f.arrivalTime}</p>
                    <p className="text-[10px] text-[#777e89] dark:text-[#a39db0]">{f.departureDate}</p>
                  </td>
                  <td className="py-3.5 px-3">
                    <p className="text-xs text-[#2a3547] dark:text-white font-bold">{f.baggage}</p>
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">{f.seatsLeft} ta joy qoldi</span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-sm font-black text-[#0891b2] dark:text-cyan-400">${f.price}</span>
                  </td>
                  <td className="py-3.5 pr-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(f)}
                        className="p-1.5 rounded-lg bg-[#f4f6f9] dark:bg-white/10 hover:bg-[#e0f7fa] dark:hover:bg-cyan-950/40 text-[#2a3547] dark:text-white hover:text-[#0891b2]"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(f.id, f.flightNumber)}
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
                {editingFlight ? "Reysni Tahrirlash" : "Yangi Reys Qo'shish"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#777e89] hover:text-[#11142d] dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Aviakompaniya</label>
                  <input
                    type="text"
                    required
                    value={formAirline}
                    onChange={(e) => setFormAirline(e.target.value)}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Reys Raqami</label>
                  <input
                    type="text"
                    required
                    value={formFlightNumber}
                    onChange={(e) => setFormFlightNumber(e.target.value)}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 focus:border-[#0891b2] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Uchish Shahri (Kodi)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formDepCity}
                      onChange={(e) => setFormDepCity(e.target.value)}
                      placeholder="Toshkent"
                      className="w-2/3 bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700"
                    />
                    <input
                      type="text"
                      value={formDepCode}
                      onChange={(e) => setFormDepCode(e.target.value)}
                      placeholder="TAS"
                      className="w-1/3 bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-2 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 uppercase"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Qo'nish Shahri (Kodi)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formArrCity}
                      onChange={(e) => setFormArrCity(e.target.value)}
                      placeholder="Antalya"
                      className="w-2/3 bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700"
                    />
                    <input
                      type="text"
                      value={formArrCode}
                      onChange={(e) => setFormArrCode(e.target.value)}
                      placeholder="AYT"
                      className="w-1/3 bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-2 py-2 text-sm border border-[#e5eaef] dark:border-slate-700 uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Uchish Vaqti</label>
                  <input
                    type="time"
                    value={formDepTime}
                    onChange={(e) => setFormDepTime(e.target.value)}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-2 py-2 text-sm border border-[#e5eaef] dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Qo'nish Vaqti</label>
                  <input
                    type="time"
                    value={formArrTime}
                    onChange={(e) => setFormArrTime(e.target.value)}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-2 py-2 text-sm border border-[#e5eaef] dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Sana</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-2 py-2 text-sm border border-[#e5eaef] dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Narxi ($)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#0891b2] dark:text-cyan-400 font-bold rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#777e89] dark:text-[#a39db0] block mb-1">Bagaj</label>
                  <input
                    type="text"
                    value={formBaggage}
                    onChange={(e) => setFormBaggage(e.target.value)}
                    placeholder="20 kg + 7 kg"
                    className="w-full bg-[#f4f6f9] dark:bg-white/5 text-[#11142d] dark:text-white rounded-xl px-3 py-2 text-sm border border-[#e5eaef] dark:border-slate-700"
                  />
                </div>
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
