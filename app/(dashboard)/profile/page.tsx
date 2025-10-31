"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { PersonalInfoSection } from "@/components/profile/personal-info-section"
import { SkillsSection } from "@/components/profile/skills-section"
import { MarketplaceConnections } from "@/components/profile/marketplace-connections"
import { WorkPreferencesSection } from "@/components/profile/work-preferences-section"
import { ProfileHeader } from "@/components/profile/profile-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  onboardingCompleted: boolean
  profile?: {
    selectedSkills: string[]
    experienceLevel: string
    preferredPlatforms: string[]
    hourlyRateMin: number
    hourlyRateMax: number
    availability: string
  }
}

export default function ProfilePage() {
  const { user, isLoaded } = useUser()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserProfile()
    }
  }, [isLoaded, user])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setUserProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async (updates: Partial<UserProfile>) => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setUserProfile(updatedProfile)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <div className="animate-pulse">
          <div className="h-8 bg-primary/20 rounded-md w-48 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-primary/10 rounded-lg"></div>
            <div className="h-64 bg-primary/10 rounded-lg"></div>
            <div className="h-64 bg-primary/10 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <Card className="w-96 mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please sign in to view your profile.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      <ProfileHeader 
        user={user} 
        profile={userProfile} 
        onUpdate={handleProfileUpdate}
      />
      
      <Separator className="my-6" />

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="skills">Skills & Experience</TabsTrigger>
          <TabsTrigger value="marketplaces">Marketplace Connections</TabsTrigger>
          <TabsTrigger value="preferences">Work Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <PersonalInfoSection 
            user={user}
            profile={userProfile}
            onUpdate={handleProfileUpdate}
          />
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <SkillsSection 
            profile={userProfile}
            onUpdate={handleProfileUpdate}
          />
        </TabsContent>

        <TabsContent value="marketplaces" className="space-y-6">
          <MarketplaceConnections 
            profile={userProfile}
            onUpdate={handleProfileUpdate}
          />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <WorkPreferencesSection 
            profile={userProfile}
            onUpdate={handleProfileUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
