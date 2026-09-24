import React from 'react';
import { ComboTour, FlightTicket, HotelOnly } from '../types';

interface ServiceModalsProps {
  selectedComboTour: ComboTour | null;
  onCloseComboTour: () => void;
  selectedFlight: FlightTicket | null;
  onCloseFlight: () => void;
  selectedHotel: HotelOnly | null;
  onCloseHotel: () => void;
  onShowToast: (text: string, type: 'success' | 'error' | 'info') => void;
  onBookCombo?: (combo: ComboTour) => void;
  onBookFlight?: (flight: FlightTicket) => void;
  onBookHotel?: (hotel: HotelOnly) => void;
}

export const ServiceModals: React.FC<ServiceModalsProps> = ({
  selectedComboTour,
  onCloseComboTour,
  selectedFlight,
  onCloseFlight,
  selectedHotel,
  onCloseHotel,
  onShowToast,
  onBookCombo,
  onBookFlight,
  onBookHotel
}) => {
  return (
    <>
      {/* 1. COMBO TOUR DETAILS & ITINERARY MODAL */}
      {selectedComboTour && (
        <div
          id="modal-combo-details"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
          onClick={onCloseComboTour}
        >
          <div
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border overflow-hidden shadow-2xl transition-all max-h-[90vh] flex flex-col"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Image */}
            <div className="relative h-48 sm:h-56 shrink-0 overflow-hidden">
              <img
                src={selectedComboTour.img}
                alt={selectedComboTour.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <button
                type="button"
                onClick={onCloseComboTour}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center tap-bounce"
              >
                ✕
              </button>

              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Combo Paket
                </span>
                <span className="bg-emerald-600/90 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  1:1 Kompas Narx
                </span>
              </div>

              <div className="absolute bottom-3 left-4 right-4">
                <span className="text-amber-300 text-xs font-bold block mb-1">
                  ★ {selectedComboTour.rating} Reyting
                </span>
                <h3 className="text-white text-base sm:text-lg font-black leading-tight">
                  {selectedComboTour.title}
                </h3>
                <p className="text-white/80 text-[11px] font-medium mt-0.5">
                  📍 {selectedComboTour.routeSummary}
                </p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 overflow-y-auto space-y-4">
              {/* Route timeline */}
              <div
                className="p-3 rounded-2xl border space-y-2"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <span className="text-[10px] font-extrabold uppercase tracking-wider block text-emerald-600 dark:text-emerald-400">
                  Marshrut xaritasi va davomiyligi
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  {selectedComboTour.route.map((stop, idx) => (
                    <React.Fragment key={idx}>
                      <span className="px-2.5 py-1 rounded-xl font-bold shrink-0 border text-[11px]"
                        style={{
                          backgroundColor: 'var(--tw-surface)',
                          borderColor: 'var(--tw-border)',
                          color: 'var(--tw-text-main)'
                        }}
                      >
                        {stop}
                      </span>
                      {idx < selectedComboTour.route.length - 1 && (
                        <span className="text-emerald-500 font-bold">➔</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Hotels in each stop */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--tw-text-main)' }}>
                  🏨 Marshrutdagi mehmonxonalar
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedComboTour.hotels.map((hotel, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl border flex items-center gap-2.5"
                      style={{
                        backgroundColor: 'var(--tw-subtle)',
                        borderColor: 'var(--tw-border)'
                      }}
                    >
                      {hotel.img && (
                        <img
                          src={hotel.img}
                          alt={hotel.hotelName}
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold text-amber-500 block">
                          {hotel.city} ({hotel.nights} kecha)
                        </span>
                        <h5 className="text-[11px] font-bold truncate" style={{ color: 'var(--tw-text-main)' }}>
                          {hotel.hotelName}
                        </h5>
                        <p className="text-[9px]" style={{ color: 'var(--tw-text-sub)' }}>
                          {hotel.stars} • {hotel.meal}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Included services */}
              <div
                className="p-3 rounded-2xl border space-y-2"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--tw-text-main)' }}>
                  ✅ Narxga kiritilgan xizmatlar
                </h4>
                <ul className="text-xs space-y-1.5" style={{ color: 'var(--tw-text-sub)' }}>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Xalqaro aviaparvoz: {selectedComboTour.flight}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Shaharlararo ichki reys / VIP transfer to'liq kiritilgan</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Tibbiy sug'urta va Kompas Tour rasmiy vaucheri</span>
                  </li>
                  {selectedComboTour.excursionsIncluded.map((exc, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-amber-500 font-bold">★</span>
                      <span>Ekskursiya: {exc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Day-by-Day Itinerary */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--tw-text-main)' }}>
                  📅 Kun tartibi va dastur (Itinerary)
                </h4>
                <div className="space-y-2">
                  {selectedComboTour.itinerary.map((step) => (
                    <div
                      key={step.day}
                      className="p-2.5 rounded-xl border flex gap-3 text-xs"
                      style={{
                        backgroundColor: 'var(--tw-surface)',
                        borderColor: 'var(--tw-border)'
                      }}
                    >
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-[11px] flex items-center justify-center shrink-0">
                        {step.day}
                      </span>
                      <div>
                        <h6 className="font-bold text-[11px]" style={{ color: 'var(--tw-text-main)' }}>
                          {step.title}
                        </h6>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--tw-text-sub)' }}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Pricing & Actions */}
            <div
              className="p-3.5 border-t shrink-0 flex items-center justify-between gap-3"
              style={{
                backgroundColor: 'var(--tw-surface)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <div>
                <span className="text-[10px] block" style={{ color: 'var(--tw-text-sub)' }}>
                  Kompas Tour 1:1 Jami Combo narxi:
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black" style={{ color: 'var(--tw-accent)' }}>
                    ${selectedComboTour.price}
                  </span>
                  {selectedComboTour.oldPrice && (
                    <span className="text-xs line-through" style={{ color: 'var(--tw-text-muted)' }}>
                      ${selectedComboTour.oldPrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(`https://travelway.uz`)}&text=${encodeURIComponent(
                    `Assalomu alaykum! TravelWay orqali ushbu COMBO turpaket haqida so'ramoqchiman:\n\n🌴 Tur: ${selectedComboTour.title}\n📍 Marshrut: ${selectedComboTour.routeSummary}\n🌙 Muddat: ${selectedComboTour.nightsSplit}\n💵 Narx: $${selectedComboTour.price} (1:1 Kompas Tour)\n🆔 Kod: ${selectedComboTour.kompasTourCode}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-[#24A1DE] hover:bg-[#208fbf] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 tap-bounce"
                >
                  <span>💬</span>
                  <span className="hidden sm:inline">Operatorga</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    if (onBookCombo) {
                      onBookCombo(selectedComboTour);
                    }
                    onCloseComboTour();
                    onShowToast("Combo tur muvaffaqiyatli band qilindi va 'Mening turlarim' bo'limiga saqlandi! 🎒", "success");
                  }}
                  className="py-2.5 px-4 font-bold text-xs rounded-xl flex items-center gap-1.5 tap-bounce shadow-md"
                  style={{
                    backgroundColor: 'var(--tw-accent)',
                    color: 'var(--tw-accent-contrast)'
                  }}
                >
                  <span>📌</span>
                  <span>Band Qilish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. FLIGHT TICKET / BOARDING PASS MODAL */}
      {selectedFlight && (
        <div
          id="modal-flight-ticket"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
          onClick={onCloseFlight}
        >
          <div
            className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border overflow-hidden shadow-2xl transition-all max-h-[90vh] flex flex-col"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Airline Header */}
            <div className="p-4 bg-gradient-to-r from-sky-600 to-indigo-700 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase opacity-80 block">
                  Elektron Aviachipta & Vaucher
                </span>
                <h3 className="text-base font-black flex items-center gap-2 mt-0.5">
                  <span>✈️</span>
                  <span>{selectedFlight.airline}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={onCloseFlight}
                className="w-7 h-7 rounded-full bg-white/20 text-white flex items-center justify-center tap-bounce"
              >
                ✕
              </button>
            </div>

            {/* Flight Body / Boarding Pass Style */}
            <div className="p-4 space-y-4 overflow-y-auto">
              {/* Route Banner */}
              <div
                className="p-4 rounded-2xl border flex items-center justify-between text-center"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <div>
                  <span className="text-2xl font-black block" style={{ color: 'var(--tw-text-main)' }}>
                    {selectedFlight.departureAirportCode}
                  </span>
                  <span className="text-xs font-semibold block" style={{ color: 'var(--tw-text-sub)' }}>
                    {selectedFlight.departureCity}
                  </span>
                  <span className="text-sm font-bold text-sky-500 block mt-1">
                    {selectedFlight.departureTime}
                  </span>
                </div>

                <div className="flex flex-col items-center px-3">
                  <span className="text-[10px] font-mono" style={{ color: 'var(--tw-text-muted)' }}>
                    {selectedFlight.flightDuration}
                  </span>
                  <div className="flex items-center gap-1 my-1">
                    <span className="w-8 h-0.5 bg-sky-500/50"></span>
                    <span className="text-sky-500 text-xs">✈</span>
                    <span className="w-8 h-0.5 bg-sky-500/50"></span>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                    {selectedFlight.flightType === 'direct' ? "To'g'ridan-to'g'ri" : 'Tranzit'}
                  </span>
                </div>

                <div>
                  <span className="text-2xl font-black block" style={{ color: 'var(--tw-text-main)' }}>
                    {selectedFlight.arrivalAirportCode}
                  </span>
                  <span className="text-xs font-semibold block" style={{ color: 'var(--tw-text-sub)' }}>
                    {selectedFlight.arrivalCity}
                  </span>
                  <span className="text-sm font-bold text-sky-500 block mt-1">
                    {selectedFlight.arrivalTime}
                  </span>
                </div>
              </div>

              {/* Ticket Details Grid */}
              <div
                className="p-3.5 rounded-2xl border grid grid-cols-2 gap-3 text-xs"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <div>
                  <span className="text-[10px] block" style={{ color: 'var(--tw-text-sub)' }}>Reys raqami:</span>
                  <span className="font-bold font-mono text-sm" style={{ color: 'var(--tw-text-main)' }}>
                    {selectedFlight.flightNumber}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] block" style={{ color: 'var(--tw-text-sub)' }}>Uchish sanasi:</span>
                  <span className="font-bold" style={{ color: 'var(--tw-text-main)' }}>
                    {selectedFlight.departureDate}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] block" style={{ color: 'var(--tw-text-sub)' }}>Bagaj me'yori:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    🧳 {selectedFlight.baggage}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] block" style={{ color: 'var(--tw-text-sub)' }}>Reys turi:</span>
                  <span className="font-bold" style={{ color: 'var(--tw-text-main)' }}>
                    {selectedFlight.isCharter ? 'Charter Blok' : 'Muntazam GDS'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] block" style={{ color: 'var(--tw-text-sub)' }}>Tarif toifasi:</span>
                  <span className="font-bold uppercase" style={{ color: 'var(--tw-text-main)' }}>
                    {selectedFlight.cabinClass}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] block" style={{ color: 'var(--tw-text-sub)' }}>Bo'sh o'rinlar:</span>
                  <span className="font-bold text-amber-500">
                    🔥 {selectedFlight.seatsLeft} ta joy qoldi
                  </span>
                </div>
              </div>

              {/* Barcode representation */}
              <div
                className="p-3 rounded-2xl border text-center space-y-1.5"
                style={{
                  backgroundColor: 'var(--tw-surface)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <div className="h-10 flex items-center justify-center gap-1 opacity-70">
                  {[...Array(32)].map((_, i) => (
                    <span
                      key={i}
                      className="bg-current inline-block h-full"
                      style={{
                        width: i % 3 === 0 ? '3px' : i % 2 === 0 ? '1.5px' : '2px',
                        color: 'var(--tw-text-main)'
                      }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-mono tracking-widest block" style={{ color: 'var(--tw-text-sub)' }}>
                  {selectedFlight.kompasFlightCode} • E-TICKET VOUCHER
                </span>
              </div>
            </div>

            {/* Price & Booking Footer */}
            <div
              className="p-3.5 border-t shrink-0 flex items-center justify-between gap-3"
              style={{
                backgroundColor: 'var(--tw-surface)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <div>
                <span className="text-[10px] block" style={{ color: 'var(--tw-text-sub)' }}>
                  1:1 Rasmiy chipta narxi:
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-sky-500">
                    ${selectedFlight.price}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-mono font-bold">
                    ~{(selectedFlight.price * 12950).toLocaleString()} UZS
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(`https://travelway.uz`)}&text=${encodeURIComponent(
                    `Assalomu alaykum! Ushbu aviabiletni band qilmoqchiman:\n\n✈️ Reys: ${selectedFlight.airline} (${selectedFlight.flightNumber})\n🛫 Yo'nalish: ${selectedFlight.departureCity} (${selectedFlight.departureAirportCode}) ➔ ${selectedFlight.arrivalCity} (${selectedFlight.arrivalAirportCode})\n📅 Sana: ${selectedFlight.departureDate} (${selectedFlight.departureTime})\n🧳 Bagaj: ${selectedFlight.baggage}\n💵 Narx: $${selectedFlight.price}\n🆔 Kod: ${selectedFlight.kompasFlightCode}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-[#24A1DE] hover:bg-[#208fbf] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 tap-bounce"
                >
                  <span>💬</span>
                  <span className="hidden sm:inline">Operator</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    if (onBookFlight) {
                      onBookFlight(selectedFlight);
                    }
                    onCloseFlight();
                    onShowToast("Aviabilet muvaffaqiyatli band qilindi va 'Mening turlarim' ga qo'shildi! ✈️", "success");
                  }}
                  className="py-2.5 px-4 font-bold text-xs rounded-xl flex items-center gap-1.5 tap-bounce shadow-md"
                  style={{
                    backgroundColor: 'var(--tw-accent)',
                    color: 'var(--tw-accent-contrast)'
                  }}
                >
                  <span>🎫</span>
                  <span>Chiptani Olish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. HOTEL ONLY BOOKING MODAL */}
      {selectedHotel && (
        <div
          id="modal-hotel-only"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
          onClick={onCloseHotel}
        >
          <div
            className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border overflow-hidden shadow-2xl transition-all max-h-[90vh] flex flex-col"
            style={{
              backgroundColor: 'var(--tw-surface)',
              borderColor: 'var(--tw-border)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hotel Image Banner */}
            <div className="relative h-48 sm:h-56 shrink-0 overflow-hidden">
              <img
                src={selectedHotel.img}
                alt={selectedHotel.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <button
                type="button"
                onClick={onCloseHotel}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center tap-bounce"
              >
                ✕
              </button>

              <div className="absolute top-3 left-3 flex items-center gap-1.5">
                <span className="bg-indigo-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  🏨 Faqat Mehmonxona
                </span>
                <span className="bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full border border-white/20">
                  1:1 Rasmiy Narx
                </span>
              </div>

              <div className="absolute bottom-3 left-4 right-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-amber-300 text-xs font-bold">
                    ★ {selectedHotel.rating} ({selectedHotel.stars})
                  </span>
                  <span className="text-white/70 text-[10px]">
                    ({selectedHotel.reviewsCount} sharhlar)
                  </span>
                </div>
                <h3 className="text-white text-base sm:text-lg font-black leading-tight">
                  {selectedHotel.name}
                </h3>
                <p className="text-white/80 text-[11px] font-medium mt-0.5">
                  📍 {selectedHotel.resort}, {selectedHotel.country}
                </p>
              </div>
            </div>

            {/* Hotel Content */}
            <div className="p-4 space-y-4 overflow-y-auto">
              {/* Room & Meal Details */}
              <div
                className="p-3.5 rounded-2xl border space-y-2.5"
                style={{
                  backgroundColor: 'var(--tw-subtle)',
                  borderColor: 'var(--tw-border)'
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] block" style={{ color: 'var(--tw-text-sub)' }}>Tanlangan xona toifasi:</span>
                    <span className="text-xs font-extrabold" style={{ color: 'var(--tw-text-main)' }}>
                      🛏 {selectedHotel.roomType}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    {selectedHotel.mealType}
                  </span>
                </div>

                <div className="text-xs pt-1 border-t" style={{ borderColor: 'var(--tw-border)', color: 'var(--tw-text-sub)' }}>
                  🍽️ <strong style={{ color: 'var(--tw-text-main)' }}>Ovqatlanish:</strong> {selectedHotel.mealDesc}
                </div>

                {selectedHotel.distanceToBeach && (
                  <div className="text-xs text-sky-500 font-medium">
                    🏖️ {selectedHotel.distanceToBeach}
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--tw-text-main)' }}>
                  ✨ Mehmonxona qulayliklari
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedHotel.amenities.map((amenity, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-semibold border"
                      style={{
                        backgroundColor: 'var(--tw-subtle)',
                        borderColor: 'var(--tw-border)',
                        color: 'var(--tw-text-main)'
                      }}
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              {/* Address / Location */}
              {selectedHotel.address && (
                <div className="text-[11px] space-y-0.5" style={{ color: 'var(--tw-text-sub)' }}>
                  <span className="font-bold block">Manzil:</span>
                  <span>{selectedHotel.address}</span>
                </div>
              )}
            </div>

            {/* Footer & Actions */}
            <div
              className="p-3.5 border-t shrink-0 flex items-center justify-between gap-3"
              style={{
                backgroundColor: 'var(--tw-surface)',
                borderColor: 'var(--tw-border)'
              }}
            >
              <div>
                <span className="text-[10px] block" style={{ color: 'var(--tw-text-sub)' }}>
                  ${selectedHotel.pricePerNight} / kecha • {selectedHotel.nightsCount} kechaga jami:
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black" style={{ color: 'var(--tw-accent)' }}>
                    ${selectedHotel.totalPrice}
                  </span>
                  {selectedHotel.oldPrice && (
                    <span className="text-xs line-through" style={{ color: 'var(--tw-text-muted)' }}>
                      ${selectedHotel.oldPrice}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(`https://travelway.uz`)}&text=${encodeURIComponent(
                    `Assalomu alaykum! TravelWay orqali ushbu MEHMONXONA bo'yicha ma'lumot olmoqchiman:\n\n🏨 Mehmonxona: ${selectedHotel.name}\n📍 Manzil: ${selectedHotel.resort}, ${selectedHotel.country}\n🛏 Xona: ${selectedHotel.roomType}\n🍽 Ovqat: ${selectedHotel.mealDesc}\n🌙 Muddat: ${selectedHotel.nightsCount} kecha\n💵 Narx: $${selectedHotel.totalPrice} ($${selectedHotel.pricePerNight}/kecha)\n🆔 Kod: ${selectedHotel.kompasHotelCode}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 bg-[#24A1DE] hover:bg-[#208fbf] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 tap-bounce"
                >
                  <span>💬</span>
                  <span className="hidden sm:inline">Operator</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    if (onBookHotel) {
                      onBookHotel(selectedHotel);
                    }
                    onCloseHotel();
                    onShowToast("Mehmonxona muvaffaqiyatli band qilindi va 'Mening turlarim' ga saqlandi! 🏨", "success");
                  }}
                  className="py-2.5 px-4 font-bold text-xs rounded-xl flex items-center gap-1.5 tap-bounce shadow-md"
                  style={{
                    backgroundColor: 'var(--tw-accent)',
                    color: 'var(--tw-accent-contrast)'
                  }}
                >
                  <span>📌</span>
                  <span>Band Qilish</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
