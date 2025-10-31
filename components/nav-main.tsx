"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
    comingSoon?: boolean
    external?: boolean
  }[]
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
            >
              <IconCirclePlusFilled />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0 hover:text-green-600 dark:hover:text-green-400"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url
            
            return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton 
                tooltip={item.title}
                asChild={!item.comingSoon}
                disabled={item.comingSoon}
                className={`
                  ${item.comingSoon ? "opacity-60 cursor-not-allowed" : ""} 
                  ${isActive ? "bg-accent text-accent-foreground font-medium" : ""}
                `}
              >
                {item.comingSoon ? (
                  <div className="flex items-center gap-2">
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                    <span className="text-xs text-muted-foreground ml-auto">Coming Soon</span>
                  </div>
                ) : item.external ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </a>
                ) : (
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
