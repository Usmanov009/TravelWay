"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import type { Booking } from "@/types"

export const description = "Interaktiv maydon grafigi"

type DailyPoint = { date: string; bookings: number; travelers: number }

function buildChartData(bookings: Booking[]): DailyPoint[] {
  const today = new Date()
  const start = new Date(today)
  start.setDate(start.getDate() - 89)

  const buckets = new Map<string, DailyPoint>()
  for (let index = 0; index < 90; index += 1) {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    const key = day.toISOString().slice(0, 10)
    buckets.set(key, { date: key, bookings: 0, travelers: 0 })
  }

  bookings.forEach((booking) => {
    const raw = booking.createdAt || booking.startDate || ""
    const date = new Date(raw)
    if (Number.isNaN(date.getTime())) return
    const bucket = buckets.get(date.toISOString().slice(0, 10))
    if (!bucket) return
    if (booking.status === "Bekor qilingan") return
    bucket.bookings += 1
    bucket.travelers += Number(booking.guestsCount) || 1
  })

  return [...buckets.values()]
}

const chartConfig = {
  visitors: {
    label: "Bronlar",
  },
  bookings: {
    label: "Bronlar",
    color: "var(--primary)",
  },
  travelers: {
    label: "Yo‘lovchilar",
    color: "var(--primary)",
  },
} satisfies ChartConfig

const UZ_SHORT_MONTHS = [
  "Yan",
  "Fev",
  "Mar",
  "Apr",
  "May",
  "Iyn",
  "Iyl",
  "Avg",
  "Sen",
  "Okt",
  "Noy",
  "Dek",
]

function formatAxisDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${UZ_SHORT_MONTHS[date.getMonth()]} ${date.getDate()}`
}

export function ChartAreaInteractive({ bookings }: { bookings: Booking[] }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const chartData = React.useMemo(() => buildChartData(bookings), [bookings])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Umumiy bronlar</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Oxirgi 3 oy uchun jami
          </span>
          <span className="@[540px]/card:hidden">Oxirgi 3 oy</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={timeRange ? [timeRange] : []}
            onValueChange={(value) => {
              setTimeRange(value[0] ?? "90d")
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Oxirgi 3 oy</ToggleGroupItem>
            <ToggleGroupItem value="30d">Oxirgi 30 kun</ToggleGroupItem>
            <ToggleGroupItem value="7d">Oxirgi 7 kun</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(value) => {
              if (value !== null) {
                setTimeRange(value)
              }
            }}
          >
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Davrni tanlang"
            >
              <SelectValue placeholder="Oxirgi 3 oy" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Oxirgi 3 oy
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Oxirgi 30 kun
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Oxirgi 7 kun
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-bookings)"
                  stopOpacity={1.0}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-bookings)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-travelers)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-travelers)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => formatAxisDate(value)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return formatAxisDate(String(value))
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="travelers"
              type="natural"
              fill="url(#fillMobile)"
              stroke="var(--color-travelers)"
              stackId="a"
            />
            <Area
              dataKey="bookings"
              type="natural"
              fill="url(#fillDesktop)"
              stroke="var(--color-bookings)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
