"use client"

import { useState } from "react"
import { User } from "@clerk/nextjs/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IconEdit, IconCheck, IconX } from "@tabler/icons-react"

interface ProfileHeaderProps {
  user: any // Clerk user type
  profile: any
  onUpdate: (updates: any) => Promise<void>
}

export function ProfileHeader({ user, profile, onUpdate }: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U'
  }

  const getCompletionPercentage = () => {
    const fields = [
      user?.firstName,
      user?.lastName,
      user?.emailAddresses?.[0]?.emailAddress,
      profile?.profile?.selectedSkills?.length > 0,
      profile?.profile?.experienceLevel,
      profile?.profile?.preferredPlatforms?.length > 0,
      profile?.profile?.hourlyRateMin,
      profile?.profile?.availability,
    ]
    
    const completedFields = fields.filter(Boolean).length
    return Math.round((completedFields / fields.length) * 100)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.imageUrl} alt={user?.firstName || 'User'} />
              <AvatarFallback className="text-lg">
                {getInitials(user?.firstName, user?.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <div>
                <CardTitle className="text-2xl">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName} ${user.lastName}`
                    : user?.firstName || user?.lastName || 'Anonymous User'
                  }
                </CardTitle>
                <CardDescription className="text-base">
                  {user?.emailAddresses?.[0]?.emailAddress}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={profile?.onboardingCompleted ? "default" : "secondary"}>
                  {profile?.onboardingCompleted ? "Profile Complete" : "Setup Required"}
                </Badge>
                {profile?.profile?.experienceLevel && (
                  <Badge variant="outline">
                    {profile.profile.experienceLevel}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <IconEdit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Profile Completion</span>
              <span className="text-sm text-muted-foreground">{getCompletionPercentage()}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionPercentage()}%` }}
              />
            </div>
          </div>
          
          {profile?.profile && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Skills:</span>
                <p className="font-medium">
                  {profile.profile.selectedSkills?.length || 0} skills added
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Platforms:</span>
                <p className="font-medium">
                  {profile.profile.preferredPlatforms?.length || 0} platforms connected
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Rate Range:</span>
                <p className="font-medium">
                  {profile.profile.hourlyRateMin && profile.profile.hourlyRateMax
                    ? `$${profile.profile.hourlyRateMin}-$${profile.profile.hourlyRateMax}/hr`
                    : 'Not set'
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
