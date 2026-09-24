import React from 'react';
import { TourPackage, Booking, PriceAlert, ComboTour, FlightTicket, HotelOnly } from '../types';
import { AdminRole, AdminUser } from './adminTypes';

interface AdminDashboardProps {
  currentRole: AdminRole;
  currentAdmin: AdminUser;
  tours: TourPackage[];
  comboTours: ComboTour[];
  flights: FlightTicket[];
  hotels: HotelOnly[];
  bookings: Booking[];
  priceAlerts: PriceAlert[];
  usersCount: number;
  onSelectTab: (tab: any) => void;
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  onSimulatePriceDrop: (tourId: string, price: number) => void;
  onQuickAddTour: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentRole,
  currentAdmin,
  tours,
  comboTours,
  flights,
  hotels,
  bookings,
  priceAlerts,
  usersCount,
  onSelectTab,
  onUpdateBookingStatus,
  onSimulatePriceDrop,
  onQuickAddTour
}) => {
  const isMainAdmin = currentRole === 'main_admin';

  // Calculate live stats
  const activeBookings = bookings.filter((b) => b.status === 'Jarayonda' || b.type === 'active');
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalNumeric || 0), 0);
  const fiveStarToursCount = tours.filter((t) => t.is5Star).length;

  return (
    <div className="space-y-6">
      {/* 1. WELCOME & ROLE PERMISSION BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-cyan-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">👋</span>
              <h1 className="text-2xl font-black text-white tracking-tight">
                Xush kelibsiz, {currentAdmin.name}!
              </h1>
              {isMainAdmin ? (
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  👑 Bosh Admin (To'liq Huquqlar)
                </span>
              ) : (
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-400/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1">
                  🧳 Tur Admin (Operatsion Nazorat)
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              {isMainAdmin
                ? "Barcha modullar, mijozlar bazasi, moliyaviy hisobotlar, turlar katalogi va tur adminlar ruxsatlarini to'liq boshqarish huquqiga egasiz."
                : "Turpaketlar, combo turlar, aviabiletlar, mehmonxonalar hamda mijozlar buyurtmalarini tasdiqlash va vaucher berish huquqiga egasiz."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onQuickAddTour}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-black text-xs shadow-lg shadow-cyan-500/20 transition-all tap-bounce"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Yangi Turpaket Qo'shish</span>
            </button>
            <button
              onClick={() => onSelectTab('bookings')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-amber-400">pending_actions</span>
              <span>Bronlar ({activeBookings.length})</span>
            </button>
          </div>
        </div>

        {/* Live sync pill */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Kompas Tour API: Ulangan (Live 1:1)
            </span>
            <span>•</span>
            <span>Oxirgi yangilanish: Bugun, {new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Faol rejim:</span>
            <span className="font-bold text-slate-200">{isMainAdmin ? 'Super Admin Boshqaruvi' : "Mas'ul Tur Menejer"}</span>
          </div>
        </div>
      </div>

      {/* 2. STATS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tours */}
        <div
          onClick={() => onSelectTab('tours')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Katalog Turlari</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[20px]">travel_explore</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{tours.length}</span>
            <span className="text-xs font-bold text-emerald-400 flex items-center">
              <span>{fiveStarToursCount} ta 5★ Deluxe</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Kompas Tour & Charter paketlar</p>
        </div>

        {/* Card 2: Bookings */}
        <div
          onClick={() => onSelectTab('bookings')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Buyurtmalar</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[20px]">receipt_long</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{bookings.length}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
              {activeBookings.length} ta faol
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Mijozlar band qilgan barcha safarlar</p>
        </div>

        {/* Card 3: Revenue (Special logic for Main Admin vs Tour Admin) */}
        <div
          onClick={() => isMainAdmin && onSelectTab('bookings')}
          className={`p-5 rounded-2xl bg-slate-900 border border-slate-800 transition-all shadow-sm ${
            isMainAdmin ? 'hover:border-emerald-500/50 cursor-pointer group' : 'opacity-85'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Jami Aylanma (USD)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">payments</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            {isMainAdmin ? (
              <>
                <span className="text-3xl font-black text-emerald-400">${totalRevenue.toLocaleString()}</span>
                <span className="text-xs font-bold text-emerald-400">+18.4%</span>
              </>
            ) : (
              <>
                <span className="text-2xl font-black text-slate-400">••••••</span>
                <span className="text-[11px] font-bold text-slate-400">(Faqat Bosh Admin)</span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isMainAdmin ? "Tasdiqlangan va to'langan turlar" : "Moliyaviy ko'rsatkichlar cheklangan"}
          </p>
        </div>

        {/* Card 4: Services Ecosystem */}
        <div
          onClick={() => onSelectTab('combo')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Qo'shimcha Xizmatlar</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[20px]">hub</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-xs font-bold text-indigo-300">
              <b className="text-xl font-black text-white">{comboTours.length}</b> combo
            </span>
            <span className="text-xs font-bold text-cyan-300">
              <b className="text-xl font-black text-white">{flights.length}</b> bilet
            </span>
            <span className="text-xs font-bold text-emerald-300">
              <b className="text-xl font-black text-white">{hotels.length}</b> mehmonxona
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Kombinatsiyalangan & mustaqil xizmatlar</p>
        </div>
      </div>

      {/* 3. TWO COLUMNS: RECENT BOOKINGS & PRICE ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Bookings Table (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>📋</span> So'nggi Buyurtmalar
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Mijozlar ilovada band qilgan turlar va chiptalar
              </p>
            </div>
            <button
              onClick={() => onSelectTab('bookings')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Barchasini ko'rish</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 pl-2">Vaucher / Tur</th>
                  <th className="pb-3">Sayohatchi</th>
                  <th className="pb-3">Sana / Narx</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.slice(0, 5).map((booking) => {
                  const isApproved = booking.status === 'Tasdiqlangan';
                  const isVoucher = booking.status === 'Vaucher tayyor';
                  const isPending = booking.status === 'Jarayonda';

                  return (
                    <tr key={booking.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-3">
                          {booking.hotelImg ? (
                            <img
                              src={booking.hotelImg}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                              🏖️
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-bold text-white text-xs truncate max-w-[200px]">
                              {booking.tourTitle}
                            </p>
                            <p className="text-[11px] text-cyan-400 font-mono font-bold mt-0.5">
                              {booking.voucherId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <p className="font-bold text-slate-200 text-xs">{booking.travelerName}</p>
                        <p className="text-[11px] text-slate-400">{booking.dest}</p>
                      </td>
                      <td className="py-3.5">
                        <p className="font-extrabold text-emerald-400 text-xs">{booking.price}</p>
                        <p className="text-[10px] text-slate-400">{booking.dates}</p>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                            isApproved
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isVoucher
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <button
                              onClick={() => onUpdateBookingStatus(booking.id, 'Tasdiqlangan')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] transition-all"
                              title="Tasdiqlash"
                            >
                              Tasdiqlash
                            </button>
                          )}
                          {isApproved && (
                            <button
                              onClick={() => onUpdateBookingStatus(booking.id, 'Vaucher tayyor')}
                              className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[11px] transition-all"
                              title="Vaucher berish"
                            >
                              Vaucher
                            </button>
                          )}
                          <button
                            onClick={() => onSelectTab('bookings')}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Price Alerts Live Trigger (1 col) */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>🔔</span> Narx Signallari
              </h3>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                {priceAlerts.length} ta faol
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Mijozlar narx tushishini kutayotgan turlar
            </p>

            <div className="mt-4 space-y-3">
              {priceAlerts.slice(0, 3).map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-xs text-white truncate max-w-[180px]">
                      {alert.tourTitle}
                    </h5>
                    <span className="text-[10px] font-bold text-slate-400">{alert.createdAt}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Hozir: <b className="text-white font-bold">${alert.currentPrice}</b>
                    </span>
                    <span className="text-emerald-400 font-black">
                      Kutilmoqda: &lt; ${alert.targetPrice}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400 font-mono truncate">
                      {alert.userEmail || "Mijoz (Push/TG)"}
                    </span>
                    <button
                      onClick={() => onSimulatePriceDrop(alert.tourId, alert.targetPrice - 20)}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-[11px] transition-all shrink-0 shadow-sm"
                      title="Narxni kutilgan narxdan ham pastga tushirish (Mijozga bildirishnoma boradi)"
                    >
                      Aksiya e'lon qilish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSelectTab('price_alerts')}
            className="w-full mt-4 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold text-center border border-slate-700 transition-all"
          >
            Barcha Narx Signallarini Ko'rish
          </button>
        </div>
      </div>
    </div>
  );
};
