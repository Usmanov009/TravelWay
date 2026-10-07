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
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  globalSearch?: string;
}

export const AdminFlightsManager: React.FC<AdminFlightsManagerProps> = ({
  currentRole,
  currentAdmin,
  flights,
  onAddFlight,
  onUpdateFlight,
  onDeleteFlight,
  onShowToast,
  globalSearch = ''
}) => {
  const isMainAdmin = currentRole === 'main_admin';
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'CHARTER' | 'REGULAR'>('ALL');
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

  const handleDuplicateFlight = (f: FlightTicket) => {
    const duplicated: FlightTicket = {
      ...f,
      id: `fl-${Date.now()}`,
      flightNumber: `${f.flightNumber}-N`
    };
    onAddFlight(duplicated);
    onShowToast(`"${f.flightNumber}" reysi nusxalandi! 📋`, 'success');
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
        airlineCode: formAirline.includes('Uzbekistan') ? 'HY' : 'TK',
        flightNumber: formFlightNumber,
        departureCity: formDepCity,
        departureAirportCode: formDepCode,
        arrivalCity: formArrCity,
        arrivalAirportCode: formArrCode,
        departureTime: formDepTime,
        arrivalTime: formArrTime,
        flightDuration: '4s 30m',
        departureDate: formDate,
        tripType: 'round_trip',
        flightType: 'direct',
        price: formPrice,
        baggage: formBaggage,
        seatsLeft: formSeatsLeft,
        isCharter: formIsCharter,
        cabinClass: 'economy',
        kompasFlightCode: `GDS-${formFlightNumber}`
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

  const effectiveSearch = (search || globalSearch).trim().toLowerCase();

  const filtered = flights.filter((f) => {
    const matchSearch =
      !effectiveSearch ||
      f.flightNumber.toLowerCase().includes(effectiveSearch) ||
      f.airline.toLowerCase().includes(effectiveSearch) ||
      f.arrivalCity.toLowerCase().includes(effectiveSearch) ||
      f.departureCity.toLowerCase().includes(effectiveSearch);

    const matchType =
      filterType === 'ALL' ||
      (filterType === 'CHARTER' && f.isCharter) ||
      (filterType === 'REGULAR' && !f.isCharter);

    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>✈️</span> Aviachiptalar & Charter Reyslar ({flights.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Charter va doimiy GDS reyslariga aviachiptalar savdosi va o'rinlar nazorati
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs transition-all shrink-0 tap-bounce"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Yangi Reys Qo'shish</span>
        </button>
      </div>

      {/* 2. Filter Pills & Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'ALL'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Barcha Reyslar
          </button>
          <button
            onClick={() => setFilterType('CHARTER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'CHARTER'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Faqat Charter
          </button>
          <button
            onClick={() => setFilterType('REGULAR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'REGULAR'
                ? 'bg-sky-600 text-white shadow-2xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Doimiy Reyslar
          </button>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Reys raqami, aviakompaniya yoki shahar..."
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

      {/* 3. Flights Table */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-400 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5">Reys & Aviakompaniya</th>
                <th className="py-3.5 px-3">Yo'nalish</th>
                <th className="py-3.5 px-3">Vaqt & Sana</th>
                <th className="py-3.5 px-3">Bagaj & O'rin</th>
                <th className="py-3.5 px-3">Narx (USD)</th>
                <th className="py-3.5 pr-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                    Hech qanday aviachipta topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-5">
                      <p className="font-bold text-slate-900 dark:text-white text-xs">{f.flightNumber}</p>
                      <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">{f.airline}</p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 font-medium border border-sky-200/60 dark:border-sky-800/50">
                        {f.isCharter ? 'Charter' : 'Doimiy GDS'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {f.departureCity} ({f.departureAirportCode}) ➔ {f.arrivalCity} ({f.arrivalAirportCode})
                      </p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">To'g'ridan-to'g'ri</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{f.departureTime} – {f.arrivalTime}</p>
                      <p className="text-[10px] text-slate-400">{f.departureDate}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{f.baggage}</p>
                      {f.seatsLeft <= 3 ? (
                        <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-800/50">
                          Faqat {f.seatsLeft} ta joy qoldi!
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                          {f.seatsLeft} ta joy qoldi
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="text-sm font-bold font-mono text-sky-600 dark:text-sky-400">${f.price}</span>
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDuplicateFlight(f)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 hover:text-sky-600 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Nusxalash"
                        >
                          <span className="material-symbols-outlined text-[17px]">content_copy</span>
                        </button>
                        <button
                          onClick={() => openEditModal(f)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 hover:text-sky-600 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Tahrirlash"
                        >
                          <span className="material-symbols-outlined text-[17px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(f.id, f.flightNumber)}
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

      {/* 4. MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>✈️</span>
                <span>{editingFlight ? 'Reysni Tahrirlash' : "Yangi Reys Qo'shish"}</span>
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
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Aviakompaniya</label>
                  <input
                    type="text"
                    required
                    value={formAirline}
                    onChange={(e) => setFormAirline(e.target.value)}
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Reys Raqami *</label>
                  <input
                    type="text"
                    required
                    value={formFlightNumber}
                    onChange={(e) => setFormFlightNumber(e.target.value)}
                    placeholder="HY-271"
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Uchish Shahri (Kodi)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formDepCity}
                      onChange={(e) => setFormDepCity(e.target.value)}
                      placeholder="Toshkent"
                      className="w-2/3 bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={formDepCode}
                      onChange={(e) => setFormDepCode(e.target.value)}
                      placeholder="TAS"
                      className="w-1/3 bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-2 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Qo'nish Shahri (Kodi)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formArrCity}
                      onChange={(e) => setFormArrCity(e.target.value)}
                      placeholder="Istanbul"
                      className="w-2/3 bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={formArrCode}
                      onChange={(e) => setFormArrCode(e.target.value)}
                      placeholder="IST"
                      className="w-1/3 bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-2 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Uchish & Qo'nish Vaqti</label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      value={formDepTime}
                      onChange={(e) => setFormDepTime(e.target.value)}
                      className="w-1/2 bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-2 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                    />
                    <input
                      type="time"
                      value={formArrTime}
                      onChange={(e) => setFormArrTime(e.target.value)}
                      className="w-1/2 bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-2 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Parvoz Sanasi</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Chipta Narxi ($)</label>
                  <input
                    type="number"
                    min="1"
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none font-bold text-sky-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Qolgan Joylar Soni</label>
                  <input
                    type="number"
                    min="0"
                    value={formSeatsLeft}
                    onChange={(e) => setFormSeatsLeft(Number(e.target.value))}
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">Bagaj Ma'lumoti</label>
                  <input
                    type="text"
                    value={formBaggage}
                    onChange={(e) => setFormBaggage(e.target.value)}
                    placeholder="23 kg + 8 kg"
                    className="w-full bg-slate-100/90 dark:bg-slate-800/80 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={formIsCharter}
                      onChange={(e) => setFormIsCharter(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500"
                    />
                    <span>Charter Reys (Blok o'rinlar)</span>
                  </label>
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
                  {editingFlight ? 'Yangilashni Saqlash' : "Reysni Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
