import * as React from "react"

import * as FlaticonIcons from "@/lib/flaticon-icons"

type FlaticonIconName = keyof typeof FlaticonIcons

/**
 * shadcn Blocks (`dashboard-01`) ships an `IconPlaceholder` that switches between
 * icon libraries. SayrHub standardises on Flaticon UIcons, so this local
 * implementation keeps the exact same public API while rendering the Flaticon
 * glyph that matches the `lucide` name used by the block.
 */
export function IconPlaceholder({
  lucide,
  tabler: _tabler,
  hugeicons: _hugeicons,
  phosphor: _phosphor,
  remixicon: _remixicon,
  ...props
}: {
  lucide?: FlaticonIconName
  tabler?: string
  hugeicons?: string
  phosphor?: string
  remixicon?: string
} & React.ComponentPropsWithoutRef<"i">) {
  if (!lucide) return null
  const Icon = FlaticonIcons[lucide] as React.ComponentType<
    React.ComponentPropsWithoutRef<"i">
  >
  if (!Icon) return null
  return <Icon {...props} />
}
