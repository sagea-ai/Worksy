"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { IconEdit, IconCheck, IconX } from "@tabler/icons-react"

interface PersonalInfoSectionProps {
  user: any
  profile: any
  onUpdate: (updates: any) => Promise<void>
}

export function PersonalInfoSection({ user, profile, onUpdate }: PersonalInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.emailAddresses?.[0]?.emailAddress || '',
    bio: profile?.profile?.bio || '',
    location: profile?.profile?.location || '',
    website: profile?.profile?.website || '',
    linkedIn: profile?.profile?.linkedIn || '',
    github: profile?.profile?.github || '',
  })

  const handleSave = async () => {
    try {
      await onUpdate({
        profile: {
          ...profile?.profile,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          linkedIn: formData.linkedIn,
          github: formData.github,
        }
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving personal info:', error)
    }
  }

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.emailAddresses?.[0]?.emailAddress || '',
      bio: profile?.profile?.bio || '',
      location: profile?.profile?.location || '',
      website: profile?.profile?.website || '',
      linkedIn: profile?.profile?.linkedIn || '',
      github: profile?.profile?.github || '',
    })
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details and contact information
            </CardDescription>
          </div>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <IconEdit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <IconX className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                <IconCheck className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            disabled={true}
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Email address is managed by your account settings
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            placeholder="Tell us about yourself..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            disabled={!isEditing}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            placeholder="City, Country"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">Social Links</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                placeholder="https://yourwebsite.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedIn">LinkedIn</Label>
              <Input
                id="linkedIn"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedIn}
                onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
                disabled={!isEditing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                placeholder="https://github.com/username"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
