"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { IconEdit, IconCheck, IconX, IconPlus, IconTrash } from "@tabler/icons-react"

interface SkillsSectionProps {
  profile: any
  onUpdate: (updates: any) => Promise<void>
}

interface SkillsFormData {
  selectedSkills: string[]
  experienceLevel: string
}

const EXPERIENCE_LEVELS = [
  { value: "BEGINNER", label: "Beginner (0-1 years)" },
  { value: "INTERMEDIATE", label: "Intermediate (2-4 years)" },
  { value: "ADVANCED", label: "Advanced (5-7 years)" },
  { value: "EXPERT", label: "Expert (8+ years)" },
]

const COMMON_SKILLS = [
  "JavaScript", "TypeScript", "React", "Node.js", "Python", "Java", "C++", "C#",
  "PHP", "Ruby", "Go", "Rust", "Swift", "Kotlin", "HTML", "CSS", "SASS", "LESS",
  "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js", "Express.js", "NestJS",
  "Django", "Flask", "FastAPI", "Spring Boot", "Laravel", "Ruby on Rails",
  "GraphQL", "REST API", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis",
  "Docker", "Kubernetes", "AWS", "Azure", "Google Cloud", "Git", "CI/CD",
  "UI/UX Design", "Figma", "Adobe XD", "Photoshop", "Illustrator", "Sketch",
  "Content Writing", "Copywriting", "SEO", "Digital Marketing", "Social Media",
  "Data Analysis", "Machine Learning", "AI", "DevOps", "Cybersecurity"
]

export function SkillsSection({ profile, onUpdate }: SkillsSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [formData, setFormData] = useState<SkillsFormData>({
    selectedSkills: profile?.profile?.selectedSkills || [],
    experienceLevel: profile?.profile?.experienceLevel || '',
  })

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.selectedSkills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        selectedSkills: [...formData.selectedSkills, newSkill.trim()]
      })
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData({
      ...formData,
      selectedSkills: formData.selectedSkills.filter((skill: string) => skill !== skillToRemove)
    })
  }

  const handleAddCommonSkill = (skill: string) => {
    if (!formData.selectedSkills.includes(skill)) {
      setFormData({
        ...formData,
        selectedSkills: [...formData.selectedSkills, skill]
      })
    }
  }

  const handleSave = async () => {
    try {
      await onUpdate({
        profile: {
          ...profile?.profile,
          selectedSkills: formData.selectedSkills,
          experienceLevel: formData.experienceLevel,
        }
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving skills:', error)
    }
  }

  const handleCancel = () => {
    setFormData({
      selectedSkills: profile?.profile?.selectedSkills || [],
      experienceLevel: profile?.profile?.experienceLevel || '',
    })
    setIsEditing(false)
  }

  const availableCommonSkills = COMMON_SKILLS.filter(
    skill => !formData.selectedSkills.includes(skill)
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Skills & Experience</CardTitle>
            <CardDescription>
              Manage your skills and experience level to get better job matches
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
        <div className="space-y-2">
          <Label htmlFor="experienceLevel">Experience Level</Label>
          <Select
            value={formData.experienceLevel}
            onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}
            disabled={!isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your experience level" />
            </SelectTrigger>
            <SelectContent>
              {EXPERIENCE_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">Your Skills</Label>
          
          {isEditing && (
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a skill..."
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <Button onClick={handleAddSkill} size="sm">
                  <IconPlus className="h-4 w-4" />
                </Button>
              </div>
              
              {availableCommonSkills.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">Common Skills:</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableCommonSkills.slice(0, 20).map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                        onClick={() => handleAddCommonSkill(skill)}
                      >
                        {skill}
                        <IconPlus className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {formData.selectedSkills.map((skill: string, index: number) => (
              <Badge key={index} variant="default" className="text-sm">
                {skill}
                {isEditing && (
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 hover:text-destructive"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
            {formData.selectedSkills.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No skills added yet. {isEditing ? "Add some skills above." : "Click edit to add skills."}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
