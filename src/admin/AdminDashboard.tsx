import React from 'react';
import { TourPackage, Booking, PriceAlert, ComboTour, FlightTicket, HotelOnly } from '../types';
import { AdminRole, AdminUser } from './adminTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Pencil, Plane, TrendingUp } from '@/lib/flaticon-icons';

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
  agencyCommissionRate?: number;
  onUpdateCommissionRate?: (rate: number) => void;
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
  onQuickAddTour,
  agencyCommissionRate = 8,
  onUpdateCommissionRate
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
    { name: 'Turkiya (Antalya & Bodrum)', share: 42, color: 'bg-indigo-500' },
    { name: 'BAA (Dubay & Palm)', share: 28, color: 'bg-teal-500' },
    { name: 'Misr (Sharm El-Sheikh)', share: 16, color: 'bg-amber-500' },
    { name: 'Maldiv (Male Atoll)', share: 9, color: 'bg-indigo-500' },
    { name: 'Tailand (Phuket)', share: 5, color: 'bg-emerald-500' }
  ];

  return (
    <div className="space-y-6">
      {/* 1. WELCOME & OVERVIEW BANNER (Eye-friendly soft design) */}
      <Card className="relative overflow-hidden border-indigo-200/70 bg-gradient-to-br from-card via-card to-indigo-50/80 shadow-sm transition-all dark:border-indigo-400/20 dark:to-indigo-950/30">
        <CardContent className="p-6">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  Xush kelibsiz, {currentAdmin.name}!
                </h1>
                <Badge variant={isMainAdmin ? 'secondary' : 'outline'}>
                  {isMainAdmin ? 'Bosh Admin' : 'Tur Admin'}
                </Badge>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {isMainAdmin
                  ? "Barcha xizmatlar, mijozlar buyurtmalari, tushumlar hisoboti hamda xodimlar jamoasini to'liq boshqaring."
                  : "Turpaketlar, aviabiletlar hamda mijozlar bronlarini tasdiqlash va rasmiy vaucher berish huquqiga egasiz."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={onQuickAddTour} className="gap-2 font-semibold" type="button">
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                Yangi tur
              </Button>
              <Button variant="outline" onClick={() => onSelectTab('flights')} className="gap-1.5 bg-background/80" type="button">
                <span className="material-symbols-outlined text-[17px] text-primary">flight_takeoff</span>
                Reyslar
              </Button>
              <Button variant="secondary" onClick={() => onSelectTab('bookings')} className="gap-1.5" type="button">
                <span className="material-symbols-outlined text-[17px]">pending_actions</span>
                Bronlar ({activeBookings.length})
              </Button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-2 font-medium text-emerald-600 dark:text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-500" />
              Kompas Tour API: faol
              <span className="font-normal text-muted-foreground">· Jonli qidiruv</span>
            </span>
            <span>
              Oxirgi sinxron: {new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
              <span className="ml-3 text-foreground">{isMainAdmin ? 'Super administrator' : 'Operatsion menejer'}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 2. FOUR STAT METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tours */}
        <div
          onClick={() => onSelectTab('tours')}
          className="p-5 rounded-2xl bg-card border border-zinc-200/90 dark:border-zinc-800 shadow-2xs hover:border-indigo-400/60 dark:hover:border-indigo-500/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
              Katalog Turlari
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">travel_explore</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{tours.length}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {fiveStarToursCount} ta 5★ Deluxe
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Kompas & Charter</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              +8.4% faollik
            </span>
          </div>
        </div>

        {/* Card 2: Bookings */}
        <div
          onClick={() => onSelectTab('bookings')}
          className="p-5 rounded-2xl bg-card border border-zinc-200/90 dark:border-zinc-800 shadow-2xs hover:border-amber-400/60 dark:hover:border-amber-500/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
              Buyurtmalar
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">receipt_long</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">{bookings.length}</span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              {activeBookings.length} ta faol bron
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Tasdiqlash kutilmoqda</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              {activeBookings.length > 0 ? `${activeBookings.length} ta kutilmoqda` : 'Barchasi tayyor'}
            </span>
          </div>
        </div>

        {/* Card 3: Revenue */}
        <div
          onClick={() => onSelectTab('bookings')}
          className="p-5 rounded-2xl bg-card border border-zinc-200/90 dark:border-zinc-800 shadow-2xs hover:border-emerald-400/60 dark:hover:border-emerald-500/60 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
              Umumiy Tushum
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-white">
              ${totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              Vaucherlar
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Online to'lovlar</span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              +23.1% o'sish
            </span>
          </div>
        </div>

        {/* Card 4: Agentlik Komissiyasi (Persisted & Editable by all admins) */}
        <div
          className="p-5 rounded-2xl bg-card border border-zinc-200/90 dark:border-zinc-800 shadow-2xs hover:border-emerald-400/60 dark:hover:border-emerald-500/60 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-400">
              Agentlik Komissiyasi
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-[22px]">percent</span>
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {agencyCommissionRate}%
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Katalog ustamasi
              </span>
            </div>
            {onUpdateCommissionRate && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const input = prompt("Yangi agentlik komissiyasi foizini kiriting (0 - 100%):", String(agencyCommissionRate));
                  if (input !== null) {
                    const num = Number(input);
                    if (!isNaN(num) && num >= 0 && num <= 100) {
                      onUpdateCommissionRate(num);
                    }
                  }
                }}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 transition tap-bounce cursor-pointer"
              >
                <Pencil aria-hidden="true" className="inline h-3 w-3" /> O'zgartirish
              </button>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Barcha narxlarga ta'sir qiladi</span>
            <span
              onClick={() => onSelectTab('settings')}
              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 hover:underline cursor-pointer"
            >
              Sozlamalar →
            </span>
          </div>
        </div>
      </div>

      {/* 3. ANALYTICS ROW: SALES DYNAMICS & TOP DESTINATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sales & Bookings Dynamics */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-zinc-200/90 dark:border-zinc-800 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                <TrendingUp aria-hidden="true" className="h-4 w-4" /> Savdo va Bronlar Dinamikasi
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Oylar bo'yicha tushum va tasdiqlangan turpaketlar statistikasi
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500" /> Tushum ($)
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
                    className="w-full max-w-[20px] bg-indigo-500/80 hover:bg-indigo-500 rounded-t-md transition-all relative"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-bold py-1 px-1.5 rounded-md pointer-events-none whitespace-nowrap z-20 shadow-md">
                      ${item.revenue.toLocaleString()}
                    </div>
                  </div>
                  {/* Booking count sub-bar */}
                  <div
                    style={{ height: `${parseInt(item.height) * 0.7}%` }}
                    className="w-1.5 bg-teal-400/80 rounded-t-xs hidden sm:block"
                  />
                </div>
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mt-1">
                  {item.month}
                </span>
              </div>
            ))}
          </div>

          {/* Quick monthly summary pills */}
          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-400">O'rtacha Chek</p>
              <p className="text-sm font-black text-zinc-900 dark:text-white mt-0.5">$740 / tur</p>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
              <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-400">Eng Yuqori Oy</p>
              <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 mt-0.5">Iyun ($38,900)</p>
            </div>
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-400">Konversiya</p>
              <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5">96.4% Muvaffaqiyat</p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Top Destinations Breakdown */}
        <div className="p-6 rounded-2xl bg-card border border-zinc-200/90 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <Plane aria-hidden="true" className="h-4 w-4" /> Mashhur Yo'nalishlar
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Mijozlar eng ko'p tanlayotgan kurortlar ulushi
            </p>

            <div className="mt-5 space-y-4">
              {topDestinations.map((dest, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{dest.name}</span>
                    <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">{dest.share}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      style={{ width: `${dest.share}%` }}
                      className={`h-full rounded-full ${dest.color} transition-all duration-500`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => onSelectTab('tours')}
              className="w-full py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100/80 text-xs font-bold transition-all flex items-center justify-center gap-1.5 tap-bounce border border-indigo-200/60 dark:border-indigo-800/50"
              type="button"
            >
              <span>Barcha Turlarni Ko'rish</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. RECENT BOOKINGS TABLE & QUICK APPROVAL */}
      <div className="rounded-2xl bg-card border border-zinc-200/90 dark:border-zinc-800 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <ClipboardList aria-hidden="true" className="h-4 w-4" /> So'nggi Buyurtmalar va Bronlar
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Sayohatchilardan kelib tushgan oxirgi buyurtmalar va tezkor tasdiqlash
            </p>
          </div>

          <button
            onClick={() => onSelectTab('bookings')}
            className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
            type="button"
          >
            <span>Barcha Buyurtmalarni Ko'rish ({bookings.length})</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>

        {/* Table content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 text-zinc-400 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Sayohatchi</th>
                <th className="px-5 py-3.5">Turpaket / Yo'nalish</th>
                <th className="px-5 py-3.5">Sana / Muddat</th>
                <th className="px-5 py-3.5">Summa</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Tezkor Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-zinc-800 dark:text-zinc-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-zinc-400">
                    Hozircha buyurtmalar yo'q
                  </td>
                </tr>
              ) : (
                bookings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                          {b.travelerName ? b.travelerName[0].toUpperCase() : 'M'}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 dark:text-white truncate max-w-[150px]">
                            {b.travelerName || 'Sayohatchi'}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-mono">{b.voucherId}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-bold text-zinc-900 dark:text-white truncate max-w-[220px]">{b.tourTitle}</p>
                      <p className="text-[11px] text-zinc-400">{b.dest}</p>
                    </td>

                    <td className="px-5 py-3.5">
                      <p className="font-medium text-zinc-800 dark:text-zinc-200">{b.dates}</p>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="font-bold font-mono text-sm text-indigo-600 dark:text-indigo-400">
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
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 rounded-full border border-indigo-200/80 dark:border-indigo-800/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
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
                          className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-indigo-50 hover:text-indigo-700 text-zinc-700 dark:text-zinc-300 font-bold text-[11px] transition-all"
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
