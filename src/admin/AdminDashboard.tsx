import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Booking, ComboTour, FlightTicket, HotelOnly, PriceAlert, TourPackage } from '../types';
import { AdminRole, AdminTab, AdminUser } from './adminTypes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BriefcaseBusiness, CalendarDays, CircleDollarSign, Plane, Plus, UsersRound } from '@/lib/flaticon-icons';

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
  onSelectTab: (tab: AdminTab) => void;
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  onQuickAddTour: () => void;
  agencyCommissionRate?: number;
  onUpdateCommissionRate?: (rate: number) => Promise<void>;
}

const money = new Intl.NumberFormat('uz-UZ');
const monthLabels = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];

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
  onQuickAddTour,
  agencyCommissionRate = 0,
}) => {
  const activeBookings = bookings.filter((booking) => booking.type === 'active' && booking.status !== 'Bekor qilingan');
  const revenue = bookings.reduce(
    (total, booking) => total + (booking.status === 'Bekor qilingan' ? 0 : Number(booking.totalNumeric) || 0),
    0,
  );
  const recentBookings = [...bookings]
    .sort((left, right) => new Date(right.createdAt || right.startDate || 0).getTime() - new Date(left.createdAt || left.startDate || 0).getTime())
    .slice(0, 6);

  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: `${month.getFullYear()}-${month.getMonth()}`,
        name: monthLabels[month.getMonth()],
        revenue: 0,
      };
    });
    const lookup = new Map(months.map((month) => [month.key, month]));
    bookings.forEach((booking) => {
      if (booking.status === 'Bekor qilingan') return;
      const date = new Date(booking.createdAt || booking.startDate || '');
      if (Number.isNaN(date.getTime())) return;
      const month = lookup.get(`${date.getFullYear()}-${date.getMonth()}`);
      if (month) month.revenue += Number(booking.totalNumeric) || 0;
    });
    return months;
  }, [bookings]);

  const metrics = [
    { title: 'Sayohat paketlari', value: tours.length + comboTours.length, note: `${tours.length} ta tur · ${comboTours.length} ta combo`, icon: BriefcaseBusiness, tab: 'tours' as const },
    { title: 'Bronlar', value: bookings.length, note: `${activeBookings.length} ta faol bron`, icon: CalendarDays, tab: 'bookings' as const },
    { title: 'Bronlarning qiymati', value: `$${money.format(revenue)}`, note: 'To‘lov va turoperator tasdig‘i alohida', icon: CircleDollarSign, tab: 'bookings' as const },
    { title: 'Foydalanuvchilar', value: usersCount, note: `${priceAlerts.length} ta narx signali`, icon: UsersRound, tab: 'users' as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Boshqaruv paneli</h1>
            <Badge variant="secondary">{currentRole === 'main_admin' ? 'Bosh admin' : 'Tur admin'}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Xush kelibsiz, {currentAdmin.name}. Ko‘rsatkichlar bazadagi joriy yozuvlardan olinadi.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onSelectTab('bookings')}>
            <CalendarDays aria-hidden="true" />
            Bronlarni ko‘rish
          </Button>
          <Button onClick={onQuickAddTour}>
            <Plus aria-hidden="true" />
            Tur qo‘shish
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.title}
              className="cursor-pointer rounded-2xl border-border bg-card shadow-xs transition-shadow hover:shadow-md"
              onClick={() => onSelectTab(metric.tab)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription>{metric.title}</CardDescription>
                <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold tabular-nums">{metric.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{metric.note}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-7">
        <Card className="rounded-2xl border-border bg-card shadow-xs xl:col-span-4">
          <CardHeader>
            <CardTitle>Bronlar qiymati</CardTitle>
            <CardDescription>Oxirgi 6 oy · bekor qilingan bronlar hisoblanmaydi</CardDescription>
          </CardHeader>
          <CardContent className="h-[280px] px-2 sm:px-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenue} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} width={56} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} />
                <Tooltip formatter={(value) => [`$${money.format(Number(value))}`, 'Bron qiymati']} />
                <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card shadow-xs xl:col-span-3">
          <CardHeader>
            <CardTitle>Katalog holati</CardTitle>
            <CardDescription>Bazaga saqlangan xizmatlar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { label: 'Combo turlar', count: comboTours.length, tab: 'combo' as const, icon: BriefcaseBusiness },
              { label: 'Aviabiletlar', count: flights.length, tab: 'flights' as const, icon: Plane },
              { label: 'Mehmonxonalar', count: hotels.length, tab: 'hotels' as const, icon: BriefcaseBusiness },
              { label: 'Narx signallari', count: priceAlerts.length, tab: 'price_alerts' as const, icon: Bell },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.label} className="flex w-full items-center justify-between text-left" onClick={() => onSelectTab(item.tab)}>
                  <span className="flex items-center gap-3 text-sm font-medium">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-muted">
                      <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
                    </span>
                    {item.label}
                  </span>
                  <span className="text-sm tabular-nums text-muted-foreground">{item.count}</span>
                </button>
              );
            })}
            <div className="border-t border-border pt-4 text-xs text-muted-foreground">
              Agentlik komissiyasi: {agencyCommissionRate}% · Ko‘rsatkichlar bazadagi ma’lumotlardan hisoblangan.
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border bg-card shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>So‘nggi bronlar</CardTitle>
            <CardDescription>Yaqinda yaratilgan buyurtmalar</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => onSelectTab('bookings')}>Barchasi</Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted-foreground">
                  <th className="pb-3 font-medium">Mijoz</th>
                  <th className="pb-3 font-medium">Yo‘nalish</th>
                  <th className="pb-3 font-medium">Sana</th>
                  <th className="pb-3 font-medium">Holati</th>
                  <th className="pb-3 text-right font-medium">Qiymati</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">Bazada bronlar hali mavjud emas.</td></tr>
                ) : recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3 font-medium">{booking.travelerName || '—'}</td>
                    <td className="py-3">{booking.tourTitle}</td>
                    <td className="py-3 text-muted-foreground">{booking.createdAt ? new Date(booking.createdAt).toLocaleDateString('uz-UZ') : booking.dates || '—'}</td>
                    <td className="py-3"><Badge variant={booking.status === 'Bekor qilingan' ? 'destructive' : 'secondary'}>{booking.status}</Badge></td>
                    <td className="py-3 text-right tabular-nums">${money.format(Number(booking.totalNumeric) || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
