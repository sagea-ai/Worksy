"use client"

import * as React from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import {
  IconRobot,
  IconDashboard,
  IconUser,
  IconBusinessplan,
  IconCalendar,
  IconUsers,
  IconExternalLink,
  IconFileText,
  IconCloudDataConnection,
  IconBrain,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: IconDashboard,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: IconUser,
  },
  {
    title: "Deals",
    url: "/deals",
    icon: IconBusinessplan,
  },
  {
    title: "Proposals",
    url: "/proposals",
    icon: IconFileText,
  },
  {
    title: "Teams",
    url: "/teams",
    icon: IconUsers,
  },
  {
    title: "SAGE",
    url: "/sage",
    icon: IconBrain,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isLoaded } = useUser()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const userData = user ? {
    name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User',
    email: user.primaryEmailAddress?.emailAddress || 'user@gigstar.ai',
    avatar: user.imageUrl || '/avatars/user.jpg',
    initials: getInitials(user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User')
  } : {
    name: 'User',
    email: 'user@gigstar.ai', 
    avatar: '/avatars/user.jpg',
    initials: 'U'
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                {/* change the icon to a logo representing "Worksy" */}
                <IconRobot className="size-5 text-primary" />
                <span className="text-base font-semibold">Worksy</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
