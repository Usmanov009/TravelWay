import React, { useState, useMemo } from 'react';
import { FlightTicket } from '../types';

interface FlightsViewProps {
  flights: FlightTicket[];
  onSelectFlight: (flight: FlightTicket) => void;
  onQuickBookFlight: (flight: FlightTicket) => void;
  onShowToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const FlightsView: React.FC<FlightsViewProps> = ({
  flights,
  onSelectFlight,
  onQuickBookFlight,
  onShowToast
}) => {
  const [tripType, setTripType] = useState<'round_trip' | 'one_way'>('round_trip');
  const [departureCity, setDepartureCity] = useState<string>('TAS');
  const [arrivalCity, setArrivalCity] = useState<string>('ALL');
  const [selectedAirline, setSelectedAirline] = useState<string>('Barchasi');
  const [departureDate, setDepartureDate] = useState<string>(() => new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10));
  const [passengersCount, setPassengersCount] = useState<number>(1);
  const [directOnly, setDirectOnly] = useState<boolean>(false);

  const destinationOptions = [
    { code: 'ALL', name: 'Barcha yo\'nalishlar' },
    { code: 'IST', name: 'Istanbul (IST)' },
    { code: 'DXB', name: 'Dubay (DXB)' },
    { code: 'AYT', name: 'Antaliya (AYT)' },
    { code: 'SSH', name: 'Sharm El-Sheikh (SSH)' },
    { code: 'JED', name: 'Jidda (JED)' },
    { code: 'HKT', name: 'Phuket (HKT)' },
    { code: 'TBS', name: 'Tbilisi (TBS)' }
  ];

  const airlineOptions = [
    'Barchasi',
    'Uzbekistan Airways',
    'FlyDubai',
    'Centrum Air',
    'Air Cairo',
    'Qanot Sharq',
    'Turkish Airlines'
  ];

  const filteredFlights = useMemo(() => {
    return flights.filter((flight) => {
      const matchDep = departureCity === 'ALL' || flight.departureAirportCode === departureCity;
      const matchArr = arrivalCity === 'ALL' || flight.arrivalAirportCode === arrivalCity;
      const matchAirline = selectedAirline === 'Barchasi' || flight.airline.toLowerCase().includes(selectedAirline.toLowerCase());
      const matchDirect = !directOnly || flight.flightType === 'direct';
      return matchDep && matchArr && matchAirline && matchDirect;
    });
  }, [flights, departureCity, arrivalCity, selectedAirline, directOnly]);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Banner */}
      <div
        className="p-4 rounded-3xl border relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(99, 102, 241, 0.12) 100%)',
          borderColor: 'var(--tw-border)'
        }}
      >
        <div className="flex items-start justify-between gap-3 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-600 dark:text-sky-400 font-extrabold text-[10px] uppercase tracking-wider mb-1.5">
              <span>✈️ Aviabiletlar</span>
              <span>•</span>
              <span>Charter & GDS Bloklar</span>
            </div>
            <h3 className="text-base font-black leading-tight" style={{ color: 'var(--tw-text-main)' }}>
              To'g'ridan-to'g'ri Aviachiptalar
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--tw-text-sub)' }}>
              Kompas Tour charter bloklari va doimiy reyslar. Bagaj (20-23kg) kiritilgan, kafolatlangan o'rinlar va rasmiy 1:1 narxlar.
            </p>
          </div>
          <span className="text-3xl">🎫</span>
        </div>
      </div>

      {/* Flight Search Controls */}
      <div
        className="p-3.5 rounded-3xl border space-y-3"
        style={{
          backgroundColor: 'var(--tw-surface)',
          borderColor: 'var(--tw-border)',
          boxShadow: 'var(--tw-card-shadow)'
        }}
      >
        {/* Trip Type Toggle */}
        <div className="flex items-center justify-between gap-2 border-b pb-2.5" style={{ borderColor: 'var(--tw-border)' }}>
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--tw-subtle)' }}>
            <button
              type="button"
              onClick={() => setTripType('round_trip')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition tap-bounce ${
                tripType === 'round_trip' ? 'shadow-xs' : 'opacity-70'
              }`}
              style={{
                backgroundColor: tripType === 'round_trip' ? 'var(--tw-accent)' : 'transparent',
                color: tripType === 'round_trip' ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)'
              }}
            >
              🔄 Borish-qaytish
            </button>
            <button
              type="button"
              onClick={() => setTripType('one_way')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition tap-bounce ${
                tripType === 'one_way' ? 'shadow-xs' : 'opacity-70'
              }`}
              style={{
                backgroundColor: tripType === 'one_way' ? 'var(--tw-accent)' : 'transparent',
                color: tripType === 'one_way' ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)'
              }}
            >
              ➔ Bir tomonga
            </button>
          </div>

          {/* Passengers count */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>Yo'lovchi:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPassengersCount(num)}
                  className="w-5 h-5 rounded text-[10px] font-bold tap-bounce"
                  style={{
                    backgroundColor: passengersCount === num ? 'var(--tw-accent)' : 'var(--tw-subtle)',
                    color: passengersCount === num ? 'var(--tw-accent-contrast)' : 'var(--tw-text-main)'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Departure & Arrival Selectors */}
        <div className="grid grid-cols-2 gap-2">
          {/* Qayerdan */}
          <div
            className="p-2.5 rounded-2xl border"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <label className="text-[10px] block font-semibold mb-0.5" style={{ color: 'var(--tw-text-sub)' }}>
              🛫 Qayerdan (Вылет)
            </label>
            <select
              value={departureCity}
              onChange={(e) => setDepartureCity(e.target.value)}
              className="w-full bg-transparent text-xs font-extrabold border-0 p-0 focus:ring-0 cursor-pointer"
              style={{ color: 'var(--tw-text-main)' }}
            >
              <option value="TAS" style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}>
                Toshkent (TAS)
              </option>
              <option value="SKD" style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}>
                Samarqand (SKD)
              </option>
            </select>
          </div>

          {/* Qayerga */}
          <div
            className="p-2.5 rounded-2xl border"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <label className="text-[10px] block font-semibold mb-0.5" style={{ color: 'var(--tw-text-sub)' }}>
              🛬 Qayerga (Прилет)
            </label>
            <select
              value={arrivalCity}
              onChange={(e) => setArrivalCity(e.target.value)}
              className="w-full bg-transparent text-xs font-extrabold border-0 p-0 focus:ring-0 cursor-pointer"
              style={{ color: 'var(--tw-text-main)' }}
            >
              {destinationOptions.map((dest) => (
                <option
                  key={dest.code}
                  value={dest.code}
                  style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}
                >
                  {dest.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Airline */}
        <div className="grid grid-cols-2 gap-2">
          <div
            className="p-2.5 rounded-2xl border"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <label className="text-[10px] block font-semibold mb-0.5" style={{ color: 'var(--tw-text-sub)' }}>
              📅 Parvoz sanasi
            </label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full bg-transparent text-xs font-bold border-0 p-0 focus:ring-0 cursor-pointer"
              style={{ color: 'var(--tw-text-main)' }}
            />
          </div>

          <div
            className="p-2.5 rounded-2xl border"
            style={{
              backgroundColor: 'var(--tw-subtle)',
              borderColor: 'var(--tw-border)'
            }}
          >
            <label className="text-[10px] block font-semibold mb-0.5" style={{ color: 'var(--tw-text-sub)' }}>
              ✈️ Aviakompaniya
            </label>
            <select
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              className="w-full bg-transparent text-xs font-bold border-0 p-0 focus:ring-0 cursor-pointer"
              style={{ color: 'var(--tw-text-main)' }}
            >
              {airlineOptions.map((air) => (
                <option
                  key={air}
                  value={air}
                  style={{ backgroundColor: 'var(--tw-surface)', color: 'var(--tw-text-main)' }}
                >
                  {air}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Direct flight checkbox */}
        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer" style={{ color: 'var(--tw-text-sub)' }}>
            <input
              type="checkbox"
              checked={directOnly}
              onChange={(e) => setDirectOnly(e.target.checked)}
              className="rounded text-sky-600 focus:ring-0 cursor-pointer"
            />
            <span className="text-[11px] font-medium">Faqat to'g'ridan-to'g'ri reyslar</span>
          </label>
          <span className="text-[10px] font-bold text-sky-500">
            {filteredFlights.length} ta reys topildi
          </span>
        </div>
      </div>

      {/* Flight Cards List */}
      <div className="space-y-3">
        {filteredFlights.map((flight) => {
          const calculatedPrice = tripType === 'round_trip'
            ? Math.round(flight.price * 1.7) * passengersCount
            : flight.price * passengersCount;

          return (
            <div
              key={flight.id}
              className="rounded-3xl border overflow-hidden p-3.5 space-y-3 transition-all duration-200 hover:shadow-md"
              style={{
                backgroundColor: 'var(--tw-surface)',
                borderColor: 'var(--tw-border)',
                boxShadow: 'var(--tw-card-shadow)'
              }}
            >
              {/* Airline Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 font-black text-xs flex items-center justify-center">
                    ✈️
                  </span>
                  <div>
                    <h4 className="text-xs font-black" style={{ color: 'var(--tw-text-main)' }}>
                      {flight.airline}
                    </h4>
                    <span className="text-[10px] font-mono" style={{ color: 'var(--tw-text-sub)' }}>
                      {flight.flightNumber} • {flight.isCharter ? 'Charter Blok' : 'Doimiy GDS'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
                    1:1 Chipta Narxi
                  </span>
                  <span className="text-[9px] block text-amber-500 font-bold mt-0.5">
                    🔥 {flight.seatsLeft} ta joy qoldi
                  </span>
                </div>
              </div>

              {/* Flight Timeline Flow */}
              <div
                className="p-3 rounded-2xl border flex items-center justify-between text-center"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <div className="text-left">
                  <span className="text-lg font-black block leading-none" style={{ color: 'var(--tw-text-main)' }}>
                    {flight.departureTime}
                  </span>
                  <span className="text-[11px] font-bold text-sky-500 block">
                    {flight.departureAirportCode}
                  </span>
                  <span className="text-[9px]" style={{ color: 'var(--tw-text-sub)' }}>
                    {flight.departureCity}
                  </span>
                </div>

                <div className="flex flex-col items-center px-2">
                  <span className="text-[9px] font-mono" style={{ color: 'var(--tw-text-muted)' }}>
                    {flight.flightDuration}
                  </span>
                  <div className="flex items-center gap-1 my-0.5">
                    <span className="w-6 h-0.5 bg-sky-500/40"></span>
                    <span className="text-sky-500 text-[10px]">✈</span>
                    <span className="w-6 h-0.5 bg-sky-500/40"></span>
                  </div>
                  <span className="text-[8px] font-semibold text-emerald-600 dark:text-emerald-400">
                    To'g'ridan-to'g'ri
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black block leading-none" style={{ color: 'var(--tw-text-main)' }}>
                    {flight.arrivalTime}
                  </span>
                  <span className="text-[11px] font-bold text-sky-500 block">
                    {flight.arrivalAirportCode}
                  </span>
                  <span className="text-[9px]" style={{ color: 'var(--tw-text-sub)' }}>
                    {flight.arrivalCity}
                  </span>
                </div>
              </div>

              {/* Baggage and Class info */}
              <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--tw-text-sub)' }}>
                <span>🧳 {flight.baggage}</span>
                <span className="font-semibold uppercase">{flight.cabinClass} toifasi</span>
              </div>

              {/* Price & Actions */}
              <div className="pt-1 flex items-center justify-between gap-2 border-t" style={{ borderColor: 'var(--tw-border)' }}>
                <div>
                  <span className="text-[9px] block" style={{ color: 'var(--tw-text-sub)' }}>
                    {tripType === 'round_trip' ? 'Borish-qaytish jami:' : '1 tomonga narx:'}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-sky-500">
                      ${calculatedPrice}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-500">
                      ~{(calculatedPrice * 12950).toLocaleString()} UZS
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onSelectFlight(flight)}
                    className="py-2 px-3 border text-xs font-bold rounded-xl tap-bounce transition"
                    style={{
                      backgroundColor: 'var(--tw-surface)',
                      borderColor: 'var(--tw-border)',
                      color: 'var(--tw-text-main)'
                    }}
                  >
                    🎫 Chipta
                  </button>

                  <button
                    type="button"
                    onClick={() => onQuickBookFlight(flight)}
                    className="py-2 px-3 text-xs font-bold rounded-xl tap-bounce shadow-xs transition"
                    style={{
                      backgroundColor: 'var(--tw-accent)',
                      color: 'var(--tw-accent-contrast)'
                    }}
                  >
                    Band qilish
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
