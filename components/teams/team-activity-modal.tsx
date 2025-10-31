"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { IconActivity, IconUsers, IconUserPlus, IconUserMinus, IconBriefcase, IconCrown, IconMail, IconBolt } from "@tabler/icons-react"
import { formatDistanceToNow } from "date-fns"

interface TeamActivity {
  id: string
  activityType: string
  description: string
  createdAt: string
  metadata?: any
  user?: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  }
  team?: {
    id: string
    name: string
  }
}

interface TeamActivityModalProps {
  isOpen: boolean
  onClose: () => void
  teamId: string
  teamName: string
}

const activityIcons = {
  MEMBER_JOINED: IconUserPlus,
  MEMBER_LEFT: IconUserMinus,
  MEMBER_INVITED: IconMail,
  TEAM_SUMMONED: IconBolt,
  JOB_ASSIGNED: IconBriefcase,
  PROJECT_STARTED: IconActivity,
  PROJECT_COMPLETED: IconActivity,
  TEAM_CREATED: IconCrown,
}

const activityColors = {
  MEMBER_JOINED: "text-green-600 dark:text-green-400",
  MEMBER_LEFT: "text-red-600 dark:text-red-400",
  MEMBER_INVITED: "text-blue-600 dark:text-blue-400",
  TEAM_SUMMONED: "text-purple-600 dark:text-purple-400",
  JOB_ASSIGNED: "text-orange-600 dark:text-orange-400",
  PROJECT_STARTED: "text-indigo-600 dark:text-indigo-400",
  PROJECT_COMPLETED: "text-green-600 dark:text-green-400",
  TEAM_CREATED: "text-yellow-600 dark:text-yellow-400",
}

export function TeamActivityModal({ isOpen, onClose, teamId, teamName }: TeamActivityModalProps) {
  const [activities, setActivities] = useState<TeamActivity[]>([])
  const [loading, setLoading] = useState(false)

  const fetchActivities = async () => {
    if (!isOpen) return
    
    setLoading(true)
    try {
      const url = teamId === "all" 
        ? '/api/teams/activity?teamId=all' 
        : `/api/teams/activity?teamId=${teamId}`
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      } else {
        console.error('Failed to fetch team activities')
      }
    } catch (error) {
      console.error('Error fetching team activities:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [teamId, isOpen])

  const getActivityIcon = (activityType: string) => {
    const IconComponent = activityIcons[activityType as keyof typeof activityIcons] || IconActivity
    return IconComponent
  }

  const getActivityColor = (activityType: string) => {
    return activityColors[activityType as keyof typeof activityColors] || "text-gray-600 dark:text-gray-400"
  }

  const getUserDisplayName = (user: TeamActivity['user']) => {
    if (!user) return "System"
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.email.split('@')[0]
  }

  const getUserInitials = (user: TeamActivity['user']) => {
    if (!user) return "SY"
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    return user.email.slice(0, 2).toUpperCase()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconActivity className="h-5 w-5" />
            Team Activity Log - {teamName}
          </DialogTitle>
          <DialogDescription>
            Recent activity and events for this team
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <IconActivity className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No activity recorded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => {
                const IconComponent = getActivityIcon(activity.activityType)
                const colorClass = getActivityColor(activity.activityType)
                
                return (
                  <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg border bg-card/50">
                    <div className={`p-2 rounded-full bg-muted ${colorClass}`}>
                      <IconComponent className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {activity.description}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {getUserInitials(activity.user)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {getUserDisplayName(activity.user)}
                            </span>
                            {activity.team && teamId === "all" && (
                              <Badge variant="secondary" className="text-xs">
                                {activity.team.name}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {activity.activityType.replace('_', ' ').toLowerCase()}
                            </Badge>
                          </div>

                          {activity.metadata && activity.metadata.jobTitle && (
                            <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                              <p><strong>Project:</strong> {activity.metadata.jobTitle}</p>
                              {activity.metadata.jobBudget && (
                                <p><strong>Budget:</strong> ${activity.metadata.jobBudget}</p>
                              )}
                              {activity.metadata.jobSkills && activity.metadata.jobSkills.length > 0 && (
                                <div className="mt-1">
                                  <strong>Skills:</strong>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {activity.metadata.jobSkills.slice(0, 3).map((skill: string, idx: number) => (
                                      <Badge key={idx} variant="secondary" className="text-xs py-0">
                                        {skill}
                                      </Badge>
                                    ))}
                                    {activity.metadata.jobSkills.length > 3 && (
                                      <Badge variant="secondary" className="text-xs py-0">
                                        +{activity.metadata.jobSkills.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground text-right">
                          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
