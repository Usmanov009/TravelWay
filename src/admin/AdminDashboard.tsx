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

  // Monthly mockup bars for Flexy sales chart
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
    { name: 'Turkiya (Antalya & Bodrum)', share: 42, color: 'bg-[#0891b2]' },
    { name: 'BAA (Dubay & Palm)', share: 28, color: 'bg-blue-500' },
    { name: 'Misr (Sharm El-Sheikh)', share: 16, color: 'bg-amber-500' },
    { name: 'Maldiv (Male Atoll)', share: 9, color: 'bg-purple-500' },
    { name: 'Tailand (Phuket)', share: 5, color: 'bg-emerald-500' }
  ];

  return (
    <div className="space-y-6">
      {/* 1. FLEXY WELCOME & OVERVIEW BANNER */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#e0f7fa]/70 via-[#f0f9ff] to-[#ecf2ff] dark:from-[#1b2533] dark:via-[#16202c] dark:to-[#171a24] border border-[#b2ebf2] dark:border-white/10 shadow-sm relative overflow-hidden transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-2xl">👋</span>
              <h1 className="text-2xl font-black text-[#11142d] dark:text-white tracking-tight">
                Xush kelibsiz, {currentAdmin.name}!
              </h1>
              {isMainAdmin ? (
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 flex items-center gap-1">
                  👑 Bosh Admin (To'liq Huquqlar)
                </span>
              ) : (
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/40 flex items-center gap-1">
                  🧳 Tur Admin (Operatsion Nazorat)
                </span>
              )}
            </div>
            <p className="text-[#777e89] dark:text-[#a39db0] text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              {isMainAdmin
                ? "Barcha xizmatlar, mijozlar buyurtmalari, tushumlar hisoboti hamda tur adminlar jamoasini to'liq boshqaring."
                : "Turpaketlar, aviabiletlar hamda mijozlar bronlarini tasdiqlash va rasmiy vaucher berish huquqiga egasiz."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={onQuickAddTour}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0891b2] hover:bg-[#0e7490] text-white font-extrabold text-xs shadow-md shadow-[#0891b2]/20 transition-all tap-bounce"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Yangi Tur Qo'shish</span>
            </button>
            <button
              onClick={() => onSelectTab('bookings')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/10 hover:bg-[#f4f6f9] text-[#2a3547] dark:text-white border border-[#e5eaef] dark:border-white/10 font-bold text-xs shadow-xs transition-all tap-bounce"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px] text-amber-500">pending_actions</span>
              <span>Bronlar ({activeBookings.length})</span>
            </button>
          </div>
        </div>

        {/* Live sync heartbeat */}
        <div className="mt-5 pt-4 border-t border-[#b2ebf2]/60 dark:border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-[#777e89] dark:text-[#a39db0]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Kompas Tour API: Faol (1:1 Jonli Qidiruv)
            </span>
            <span>•</span>
            <span>Oxirgi yangilanish: Bugun, {new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Sessiya:</span>
            <span className="font-bold text-[#11142d] dark:text-white">
              {isMainAdmin ? 'Super Administrator' : "Operatsion Menejer"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. FLEXY 4 STAT METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tours */}
        <div
          onClick={() => onSelectTab('tours')}
          className="p-5 rounded-2xl bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 shadow-sm hover:shadow-md hover:border-[#0891b2]/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#777e89] dark:text-[#a39db0]">
              Katalog Turlari
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#e0f7fa] dark:bg-cyan-950/50 text-[#0891b2] dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <span className="material-symbols-outlined text-[22px]">travel_explore</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#11142d] dark:text-white">{tours.length}</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {fiveStarToursCount} ta 5★ Deluxe
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[#777e89] dark:text-[#a39db0]">
            <span>Kompas & Charter</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              +8.4% bu oy
            </span>
          </div>
        </div>

        {/* Card 2: Bookings */}
        <div
          onClick={() => onSelectTab('bookings')}
          className="p-5 rounded-2xl bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 shadow-sm hover:shadow-md hover:border-amber-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#777e89] dark:text-[#a39db0]">
              Buyurtmalar
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#fff8e1] dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <span className="material-symbols-outlined text-[22px]">receipt_long</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#11142d] dark:text-white">{bookings.length}</span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {activeBookings.length} ta faol bron
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[#777e89] dark:text-[#a39db0]">
            <span>Tasdiqlash kutilmoqda</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              +14.2% bu hafta
            </span>
          </div>
        </div>

        {/* Card 3: Revenue */}
        <div
          onClick={() => onSelectTab('bookings')}
          className="p-5 rounded-2xl bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#777e89] dark:text-[#a39db0]">
              Umumiy Tushum
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#e8f5e9] dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#11142d] dark:text-white">
              ${totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Vaucherlar
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[#777e89] dark:text-[#a39db0]">
            <span>Online to'lovlar</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              +23.1% o'sish
            </span>
          </div>
        </div>

        {/* Card 4: Users */}
        <div
          onClick={() => isMainAdmin && onSelectTab('users')}
          className={`p-5 rounded-2xl bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 shadow-sm transition-all group ${
            isMainAdmin ? 'hover:shadow-md hover:border-purple-500/50 cursor-pointer' : 'opacity-90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#777e89] dark:text-[#a39db0]">
              Mijozlar Bazasi
            </span>
            <div className="w-10 h-10 rounded-xl bg-[#f3e5f5] dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <span className="material-symbols-outlined text-[22px]">group</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#11142d] dark:text-white">{usersCount}</span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              {priceAlerts.length} ta narx signali
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-[#777e89] dark:text-[#a39db0]">
            <span>Telegram & Web</span>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400">
              Faol foydalanuvchilar
            </span>
          </div>
        </div>
      </div>

      {/* 3. FLEXY ANALYTICS ROW: SALES OVERVIEW & DESTINATIONS BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sales & Bookings Dynamics (Flexy Chart Card) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e5eaef] dark:border-white/10">
            <div>
              <h3 className="text-base font-extrabold text-[#11142d] dark:text-white tracking-tight flex items-center gap-2">
                <span>📈</span> Savdo va Bronlar Dinamikasi (Sales Overview)
              </h3>
              <p className="text-xs text-[#777e89] dark:text-[#a39db0] mt-0.5">
                Oylar bo'yicha tushum va tasdiqlangan turpaketlar statistikasi
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0891b2]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0891b2]" /> Tushum ($)
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" /> Bronlar soni
              </span>
            </div>
          </div>

          {/* Visual Flexy Bars */}
          <div className="mt-6 h-56 flex items-end justify-between gap-2 px-2 pt-4">
            {monthlyStats.map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="relative w-full flex items-end justify-center gap-1 h-full">
                  {/* Revenue Bar */}
                  <div
                    style={{ height: item.height }}
                    className="w-full max-w-[20px] bg-gradient-to-t from-[#0891b2] to-[#22d3ee] rounded-t-md transition-all group-hover:opacity-90 relative"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-[#11142d] text-white text-[10px] font-bold py-1 px-1.5 rounded pointer-events-none whitespace-nowrap z-20 shadow-md">
                      ${item.revenue.toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#777e89] dark:text-[#a39db0] mt-1">
                  {item.month}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[#e5eaef] dark:border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-[#fafbfb] dark:bg-white/5">
              <p className="text-[10px] uppercase font-bold text-[#777e89] dark:text-[#a39db0]">O'rtacha Narx</p>
              <p className="text-sm font-black text-[#11142d] dark:text-white mt-0.5">$745 / kishi</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#fafbfb] dark:bg-white/5">
              <p className="text-[10px] uppercase font-bold text-[#777e89] dark:text-[#a39db0]">Eng Faol Oy</p>
              <p className="text-sm font-black text-[#0891b2] mt-0.5">Iyun ($38,900)</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#fafbfb] dark:bg-white/5 col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase font-bold text-[#777e89] dark:text-[#a39db0]">Muvaffaqiyat</p>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">96.4% Konversiya</p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Top Destinations Breakdown (Flexy Donut/Progress Style) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#11142d] dark:text-white tracking-tight flex items-center gap-2">
              <span>✈️</span> Mashhur Yo'nalishlar
            </h3>
            <p className="text-xs text-[#777e89] dark:text-[#a39db0] mt-0.5">
              Mijozlar eng ko'p tanlayotgan kurortlar ulushi
            </p>

            <div className="mt-5 space-y-4">
              {topDestinations.map((dest, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#11142d] dark:text-white">{dest.name}</span>
                    <span className="font-extrabold font-mono text-[#0891b2]">{dest.share}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#f4f6f9] dark:bg-white/10 overflow-hidden">
                    <div
                      style={{ width: `${dest.share}%` }}
                      className={`h-full rounded-full ${dest.color} transition-all duration-500`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#e5eaef] dark:border-white/10">
            <button
              onClick={() => onSelectTab('tours')}
              className="w-full py-2.5 rounded-xl bg-[#e0f7fa] dark:bg-cyan-950/40 text-[#0891b2] dark:text-cyan-400 hover:bg-[#b2ebf2] text-xs font-bold transition-all flex items-center justify-center gap-1.5 tap-bounce"
              type="button"
            >
              <span>Barcha Turlarni Ko'rish</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. FLEXY RECENT BOOKINGS TABLE */}
      <div className="rounded-2xl bg-white dark:bg-[#1e1a23] border border-[#e5eaef] dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#e5eaef] dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-[#11142d] dark:text-white tracking-tight flex items-center gap-2">
              <span>📋</span> So'nggi Buyurtmalar va Bronlar
            </h3>
            <p className="text-xs text-[#777e89] dark:text-[#a39db0] mt-0.5">
              Sayohatchilardan kelib tushgan oxirgi buyurtmalar va ularning statusi
            </p>
          </div>

          <button
            onClick={() => onSelectTab('bookings')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#0891b2] hover:text-[#0e7490] transition-colors"
            type="button"
          >
            <span>Barchasini Boshqarish ({bookings.length})</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        {/* Table content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#fafbfb] dark:bg-white/5 border-b border-[#e5eaef] dark:border-white/10 text-[#777e89] dark:text-[#a39db0] font-extrabold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Mijoz / Telefon</th>
                <th className="px-5 py-3.5">Turpaket</th>
                <th className="px-5 py-3.5">Sana / Sayohatchilar</th>
                <th className="px-5 py-3.5">Summa</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f6f9] dark:divide-white/5 text-[#2a3547] dark:text-[#faf9fb]">
              {bookings.slice(0, 6).map((b) => (
                <tr key={b.id} className="hover:bg-[#f8f9fa] dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#e0f7fa] dark:bg-cyan-950/50 text-[#0891b2] dark:text-cyan-400 font-bold flex items-center justify-center shrink-0">
                        {b.userName ? b.userName[0].toUpperCase() : 'M'}
                      </div>
                      <div>
                        <p className="font-bold text-[#11142d] dark:text-white truncate max-w-[150px]">
                          {b.userName || 'Mijoz'}
                        </p>
                        <p className="text-[11px] text-[#777e89] dark:text-[#a39db0]">{b.userPhone || '+998 90 123 45 67'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <p className="font-bold text-[#11142d] dark:text-white truncate max-w-[200px]">{b.title}</p>
                    <p className="text-[11px] text-[#777e89] dark:text-[#a39db0]">{b.destination || b.dates}</p>
                  </td>

                  <td className="px-5 py-3.5">
                    <p className="font-medium text-[#11142d] dark:text-white">{b.dates}</p>
                    <p className="text-[11px] text-[#777e89] dark:text-[#a39db0]">{b.travelers || 2} kishi</p>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="font-black font-mono text-sm text-[#0891b2]">
                      {b.totalPrice}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    {b.status === 'Tasdiqlandi' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Tasdiqlandi
                      </span>
                    ) : b.status === 'Bekor qilindi' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full border border-rose-200 dark:border-rose-800/40">
                        Bekor qilindi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Kutilmoqda
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => onSelectTab('bookings')}
                      className="px-2.5 py-1 rounded-lg bg-[#f4f6f9] dark:bg-white/10 hover:bg-[#e0f7fa] dark:hover:bg-cyan-950/40 text-[#0891b2] dark:text-cyan-400 font-bold text-[11px] transition-all"
                      type="button"
                    >
                      Boshqarish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
