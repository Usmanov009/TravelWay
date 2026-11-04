import React, { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
} from 'recharts';
import { Booking, ComboTour, FlightTicket, HotelOnly, PriceAlert, TourPackage } from '../types';
import { AdminRole, AdminTab, AdminUser } from './adminTypes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  CircleDollarSign,
  UsersRound,
} from '@/lib/flaticon-icons';

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
const chartConfig = {
  revenue: {
    label: 'Bronlar qiymati',
    color: 'var(--primary)',
  },
} satisfies ChartConfig;

type RevenuePeriod = '6m' | '3m' | '1m';

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
  agencyCommissionRate = 0,
}) => {
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>('6m');
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

  const displayedRevenue = revenuePeriod === '6m'
    ? monthlyRevenue
    : monthlyRevenue.slice(revenuePeriod === '3m' ? -3 : -1);
  const serviceCount = tours.length + comboTours.length + flights.length + hotels.length;
  const peopleMetric = currentRole === 'main_admin'
    ? {
      title: 'Foydalanuvchilar',
      value: usersCount,
      note: `${priceAlerts.length} ta narx signali`,
      description: 'Ro‘yxatdan o‘tgan mijozlar',
      icon: UsersRound,
      tab: 'users' as const,
      badge: 'Mijozlar',
    }
    : {
      title: 'Narx signallari',
      value: priceAlerts.length,
      note: 'Faol kuzatuvdagi narxlar',
      description: 'Mijozlar sozlagan bildirishnomalar',
      icon: Bell,
      tab: 'price_alerts' as const,
      badge: 'Kuzatuv',
    };

  const metrics = [
    {
      title: 'Bronlar daromadi',
      value: `$${money.format(revenue)}`,
      note: 'Bekor qilingan bronlar chiqarildi',
      description: 'Barcha tasdiqlanmagan va tasdiqlangan bronlar',
      icon: CircleDollarSign,
      tab: 'bookings' as const,
      badge: 'USD',
    },
    {
      title: 'Jami bronlar',
      value: bookings.length,
      note: `${activeBookings.length} ta faol bron`,
      description: 'Barcha saqlangan buyurtmalar',
      icon: CalendarDays,
      tab: 'bookings' as const,
      badge: `${activeBookings.length} faol`,
    },
    {
      title: 'Sayohat xizmatlari',
      value: serviceCount,
      note: `${tours.length} ta tur · ${comboTours.length} ta combo`,
      description: `${flights.length} ta reys · ${hotels.length} ta mehmonxona`,
      icon: BriefcaseBusiness,
      tab: 'tours' as const,
      badge: 'Katalog',
    },
    peopleMetric,
  ];

  const selectMetric = (tab: AdminTab) => onSelectTab(tab);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.title}
              className="@container/card cursor-pointer"
              onClick={() => selectMetric(metric.tab)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  selectMetric(metric.tab);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div className="space-y-1">
                  <CardDescription>{metric.title}</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {metric.value}
                  </CardTitle>
                </div>
                <CardAction>
                  <Badge variant="outline">
                    <Icon aria-hidden="true" />
                    {metric.badge}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1.5 text-sm">
                <div className="line-clamp-1 font-medium">
                  {metric.note}
                </div>
                <div className="text-muted-foreground">{metric.description}</div>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="px-4 lg:px-6">
        <Card className="@container/card">
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>Bronlar qiymati</CardTitle>
              <CardDescription>
                {revenuePeriod === '6m' ? 'Oxirgi 6 oy' : revenuePeriod === '3m' ? 'Oxirgi 3 oy' : 'Joriy oy'}
                {' · bekor qilingan bronlar hisoblanmaydi'}
              </CardDescription>
            </div>
            <CardAction>
              <div className="flex items-center gap-1" role="group" aria-label="Daromad davrini tanlash">
                {([
                  ['6m', '6 oy'],
                  ['3m', '3 oy'],
                  ['1m', '1 oy'],
                ] as const).map(([period, label]) => (
                  <Button
                    key={period}
                    type="button"
                    size="sm"
                    variant={revenuePeriod === period ? 'secondary' : 'outline'}
                    aria-pressed={revenuePeriod === period}
                    onClick={() => setRevenuePeriod(period)}
                    className="h-8 px-2.5 text-xs sm:px-3"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </CardAction>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
              <AreaChart data={displayedRevenue} margin={{ left: 12, right: 12, top: 8 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  minTickGap={24}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      indicator="dot"
                      formatter={(value) => `$${money.format(Number(value))}`}
                    />
                  }
                />
                <Area
                  dataKey="revenue"
                  type="monotone"
                  fill="url(#fillRevenue)"
                  stroke="var(--color-revenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader className="flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <CardTitle>So‘nggi bronlar</CardTitle>
              <CardDescription>Yaqinda yaratilgan buyurtmalar</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => onSelectTab('bookings')}>
              Barchasi
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mijoz</TableHead>
                  <TableHead>Yo‘nalish</TableHead>
                  <TableHead>Sana</TableHead>
                  <TableHead>Holati</TableHead>
                  <TableHead className="text-right">Qiymati</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Bazada bronlar hali mavjud emas.
                    </TableCell>
                  </TableRow>
                ) : recentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">{booking.travelerName || '—'}</TableCell>
                    <TableCell>{booking.tourTitle}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {booking.createdAt
                        ? new Date(booking.createdAt).toLocaleDateString('uz-UZ')
                        : booking.dates || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={booking.status === 'Bekor qilingan' ? 'destructive' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      ${money.format(Number(booking.totalNumeric) || 0)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <p className="px-4 text-xs text-muted-foreground lg:px-6">
        Agentlik komissiyasi: {agencyCommissionRate}% · Xush kelibsiz, {currentAdmin.name}.
      </p>
    </div>
  );
};
