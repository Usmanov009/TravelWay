import React, { useState } from 'react';
import { FlightTicket } from '../types';
import { AdminRole, AdminUser } from './adminTypes';
import { PriceMarkupModal } from './PriceMarkupModal';
import { Briefcase, DollarSign, Plane, PlaneLanding, PlaneTakeoff, Pencil, RefreshCw } from '@/lib/flaticon-icons';

interface AdminFlightsManagerProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  flights: FlightTicket[];
  onAddFlight: (flight: FlightTicket) => Promise<void>;
  onUpdateFlight: (flight: FlightTicket) => Promise<void>;
  onDeleteFlight: (flightId: string) => Promise<void>;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  globalSearch?: string;
  agencyCommissionRate?: number;
  onUpdateCommissionRate?: (rate: number) => Promise<void>;
}

export const AdminFlightsManager: React.FC<AdminFlightsManagerProps> = ({
  currentRole,
  currentAdmin,
  flights,
  onAddFlight,
  onUpdateFlight,
  onDeleteFlight,
  onShowToast,
  globalSearch = '',
  agencyCommissionRate = 0,
  onUpdateCommissionRate
}) => {
  const isMainAdmin = currentRole === 'main_admin';
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'CHARTER' | 'REGULAR'>('ALL');
  const [selectedDepCity, setSelectedDepCity] = useState('ALL');
  const [selectedArrCity, setSelectedArrCity] = useState('ALL');
  const [selectedAirline, setSelectedAirline] = useState('ALL');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(99999);
  const [markupModalFlight, setMarkupModalFlight] = useState<FlightTicket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightTicket | null>(null);

  // Form
  const [formAirline, setFormAirline] = useState('');
  const [formFlightNumber, setFormFlightNumber] = useState('');
  const [formDepCity, setFormDepCity] = useState('');
  const [formDepCode, setFormDepCode] = useState('');
  const [formArrCity, setFormArrCity] = useState('');
  const [formArrCode, setFormArrCode] = useState('');
  const [formDepTime, setFormDepTime] = useState('');
  const [formArrTime, setFormArrTime] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formPrice, setFormPrice] = useState(0);
  const [formBaggage, setFormBaggage] = useState('');
  const [formSeatsLeft, setFormSeatsLeft] = useState(0);
  const [formIsCharter, setFormIsCharter] = useState(false);

  const openAddModal = () => {
    setEditingFlight(null);
    setFormAirline('');
    setFormFlightNumber('');
    setFormDepCity('');
    setFormDepCode('');
    setFormArrCity('');
    setFormArrCode('');
    setFormDepTime('');
    setFormArrTime('');
    setFormDate('');
    setFormPrice(0);
    setFormBaggage('');
    setFormSeatsLeft(0);
    setFormIsCharter(false);
    setIsModalOpen(true);
  };

  const openEditModal = (f: FlightTicket) => {
    setEditingFlight(f);
    setFormAirline(f.airline);
    setFormFlightNumber(f.flightNumber);
    setFormDepCity(f.departureCity || '');
    setFormDepCode(f.departureAirportCode || '');
    setFormArrCity(f.arrivalCity || '');
    setFormArrCode(f.arrivalAirportCode || '');
    setFormDepTime(f.departureTime || '');
    setFormArrTime(f.arrivalTime || '');
    setFormDate(f.departureDate || '');
    setFormPrice(f.price);
    setFormBaggage(f.baggage || '');
    setFormSeatsLeft(f.seatsLeft);
    setFormIsCharter(f.isCharter);
    setIsModalOpen(true);
  };

  const handleDuplicateFlight = async (f: FlightTicket) => {
    const duplicated: FlightTicket = {
      ...f,
      id: `fl-${Date.now()}`,
      flightNumber: `${f.flightNumber}-N`
    };
    try {
      await onAddFlight(duplicated);
      onShowToast(`"${f.flightNumber}" reysi nusxalandi!`, 'success');
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Reysni nusxalab bo‘lmadi.', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFlightNumber.trim()) {
      onShowToast("Reys raqamini kiriting!", 'error');
      return;
    }
    if (!formAirline.trim() || !formDepCity.trim() || !formDepCode.trim() || !formArrCity.trim() ||
      !formArrCode.trim() || !formDepTime || !formArrTime || !formDate || formPrice <= 0 ||
      !formBaggage.trim()) {
      onShowToast("Reys ma’lumotlarining barcha majburiy maydonlarini to‘ldiring.", 'error');
      return;
    }

    try {
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
      await onUpdateFlight(updated);
      onShowToast(`"${formFlightNumber}" reysi yangilandi!`, 'success');
    } else {
      const newFlight: FlightTicket = {
        id: `fl-${Date.now()}`,
        airline: formAirline,
        airlineCode: '',
        flightNumber: formFlightNumber,
        departureCity: formDepCity,
        departureAirportCode: formDepCode,
        arrivalCity: formArrCity,
        arrivalAirportCode: formArrCode,
        departureTime: formDepTime,
        arrivalTime: formArrTime,
        flightDuration: '',
        departureDate: formDate,
        tripType: 'round_trip',
        flightType: 'direct',
        price: formPrice,
        baggage: formBaggage,
        seatsLeft: formSeatsLeft,
        isCharter: formIsCharter,
        cabinClass: 'economy',
        kompasFlightCode: ''
      };
      await onAddFlight(newFlight);
      onShowToast(`Yangi "${formFlightNumber}" reysi qo'shildi!`, 'success');
    }

    setIsModalOpen(false);
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Reysni saqlab bo‘lmadi.', 'error');
    }
  };

  const handleSaveMarkup = async (newPrice: number, markupType: 'percent' | 'manual', markupValue: number): Promise<boolean> => {
    if (!markupModalFlight) return false;
    const originalCost = markupModalFlight.originalCostPrice ?? markupModalFlight.price;

    const updated: FlightTicket = {
      ...markupModalFlight,
      price: newPrice,
      originalCostPrice: originalCost,
      markupType,
      markupValue,
      tourOperator: markupModalFlight.tourOperator,
      agencyName: markupModalFlight.agencyName
    };

    try {
    await onUpdateFlight(updated);
    onShowToast(`"${updated.flightNumber}" reysi narxi $${newPrice} qilib belgilandi!`, 'success');
    setMarkupModalFlight(null);
    return true;
    } catch (error) {
      onShowToast(error instanceof Error ? error.message : 'Reys narxini saqlab bo‘lmadi.', 'error');
      return false;
    }
  };

  const handleDelete = async (id: string, flightNumber: string) => {
    if (!isMainAdmin && !currentAdmin.canDeleteTours) {
      onShowToast("Reyslarni o'chirish faqat Bosh Admin huquqida!", 'error');
      return;
    }
    if (confirm(`"${flightNumber}" reysini jadvaldan o'chirmoqchimisiz?`)) {
      try {
        await onDeleteFlight(id);
        onShowToast(`"${flightNumber}" o'chirildi!`, 'info');
      } catch (error) {
        onShowToast(error instanceof Error ? error.message : 'Reysni o‘chirib bo‘lmadi.', 'error');
      }
    }
  };

  const effectiveSearch = (search || globalSearch).trim().toLowerCase();

  const filtered = flights.filter((f) => {
    const matchSearch =
      !effectiveSearch ||
      f.flightNumber.toLowerCase().includes(effectiveSearch) ||
      f.airline.toLowerCase().includes(effectiveSearch) ||
      f.arrivalCity.toLowerCase().includes(effectiveSearch) ||
      f.departureCity.toLowerCase().includes(effectiveSearch) ||
      (f.kompasFlightCode && f.kompasFlightCode.toLowerCase().includes(effectiveSearch));

    const matchType =
      filterType === 'ALL' ||
      (filterType === 'CHARTER' && f.isCharter) ||
      (filterType === 'REGULAR' && !f.isCharter);

    const matchDep = selectedDepCity === 'ALL' || f.departureCity.toLowerCase().includes(selectedDepCity.toLowerCase());
    const matchArr = selectedArrCity === 'ALL' || f.arrivalCity.toLowerCase().includes(selectedArrCity.toLowerCase());
    const matchAirline = selectedAirline === 'ALL' || f.airline.toLowerCase().includes(selectedAirline.toLowerCase());
    const matchPrice = f.price >= minPrice && f.price <= maxPrice;

    return matchSearch && matchType && matchDep && matchArr && matchAirline && matchPrice;
  });

  const resetFilters = () => {
    setFilterType('ALL');
    setSelectedDepCity('ALL');
    setSelectedArrCity('ALL');
    setSelectedAirline('ALL');
    setMinPrice(0);
    setMaxPrice(99999);
    setSearch('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Plane aria-hidden="true" className="h-4 w-4" /> Aviachiptalar & Charter Reyslar ({flights.length})
            </h2>
            <span className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 text-[10px] px-2.5 py-1 rounded-full font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>MongoDB katalogi</span>
            </span>

            {/* Active Commission Badge */}
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-200 text-[11px] px-3 py-1 rounded-full font-bold">
              <Briefcase aria-hidden="true" className="h-3 w-3" /> Komissiya:
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{agencyCommissionRate}%</span>
              {onUpdateCommissionRate && (
                <button
                  type="button"
                  onClick={() => {
                    const input = prompt("Yangi umumiy agentlik komissiyasi foizini kiriting (0 - 100%):", String(agencyCommissionRate));
                    if (input !== null) {
                      const val = Number(input);
                      if (!isNaN(val) && val >= 0 && val <= 100) {
                        void onUpdateCommissionRate(val).catch((error) =>
                          onShowToast(error instanceof Error ? error.message : 'Komissiyani saqlab bo‘lmadi.', 'error')
                        );
                      }
                    }
                  }}
                  className="ml-1 text-[10px] underline hover:text-amber-900 dark:hover:text-amber-100 cursor-pointer"
                >
                  <Pencil aria-hidden="true" className="inline h-3 w-3" /> O'zgartirish
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Charter va doimiy GDS reyslariga aviachiptalar savdosi • Komissiya: {agencyCommissionRate}%
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-all shrink-0 tap-bounce cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Yangi Reys</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Pills & Search */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-zinc-200/90 dark:border-zinc-800 shadow-2xs space-y-3">
        {/* Header and Reset */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
              Aviachiptalar Filtrlari
            </span>
            <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
              {filtered.length} ta natija
            </span>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RefreshCw aria-hidden="true" className="h-3 w-3" /> Filtrlarni tozalash
          </button>
        </div>

        {/* Flight Type and Departure / Arrival Cities */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Flight Type */}
          <div>
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1">
              <Plane aria-hidden="true" className="inline h-3 w-3" /> Reys turi:
            </span>
            <div className="flex items-center gap-1">
              {[
                { code: 'ALL', label: 'Barchasi' },
                { code: 'CHARTER', label: 'Charter' },
                { code: 'REGULAR', label: 'Doimiy' }
              ].map((t) => (
                <button
                  key={t.code}
                  type="button"
                  onClick={() => setFilterType(t.code as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    filterType === t.code
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Departure City */}
          <div>
            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1">
              <PlaneTakeoff aria-hidden="true" className="inline h-3 w-3" /> Uchish shahri:
            </label>
            <select
              value={selectedDepCity}
              onChange={(e) => setSelectedDepCity(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Barchasi</option>
              <option value="Toshkent">Toshkent (TAS)</option>
              <option value="Samarqand">Samarqand (SKD)</option>
              <option value="Namangan">Namangan (NMA)</option>
              <option value="Buxoro">Buxoro (BHK)</option>
            </select>
          </div>

          {/* Arrival City */}
          <div>
            <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block mb-1">
              <PlaneLanding aria-hidden="true" className="inline h-3 w-3" /> Qo'nish shahri / Kurort:
            </label>
            <select
              value={selectedArrCity}
              onChange={(e) => setSelectedArrCity(e.target.value)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Barcha shaharlar</option>
              <option value="Antalya">Antalya (AYT)</option>
              <option value="Istanbul">Istanbul (IST)</option>
              <option value="Dubay">Dubay (DXB)</option>
              <option value="Sharm">Sharm El-Sheikh (SSH)</option>
              <option value="Phuket">Phuket (HKT)</option>
            </select>
          </div>
        </div>

        {/* Search, Airline, and Price Range */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="relative w-full sm:max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-[18px]">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Reys raqami, aviakompaniya yoki shahar..."
              className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white placeholder-slate-400 pl-9 pr-7 py-2 rounded-xl text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 w-full sm:w-auto">
            <span className="font-semibold shrink-0 inline-flex items-center gap-1"><DollarSign aria-hidden="true" className="h-3 w-3" /> Narx ($):</span>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={minPrice === 0 ? '' : minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
              className="w-18 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-2 py-1.5 rounded-lg text-xs font-mono text-center border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-indigo-500"
            />
            <span>—</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={maxPrice === 99999 ? '' : maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value) || 99999)}
              className="w-20 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-2 py-1.5 rounded-lg text-xs font-mono text-center border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 3. Flights Table */}
      <div className="bg-card rounded-2xl border border-zinc-200/90 dark:border-zinc-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-400 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 pl-5">Reys & Aviakompaniya</th>
                <th className="py-3.5 px-3">Yo'nalish</th>
                <th className="py-3.5 px-3">Vaqt & Sana</th>
                <th className="py-3.5 px-3">Bagaj & O'rin</th>
                <th className="py-3.5 px-3">Narx (USD)</th>
                <th className="py-3.5 pr-5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-zinc-800 dark:text-zinc-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-zinc-400">
                    Hech qanday aviachipta topilmadi
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr key={f.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="py-3.5 pl-5">
                      <p className="font-bold text-zinc-900 dark:text-white text-xs">{f.flightNumber}</p>
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">{f.airline}</p>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-medium border border-indigo-200/60 dark:border-indigo-800/50">
                        {f.isCharter ? 'Charter' : 'Doimiy GDS'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                        {f.departureCity} ({f.departureAirportCode}) ➔ {f.arrivalCity} ({f.arrivalAirportCode})
                      </p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">To'g'ridan-to'g'ri</span>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{f.departureTime} – {f.arrivalTime}</p>
                      <p className="text-[10px] text-zinc-400">{f.departureDate}</p>
                    </td>
                    <td className="py-3.5 px-3">
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">{f.baggage}</p>
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
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-zinc-400">Asl (Kompas):</span>
                          <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                            ${f.originalCostPrice ?? f.price}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                            {f.markupType === 'manual' ? "Qo'lda:" : "Ustama:"}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            {f.markupType === 'manual'
                              ? `$${f.price}`
                              : `+${f.markupValue ?? agencyCommissionRate}%`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400">Mijozga:</span>
                          <span className="text-sm font-black font-mono text-indigo-600 dark:text-indigo-400">
                            ${f.price}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setMarkupModalFlight(f)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 transition-colors border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 text-xs font-bold cursor-pointer"
                          title="Narxni sozlash (% ustama yoki qo'lda kiritish)"
                        >
                          <DollarSign aria-hidden="true" className="h-3 w-3" />
                          <span className="text-[11px]">Narx</span>
                        </button>
                        <button
                          onClick={() => handleDuplicateFlight(f)}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-600 dark:text-zinc-300 transition-colors"
                          title="Nusxalash"
                        >
                          <span className="material-symbols-outlined text-[17px]">content_copy</span>
                        </button>
                        <button
                          onClick={() => openEditModal(f)}
                          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 hover:text-indigo-600 text-zinc-600 dark:text-zinc-300 transition-colors"
                          title="Tahrirlash"
                        >
                          <span className="material-symbols-outlined text-[17px]">edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(f.id, f.flightNumber)}
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

      {/* 4. MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-card border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Plane aria-hidden="true" className="h-4 w-4" />
                <span>{editingFlight ? 'Reysni Tahrirlash' : "Yangi Reys Qo'shish"}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Aviakompaniya</label>
                  <input
                    type="text"
                    required
                    value={formAirline}
                    onChange={(e) => setFormAirline(e.target.value)}
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Reys Raqami *</label>
                  <input
                    type="text"
                    required
                    value={formFlightNumber}
                    onChange={(e) => setFormFlightNumber(e.target.value)}
                    placeholder="HY-271"
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Uchish Shahri (Kodi)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formDepCity}
                      onChange={(e) => setFormDepCity(e.target.value)}
                      placeholder="Toshkent"
                      className="w-2/3 bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      value={formDepCode}
                      onChange={(e) => setFormDepCode(e.target.value)}
                      placeholder="TAS"
                      className="w-1/3 bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-2 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Qo'nish Shahri (Kodi)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={formArrCity}
                      onChange={(e) => setFormArrCity(e.target.value)}
                      placeholder="Istanbul"
                      className="w-2/3 bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                    />
                    <input
                      type="text"
                      required
                      value={formArrCode}
                      onChange={(e) => setFormArrCode(e.target.value)}
                      placeholder="IST"
                      className="w-1/3 bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-2 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Uchish & Qo'nish Vaqti</label>
                  <div className="flex gap-2">
                    <input
                      type="time"
                      required
                      value={formDepTime}
                      onChange={(e) => setFormDepTime(e.target.value)}
                      className="w-1/2 bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-2 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                    />
                    <input
                      type="time"
                      required
                      value={formArrTime}
                      onChange={(e) => setFormArrTime(e.target.value)}
                      className="w-1/2 bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-2 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Parvoz Sanasi</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Chipta Narxi ($)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none font-bold text-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Qolgan Joylar Soni</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formSeatsLeft}
                    onChange={(e) => setFormSeatsLeft(Number(e.target.value))}
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">Bagaj Ma'lumoti</label>
                  <input
                    type="text"
                    required
                    value={formBaggage}
                    onChange={(e) => setFormBaggage(e.target.value)}
                    placeholder="23 kg + 8 kg"
                    className="w-full bg-zinc-100/90 dark:bg-zinc-800/80 text-zinc-900 dark:text-white rounded-xl px-3 py-2 text-xs border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={formIsCharter}
                      onChange={(e) => setFormIsCharter(e.target.checked)}
                      className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Charter Reys (Blok o'rinlar)</span>
                  </label>
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
                  {editingFlight ? 'Yangilashni Saqlash' : "Reysni Qo'shish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRICE & MARKUP MODAL */}
      {markupModalFlight && (
        <PriceMarkupModal
          isOpen={!!markupModalFlight}
          onClose={() => setMarkupModalFlight(null)}
          itemTitle={`${markupModalFlight.airline} (${markupModalFlight.flightNumber})`}
          itemSubtitle={`${markupModalFlight.departureCity} (${markupModalFlight.departureAirportCode}) ➔ ${markupModalFlight.arrivalCity} (${markupModalFlight.arrivalAirportCode})`}
          originalCostPrice={markupModalFlight.originalCostPrice ?? markupModalFlight.price}
          currentPrice={markupModalFlight.price}
          currentMarkupType={markupModalFlight.markupType || 'percent'}
          currentMarkupValue={markupModalFlight.markupValue || agencyCommissionRate}
          tourOperator={markupModalFlight.tourOperator || ''}
          agencyName={markupModalFlight.agencyName || ''}
          agencyCommissionRate={agencyCommissionRate}
          onApplyToAllCommission={onUpdateCommissionRate ? async (rate) => {
            try {
              await onUpdateCommissionRate(rate);
            } catch (error) {
              onShowToast(error instanceof Error ? error.message : 'Komissiyani saqlab bo‘lmadi.', 'error');
            }
          } : undefined}
          onSave={handleSaveMarkup}
        />
      )}
    </div>
  );
};
