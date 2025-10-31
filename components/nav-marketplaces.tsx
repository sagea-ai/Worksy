"use client"

import { useState } from "react"
import { 
  IconBrandUpwork,
  IconUsers,
  IconBrandFiverr,
  IconStar,
  IconTarget,
  IconClock
} from "@tabler/icons-react"

import { Switch } from "@/components/ui/switch"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const marketplaces = [
  {
    name: "Freelancer",
    icon: IconUsers,
    connected: true,
    enabled: true,
  },
  {
    name: "Upwork",
    icon: IconBrandUpwork,
    connected: true,
    enabled: true,
  },
  {
    name: "Fiverr",
    icon: IconBrandFiverr,
    connected: false,
    enabled: false,
    comingSoon: true,
  },
  {
    name: "Toptal",
    icon: IconStar,
    connected: false,
    enabled: false,
    comingSoon: true,
  },
  {
    name: "Guru",
    icon: IconTarget,
    connected: false,
    enabled: false,
    comingSoon: true,
  },
  {
    name: "People per Hour",
    icon: IconClock,
    connected: false,
    enabled: false,
    comingSoon: true,
  },
]

export function NavMarketplaces() {
  const [toggleStates, setToggleStates] = useState<Record<string, boolean>>(
    marketplaces.reduce((acc, marketplace) => {
      acc[marketplace.name] = marketplace.enabled
      return acc
    }, {} as Record<string, boolean>)
  )

  const handleToggle = (name: string, enabled: boolean) => {
    if (!enabled) return // Don't allow toggling for coming soon items
    setToggleStates(prev => ({
      ...prev,
      [name]: !prev[name]
    }))
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-medium text-sidebar-foreground/70">
        Marketplaces
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {marketplaces.map((marketplace) => (
            <SidebarMenuItem key={marketplace.name} className="px-1 py-0.5">
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className={`flex items-center justify-center w-4 h-4 rounded ${
                    marketplace.name === 'Freelancer' ? 'bg-blue-100 text-blue-600' :
                    marketplace.name === 'Upwork' ? 'bg-green-100 text-green-600' :
                    marketplace.name === 'Fiverr' ? 'bg-green-100 text-green-600' :
                    marketplace.name === 'Toptal' ? 'bg-gray-100 text-gray-600' :
                    marketplace.name === 'Guru' ? 'bg-teal-100 text-teal-600' :
                    'bg-orange-100 text-orange-600'
                  }`}>
                    <marketplace.icon className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-sidebar-foreground truncate block">
                      {marketplace.name}
                    </span>
                    <div className="text-[10px] text-sidebar-foreground/50 leading-tight">
                      {marketplace.connected ? 'Account connected' : 
                       marketplace.comingSoon ? 'Coming soon' : 'Connect account'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {marketplace.connected && !marketplace.comingSoon && (
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full" title="Connected"></div>
                  )}
                  {marketplace.comingSoon ? (
                    <Switch 
                      checked={false} 
                      disabled={true}
                      className="opacity-50"
                    />
                  ) : (
                    <Switch 
                      checked={toggleStates[marketplace.name]} 
                      onCheckedChange={() => handleToggle(marketplace.name, marketplace.enabled)}
                      disabled={!marketplace.connected}
                    />
                  )}
                </div>
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
