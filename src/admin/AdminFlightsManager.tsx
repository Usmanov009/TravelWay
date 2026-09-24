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
        id: `fl-adm-${Date.now()}`,
        airline: formAirline,
        airlineCode: formAirline.slice(0, 2).toUpperCase(),
        flightNumber: formFlightNumber,
        departureCity: formDepCity,
        departureAirportCode: formDepCode,
        arrivalCity: formArrCity,
        arrivalAirportCode: formArrCode,
        departureTime: formDepTime,
        arrivalTime: formArrTime,
        flightDuration: '4s 45d',
        departureDate: formDate,
        tripType: 'round_trip',
        flightType: 'direct',
        baggage: formBaggage,
        cabinClass: 'economy',
        seatsLeft: formSeatsLeft,
        price: formPrice,
        isCharter: formIsCharter,
        kompasFlightCode: `KMP-FL-${formFlightNumber}`
      };
      onAddFlight(newFlight);
      onShowToast(`Yangi reys "${formFlightNumber}" qo'shildi!`, 'success');
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, num: string) => {
    if (!isMainAdmin && !currentAdmin.canDeleteTours) {
      onShowToast("Reyslarni butunlay o'chirish faqat Bosh Admin huquqida!", 'error');
      return;
    }
    if (confirm(`"${num}" reysini o'chirishni tasdiqlaysizmi?`)) {
      onDeleteFlight(id);
      onShowToast(`"${num}" o'chirildi!`, 'info');
    }
  };

  const filtered = flights.filter(f =>
    f.flightNumber.toLowerCase().includes(search.toLowerCase()) ||
    f.airline.toLowerCase().includes(search.toLowerCase()) ||
    f.arrivalCity.toLowerCase().includes(search.toLowerCase()) ||
    f.departureCity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <span>✈️</span> Aviachiptalar Boshqaruvi ({flights.length})
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Charter va doimiy GDS reyslariga aviachiptalar savdosi
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/20 transition-all shrink-0 tap-bounce"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Yangi Reys Qo'shish</span>
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
            placeholder="Reys raqami, aviakompaniya yoki shahar..."
            className="w-full bg-slate-800 text-slate-100 placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-700 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/80 border-b border-slate-800 text-slate-400 text-xs font-extrabold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-4">Reys & Aviakompaniya</th>
                <th className="py-3.5">Yo'nalish</th>
                <th className="py-3.5">Vaqt & Sana</th>
                <th className="py-3.5">Bagaj & O'rin</th>
                <th className="py-3.5">Narx (USD)</th>
                <th className="py-3.5 pr-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 pl-4">
                    <p className="font-bold text-white text-xs">{f.flightNumber}</p>
                    <p className="text-[11px] text-cyan-400 font-semibold">{f.airline}</p>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">
                      {f.isCharter ? 'Charter' : 'Doimiy GDS'}
                    </span>
                  </td>
                  <td className="py-3">
                    <p className="text-xs font-bold text-slate-200">
                      {f.departureCity} ({f.departureAirportCode}) ➔ {f.arrivalCity} ({f.arrivalAirportCode})
                    </p>
                    <span className="text-[10px] text-emerald-400 font-semibold">To'g'ridan-to'g'ri</span>
                  </td>
                  <td className="py-3">
                    <p className="text-xs font-bold text-slate-200">{f.departureTime} – {f.arrivalTime}</p>
                    <p className="text-[10px] text-slate-400">{f.departureDate}</p>
                  </td>
                  <td className="py-3">
                    <p className="text-xs text-slate-300 font-bold">{f.baggage}</p>
                    <span className="text-[10px] font-bold text-amber-400">{f.seatsLeft} ta joy qoldi</span>
                  </td>
                  <td className="py-3">
                    <span className="text-sm font-black text-emerald-400">${f.price}</span>
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(f)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-400"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(f.id, f.flightNumber)}
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
                {editingFlight ? "Reysni Tahrirlash" : "Yangi Reys Qo'shish"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Aviakompaniya</label>
                  <input
                    type="text"
                    required
                    value={formAirline}
                    onChange={(e) => setFormAirline(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Reys Raqami</label>
                  <input
                    type="text"
                    required
                    value={formFlightNumber}
                    onChange={(e) => setFormFlightNumber(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Qayerdan</label>
                  <input
                    type="text"
                    value={formDepCity}
                    onChange={(e) => setFormDepCity(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Qayerga</label>
                  <input
                    type="text"
                    value={formArrCity}
                    onChange={(e) => setFormArrCity(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Uchish Vaqti</label>
                  <input
                    type="text"
                    value={formDepTime}
                    onChange={(e) => setFormDepTime(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Qo'nish Vaqti</label>
                  <input
                    type="text"
                    value={formArrTime}
                    onChange={(e) => setFormArrTime(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Narxi ($)</label>
                  <input
                    type="number"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 text-emerald-400 font-bold rounded-xl px-3 py-2 text-sm border border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Bagaj</label>
                  <input
                    type="text"
                    value={formBaggage}
                    onChange={(e) => setFormBaggage(e.target.value)}
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">Bo'sh O'rinlar</label>
                  <input
                    type="number"
                    value={formSeatsLeft}
                    onChange={(e) => setFormSeatsLeft(Number(e.target.value))}
                    className="w-full bg-slate-800 text-white rounded-xl px-3 py-2 text-sm border border-slate-700"
                  />
                </div>
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
