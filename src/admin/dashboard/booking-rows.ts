import { z } from "zod"

import { schema } from "@/admin/dashboard/data-table"
import type { Booking } from "@/types"

export type AdminTableRow = z.infer<typeof schema>

function resolveBookingType(booking: Booking) {
  if (booking.id.startsWith("fl-")) return "Aviachipta"
  if (booking.id.startsWith("ht-")) return "Mehmonxona"
  if (booking.id.startsWith("combo-")) return "Combo tur"
  return "Turpaket"
}

/**
 * Maps SayrHub bookings into the row shape used by the shadcn `dashboard-01`
 * data table, so the block markup stays 1:1 with the registry source.
 */
export function toTableRows(bookings: Booking[]): AdminTableRow[] {
  return bookings.map((booking, index) => ({
    id: index + 1,
    bookingId: booking.id,
    header: booking.tourTitle || "—",
    type: resolveBookingType(booking),
    status: booking.status,
    target: `$${Number(booking.totalNumeric) || 0}`,
    limit: String(booking.guestsCount ?? booking.adultsCount ?? 1),
    reviewer: booking.travelerName || "—",
  }))
}
