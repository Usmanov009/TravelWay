"use client"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { IconPlaceholder } from "@/admin/dashboard/icon-placeholder"

export function NavMain({
  items,
  activeKey,
  onSelect,
  onQuickCreate,
}: {
  items: {
    key: string
    title: string
    icon?: React.ReactNode
  }[]
  activeKey?: string
  onSelect?: (key: string) => void
  onQuickCreate?: () => void
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Tezkor yaratish"
              onClick={onQuickCreate}
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <IconPlaceholder lucide="CirclePlusIcon" />
              <span>Tezkor yaratish</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
              onClick={() => onSelect?.("bookings")}
            >
              <IconPlaceholder lucide="MailIcon" />
              <span className="sr-only">Buyurtmalar</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                isActive={activeKey === item.key}
                onClick={() => onSelect?.(item.key)}
              >
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
