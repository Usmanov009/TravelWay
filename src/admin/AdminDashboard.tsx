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
  const fiveStarToursCount = tours.filter((t) => t.is5Star || (t.hotelStars && t.hotelStars.includes('5'))).length;

  // Monthly stats for soft bar chart
  const monthlyStats = [
    { month: 'Yan', revenue: 14200, bookings: 18, height: '45%' },
    { month: 'Fev', revenue: 19800, bookings: 25, height: '58%' },
    { month: 'Mar', revenue: 26500, bookings: 34, height: '75%' },
    { month: 'Apr', revenue: 22100, bookings: 29, height: '62%' },
    { month: 'May', revenue: 31400, bookings: 42, height: '88%' },
    { month: 'Iyun', revenue: 38900, bookings: 53, height: '100%' },
    { month: 'Iyul', revenue: 35200, bookings: 48, height: '92%' },
    { month: 'Avg', revenue: 29400, bookings: 39, height: '80%' },
    { month: 'Sen', revenue: 24600, bookings: 31, height: '68%' }
  ];

  const topDestinations = [
    { name: 'Turkiya (Antalya & Bodrum)', share: 42, color: 'bg-sky-500' },
    { name: 'BAA (Dubay & Palm)', share: 28, color: 'bg-teal-500' },
    { name: 'Misr (Sharm El-Sheikh)', share: 16, color: 'bg-amber-500' },
    { name: 'Maldiv (Male Atoll)', share: 9, color: 'bg-indigo-500' },
    { name: 'Tailand (Phuket)', share: 5, color: 'bg-emerald-500' }
  ];

  return (
    <div className="space-y-6">
      {/* 1. WELCOME & OVERVIEW BANNER (Eye-friendly soft design) */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs relative overflow-hidden transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-2xl">👋</span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Xush kelibsiz, {currentAdmin.name}!
              </h1>
              {isMainAdmin ? (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-1">
                  👑 Bosh Admin
                </span>
              ) : (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 flex items-center gap-1">
                  🧳 Tur Admin
                </span>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              {isMainAdmin
                ? "Barcha xizmatlar, mijozlar buyurtmalari, tushumlar hisoboti hamda xodimlar jamoasini to'liq boshqaring."
                : "Turpaketlar, aviabiletlar hamda mijozlar bronlarini tasdiqlash va rasmiy vaucher berish huquqiga egasiz."}
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={onQuickAddTour}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-2xs transition-all tap-bounce"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Yangi Tur</span>
            </button>
            <button
              onClick={() => onSelectTab('flights')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all tap-bounce"
              type="button"
            >
              <span className="material-symbols-outlined text-[17px] text-sky-600 dark:text-sky-400">flight_takeoff</span>
              <span>Reyslar</span>
            </button>
            <button
              onClick={() => onSelectTab('bookings')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100/80 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 font-bold text-xs transition-all tap-bounce"
              type="button"
            >
              <span className="material-symbols-outlined text-[17px]">pending_actions</span>
              <span>Bronlar ({activeBookings.length})</span>
            </button>
          </div>
        </div>

        {/* Live sync heartbeat */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Kompas Tour API: Faol (1:1 Jonli Qidiruv)
            </span>
            <span>•</span>
            <span>Oxirgi sinxron: Bugun, {new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Sessiya:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {isMainAdmin ? 'Super Administrator' : 'Operatsion Menejer'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. FOUR STAT METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tours */}
        <div
          onClick={() => onSelectTab('tours')}
          className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-sky-400/60 dark:hover:border-sky-500/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Katalog Turlari
            </span>
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">travel_explore</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{tours.length}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {fiveStarToursCount} ta 5★ Deluxe
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Kompas & Charter</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              +8.4% faollik
            </span>
          </div>
        </div>

        {/* Card 2: Bookings */}
        <div
          onClick={() => onSelectTab('bookings')}
          className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-amber-400/60 dark:hover:border-amber-500/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Buyurtmalar
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">receipt_long</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">{bookings.length}</span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {activeBookings.length} ta faol bron
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Tasdiqlash kutilmoqda</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              {activeBookings.length > 0 ? `${activeBookings.length} ta kutilmoqda` : 'Barchasi tayyor'}
            </span>
          </div>
        </div>

        {/* Card 3: Revenue */}
        <div
          onClick={() => onSelectTab('bookings')}
          className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-emerald-400/60 dark:hover:border-emerald-500/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Umumiy Tushum
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              ${totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Vaucherlar
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Online to'lovlar</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              +23.1% o'sish
            </span>
          </div>
        </div>

        {/* Card 4: Users for Main Admin OR Agency Commission for Tour Admin */}
        {isMainAdmin ? (
          <div
            onClick={() => onSelectTab('users')}
            className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-indigo-400/60 dark:hover:border-indigo-500/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Mijozlar Bazasi
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[22px]">group</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{usersCount}</span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {priceAlerts.length} ta narx signali
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Telegram & Web</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                Faol foydalanuvchilar
              </span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => onSelectTab('settings')}
            className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-emerald-400/60 dark:hover:border-emerald-500/60 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                Agentlik Komissiyasi
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[22px]">percent</span>
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {typeof window !== 'undefined' ? (localStorage.getItem('sayrhub_agency_commission') || localStorage.getItem('travelway_agency_commission') || '8') : '8'}%
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Faol foiz
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>O'zgartirish huquqi bor</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                Sozlamalarga o'tish →
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. ANALYTICS ROW: SALES DYNAMICS & TOP DESTINATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sales & Bookings Dynamics */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span>📈</span> Savdo va Bronlar Dinamikasi
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Oylar bo'yicha tushum va tasdiqlangan turpaketlar statistikasi
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-sky-500" /> Tushum ($)
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-teal-500" /> Bronlar soni
              </span>
            </div>
          </div>

          {/* Eye-friendly Bars */}
          <div className="mt-6 h-52 flex items-end justify-between gap-2 px-2 pt-4">
            {monthlyStats.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="relative w-full flex items-end justify-center gap-1 h-full">
                  {/* Revenue Bar */}
                  <div
                    style={{ height: item.height }}
                    className="w-full max-w-[20px] bg-sky-500/80 hover:bg-sky-500 rounded-t-md transition-all relative"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-1 px-1.5 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-md">
                      ${item.revenue.toLocaleString()}
                    </div>
                  </div>
                  {/* Booking count sub-bar */}
                  <div
                    style={{ height: `${parseInt(item.height) * 0.7}%` }}
                    className="w-1.5 bg-teal-400/80 rounded-t-xs hidden sm:block"
                  />
                </div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                  {item.month}
                </span>
              </div>
            ))}
          </div>

          {/* Quick monthly summary pills */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">O'rtacha Chek</p>
              <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">$740 / tur</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Eng Yuqori Oy</p>
              <p className="text-sm font-black text-sky-600 dark:text-sky-400 mt-0.5">Iyun ($38,900)</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-400">Konversiya</p>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">96.4% Muvaffaqiyat</p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Top Destinations Breakdown */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>✈️</span> Mashhur Yo'nalishlar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mijozlar eng ko'p tanlayotgan kurortlar ulushi
            </p>

            <div className="mt-5 space-y-4">
              {topDestinations.map((dest, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{dest.name}</span>
                    <span className="font-bold font-mono text-sky-600 dark:text-sky-400">{dest.share}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${dest.share}%` }}
                      className={`h-full rounded-full ${dest.color} transition-all duration-500`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onSelectTab('tours')}
              className="w-full py-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 hover:bg-sky-100/80 text-xs font-bold transition-all flex items-center justify-center gap-1.5 tap-bounce border border-sky-200/60 dark:border-sky-800/50"
              type="button"
            >
              <span>Barcha Turlarni Ko'rish</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. RECENT BOOKINGS TABLE & QUICK APPROVAL */}
      <div className="rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>📋</span> So'nggi Buyurtmalar va Bronlar
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sayohatchilardan kelib tushgan oxirgi buyurtmalar va tezkor tasdiqlash
            </p>
          </div>

          <button
            onClick={() => onSelectTab('bookings')}
            className="flex items-center gap-1 text-xs font-bold text-sky-600 dark:text-sky-400 hover:text-sky-700 transition-colors"
            type="button"
          >
            <span>Barcha Buyurtmalarni Ko'rish ({bookings.length})</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        {/* Table content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Sayohatchi</th>
                <th className="px-5 py-3.5">Turpaket / Yo'nalish</th>
                <th className="px-5 py-3.5">Sana / Muddat</th>
                <th className="px-5 py-3.5">Summa</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Tezkor Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    Hozircha buyurtmalar yo'q
                  </td>
                </tr>
              ) : (
                bookings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center shrink-0">
                          {b.travelerName ? b.travelerName[0].toUpperCase() : 'M'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">
                            {b.travelerName || 'Sayohatchi'}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">{b.voucherId}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]">{b.tourTitle}</p>
                      <p className="text-[11px] text-slate-400">{b.dest}</p>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{b.dates}</p>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-bold font-mono text-sm text-sky-600 dark:text-sky-400">
                        {b.price}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      {b.status === 'Tasdiqlangan' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Tasdiqlangan
                        </span>
                      ) : b.status === 'Vaucher tayyor' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 px-2.5 py-0.5 rounded-full border border-sky-200/80 dark:border-sky-800/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                          Vaucher tayyor
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-0.5 rounded-full border border-amber-200/80 dark:border-amber-800/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Kutilmoqda
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      {b.status === 'Jarayonda' ? (
                        <button
                          onClick={() => onUpdateBookingStatus(b.id, 'Tasdiqlangan')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all tap-bounce shadow-2xs"
                          type="button"
                          title="Tezkor tasdiqlash"
                        >
                          Tasdiqlash ✓
                        </button>
                      ) : (
                        <button
                          onClick={() => onSelectTab('bookings')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 hover:text-sky-700 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-all"
                          type="button"
                        >
                          Ko'rish
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
