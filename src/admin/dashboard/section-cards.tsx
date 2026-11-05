"use client"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { IconPlaceholder } from "@/admin/dashboard/icon-placeholder"
import type { Booking } from "@/types"

const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })

function percentChange(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 1000) / 10
}

export function SectionCards({
  bookings,
  usersCount,
}: {
  bookings: Booking[]
  usersCount: number
}) {
  const paidBookings = bookings.filter(
    (booking) => booking.status !== "Bekor qilingan"
  )
  const totalRevenue = paidBookings.reduce(
    (total, booking) => total + (Number(booking.totalNumeric) || 0),
    0
  )
  const activeBookings = paidBookings.filter(
    (booking) => booking.type === "active"
  ).length

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const inRange = (booking: Booking, from: Date, to?: Date) => {
    const date = new Date(booking.createdAt || booking.startDate || "")
    if (Number.isNaN(date.getTime())) return false
    return date >= from && (!to || date < to)
  }

  const currentMonthBookings = paidBookings.filter((booking) =>
    inRange(booking, monthStart)
  )
  const previousMonthBookings = paidBookings.filter((booking) =>
    inRange(booking, previousMonthStart, monthStart)
  )

  const revenueGrowth = percentChange(
    currentMonthBookings.reduce(
      (total, booking) => total + (Number(booking.totalNumeric) || 0),
      0
    ),
    previousMonthBookings.reduce(
      (total, booking) => total + (Number(booking.totalNumeric) || 0),
      0
    )
  )
  const bookingGrowth = percentChange(
    currentMonthBookings.length,
    previousMonthBookings.length
  )

  const TrendIcon = revenueGrowth >= 0 ? "TrendingUpIcon" : "TrendingDownIcon"
  const BookingTrendIcon =
    bookingGrowth >= 0 ? "TrendingUpIcon" : "TrendingDownIcon"

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Umumiy tushum</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${money.format(totalRevenue)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconPlaceholder lucide={TrendIcon} />
              {revenueGrowth >= 0 ? "+" : ""}
              {revenueGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Shu oyda o‘sish tendensiyasi{" "}
            <IconPlaceholder lucide={TrendIcon} className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Oxirgi oylar bo‘yicha jami bronlar qiymati
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Yangi mijozlar</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {money.format(usersCount)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconPlaceholder lucide={BookingTrendIcon} />
              {bookingGrowth >= 0 ? "+" : ""}
              {bookingGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {bookingGrowth >= 0 ? "Bu davrda o‘sish" : "Bu davrda pasayish"}{" "}
            <IconPlaceholder lucide={BookingTrendIcon} className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Ro‘yxatdan o‘tgan foydalanuvchilar bazasi
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Faol bronlar</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {money.format(activeBookings)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconPlaceholder lucide="TrendingUpIcon" />
              {money.format(paidBookings.length)}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Mijozlar saqlanib qolmoqda{" "}
            <IconPlaceholder lucide="TrendingUpIcon" className="size-4" />
          </div>
          <div className="text-muted-foreground">Jami tasdiqlangan bronlar</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>O‘sish sur’ati</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {Math.max(revenueGrowth, 0)}%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconPlaceholder lucide="TrendingUpIcon" />
              {revenueGrowth >= 0 ? "+" : ""}
              {revenueGrowth}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Barqaror o‘sish{" "}
            <IconPlaceholder lucide="TrendingUpIcon" className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Oylik tushum prognoziga mos
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
