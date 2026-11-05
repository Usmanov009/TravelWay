"use client"

import * as React from "react"

import { NavDocuments } from "@/admin/dashboard/nav-documents"
import { NavMain } from "@/admin/dashboard/nav-main"
import { NavSecondary } from "@/admin/dashboard/nav-secondary"
import { NavUser } from "@/admin/dashboard/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { IconPlaceholder } from "@/admin/dashboard/icon-placeholder"
import type { AdminTab, AdminUser } from "@/admin/adminTypes"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  currentTab: AdminTab
  onSelectTab: (tab: AdminTab) => void
  currentAdmin: AdminUser
  onExitToApp: () => void
}

export function AppSidebar({
  currentTab,
  onSelectTab,
  currentAdmin,
  onExitToApp,
  ...props
}: AppSidebarProps) {
  const navMain = [
    {
      key: "dashboard",
      title: "Boshqaruv paneli",
      icon: <IconPlaceholder lucide="LayoutDashboardIcon" />,
    },
    {
      key: "tours",
      title: "Turpaketlar",
      icon: <IconPlaceholder lucide="ListIcon" />,
    },
    {
      key: "combo",
      title: "Combo turlar",
      icon: <IconPlaceholder lucide="LayersIcon" />,
    },
    {
      key: "flights",
      title: "Aviachiptalar",
      icon: <IconPlaceholder lucide="PlaneIcon" />,
    },
    {
      key: "hotels",
      title: "Mehmonxonalar",
      icon: <IconPlaceholder lucide="HotelIcon" />,
    },
  ]

  const documents = [
    {
      key: "bookings",
      name: "Buyurtmalar",
      icon: <IconPlaceholder lucide="ReceiptIcon" />,
    },
    {
      key: "price_alerts",
      name: "Narx signallari",
      icon: <IconPlaceholder lucide="BellIcon" />,
    },
    {
      key: "users",
      name: "Mijozlar bazasi",
      icon: <IconPlaceholder lucide="UsersIcon" />,
    },
  ]

  const navSecondary = [
    {
      key: "settings",
      title: "Sozlamalar",
      icon: <IconPlaceholder lucide="Settings2Icon" />,
    },
    {
      key: "help",
      title: "Yordam",
      icon: <IconPlaceholder lucide="CircleHelpIcon" />,
    },
    {
      key: "search",
      title: "Qidiruv",
      icon: <IconPlaceholder lucide="SearchIcon" />,
    },
  ]

  const handleSelect = (key: string) => {
    if (key === "help") {
      onExitToApp()
      return
    }
    onSelectTab(key as AdminTab)
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="/admin" />}
            >
              <IconPlaceholder lucide="CommandIcon" className="size-5!" />
              <span className="text-base font-semibold">SayrHub</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={navMain}
          activeKey={currentTab}
          onSelect={handleSelect}
          onQuickCreate={() => onSelectTab("tours")}
        />
        <NavDocuments
          items={documents}
          activeKey={currentTab}
          onSelect={handleSelect}
        />
        <NavSecondary
          items={navSecondary}
          activeKey={currentTab}
          onNavigate={handleSelect}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: currentAdmin.name,
            email: currentAdmin.email || currentAdmin.username || "admin@sayrhub.uz",
            avatar: currentAdmin.avatar || "",
          }}
          onNavigate={handleSelect}
          onLogout={onExitToApp}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
