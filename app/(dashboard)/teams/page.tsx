"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { IconUsers, IconPlus, IconDots, IconSettings, IconTrash, IconUserPlus, IconCrown, IconUser, IconX, IconCheck, IconLogout, IconActivity, IconPhone, IconMail, IconCalendar, IconBell, IconRefresh } from "@tabler/icons-react"
import { toast } from "sonner"
import { TeamActivityModal } from "@/components/teams/team-activity-modal"

interface Team {
  id: string
  name: string
  description: string | null
  createdAt: string
  isCreator: boolean
  creator?: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
    imageUrl: string | null
  }
  members: {
    id: string
    user: {
      id: string
      email: string
      firstName: string | null
      lastName: string | null
      imageUrl: string | null
    }
    joinedAt: string
  }[]
  _count: {
    assignedJobs: number
    jobAssignments: number
  }
}

interface TeamInvitation {
  id: string
  teamId: string
  team: {
    id: string
    name: string
    description: string | null
  }
  inviterEmail: string
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED'
  createdAt: string
}

interface TeamActivity {
  id: string
  type: 'TEAM_CALLED' | 'MEMBER_RESPONDED' | 'TEAM_ASSIGNED' | 'TEAM_COMPLETED'
  description: string
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  }
  team: {
    id: string
    name: string
  }
  createdAt: string
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [invitations, setInvitations] = useState<TeamInvitation[]>([])
  const [teamActivities, setTeamActivities] = useState<TeamActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [unreadActivitiesCount, setUnreadActivitiesCount] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefreshing, setAutoRefreshing] = useState(false)

  const [newTeam, setNewTeam] = useState({
    name: "",
    description: ""
  })

  const [inviteEmails, setInviteEmails] = useState("")

  useEffect(() => {
    fetchTeams()
    fetchInvitations()
    fetchTeamActivities()
    
    const handleTeamAssignmentEvent = (event: StorageEvent) => {
      if (event.key === 'team-job-assigned') {
        console.log('🔄 Team job assignment detected, refreshing teams...')
        fetchTeams(false, true) 
        fetchTeamActivities()
        toast.info("🔄 Teams Updated", {
          description: "New job assignments detected, refreshing team data...",
          duration: 3000,
        })
        localStorage.removeItem('team-job-assigned')
      }
    }

    const handleCustomTeamUpdate = (event: CustomEvent) => {
      console.log('🔄 Custom team update event received, details:', event.detail)
      fetchTeams(false, true)
      fetchTeamActivities()
      if (event.detail?.jobTitle) {
        toast.success("🚀 Job Assigned!", {
          description: `Teams have been assigned to "${event.detail.jobTitle}"`,
          duration: 4000,
        })
      }
    }

    window.addEventListener('storage', handleTeamAssignmentEvent)
    window.addEventListener('team-update' as any, handleCustomTeamUpdate)
    const teamsInterval = setInterval(fetchTeams, 30000)
    const activitiesInterval = setInterval(fetchTeamActivities, 30000)
    
    return () => {
      window.removeEventListener('storage', handleTeamAssignmentEvent)
      window.removeEventListener('team-update' as any, handleCustomTeamUpdate)
      clearInterval(teamsInterval)
      clearInterval(activitiesInterval)
    }
  }, [])

  const fetchTeams = async (showRefreshing = false, isAutoRefresh = false) => {
    if (showRefreshing) setRefreshing(true)
    if (isAutoRefresh) setAutoRefreshing(true)
    
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const data = await response.json()
        const allTeams = [
          ...data.createdTeams.map((team: any) => ({ ...team, isCreator: true })),
          ...data.memberTeams.map((team: any) => ({ ...team, isCreator: false }))
        ]
        setTeams(allTeams)
        
        if (showRefreshing && !isAutoRefresh) {
          toast.success("Teams updated!", {
            description: "Team job assignments have been refreshed",
          })
        }
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
      if (showRefreshing) {
        toast.error("Failed to refresh teams")
      }
    } finally {
      setLoading(false)
      if (showRefreshing) setRefreshing(false)
      if (isAutoRefresh) {
        setTimeout(() => setAutoRefreshing(false), 1000) 
      }
    }
  }

  const handleRefresh = async () => {
    await Promise.all([
      fetchTeams(true),
      fetchTeamActivities()
    ])
  }

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/teams/invitations')
      if (response.ok) {
        const data = await response.json()
        setInvitations(data.invitations)
      }
    } catch (error) {
      console.error('Error fetching invitations:', error)
    }
  }

  const fetchTeamActivities = async () => {
    setActivitiesLoading(true)
    try {
      const response = await fetch('/api/teams/activity?teamId=all')
      if (response.ok) {
        const data = await response.json()
        setTeamActivities(data.activities)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const newActivities = data.activities.filter((activity: TeamActivity) => 
          activity.createdAt > oneDayAgo
        )
        setUnreadActivitiesCount(newActivities.length)
      }
    } catch (error) {
      console.error('Error fetching team activities:', error)
    } finally {
      setActivitiesLoading(false)
    }
  }

  const createTeam = async () => {
    if (!newTeam.name.trim()) {
      toast.error("Team name is required")
      return
    }

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTeam)
      })

      if (response.ok) {
        toast.success("Team created successfully")
        setIsCreateDialogOpen(false)
        setNewTeam({ name: "", description: "" })
        fetchTeams()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to create team")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    }
  }

  const inviteMembers = async () => {
    if (!selectedTeam || !inviteEmails.trim()) {
      toast.error("Please enter email addresses")
      return
    }

    const emails = inviteEmails.split(',').map(email => email.trim()).filter(email => email)
    
    try {
      const response = await fetch(`/api/teams/${selectedTeam.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emails })
      })

      if (response.ok) {
        const data = await response.json()
        
        if (data.results?.length > 0) {
          data.results.forEach((result: any) => {
            toast.success(`Invitation sent to ${result.email}`)
          })
        }
        
        if (data.errors?.length > 0) {
          data.errors.forEach((error: string) => toast.error(error))
        }
        
        if (!data.results?.length && !data.errors?.length) {
          toast.success("Invitations processed")
        }
        
        setIsInviteDialogOpen(false)
        setInviteEmails("")
        setSelectedTeam(null)
        fetchTeams()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to send invitations")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    }
  }

  const respondToInvitation = async (invitationId: string, accept: boolean) => {
    try {
      const response = await fetch('/api/teams/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invitationId,
          action: accept ? 'accept' : 'decline'
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (accept) {
          toast.success(data.message || "Invitation accepted successfully!")
        } else {
          toast.success(data.message || "Invitation declined")
        }
        fetchInvitations()
        if (accept) {
          fetchTeams()
        }
      } else {
        const error = await response.json()
        toast.error(error.error || `Failed to ${accept ? 'accept' : 'decline'} invitation`)
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    }
  }

  const removeMember = async (teamId: string, userId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/members?userId=${userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        toast.success("Member removed successfully")
        fetchTeams()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to remove member")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    }
  }

  const deleteTeam = async (teamId: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success("Team deleted successfully")
        fetchTeams()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to delete team")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    }
  }

  const leaveTeam = async (teamId: string, teamName: string) => {
    try {
      const response = await fetch(`/api/teams/${teamId}/members`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || `Left team "${teamName}" successfully`)
        fetchTeams()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to leave team")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <div className="flex items-center space-x-3 mb-6">
          <IconUsers className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Teams</h1>
            <p className="text-muted-foreground">
              Collaborate with your team members
            </p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 border border-primary/20">
              <IconUsers className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Teams
                </h1>
                {autoRefreshing && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20">
                    <IconRefresh className="h-3 w-3 animate-spin text-primary" />
                    <span className="text-xs font-medium text-primary">Updating...</span>
                  </div>
                )}
              </div>
              <p className="text-muted-foreground text-lg mt-1">
                Collaborate with your team members on exciting projects
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="default"
              onClick={() => setIsActivityModalOpen(true)}
              className="relative shadow-sm hover:shadow-md transition-all duration-200"
            >
              <IconBell className="h-4 w-4 mr-2" />
              Activity
              {unreadActivitiesCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs shadow-md"
                >
                  {unreadActivitiesCount > 99 ? '99+' : unreadActivitiesCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="outline"
              size="default"
              onClick={handleRefresh}
              disabled={refreshing}
              className="shadow-sm hover:shadow-md transition-all duration-200"
            >
              <IconRefresh className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                  <IconPlus className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
                      <IconUsers className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-semibold">Create New Team</DialogTitle>
                      <DialogDescription className="text-sm text-muted-foreground">
                        Create a team to collaborate with other freelancers
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium">Team Name</Label>
                    <Input
                      id="name"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                      placeholder="Enter team name"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={newTeam.description}
                      onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                      placeholder="Describe your team's focus and goals..."
                      rows={3}
                      className="resize-none"
                    />
                  </div>
                </div>
                
                <DialogFooter className="gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={createTeam}
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    disabled={!newTeam.name.trim()}
                  >
                    Create Team
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

      {/* Team Invitations */}
      {invitations.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Team Invitations</CardTitle>
            <CardDescription>
              You have pending team invitations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{invitation.team.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Invited by {invitation.inviterEmail}
                    </p>
                    {invitation.team.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {invitation.team.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => respondToInvitation(invitation.id, true)}
                    >
                      <IconCheck className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => respondToInvitation(invitation.id, false)}
                    >
                      <IconX className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Activity is now accessible via the Activity button in the header */}

        {/* Teams Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id} className="group hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors shrink-0">
                    <IconUsers className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg font-semibold truncate mb-2">{team.name}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      {team.isCreator && (
                        <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                          <IconCrown className="h-3 w-3 mr-1" />
                          Owner
                        </Badge>
                      )}
                      {teamActivities.some(activity => 
                        activity.team?.id === team.id && 
                        (activity.type === 'TEAM_CALLED' || activity.type === 'TEAM_ASSIGNED') &&
                        new Date(activity.createdAt) > new Date(Date.now() - 10 * 60 * 1000) 
                      ) && (
                        <Badge variant="default" className="text-xs bg-green-500/90 hover:bg-green-600 text-white border-green-500/20 animate-pulse">
                          New Assignment
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <IconDots className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {team.isCreator ? (
                    <>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTeam(team)
                          setIsInviteDialogOpen(true)
                        }}
                      >
                        <IconUserPlus className="h-4 w-4 mr-2" />
                        Invite Members
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteTeam(team.id)}
                        className="text-red-600"
                      >
                        <IconTrash className="h-4 w-4 mr-2" />
                        Delete Team
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => leaveTeam(team.id, team.name)}
                      className="text-red-600"
                    >
                      <IconLogout className="h-4 w-4 mr-2" />
                      Leave Team
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
              <CardContent className="space-y-4">
                {team.description && (
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg border border-border/50">
                    {team.description}
                  </p>
                )}
                
                {/* Team Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/30">
                    <div className="flex items-center gap-2">
                      <IconUser className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Members</span>
                    </div>
                    <span className="text-lg font-bold text-primary">{team.members.length}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/30">
                    <div className="flex items-center gap-2">
                      <IconActivity className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Active Jobs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-primary">{(team._count.assignedJobs || 0) + (team._count.jobAssignments || 0)}</span>
                      {teamActivities.some(activity => 
                        activity.team?.id === team.id && 
                        (activity.type === 'TEAM_CALLED' || activity.type === 'TEAM_ASSIGNED') &&
                        new Date(activity.createdAt) > new Date(Date.now() - 5 * 60 * 1000)
                      ) && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Recently assigned to new project"></div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Team Members */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Team Members</p>
                    <span className="text-xs text-muted-foreground">{team.members.length} members</span>
                  </div>
                  <div className="space-y-2">
                    {team.members.slice(0, 3).map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-md border border-border/30">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <IconUser className="h-3 w-3 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {member.user.firstName} {member.user.lastName} 
                              {!member.user.firstName && !member.user.lastName && member.user.email}
                            </span>
                            {team.isCreator && team.creator?.id === member.user.id && (
                              <Badge variant="outline" className="text-xs w-fit mt-1 bg-amber-500/10 text-amber-600 border-amber-500/20">
                                <IconCrown className="h-2 w-2 mr-1" />
                                Creator
                              </Badge>
                            )}
                          </div>
                        </div>
                        {team.isCreator && team.creator?.id !== member.user.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(team.id, member.user.id)}
                            className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <IconX className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {team.members.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        +{team.members.length - 3} more members
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
          </Card>
        ))}
      </div>

      {teams.length === 0 && (
        <Card>
          <CardContent className="text-center py-16">
            <IconUsers className="h-20 w-20 mx-auto text-muted-foreground mb-6" />
            <h3 className="text-xl font-semibold mb-2">No Teams Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Create your first team to start collaborating with other freelancers and take on bigger projects together.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <IconPlus className="h-4 w-4 mr-2" />
              Create Your First Team
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Invite Members Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
            <DialogDescription>
              Invite people to join {selectedTeam?.name} by entering their email addresses
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="emails">Email Addresses</Label>
              <Textarea
                id="emails"
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                placeholder="Enter email addresses separated by commas"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Separate multiple email addresses with commas
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={inviteMembers}>Send Invitations</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Activity Modal */}
        <TeamActivityModal
          isOpen={isActivityModalOpen}
          onClose={() => setIsActivityModalOpen(false)}
          teamId="all"
          teamName="All Teams"
        />
      </div>
    </div>
  )
}
