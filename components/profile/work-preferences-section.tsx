"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { IconEdit, IconCheck, IconX, IconPlus } from "@tabler/icons-react"

interface WorkPreferencesSectionProps {
  profile: any
  onUpdate: (updates: any) => Promise<void>
}

const AVAILABILITY_OPTIONS = [
  { value: "full-time", label: "Full-time (40+ hours/week)" },
  { value: "part-time", label: "Part-time (20-39 hours/week)" },
  { value: "project-based", label: "Project-based" },
  { value: "flexible", label: "Flexible hours" },
]

const COMMON_PLATFORMS = [
  "Upwork", "Freelancer", "Fiverr", "Toptal", "Guru", "PeoplePerHour",
  "99designs", "Dribbble", "Behance", "LinkedIn", "AngelList", "Remote.co",
  "FlexJobs", "We Work Remotely", "Working Nomads"
]

export function WorkPreferencesSection({ profile, onUpdate }: WorkPreferencesSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newPlatform, setNewPlatform] = useState("")
  const [formData, setFormData] = useState({
    hourlyRateMin: profile?.profile?.hourlyRateMin || 0,
    hourlyRateMax: profile?.profile?.hourlyRateMax || 0,
    availability: profile?.profile?.availability || '',
    preferredPlatforms: profile?.profile?.preferredPlatforms || [],
    workDescription: profile?.profile?.workDescription || '',
    timezone: profile?.profile?.timezone || '',
    languages: profile?.profile?.languages || [],
    projectTypes: profile?.profile?.projectTypes || [],
  })

  const handleAddPlatform = () => {
    if (newPlatform.trim() && !formData.preferredPlatforms.includes(newPlatform.trim())) {
      setFormData({
        ...formData,
        preferredPlatforms: [...formData.preferredPlatforms, newPlatform.trim()]
      })
      setNewPlatform("")
    }
  }

  const handleRemovePlatform = (platformToRemove: string) => {
    setFormData({
      ...formData,
      preferredPlatforms: formData.preferredPlatforms.filter((platform: string) => platform !== platformToRemove)
    })
  }

  const handleAddCommonPlatform = (platform: string) => {
    if (!formData.preferredPlatforms.includes(platform)) {
      setFormData({
        ...formData,
        preferredPlatforms: [...formData.preferredPlatforms, platform]
      })
    }
  }

  const handleSave = async () => {
    try {
      await onUpdate({
        profile: {
          ...profile?.profile,
          hourlyRateMin: formData.hourlyRateMin,
          hourlyRateMax: formData.hourlyRateMax,
          availability: formData.availability,
          preferredPlatforms: formData.preferredPlatforms,
          workDescription: formData.workDescription,
          timezone: formData.timezone,
          languages: formData.languages,
          projectTypes: formData.projectTypes,
        }
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving work preferences:', error)
    }
  }

  const handleCancel = () => {
    setFormData({
      hourlyRateMin: profile?.profile?.hourlyRateMin || 0,
      hourlyRateMax: profile?.profile?.hourlyRateMax || 0,
      availability: profile?.profile?.availability || '',
      preferredPlatforms: profile?.profile?.preferredPlatforms || [],
      workDescription: profile?.profile?.workDescription || '',
      timezone: profile?.profile?.timezone || '',
      languages: profile?.profile?.languages || [],
      projectTypes: profile?.profile?.projectTypes || [],
    })
    setIsEditing(false)
  }

  const availableCommonPlatforms = COMMON_PLATFORMS.filter(
    platform => !formData.preferredPlatforms.includes(platform)
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Work Preferences</CardTitle>
            <CardDescription>
              Set your rates, availability, and preferred work arrangements
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
            <Label htmlFor="hourlyRateMin">Minimum Hourly Rate ($)</Label>
            <Input
              id="hourlyRateMin"
              type="number"
              min="0"
              step="1"
              value={formData.hourlyRateMin}
              onChange={(e) => setFormData({ ...formData, hourlyRateMin: parseInt(e.target.value) || 0 })}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hourlyRateMax">Maximum Hourly Rate ($)</Label>
            <Input
              id="hourlyRateMax"
              type="number"
              min="0"
              step="1"
              value={formData.hourlyRateMax}
              onChange={(e) => setFormData({ ...formData, hourlyRateMax: parseInt(e.target.value) || 0 })}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability">Availability</Label>
          <Select
            value={formData.availability}
            onValueChange={(value) => setFormData({ ...formData, availability: value })}
            disabled={!isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your availability" />
            </SelectTrigger>
            <SelectContent>
              {AVAILABILITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            placeholder="e.g., UTC-5, EST, PST"
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            disabled={!isEditing}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="workDescription">Work Description</Label>
          <Textarea
            id="workDescription"
            placeholder="Describe the type of work you prefer, your strengths, and what makes you unique..."
            value={formData.workDescription}
            onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
            disabled={!isEditing}
            rows={4}
          />
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">Preferred Platforms</Label>
          
          {isEditing && (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a platform..."
                  value={newPlatform}
                  onChange={(e) => setNewPlatform(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPlatform()}
                />
                <Button onClick={handleAddPlatform} size="sm">
                  <IconPlus className="h-4 w-4" />
                </Button>
              </div>
              
              {availableCommonPlatforms.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">Common Platforms:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableCommonPlatforms.slice(0, 10).map((platform) => (
                      <Badge
                        key={platform}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleAddCommonPlatform(platform)}
                      >
                        {platform}
                        <IconPlus className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {formData.preferredPlatforms.map((platform: string, index: number) => (
              <Badge key={index} variant="default" className="text-sm">
                {platform}
                {isEditing && (
                  <button
                    onClick={() => handleRemovePlatform(platform)}
                    className="ml-2 hover:text-destructive"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
            {formData.preferredPlatforms.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No platforms selected. {isEditing ? "Add some platforms above." : "Click edit to add platforms."}
              </p>
            )}
          </div>
        </div>

        {!isEditing && formData.hourlyRateMin > 0 && formData.hourlyRateMax > 0 && (
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">Rate Summary</h4>
            <p className="text-sm text-muted-foreground">
              You're looking for projects paying between <span className="font-medium">${formData.hourlyRateMin}</span> and <span className="font-medium">${formData.hourlyRateMax}</span> per hour.
              {formData.availability && (
                <span> You're available for {formData.availability.replace('-', ' ')} work.</span>
              )}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
