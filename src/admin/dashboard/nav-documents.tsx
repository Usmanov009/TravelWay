"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { IconPlaceholder } from "@/admin/dashboard/icon-placeholder"

export function NavDocuments({
  items,
  activeKey,
  onSelect,
}: {
  items: {
    key: string
    name: string
    icon: React.ReactNode
  }[]
  activeKey?: string
  onSelect?: (key: string) => void
}) {
  const { isMobile } = useSidebar()
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Boshqa bo‘limlar</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              isActive={activeKey === item.key}
              onClick={() => onSelect?.(item.key)}
            >
              {item.icon}
              <span>{item.name}</span>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuAction
                    showOnHover
                    className="aria-expanded:bg-muted"
                  />
                }
              >
                <IconPlaceholder lucide="MoreHorizontalIcon" />
                <span className="sr-only">Ko‘proq</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-24"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem onClick={() => onSelect?.(item.key)}>
                  <IconPlaceholder lucide="FolderIcon" />
                  <span>Ochish</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSelect?.(item.key)}>
                  <IconPlaceholder lucide="ShareIcon" />
                  <span>Ulashish</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive">
                  <IconPlaceholder lucide="Trash2Icon" />
                  <span>O‘chirish</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <IconPlaceholder
              lucide="MoreHorizontalIcon"
              className="text-sidebar-foreground/70"
            />
            <span>Ko‘proq</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
