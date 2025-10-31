"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  IconBrandUpwork,
  IconUsers,
  IconBrandFiverr,
  IconStar,
  IconTarget,
  IconClock,
  IconEdit,
  IconCheck,
  IconX,
  IconPlus,
  IconSettings
} from "@tabler/icons-react"

interface MarketplaceConnectionsProps {
  profile: any
  onUpdate: (updates: any) => Promise<void>
}

interface Marketplace {
  id: string
  name: string
  icon: any
  connected: boolean
  enabled: boolean
  comingSoon?: boolean
  connectionUrl?: string
  description: string
  credentials?: {
    username?: string
    apiKey?: string
    profileUrl?: string
  }
}

const MARKETPLACES: Marketplace[] = [
  {
    id: "freelancer",
    name: "Freelancer",
    icon: IconUsers,
    connected: true,
    enabled: true,
    description: "World's largest freelancing marketplace",
    connectionUrl: "https://freelancer.com",
    credentials: {
      username: "john_developer",
      profileUrl: "https://freelancer.com/u/john_developer"
    }
  },
  {
    id: "upwork",
    name: "Upwork",
    icon: IconBrandUpwork,
    connected: true,
    enabled: true,
    description: "Work marketplace for top talent",
    connectionUrl: "https://upwork.com",
    credentials: {
      username: "john_dev_2024",
      profileUrl: "https://upwork.com/freelancers/~01234567890abcdef"
    }
  },
  {
    id: "fiverr",
    name: "Fiverr",
    icon: IconBrandFiverr,
    connected: false,
    enabled: false,
    comingSoon: true,
    description: "Freelance services marketplace",
    connectionUrl: "https://fiverr.com"
  },
  {
    id: "toptal",
    name: "Toptal",
    icon: IconStar,
    connected: false,
    enabled: false,
    comingSoon: true,
    description: "Top 3% of freelance talent",
    connectionUrl: "https://toptal.com"
  },
  {
    id: "guru",
    name: "Guru",
    icon: IconTarget,
    connected: false,
    enabled: false,
    comingSoon: true,
    description: "Hire freelancers & find freelance jobs",
    connectionUrl: "https://guru.com"
  },
  {
    id: "peopleperhour",
    name: "People per Hour",
    icon: IconClock,
    connected: false,
    enabled: false,
    comingSoon: true,
    description: "Hire freelancers or find freelance work",
    connectionUrl: "https://peopleperhour.com"
  },
]

export function MarketplaceConnections({ profile, onUpdate }: MarketplaceConnectionsProps) {
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>(MARKETPLACES)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedMarketplace, setSelectedMarketplace] = useState<Marketplace | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleToggle = (marketplaceId: string) => {
    setMarketplaces(prev => 
      prev.map(marketplace => 
        marketplace.id === marketplaceId && marketplace.connected && !marketplace.comingSoon
          ? { ...marketplace, enabled: !marketplace.enabled }
          : marketplace
      )
    )
  }

  const handleConnect = (marketplace: Marketplace) => {
    setSelectedMarketplace(marketplace)
    setIsDialogOpen(true)
  }

  const handleDisconnect = (marketplaceId: string) => {
    setMarketplaces(prev => 
      prev.map(marketplace => 
        marketplace.id === marketplaceId
          ? { ...marketplace, connected: false, enabled: false, credentials: undefined }
          : marketplace
      )
    )
  }

  const handleSaveConnection = (credentials: any) => {
    if (selectedMarketplace) {
      setMarketplaces(prev => 
        prev.map(marketplace => 
          marketplace.id === selectedMarketplace.id
            ? { 
                ...marketplace, 
                connected: true, 
                enabled: true,
                credentials: credentials
              }
            : marketplace
        )
      )
      setIsDialogOpen(false)
      setSelectedMarketplace(null)
    }
  }

  const getMarketplaceColor = (marketplaceName: string) => {
    switch (marketplaceName) {
      case 'Freelancer': return 'bg-blue-100 text-blue-600'
      case 'Upwork': return 'bg-green-100 text-green-600'
      case 'Fiverr': return 'bg-green-100 text-green-600'
      case 'Toptal': return 'bg-gray-100 text-gray-600'
      case 'Guru': return 'bg-teal-100 text-teal-600'
      default: return 'bg-orange-100 text-orange-600'
    }
  }

  const connectedCount = marketplaces.filter(m => m.connected).length
  const enabledCount = marketplaces.filter(m => m.enabled).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Marketplace Connections</CardTitle>
            <CardDescription>
              Connect and manage your freelance marketplace accounts for automated job discovery
            </CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right text-sm">
              <p className="font-medium">{connectedCount} Connected</p>
              <p className="text-muted-foreground">{enabledCount} Active</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {marketplaces.map((marketplace) => (
          <div key={marketplace.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${getMarketplaceColor(marketplace.name)}`}>
                  <marketplace.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium">{marketplace.name}</h3>
                    {marketplace.connected && (
                      <Badge variant="default" className="text-xs">
                        Connected
                      </Badge>
                    )}
                    {marketplace.comingSoon && (
                      <Badge variant="secondary" className="text-xs">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {marketplace.description}
                  </p>
                  {marketplace.connected && marketplace.credentials?.username && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Connected as: <span className="font-medium">{marketplace.credentials.username}</span>
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {marketplace.connected && !marketplace.comingSoon && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="Connected"></div>
                )}
                
                {marketplace.comingSoon ? (
                  <Switch 
                    checked={false} 
                    disabled={true}
                    className="opacity-50"
                  />
                ) : marketplace.connected ? (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConnect(marketplace)}
                    >
                      <IconSettings className="h-4 w-4" />
                    </Button>
                    <Switch 
                      checked={marketplace.enabled} 
                      onCheckedChange={() => handleToggle(marketplace.id)}
                    />
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnect(marketplace)}
                  >
                    <IconPlus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedMarketplace?.connected ? 'Manage' : 'Connect'} {selectedMarketplace?.name}
              </DialogTitle>
              <DialogDescription>
                {selectedMarketplace?.connected 
                  ? 'Update your connection settings'
                  : `Connect your ${selectedMarketplace?.name} account for automated job discovery`
                }
              </DialogDescription>
            </DialogHeader>
            
            <ConnectionForm 
              marketplace={selectedMarketplace}
              onSave={handleSaveConnection}
              onDisconnect={selectedMarketplace?.connected ? () => {
                if (selectedMarketplace) {
                  handleDisconnect(selectedMarketplace.id)
                  setIsDialogOpen(false)
                }
              } : undefined}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

interface ConnectionFormProps {
  marketplace: Marketplace | null
  onSave: (credentials: any) => void
  onDisconnect?: () => void
}

function ConnectionForm({ marketplace, onSave, onDisconnect }: ConnectionFormProps) {
  const [credentials, setCredentials] = useState({
    username: marketplace?.credentials?.username || '',
    apiKey: marketplace?.credentials?.apiKey || '',
    profileUrl: marketplace?.credentials?.profileUrl || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(credentials)
  }

  if (!marketplace) return null

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          placeholder={`Your ${marketplace.name} username`}
          value={credentials.username}
          onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="profileUrl">Profile URL</Label>
        <Input
          id="profileUrl"
          placeholder={`Your ${marketplace.name} profile URL`}
          value={credentials.profileUrl}
          onChange={(e) => setCredentials({ ...credentials, profileUrl: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="apiKey">API Key (Optional)</Label>
        <Input
          id="apiKey"
          type="password"
          placeholder="For advanced automation features"
          value={credentials.apiKey}
          onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          API key enables automated bidding and enhanced job discovery
        </p>
      </div>

      <DialogFooter className="flex space-x-2">
        {onDisconnect && (
          <Button type="button" variant="destructive" onClick={onDisconnect}>
            Disconnect
          </Button>
        )}
        <Button type="submit">
          {marketplace.connected ? 'Update' : 'Connect'}
        </Button>
      </DialogFooter>
    </form>
  )
}
