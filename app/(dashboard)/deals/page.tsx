"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
  IconBusinessplan,
  IconMapPin,
  IconClock,
  IconUsers,
  IconRefresh,
  IconTrendingUp,
  IconBrain,
  IconGlobe,
  IconBulb,
  IconSend,
  IconList,
  IconCode,
  IconChevronDown,
  IconChevronUp,
  IconSettings,
  IconExternalLink,
  IconArrowLeft
} from '@tabler/icons-react'
import { LoadingScreen } from "@/components/ui/loading-screen"
import { toast } from "sonner"

interface JobAnalysis {
  marketAnalysis?: {
    industry?: string
    marketSize?: string
    targetAudience?: string
    growthTrends?: string[]
    opportunity?: string
    targetUsers?: string
    [key: string]: any
  }
  competitors?: Array<{
    name: string
    website?: string
    description?: string
    strengths: string[] | string | any
    weaknesses?: string[] | string | any
    [key: string]: any
  }>
  technicalRequirements?: {
    complexity?: 'Low' | 'Medium' | 'High'
    estimatedTimeframe?: string
    keyTechnologies?: string[]
    challenges?: string[]
    functional?: {[key: string]: any}
    nonFunctional?: {[key: string]: any}
    [key: string]: any
  }
  businessInsights?: {
    revenueModel?: string
    keyFeatures?: string[]
    successFactors?: string[]
    risks?: string[]
    keyPainPoints?: {[key: string]: any}
    valueCreationOpportunities?: {[key: string]: any}
    [key: string]: any
  }
  recommendations?: {
    bidStrategy?: string
    proposedApproach?: string
    differentiators?: string[]
    projectManagement?: string
    qualityAssurance?: string
    selectionCriteria?: string
    [key: string]: any
  }
  rawResponse?: string
  note?: string
  // Allow any additional fields that might come from the API
  industry?: string
  marketSize?: string
  targetAudience?: string
  targetUsers?: string
  opportunity?: string
  growthTrends?: string[]
  [key: string]: any
}

interface BuildingStep {
  step?: number
  name?: string
  title?: string
  description: string
  estimatedTime?: string
  timeEstimate?: string
  criteria?: string
  resources?: string[]
  deliverables?: string[]
}

interface BuildingPlan {
  overview: string
  totalTimeEstimate: string
  steps: BuildingStep[]
  requiredSkills: string[]
  recommendations: string[]
}

interface Job {
  id: number
  title: string
  description: string
  price: number
  currency: string
  platform: string
  location: string
  postedTime: string
  skills: string[]
  proposalCount: number
  rating: number
  isUrgent: boolean
  verified: boolean
  type: string
  ownerName: string
  userJobState?: 'NEW' | 'ANALYZING' | 'DECLINED' | 'PROPOSED' | 'NEGOTIATING' | 'TEAM_SUMMONED' | 'ORDER_CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ERROR'
  internalJobId?: string // The internal CUID for this job in our database
}

interface JobsResponse {
  jobs: Job[]
  total: number
  offset: number
  limit: number
  fallback?: boolean
  error?: string
}

interface ChatMessage {
  id: string
  type: 'user' | 'ai' | 'ai_analysis' | 'ai_building_plan' | 'ai_generating' | 'user_choice' | 'ai_question'
  content: string
  timestamp: Date
  data?: any 
  choice?: string 
}

export default function DealsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [usingFallback, setUsingFallback] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysis | null>(null)
  const [analyzingJob, setAnalyzingJob] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [message, setMessage] = useState('')
  const [buildingPlan, setBuildingPlan] = useState<BuildingPlan | null>(null)
  const [generatingSteps, setGeneratingSteps] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [conversationStarted, setConversationStarted] = useState(false)
  const [overviewExpanded, setOverviewExpanded] = useState(true)
  const [jobDescriptionExpanded, setJobDescriptionExpanded] = useState(true)
  const [pendingChatStorage, setPendingChatStorage] = useState(false)
  const [selectedJobState, setSelectedJobState] = useState<string>('ALL')
  const [systemPromptDialogOpen, setSystemPromptDialogOpen] = useState(false)
  const [teamSelectionDialogOpen, setTeamSelectionDialogOpen] = useState(false)
  const [availableTeams, setAvailableTeams] = useState<any[]>([])
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([])
  const [loadingTeamSelection, setLoadingTeamSelection] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState(`You are Worksy, an expert freelancer assistant that helps analyze projects and create detailed building plans. 

When analyzing projects:
- Focus on market opportunities and technical feasibility

  // Handle mobile viewport and layout issues
  useEffect(() => {
    // Prevent zoom on mobile when focusing inputs
    const handleViewportResize = () => {
      const viewport = document.querySelector('meta[name=viewport]')
      if (!viewport) {
        const meta = document.createElement('meta')
        meta.name = 'viewport'
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        document.head.appendChild(meta)
      }
    }
    
    handleViewportResize()
    
    // Add CSS for safe areas and mobile handling
    const style = document.createElement('style')
    style.textContent = \`
      .safe-area-inset-bottom { padding-bottom: env(safe-area-inset-bottom); }
      .pb-safe { padding-bottom: calc(1rem + env(safe-area-inset-bottom)); }
      .overscroll-behavior-contain { overscroll-behavior: contain; }
      
      /* Mobile-only styles */
      @media screen and (max-width: 1023px) {
        /* Prevent iOS zoom on input focus */
        input, textarea, select {
          font-size: 16px !important;
        }
        
        /* Ensure proper mobile layout */
        html, body {
          overflow: hidden;
          height: 100vh;
          height: 100dvh;
        }
      }
      
      /* Desktop styles */
      @media screen and (min-width: 1024px) {
        html, body {
          overflow: auto;
          height: auto;
        }
      }
    \`
    document.head.appendChild(style)
    
    return () => {
      if (style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }
  }, [])
- Identify key requirements and potential challenges
- Provide actionable business insights
- Suggest competitive advantages and differentiators

When creating building plans:
- Break down complex projects into manageable steps
- Estimate realistic timeframes for each phase
- List required tools, technologies, and resources
- Focus on deliverables and milestones

Always be helpful, professional, and provide practical recommendations that help users win projects and deliver excellent results.`)

  const handleSaveSystemPrompt = () => {
    // TODO: In the future, this could be saved to user preferences or passed to API calls
    console.log('System prompt saved:', systemPrompt)
    
    // For now, just store in localStorage so it persists
    try {
      localStorage.setItem('gigstar-system-prompt', systemPrompt)
      console.log('✅ System prompt saved to localStorage')
    } catch (error) {
      console.error('❌ Failed to save system prompt:', error)
    }
    
    setSystemPromptDialogOpen(false)
  }

  useEffect(() => {
    try {
      const savedPrompt = localStorage.getItem('gigstar-system-prompt')
      if (savedPrompt) {
        setSystemPrompt(savedPrompt)
        console.log('✅ Loaded system prompt from localStorage')
      }
    } catch (error) {
      console.error('❌ Failed to load system prompt:', error)
    }
  }, [])

  const generateMessageId = (jobId: string, messageType: string, sequence?: number) => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substr(2, 9)
    return `${jobId}-${messageType}-${timestamp}-${random}`
  }

  const handleButtonClick = (choice: string, job: Job) => {
    const choiceMessage: ChatMessage = {
      id: generateMessageId(job.id.toString(), 'user_choice'),
      type: 'user_choice',
      content: `User selected: ${choice}`,
      choice: choice,
      timestamp: new Date()
    }
    
    setChatMessages(prev => [...prev, choiceMessage])
    
    if (choice === 'analysis') {
      startAnalysis(job)
    } else if (choice === 'building_steps') {
      startBuildingPlan(job)
    }
    
    setTimeout(() => storeChatHistory(), 500)
  }

  const fetchJobs = async (showRefreshing = false, loadMore = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else if (loadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const currentOffset = loadMore ? offset : 0
      const limit = 20

      console.log(`🔍 Fetching jobs from API... (offset: ${currentOffset}, limit: ${limit})`)
      
      const [jobsResponse, managedJobsResponse] = await Promise.all([
        fetch(`/api/jobs?limit=${limit}&offset=${currentOffset}`),
        fetch('/api/jobs/manage')
      ])
      
      if (!jobsResponse.ok) {
        throw new Error(`Failed to fetch jobs: ${jobsResponse.status} ${jobsResponse.statusText}`)
      }

      const jobsData: JobsResponse = await jobsResponse.json()
      const managedJobsData = managedJobsResponse.ok ? await managedJobsResponse.json() : { jobs: [] }
      
      console.log('✅ Received', jobsData.jobs.length, 'jobs from API')
      console.log('✅ Received', managedJobsData.jobs?.length || 0, 'managed jobs')
      
      const managedJobsMap = new Map()
      if (managedJobsData.jobs) {
        managedJobsData.jobs.forEach((managedJob: any) => {
          const key = `${managedJob.platform}-${managedJob.externalId}`
          managedJobsMap.set(key, {
            state: managedJob.state,
            internalId: managedJob.id
          })
        })
      }
      
      const jobsWithStates = jobsData.jobs.map((job: Job) => {
        const key = `${job.platform.toUpperCase()}-${job.id}`
        const managedJob = managedJobsMap.get(key)
        
        return {
          ...job,
          userJobState: managedJob?.state || 'NEW',
          internalJobId: managedJob?.internalId
        }
      })
      
      if (jobsData.fallback) {
        console.log('⚠️ Using fallback data:', jobsData.error)
        setUsingFallback(true)
      } else {
        setUsingFallback(false)
      }
      
      if (loadMore) {
        setJobs(prev => [...prev, ...jobsWithStates])
        setOffset(prev => prev + limit)
      } else {
        setJobs(jobsWithStates)
        setOffset(limit)
      }

      setHasMore(jobsData.jobs.length === limit)
      
    } catch (err) {
      console.error('❌ Error fetching jobs:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs')
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    if (selectedJob && chatMessages.length > 0 && selectedJob.internalJobId) {
      const currentState = selectedJob.userJobState || 'NEW'
      const shouldStoreChatHistory = ['ANALYZING', 'PROPOSED', 'PROPOSING'].includes(currentState)
      
      if (shouldStoreChatHistory) {
        const timeoutId = setTimeout(() => {
          storeChatHistory()
        }, 2000)
        
        return () => clearTimeout(timeoutId)
      }
    }
  }, [chatMessages, selectedJob])

  useEffect(() => {
    console.log('🔄 State Change - jobAnalysis:', jobAnalysis ? 'HAS DATA' : 'NULL', jobAnalysis)
  }, [jobAnalysis])

  useEffect(() => {
    console.log('🔄 State Change - buildingPlan:', buildingPlan ? 'HAS DATA' : 'NULL', buildingPlan)
  }, [buildingPlan])

  useEffect(() => {
    console.log('🔄 State Change - chatMessages count:', chatMessages.length, 'types:', chatMessages.map(m => m.type))
  }, [chatMessages])

  useEffect(() => {
    console.log('🔄 State Change - conversationStarted:', conversationStarted)
  }, [conversationStarted])

  useEffect(() => {
    const checkTeamNotifications = async () => {
      try {
        const teamsResponse = await fetch('/api/teams');
        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          
          for (const team of teamsData.teams || []) {
            const activityResponse = await fetch(`/api/teams/activity?teamId=${team.id}`);
            if (activityResponse.ok) {
              const activityData = await activityResponse.json();
              
              const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
              const recentActivities = activityData.activities?.filter((activity: any) => 
                new Date(activity.createdAt) > fiveMinutesAgo &&
                activity.activityType === 'MEMBER_JOINED'
              ) || [];
              
              recentActivities.forEach((activity: any) => {
                const memberName = activity.user ? 
                  `${activity.user.firstName} ${activity.user.lastName}`.trim() || activity.user.email :
                  'Someone';
                
                toast.success(`🎉 ${memberName} joined team "${team.name}"!`, {
                  description: 'Your team is growing stronger',
                  duration: 5000,
                });
              });
            }
          }
        }
      } catch (error) {
        console.error('❌ Error checking team notifications:', error);
      }
    };

    checkTeamNotifications();
    const interval = setInterval(checkTeamNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const getJobStateInfo = (state: string) => {
    switch (state) {
      case 'NEW':
        return { 
          label: 'New', 
          variant: 'outline' as const, 
          className: 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950/20' 
        }
      case 'ANALYZING':
        return { 
          label: 'Analyzing', 
          variant: 'secondary' as const, 
          className: 'border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-950/20 animate-pulse' 
        }
      case 'PROPOSING':
        return { 
          label: 'Proposing', 
          variant: 'secondary' as const, 
          className: 'border-orange-200 text-orange-700 bg-orange-50 dark:border-orange-800 dark:text-orange-300 dark:bg-orange-950/20' 
        }
      case 'PROPOSED':
        return { 
          label: 'Proposed', 
          variant: 'default' as const, 
          className: 'border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-300 dark:bg-green-950/20' 
        }
      case 'NEGOTIATING':
        return { 
          label: 'Negotiating', 
          variant: 'secondary' as const, 
          className: 'border-purple-200 text-purple-700 bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:bg-purple-950/20' 
        }
      case 'TEAM_SUMMONED':
        return { 
          label: 'Team Ready', 
          variant: 'default' as const, 
          className: 'border-indigo-200 text-indigo-700 bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:bg-indigo-950/20' 
        }
      case 'ORDER_CONFIRMED':
        return { 
          label: 'Confirmed', 
          variant: 'default' as const, 
          className: 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:bg-emerald-950/20' 
        }
      case 'IN_PROGRESS':
        return { 
          label: 'In Progress', 
          variant: 'default' as const, 
          className: 'border-cyan-200 text-cyan-700 bg-cyan-50 dark:border-cyan-800 dark:text-cyan-300 dark:bg-cyan-950/20' 
        }
      case 'COMPLETED':
        return { 
          label: 'Completed', 
          variant: 'default' as const, 
          className: 'border-green-200 text-green-800 bg-green-100 dark:border-green-700 dark:text-green-200 dark:bg-green-950/30 font-medium' 
        }
      case 'DECLINED':
        return { 
          label: 'Declined', 
          variant: 'secondary' as const, 
          className: 'border-gray-200 text-gray-600 bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:bg-gray-950/20' 
        }
      case 'CANCELLED':
        return { 
          label: 'Cancelled', 
          variant: 'destructive' as const, 
          className: 'border-red-200 text-red-700 bg-red-50 dark:border-red-800 dark:text-red-300 dark:bg-red-950/20' 
        }
      case 'ERROR':
        return { 
          label: 'Error', 
          variant: 'destructive' as const, 
          className: 'border-red-300 text-red-800 bg-red-100 dark:border-red-700 dark:text-red-200 dark:bg-red-950/30' 
        }
      default:
        return { 
          label: 'New', 
          variant: 'outline' as const, 
          className: 'border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-950/20' 
        }
    }
  }

  const updateLocalJobState = (jobId: number, newState: string) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId 
          ? { ...job, userJobState: newState as any }
          : job
      )
    )
  }

  const handleDeclineJob = async () => {
    if (!selectedJob) return

    try {
      updateLocalJobState(selectedJob.id, 'NEW')
      await updateJobState('NEW', 'User clicked not interested - reset to new state')
      
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'ai',
        content: "Got it! You can always reconsider this opportunity later.",
        timestamp: new Date()
      }])
      
      setTimeout(() => storeChatHistory(), 500)
    } catch (error) {
      console.error('❌ Error declining job:', error)
      updateLocalJobState(selectedJob.id, selectedJob.userJobState || 'NEW')
    }
  }

  const handleRefresh = () => {
    setOffset(0)
    setHasMore(true)
    fetchJobs(true, false)
  }

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchJobs(false, true)
    }
  }

  const analyzeJob = async (job: Job) => {
    setAnalyzingJob(true)
    
    try {
      console.log('🧠 Starting AI analysis for job:', job.title)
      const response = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: job.title,
          description: job.description,
          skills: job.skills,
          price: job.price,
          currency: job.currency,
          jobId: job.internalJobId, 
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ AI analysis completed')
        console.log('📊 Analysis data received:', data.analysis)
        
        if (data.analysis && data.analysis.marketAnalysis) {
          setJobAnalysis(data.analysis)
          console.log('✅ Analysis data stored successfully')
          setTimeout(() => {
            setChatMessages(prev => [...prev, {
              id: (Date.now() + 2).toString(),
              type: 'ai',
              content: `📊 Analysis complete! I've identified this as a ${data.analysis.technicalRequirements?.complexity || 'medium'} complexity ${data.analysis.marketAnalysis?.industry || 'project'} with an estimated timeline of ${data.analysis.technicalRequirements?.estimatedTimeframe || 'several weeks'}. The analysis includes market insights, technical requirements, and strategic recommendations.`,
              timestamp: new Date()
            }])
            setTimeout(() => storeChatHistory(), 500)
          }, 1000)
        } else if (data.analysis && data.analysis.rawResponse) {
          setJobAnalysis({
            note: data.analysis.note || "Analysis completed but needs formatting adjustments.",
            rawResponse: data.analysis.rawResponse
          })
          
          setTimeout(() => {
            setChatMessages(prev => [...prev, {
              id: (Date.now() + 2).toString(),
              type: 'ai',
              content: "📊 I've completed the analysis, but encountered some formatting issues. The core insights are available, though you might want to try the analysis again for a more structured report.",
              timestamp: new Date()
            }])
            setTimeout(() => storeChatHistory(), 500)
          }, 1000)
        } else {
          setJobAnalysis({
            note: "Analysis completed with unexpected format. Please try again."
          })
        }
      } else {
        console.error('❌ Failed to analyze job')
        setJobAnalysis({
          note: "Analysis failed. Please try again later."
        })
        
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            type: 'ai',
            content: "❌ I encountered an issue while analyzing this project. Please try again, or I can help you with other aspects of the project.",
            timestamp: new Date()
          }])
          setTimeout(() => storeChatHistory(), 500)
        }, 1000)
      }
    } catch (error) {
      console.error('💥 Error during job analysis:', error)
      setJobAnalysis({
        note: "Analysis failed due to network error."
      })
      
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: "❌ Network error during analysis. Please check your connection and try again.",
          timestamp: new Date()
        }])
        setTimeout(() => storeChatHistory(), 500)
      }, 1000)
    } finally {
      setAnalyzingJob(false)
    }
  }

  const generateBuildingSteps = async (job: Job, feedback?: string) => {
    setGeneratingSteps(true)
    
    try {
      console.log('🔨 Generating building steps for job:', job.title)
      const response = await fetch('/api/jobs/building-steps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: job.title,
          description: job.description,
          skills: job.skills,
          price: job.price,
          currency: job.currency,
          feedback: feedback || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Building steps generated')
        setBuildingPlan(data.buildingPlan)
        setConversationStarted(true)
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'ai',
            content: "Do you want to have a detailed analysis of the product?",
            timestamp: new Date()
          }])
          setTimeout(() => storeChatHistory(), 500)
        }, 1000)
      } else {
        console.error('❌ Failed to generate building steps')
        setBuildingPlan({
          overview: "Failed to generate building steps. Please try again later.",
          totalTimeEstimate: "Unknown",
          steps: [],
          requiredSkills: [],
          recommendations: []
        })
      }
    } catch (error) {
      console.error('💥 Error during building steps generation:', error)
      setBuildingPlan({
        overview: "Failed to generate building steps due to network error.",
        totalTimeEstimate: "Unknown",
        steps: [],
        requiredSkills: [],
        recommendations: []
      })
    } finally {
      setGeneratingSteps(false)
    }
  }

  const handleJobSelect = async (job: Job) => {
    setSelectedJob(job)
    setJobAnalysis(null)
    setAnalyzingJob(false)
    setBuildingPlan(null)
    setGeneratingSteps(false)
    setChatMessages([])
    setConversationStarted(false)
    setShowMobileChat(true) // Show chat on mobile when job is selected
    
    const currentState = job.userJobState || 'NEW'
    
    console.log('💾 Storing job in database with ANALYZING state...')
    try {
      const storeResponse = await fetch('/api/jobs/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'select_job',
          jobData: {
            id: job.id,
            title: job.title,
            description: job.description,
            price: job.price,
            currency: job.currency,
            platform: job.platform,
            location: job.location,
            skills: job.skills,
            isUrgent: job.isUrgent,
            verified: job.verified
          }
        })
      })
      
      if (storeResponse.ok) {
        const storeResult = await storeResponse.json()
        console.log('✅ Job stored successfully:', storeResult.job?.id)
        
        // Update the job with internal database ID
        if (storeResult.job?.id) {
          job.internalJobId = storeResult.job.id
        }
      } else {
        console.error('❌ Failed to store job in database')
      }
    } catch (error) {
      console.error('❌ Error storing job:', error)
    }
    
    if (job.internalJobId) {
      console.log(`📋 Loading existing data for job ${job.internalJobId}...`)
      
      try {
        const response = await fetch(`/api/jobs/manage?jobId=${job.internalJobId}&externalId=${job.id}&platform=${job.platform}`)
        
        console.log(`🌐 API Response status: ${response.status}`)
        
        if (response.ok) {
          const result = await response.json()
          
          console.log(`📦 Raw API response:`, JSON.stringify(result, null, 2))
          
          if (result.job) {
            console.log(`🔍 Found existing job data:`, {
              hasBuildingPlan: !!result.job.buildingPlan,
              hasAiAnalysis: !!result.job.aiAnalysis,
              hasChatHistory: !!result.job.chatHistory,
              buildingPlanKeys: result.job.buildingPlan ? Object.keys(result.job.buildingPlan) : [],
              aiAnalysisKeys: result.job.aiAnalysis ? Object.keys(result.job.aiAnalysis) : [],
              chatHistoryStructure: result.job.chatHistory ? {
                hasMessages: !!result.job.chatHistory.messages,
                messageCount: result.job.chatHistory.messages?.length || 0
              } : null
            })
            
            console.log(`🏗️ Building Plan Data Structure:`, result.job.buildingPlan)
            console.log(`🧠 AI Analysis Data Structure:`, result.job.aiAnalysis)
            console.log(`💬 Chat History Data Structure:`, result.job.chatHistory)
            
            if (result.job.buildingPlan) {
              console.log('🏗️ Setting building plan state from DB data:', result.job.buildingPlan)
              setBuildingPlan(result.job.buildingPlan)
              setConversationStarted(true)
              console.log('✅ Building plan state variable updated')
            } else {
              console.log('❌ No building plan found in DB')
            }
            
            if (result.job.aiAnalysis) {
              console.log('🧠 Setting analysis state from DB data:', result.job.aiAnalysis)
              setJobAnalysis(result.job.aiAnalysis)
              console.log('✅ Analysis state variable updated')
            } else {
              console.log('❌ No AI analysis found in DB')
            }
            
            if (result.job.chatHistory && result.job.chatHistory.messages && Array.isArray(result.job.chatHistory.messages)) {
              console.log('📱 Loading chat history from DB...')
              const loadedChatMessages = result.job.chatHistory.messages.map((msg: any) => {
                let messageData = {
                  id: msg.id,
                  type: msg.type,
                  content: msg.content,
                  timestamp: new Date(msg.timestamp),
                  data: msg.data,
                  choice: msg.choice
                }
                
                if (msg.type === 'ai_analysis' && result.job.aiAnalysis && !msg.data) {
                  messageData.data = result.job.aiAnalysis
                  console.log('🔗 Attached analysis data to ai_analysis message')
                }
                
                if (msg.type === 'ai_building_plan' && result.job.buildingPlan && !msg.data) {
                  messageData.data = result.job.buildingPlan
                  console.log('🔗 Attached building plan data to ai_building_plan message')
                }
                
                return messageData
              })
              console.log(`📱 Loaded ${loadedChatMessages.length} chat messages from history:`, loadedChatMessages)
              setChatMessages(loadedChatMessages)
              setConversationStarted(true)
              console.log('✅ Chat messages loaded from DB history with data attached')
            } else if (result.job.buildingPlan || result.job.aiAnalysis) {
              console.log('🔄 No chat history found, recreating from stored data...')
              const recreatedMessages: ChatMessage[] = []
              
              const hasAnalysis = result.job.aiAnalysis && (result.job.aiAnalysis.status === 'completed' || result.job.aiAnalysis.marketAnalysis)
              const hasBuildingPlan = result.job.buildingPlan && (result.job.buildingPlan.status === 'completed' || result.job.buildingPlan.steps)
              
              console.log('🔍 Data availability check:', {
                hasAnalysis,
                hasBuildingPlan,
                analysisStatus: result.job.aiAnalysis?.status,
                analysisHasMarketData: !!result.job.aiAnalysis?.marketAnalysis,
                buildingPlanStatus: result.job.buildingPlan?.status,
                buildingPlanHasSteps: !!result.job.buildingPlan?.steps
              })
              
              if (!hasAnalysis && !hasBuildingPlan) {
                recreatedMessages.push({
                  id: generateMessageId(job.id.toString(), 'ai_initial'),
                  type: 'ai_question',
                  content: `👋 Hi! I'm ready to help with this project. What would you like to do first?`,
                  timestamp: new Date(Date.now() - 60000)
                })
              }
              
              if (hasAnalysis) {
                console.log('✅ Adding analysis messages to recreation...')
                recreatedMessages.push({
                  id: generateMessageId(job.id.toString(), 'user_choice_analysis'),
                  type: 'user_choice',
                  content: `User selected: analysis`,
                  choice: 'analysis',
                  timestamp: new Date(Date.now() - 50000) 
                })
                
                recreatedMessages.push({
                  id: generateMessageId(job.id.toString(), 'ai_analysis_completed'),
                  type: 'ai_analysis',
                  content: '✅ Analysis completed! Here are my findings:',
                  timestamp: new Date(Date.now() - 40000), 
                  data: result.job.aiAnalysis
                })
                console.log('📝 Analysis messages added to recreation')
              } else {
                console.log('❌ Skipping analysis messages - no valid analysis data')
              }
              
              if (hasBuildingPlan) {
                console.log('✅ Adding building plan messages to recreation...')
                recreatedMessages.push({
                  id: generateMessageId(job.id.toString(), 'user_choice_building'),
                  type: 'user_choice',
                  content: `User selected: building_steps`,
                  choice: 'building_steps',
                  timestamp: new Date(Date.now() - 30000)
                })
                
                recreatedMessages.push({
                  id: generateMessageId(job.id.toString(), 'ai_building_completed'),
                  type: 'ai_building_plan',
                  content: '🎯 Building plan ready! Here\'s your project roadmap:',
                  timestamp: new Date(Date.now() - 20000), 
                  data: result.job.buildingPlan
                })
                console.log('📝 Building plan messages added to recreation')
              } else {
                console.log('❌ Skipping building plan messages - no valid building plan data')
              }
              
              if (hasAnalysis && !hasBuildingPlan) {
                recreatedMessages.push({
                  id: generateMessageId(job.id.toString(), 'ai_followup_building'),
                  type: 'ai_question',
                  content: '✅ Analysis complete! Would you like me to create a detailed building plan next?',
                  timestamp: new Date(Date.now() - 10000)
                })
              } else if (hasBuildingPlan && !hasAnalysis) {
                recreatedMessages.push({
                  id: generateMessageId(job.id.toString(), 'ai_followup_analysis'),
                  type: 'ai_question',
                  content: '🎯 Building plan ready! Would you like me to analyze this project in detail as well?',
                  timestamp: new Date(Date.now() - 10000) 
                })
              } else if (hasAnalysis && hasBuildingPlan) {
                recreatedMessages.push({
                  id: generateMessageId(job.id.toString(), 'ai_completion'),
                  type: 'ai',
                  content: '🎉 Perfect! You have both the analysis and building plan ready. You can now submit your proposal with confidence!',
                  timestamp: new Date(Date.now() - 10000) 
                })
              }
              
              console.log(`🔄 Final recreated messages (${recreatedMessages.length} total):`, recreatedMessages)
              setChatMessages(recreatedMessages)
              setConversationStarted(true)
              console.log(`✅ Chat messages set in state. Conversation started: true`)
            } else {
              console.log('❌ No chat history and no stored data to recreate from')
            }
            
            if (result.job.buildingPlan || result.job.aiAnalysis || (result.job.chatHistory && result.job.chatHistory.messages?.length > 0)) {
              console.log('✅ Found existing data, skipping initial choice UI')
              return
            } else {
              console.log('❌ No existing data found, will show initial choice UI')
            }
          } else {
            console.log('❌ No job data in API response')
          }
        } else {
          console.log(`❌ API request failed with status: ${response.status}`)
          const errorText = await response.text()
          console.log('❌ Error response:', errorText)
        }
      } catch (error) {
        console.error('Error loading existing job data:', error)
      }
    }
    
    console.log('🚀 Starting choice-based UI for job without existing data...')
    setConversationStarted(true)
    
    const initialMessages: ChatMessage[] = [{
      id: generateMessageId(job.id.toString(), 'ai_question'),
      type: 'ai_question',
      content: `👋 Hi! I'm ready to help with this project. What would you like to do first?`,
      timestamp: new Date()
    }]
    
    setChatMessages(initialMessages)
    
    setTimeout(() => storeChatHistory(), 500)
  }

  const startAnalysis = async (job: Job) => {
    setAnalyzingJob(true)
    
    const generatingMessage: ChatMessage = {
      id: 'generating-analysis',
      type: 'ai_generating',
      content: '🧠 Analyzing project requirements, market conditions, and technical scope...',
      timestamp: new Date()
    }
    
    setChatMessages(prev => [...prev, generatingMessage])
    
    try {
      const response = await fetch('/api/jobs/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: job.title,
          description: job.description,
          skills: job.skills,
          price: job.price,
          currency: job.currency,
          jobId: job.internalJobId || job.id.toString(),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setJobAnalysis(result.analysis)
        
        const analysisMessage: ChatMessage = {
          id: 'analysis-completed',
          type: 'ai_analysis',
          content: '✅ Analysis completed! Here are my findings:',
          timestamp: new Date(),
          data: result.analysis
        }
        
        setChatMessages(prev => prev.filter(msg => msg.id !== 'generating-analysis').concat([analysisMessage]))
        
        setTimeout(() => {
          const followUpMessage: ChatMessage = {
            id: generateMessageId(job.id.toString(), 'ai_question_followup'),
            type: 'ai_question',
            content: '✅ Analysis complete! Would you like me to create a detailed building plan next?',
            timestamp: new Date()
          }
          setChatMessages(prev => [...prev, followUpMessage])
        }, 1000)
        
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to analyze job')
      }
    } catch (error) {
      console.error('Error analyzing job:', error)
      
      const errorMessage: ChatMessage = {
        id: 'analysis-error',
        type: 'ai',
        content: `❌ Sorry, I encountered an error during analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }
      
      setChatMessages(prev => prev.filter(msg => msg.id !== 'generating-analysis').concat([errorMessage]))
    } finally {
      setAnalyzingJob(false)
    }
  }

  const renderAnalysisData = (analysis: JobAnalysis) => {
    console.log('🎨 Rendering analysis data:', analysis)
    console.log('🎨 Analysis keys:', Object.keys(analysis))
    console.log('🎨 Full analysis structure:', JSON.stringify(analysis, null, 2))
    console.log('🎨 Available analysis sections:', {
      marketAnalysis: !!analysis.marketAnalysis,
      technicalRequirements: !!analysis.technicalRequirements,
      businessInsights: !!analysis.businessInsights,
      competitors: !!analysis.competitors,
      recommendations: !!analysis.recommendations,
      rawResponse: !!analysis.rawResponse
    })
    
    // Log specific nested structures if they exist
    if (analysis.marketAnalysis) {
      console.log('🎨 Market Analysis structure:', analysis.marketAnalysis)
    }
    if (analysis.technicalRequirements) {
      console.log('🎨 Technical Requirements structure:', analysis.technicalRequirements)
    }
    if (analysis.businessInsights) {
      console.log('🎨 Business Insights structure:', analysis.businessInsights)
    }
    if (analysis.recommendations) {
      console.log('🎨 Recommendations structure:', analysis.recommendations)
    }
    
    // Helper function to safely extract data from rawResponse
    const extractFromRaw = (pattern: RegExp, raw: string) => {
      const match = raw.match(pattern)
      return match ? match[1]?.trim() : null
    }

    // Helper function to extract list items from rawResponse
    const extractListFromRaw = (sectionPattern: RegExp, raw: string) => {
      const sectionMatch = raw.match(sectionPattern)
      if (!sectionMatch) return []
      
      const sectionText = sectionMatch[1]
      const items = sectionText.split(/[•\-\*]\s+/).filter(item => item.trim().length > 0)
      return items.map(item => item.trim().replace(/^\d+\.\s*/, ''))
    }

    // Parse market analysis data
    const getMarketAnalysis = () => {
      console.log('🔍 Parsing market analysis...')
      
      // Helper function to safely get nested values
      const safeGet = (obj: any, path: string) => {
        return path.split('.').reduce((current, key) => current && current[key], obj)
      }
      
      let marketData: any = null
      
      // Check multiple possible structures
      if (analysis.marketAnalysis && typeof analysis.marketAnalysis === 'object') {
        marketData = analysis.marketAnalysis
        console.log('✅ Found marketAnalysis object:', marketData)
      } else if (safeGet(analysis, 'market_analysis')) {
        marketData = safeGet(analysis, 'market_analysis')
        console.log('✅ Found market_analysis object:', marketData)
      } else if (safeGet(analysis, 'MarketAnalysis')) {
        marketData = safeGet(analysis, 'MarketAnalysis')
        console.log('✅ Found MarketAnalysis object:', marketData)
      }
      
      if (marketData) {
        const rawTrends = marketData.growthTrends || marketData.growth_trends || marketData.trends || []
        const result = {
          industry: marketData.industry || marketData.Industry || marketData.sector || 'Web Development / SEO',
          marketSize: marketData.marketSize || marketData.market_size || marketData.opportunity || marketData.size || 'Growing market for web services',
          targetAudience: marketData.targetAudience || marketData.target_audience || marketData.targetUsers || marketData.target_users || 'Small to medium businesses',
          growthTrends: Array.isArray(rawTrends) ? rawTrends : (typeof rawTrends === 'string' ? [rawTrends] : [])
        }
        console.log('✅ Parsed market data:', result)
        return result
      }
      
      // Check for market data at root level
      const rawRootTrends = analysis.growthTrends || analysis.growth_trends || []
      const rootMarketData = {
        industry: analysis.industry || analysis.Industry || 'Web Development / SEO',
        marketSize: analysis.marketSize || analysis.market_size || analysis.opportunity || 'Growing market',
        targetAudience: analysis.targetAudience || analysis.target_audience || analysis.targetUsers || 'Businesses',
        growthTrends: Array.isArray(rawRootTrends) ? rawRootTrends : (typeof rawRootTrends === 'string' ? [rawRootTrends] : [])
      }
      
      if (rootMarketData.industry || rootMarketData.marketSize || rootMarketData.targetAudience) {
        console.log('✅ Found market data at root level:', rootMarketData)
        return rootMarketData
      }
      
      // Parse from raw response if available
      if (analysis.rawResponse && typeof analysis.rawResponse === 'string') {
        const parsed = {
          industry: extractFromRaw(/(?:industry|sector)[:\s]*([^\n\r]+)/i, analysis.rawResponse) || 'Web Development',
          marketSize: extractFromRaw(/(?:market\s*size|opportunity)[:\s]*([^\n\r]+)/i, analysis.rawResponse) || 'Growing market',
          targetAudience: extractFromRaw(/(?:target\s*audience|target\s*users)[:\s]*([^\n\r]+)/i, analysis.rawResponse) || 'Businesses',
          growthTrends: extractListFromRaw(/(?:growth\s*trends?|trends)[:\s]*([^#\n]*)/i, analysis.rawResponse)
        }
        console.log('✅ Parsed from raw response:', parsed)
        return parsed
      }
      
      console.log('⚠️ No market analysis data found, using defaults')
      return null
    }

    // Parse technical requirements data
    const getTechnicalRequirements = () => {
      if (analysis.technicalRequirements) {
        // Handle new structure with functional and nonFunctional nested objects
        if (analysis.technicalRequirements.functional || analysis.technicalRequirements.nonFunctional) {
          const functional = analysis.technicalRequirements.functional || {}
          const nonFunctional = analysis.technicalRequirements.nonFunctional || {}
          
          // Extract technologies from job skills or requirements
          const keyTechnologies = ['PHP', 'JavaScript', 'SEO', 'WordPress', 'CSS'] // Default based on job data
          
          const rawKeyTech = analysis.technicalRequirements.keyTechnologies || keyTechnologies
          const rawChallenges = Object.values(functional).concat(Object.values(nonFunctional))
            .filter(item => typeof item === 'string' && item.length > 0)
          
          return {
            complexity: (analysis.technicalRequirements.complexity || 'Medium') as 'Low' | 'Medium' | 'High',
            estimatedTimeframe: analysis.technicalRequirements.estimatedTimeframe || 'Not specified',
            keyTechnologies: Array.isArray(rawKeyTech) ? rawKeyTech : (typeof rawKeyTech === 'string' ? [rawKeyTech] : keyTechnologies),
            challenges: Array.isArray(rawChallenges) ? rawChallenges : []
          }
        }
        return analysis.technicalRequirements
      }
      
      // Check for root level technical data
      const rawRootKeyTech = analysis.keyTechnologies || analysis.technologies || []
      const rawRootChallenges = analysis.challenges || []
      const rootLevelTech = {
        complexity: (analysis.complexity || 'Medium') as 'Low' | 'Medium' | 'High',
        estimatedTimeframe: analysis.estimatedTimeframe || analysis.timeframe || 'Not specified',
        keyTechnologies: Array.isArray(rawRootKeyTech) ? rawRootKeyTech : (typeof rawRootKeyTech === 'string' ? [rawRootKeyTech] : []),
        challenges: Array.isArray(rawRootChallenges) ? rawRootChallenges : (typeof rawRootChallenges === 'string' ? [rawRootChallenges] : [])
      }
      
      // If we have any technical data at root level, return it
      if (rootLevelTech.estimatedTimeframe !== 'Not specified' || rootLevelTech.keyTechnologies.length > 0) {
        return rootLevelTech
      }
      
      if (analysis.rawResponse) {
        const complexityMatch = analysis.rawResponse.match(/complexity[:\s]*(low|medium|high)/i)
        const timeframeMatch = analysis.rawResponse.match(/(?:timeframe|timeline|duration)[:\s]*([^\n\r]+)/i)
        const technologiesMatch = analysis.rawResponse.match(/(?:technologies?|tech\s+stack|tools?)[:\s]*([^#\n]*)/i)
        
        return {
          complexity: (complexityMatch ? complexityMatch[1] : 'Medium') as 'Low' | 'Medium' | 'High',
          estimatedTimeframe: timeframeMatch ? timeframeMatch[1].trim() : 'Not specified',
          keyTechnologies: technologiesMatch ? 
            technologiesMatch[1].split(/[,•\-\*]/).map((tech: string) => tech.trim()).filter((tech: string) => tech.length > 0) : [],
          challenges: extractListFromRaw(/challenges?[:\s]*([^#\n]*)/i, analysis.rawResponse)
        }
      }
      
      // Default fallback for SEO/Web development projects
      return {
        complexity: 'Medium' as 'Low' | 'Medium' | 'High',
        estimatedTimeframe: '1-2 weeks',
        keyTechnologies: ['PHP', 'JavaScript', 'SEO', 'WordPress', 'CSS'],
        challenges: ['Google Search Console fixes', 'Page optimization', 'Mobile responsiveness']
      }
    }

    // Parse business insights data
    const getBusinessInsights = () => {
      console.log('🔍 Parsing business insights...')
      
      const safeGet = (obj: any, path: string) => {
        return path.split('.').reduce((current, key) => current && current[key], obj)
      }
      
      let businessData: any = null
      
      // Check multiple possible structures
      if (analysis.businessInsights && typeof analysis.businessInsights === 'object') {
        businessData = analysis.businessInsights
      } else if (safeGet(analysis, 'business_insights')) {
        businessData = safeGet(analysis, 'business_insights')
      } else if (safeGet(analysis, 'BusinessInsights')) {
        businessData = safeGet(analysis, 'BusinessInsights')
      }
      
      if (businessData) {
        const rawFeatures = businessData.keyFeatures || businessData.key_features || businessData.features || []
        const rawFactors = businessData.successFactors || businessData.success_factors || businessData.factors || []
        const rawRisks = businessData.risks || businessData.challenges || []
        
        const result = {
          revenueModel: businessData.revenueModel || businessData.revenue_model || businessData.model || 'Project-based services',
          keyFeatures: Array.isArray(rawFeatures) ? rawFeatures : (typeof rawFeatures === 'string' ? [rawFeatures] : []),
          successFactors: Array.isArray(rawFactors) ? rawFactors : (typeof rawFactors === 'string' ? [rawFactors] : []),
          risks: Array.isArray(rawRisks) ? rawRisks : (typeof rawRisks === 'string' ? [rawRisks] : [])
        }
        console.log('✅ Parsed business insights:', result)
        return result
      }
      
      // Check root level
      if (analysis.revenueModel || analysis.revenue_model) {
        const result = {
          revenueModel: analysis.revenueModel || analysis.revenue_model || 'Service-based',
          keyFeatures: analysis.keyFeatures || analysis.key_features || [],
          successFactors: analysis.successFactors || analysis.success_factors || [],
          risks: analysis.risks || []
        }
        console.log('✅ Found business data at root level:', result)
        return result
      }
      
      if (analysis.rawResponse) {
        const parsed = {
          revenueModel: extractFromRaw(/(?:revenue\s*model|business\s*model)[:\s]*([^\n\r]+)/i, analysis.rawResponse) || 'Service-based',
          keyFeatures: extractListFromRaw(/(?:key\s*features?|features)[:\s]*([^#\n]*)/i, analysis.rawResponse),
          successFactors: extractListFromRaw(/(?:success\s*factors?|critical\s*factors?)[:\s]*([^#\n]*)/i, analysis.rawResponse),
          risks: extractListFromRaw(/(?:risks?|challenges?)[:\s]*([^#\n]*)/i, analysis.rawResponse)
        }
        console.log('✅ Parsed business insights from raw:', parsed)
        return parsed
      }
      
      console.log('⚠️ No business insights found, using defaults')
      return null
    }

    // Parse recommendations data
    const getRecommendations = () => {
      console.log('🔍 Parsing recommendations...')
      
      const safeGet = (obj: any, path: string) => {
        return path.split('.').reduce((current, key) => current && current[key], obj)
      }
      
      let recommendationsData: any = null
      
      // Check multiple possible structures
      if (analysis.recommendations && typeof analysis.recommendations === 'object') {
        recommendationsData = analysis.recommendations
      } else if (safeGet(analysis, 'recommendation')) {
        recommendationsData = safeGet(analysis, 'recommendation')
      } else if (safeGet(analysis, 'Recommendations')) {
        recommendationsData = safeGet(analysis, 'Recommendations')
      }
      
      if (recommendationsData) {
        const rawDifferentiators = recommendationsData.differentiators || (recommendationsData.qualityAssurance ? [recommendationsData.qualityAssurance] : recommendationsData.advantages || [])
        
        const result = {
          bidStrategy: recommendationsData.bidStrategy || recommendationsData.bid_strategy || recommendationsData.strategy || recommendationsData.selectionCriteria || 'Competitive pricing with quality focus',
          proposedApproach: recommendationsData.proposedApproach || recommendationsData.proposed_approach || recommendationsData.approach || recommendationsData.projectManagement || 'Agile development approach',
          differentiators: Array.isArray(rawDifferentiators) ? rawDifferentiators : (typeof rawDifferentiators === 'string' ? [rawDifferentiators] : [])
        }
        console.log('✅ Parsed recommendations:', result)
        return result
      }
      
      // Check root level
      if (analysis.bidStrategy || analysis.bid_strategy || analysis.proposedApproach || analysis.proposed_approach) {
        const result = {
          bidStrategy: analysis.bidStrategy || analysis.bid_strategy || 'Competitive approach',
          proposedApproach: analysis.proposedApproach || analysis.proposed_approach || 'Standard methodology',
          differentiators: analysis.differentiators || []
        }
        console.log('✅ Found recommendations at root level:', result)
        return result
      }
      
      if (analysis.rawResponse) {
        const parsed = {
          bidStrategy: extractFromRaw(/(?:bid\s*strategy|strategy|approach)[:\s]*([^\n\r]+)/i, analysis.rawResponse) || 'Competitive pricing',
          proposedApproach: extractFromRaw(/(?:proposed\s*approach|methodology|process)[:\s]*([^\n\r]+)/i, analysis.rawResponse) || 'Professional approach',
          differentiators: extractListFromRaw(/(?:differentiators?|advantages?|benefits?)[:\s]*([^#\n]*)/i, analysis.rawResponse)
        }
        console.log('✅ Parsed recommendations from raw:', parsed)
        return parsed
      }
      
      console.log('⚠️ No recommendations found, using defaults')
      return null
    }

    const marketAnalysis = getMarketAnalysis()
    const technicalRequirements = getTechnicalRequirements()
    const businessInsights = getBusinessInsights()
    const recommendations = getRecommendations()
    
    return (
      <div className="space-y-6 text-sm">
        {/* Market Analysis */}
        {marketAnalysis && (marketAnalysis.industry || marketAnalysis.marketSize || marketAnalysis.targetAudience) && (
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 shadow-sm">
            <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="p-1 bg-blue-100 dark:bg-blue-900/50 rounded-md">
                <IconGlobe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              Market Analysis
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-blue-100 dark:border-blue-800/50">
                <strong className="text-blue-700 dark:text-blue-300 text-sm">Industry:</strong> 
                <p className="text-foreground mt-1">{marketAnalysis.industry}</p>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-blue-100 dark:border-blue-800/50">
                <strong className="text-blue-700 dark:text-blue-300 text-sm">Market Size:</strong> 
                <p className="text-foreground mt-1">{marketAnalysis.marketSize}</p>
              </div>
              <div className="md:col-span-2 bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-blue-100 dark:border-blue-800/50">
                <strong className="text-blue-700 dark:text-blue-300 text-sm">Target Audience:</strong> 
                <p className="text-foreground mt-1">{marketAnalysis.targetAudience}</p>
              </div>
            </div>
            {marketAnalysis.growthTrends && Array.isArray(marketAnalysis.growthTrends) && marketAnalysis.growthTrends.length > 0 && (
              <div>
                <strong className="text-blue-700 dark:text-blue-300 text-sm">Growth Trends:</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {marketAnalysis.growthTrends.map((trend: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700">{trend}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Technical Requirements */}
        {technicalRequirements && (technicalRequirements.complexity || technicalRequirements.estimatedTimeframe || (technicalRequirements.keyTechnologies && technicalRequirements.keyTechnologies.length > 0)) && (
          <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/30 dark:to-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 shadow-sm">
            <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="p-1 bg-purple-100 dark:bg-purple-900/50 rounded-md">
                <IconCode className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              Technical Requirements
            </h5>
            <div className="text-muted-foreground space-y-1">
              <p><strong>Complexity:</strong> <Badge variant="outline" className="text-xs">{technicalRequirements.complexity}</Badge></p>
              <p><strong>Estimated Timeframe:</strong> {technicalRequirements.estimatedTimeframe}</p>
              {technicalRequirements.keyTechnologies && Array.isArray(technicalRequirements.keyTechnologies) && technicalRequirements.keyTechnologies.length > 0 && (
                <div>
                  <strong>Key Technologies:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {technicalRequirements.keyTechnologies.map((tech: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">{tech}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {technicalRequirements.challenges && Array.isArray(technicalRequirements.challenges) && technicalRequirements.challenges.length > 0 && (
                <div>
                  <strong>Requirements:</strong>
                  <ul className="ml-3 mt-1 space-y-0.5">
                    {technicalRequirements.challenges.map((challenge: string, index: number) => (
                      <li key={index} className="text-xs">• {challenge}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Show functional requirements if available */}
              {analysis.technicalRequirements?.functional && Object.keys(analysis.technicalRequirements.functional).length > 0 && (
                <div>
                  <strong>Functional Requirements:</strong>
                  <ul className="ml-3 mt-1 space-y-0.5">
                    {Object.entries(analysis.technicalRequirements.functional).map(([key, value], index) => (
                      <li key={index} className="text-xs">• <strong>{key}:</strong> {String(value)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Show non-functional requirements if available */}
              {analysis.technicalRequirements?.nonFunctional && Object.keys(analysis.technicalRequirements.nonFunctional).length > 0 && (
                <div>
                  <strong>Non-Functional Requirements:</strong>
                  <ul className="ml-3 mt-1 space-y-0.5">
                    {Object.entries(analysis.technicalRequirements.nonFunctional).map(([key, value], index) => (
                      <li key={index} className="text-xs">• <strong>{key}:</strong> {String(value)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Business Insights */}
        {businessInsights && (businessInsights.revenueModel || (businessInsights.keyFeatures && businessInsights.keyFeatures.length > 0) || (businessInsights.risks && businessInsights.risks.length > 0)) && (
          <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <h5 className="font-semibold text-foreground mb-2 flex items-center gap-1">
              <IconTrendingUp className="h-3 w-3" />
              Business Insights
            </h5>
            <div className="text-muted-foreground space-y-1">
              <p><strong>Revenue Model:</strong> {businessInsights.revenueModel}</p>
              {businessInsights.keyFeatures && Array.isArray(businessInsights.keyFeatures) && businessInsights.keyFeatures.length > 0 && (
                <div>
                  <strong>Key Features:</strong>
                  <ul className="ml-3 mt-1 space-y-0.5">
                    {businessInsights.keyFeatures.map((feature: string, index: number) => (
                      <li key={index} className="text-xs">• {feature}</li>
                    ))}
                  </ul>
                </div>
              )}
              {businessInsights.successFactors && Array.isArray(businessInsights.successFactors) && businessInsights.successFactors.length > 0 && (
                <div>
                  <strong>Success Factors:</strong>
                  <ul className="ml-3 mt-1 space-y-0.5">
                    {businessInsights.successFactors.map((factor: string, index: number) => (
                      <li key={index} className="text-xs">• {factor}</li>
                    ))}
                  </ul>
                </div>
              )}
              {businessInsights.risks && Array.isArray(businessInsights.risks) && businessInsights.risks.length > 0 && (
                <div>
                  <strong>Risks:</strong>
                  <ul className="ml-3 mt-1 space-y-0.5">
                    {businessInsights.risks.map((risk: string, index: number) => (
                      <li key={index} className="text-xs text-orange-600 dark:text-orange-400">• {risk}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Show key pain points if available */}
              {analysis.businessInsights?.keyPainPoints && Object.keys(analysis.businessInsights.keyPainPoints).length > 0 && (
                <div>
                  <strong>Key Pain Points:</strong>
                  <ul className="ml-3 mt-1 space-y-0.5">
                    {Object.entries(analysis.businessInsights.keyPainPoints).map(([key, value], index) => (
                      <li key={index} className="text-xs text-orange-600 dark:text-orange-400">• <strong>{key}:</strong> {String(value)}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Show value creation opportunities if available */}
              {analysis.businessInsights?.valueCreationOpportunities && Object.keys(analysis.businessInsights.valueCreationOpportunities).length > 0 && (
                <div>
                  <strong>Value Creation Opportunities:</strong>
                  <ul className="ml-3 mt-1 space-y-0.5">
                    {Object.entries(analysis.businessInsights.valueCreationOpportunities).map(([key, value], index) => (
                      <li key={index} className="text-xs text-green-600 dark:text-green-400">• <strong>{key}:</strong> {String(value)}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Competitors */}
        {analysis.competitors && analysis.competitors.length > 0 && (
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4 shadow-sm">
            <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="p-1 bg-orange-100 dark:bg-orange-900/50 rounded-md">
                <IconUsers className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              Competitive Analysis
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.competitors.slice(0, 3).map((competitor, index) => (
                <div key={index} className="bg-white/50 dark:bg-gray-800/50 border border-orange-100 dark:border-orange-800/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <strong className="text-sm text-orange-700 dark:text-orange-300">{competitor.name}</strong>
                    {competitor.website && (
                      <a href={competitor.website} target="_blank" rel="noopener noreferrer" 
                         className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        <IconExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{competitor.description}</p>
                  {competitor.strengths && (
                    <div>
                      <strong className="text-orange-700 dark:text-orange-300 text-xs">Strengths:</strong>
                      <div className="mt-1">
                        {Array.isArray(competitor.strengths) 
                          ? (
                              <ul className="ml-3 space-y-0.5">
                                {competitor.strengths.map((strength: string, idx: number) => (
                                  <li key={idx} className="text-xs text-green-600 dark:text-green-400">• {strength}</li>
                                ))}
                              </ul>
                            )
                          : typeof competitor.strengths === 'string'
                          ? (
                              <ul className="ml-3 space-y-0.5">
                                {(competitor.strengths as string).split(/[,;.]/).filter(s => s.trim().length > 0).map((strength: string, idx: number) => (
                                  <li key={idx} className="text-xs text-green-600 dark:text-green-400">• {strength.trim()}</li>
                                ))}
                              </ul>
                            )
                          : <p className="text-xs text-green-600 dark:text-green-400 ml-3">• {String(competitor.strengths)}</p>
                        }
                      </div>
                    </div>
                  )}
                  {competitor.weaknesses && (
                    <div>
                      <strong className="text-orange-700 dark:text-orange-300 text-xs">Weaknesses:</strong>
                      <div className="mt-1">
                        {Array.isArray(competitor.weaknesses) 
                          ? (
                              <ul className="ml-3 space-y-0.5">
                                {competitor.weaknesses.map((weakness: string, idx: number) => (
                                  <li key={idx} className="text-xs text-red-600 dark:text-red-400">• {weakness}</li>
                                ))}
                              </ul>
                            )
                          : typeof competitor.weaknesses === 'string'
                          ? (
                              <ul className="ml-3 space-y-0.5">
                                {(competitor.weaknesses as string).split(/[,;.]/).filter(w => w.trim().length > 0).map((weakness: string, idx: number) => (
                                  <li key={idx} className="text-xs text-red-600 dark:text-red-400">• {weakness.trim()}</li>
                                ))}
                              </ul>
                            )
                          : <p className="text-xs text-red-600 dark:text-red-400 ml-3">• {String(competitor.weaknesses)}</p>
                        }
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {analysis.competitors.length > 3 && (
                <p className="text-xs text-muted-foreground italic">
                  + {analysis.competitors.length - 3} more competitors analyzed
                </p>
              )}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {recommendations && (recommendations.bidStrategy || recommendations.proposedApproach || (recommendations.differentiators && recommendations.differentiators.length > 0)) && (
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/30 dark:to-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 shadow-sm">
            <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="p-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-md">
                <IconBulb className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              Recommendations
            </h5>
            <div className="text-muted-foreground space-y-1">
              <p><strong>Bid Strategy:</strong> {recommendations.bidStrategy}</p>
              <p><strong>Proposed Approach:</strong> {recommendations.proposedApproach}</p>
              {recommendations.differentiators && Array.isArray(recommendations.differentiators) && recommendations.differentiators.length > 0 && (
                <div>
                  <strong>Key Differentiators:</strong>
                  <ul className="ml-3 mt-1 space-y-0.5">
                    {recommendations.differentiators.map((diff: string, index: number) => (
                      <li key={index} className="text-xs">• {diff}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Show raw response if structured data isn't available or as fallback */}
        {analysis.rawResponse && (!marketAnalysis && !technicalRequirements && !businessInsights && !recommendations) && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-950/30 dark:to-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
            <h5 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <div className="p-1 bg-gray-100 dark:bg-gray-900/50 rounded-md">
                <IconList className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              Analysis Summary
            </h5>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-100 dark:border-gray-800/50">
              <pre className="text-muted-foreground text-sm whitespace-pre-wrap font-sans leading-relaxed">{analysis.rawResponse}</pre>
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderBuildingPlanData = (buildingPlan: BuildingPlan) => {
    console.log('🔨 Rendering building plan data:', buildingPlan)
    console.log('🔨 Building plan sections:', {
      overview: !!buildingPlan.overview,
      totalTimeEstimate: !!buildingPlan.totalTimeEstimate,
      steps: buildingPlan.steps?.length || 0,
      requiredSkills: buildingPlan.requiredSkills?.length || 0,
      recommendations: buildingPlan.recommendations?.length || 0
    })
    
    return (
      <div className="space-y-4">
        {/* Overview */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <h5 className="font-semibold text-foreground mb-1 flex items-center gap-1">
            <IconList className="h-3 w-3" />
            Project Overview
          </h5>
          <p className="text-sm text-muted-foreground mb-2">{buildingPlan.overview}</p>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <strong>Total Time:</strong> {buildingPlan.totalTimeEstimate}
            </div>
            <div>
              <strong>Steps:</strong> {buildingPlan.steps?.length || 0}
            </div>
          </div>
        </div>

        {/* All Implementation Steps */}
        {buildingPlan.steps && buildingPlan.steps.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-semibold text-foreground text-sm">Implementation Steps:</h5>
            {buildingPlan.steps.map((step, index) => (
              <div key={`step-${step.step || index}`} className="bg-muted/30 border border-border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 bg-foreground text-background text-xs rounded-full flex items-center justify-center">
                    {step.step || index + 1}
                  </div>
                  <h6 className="font-medium text-sm">{step.name || step.title || `Step ${index + 1}`}</h6>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{step.description}</p>
                <div className="text-xs text-muted-foreground mb-1">
                  <IconClock className="h-3 w-3 inline mr-1" />
                  {step.estimatedTime || step.timeEstimate || 'Time not specified'}
                </div>
                {step.criteria && (
                  <div className="text-xs mb-1">
                    <strong>Criteria:</strong> {step.criteria}
                  </div>
                )}
                {step.resources && step.resources.length > 0 && (
                  <div className="text-xs mb-1">
                    <strong>Resources:</strong> {step.resources.join(', ')}
                  </div>
                )}
                {step.deliverables && step.deliverables.length > 0 && (
                  <div className="text-xs">
                    <strong>Deliverables:</strong> {step.deliverables.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Required Skills */}
        {buildingPlan.requiredSkills && buildingPlan.requiredSkills.length > 0 && (
          <div>
            <h5 className="font-semibold text-foreground mb-1 text-sm">Required Skills:</h5>
            <div className="flex flex-wrap gap-1">
              {buildingPlan.requiredSkills.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {buildingPlan.recommendations && buildingPlan.recommendations.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <h5 className="font-semibold text-foreground mb-1 text-sm flex items-center gap-1">
              <IconBulb className="h-3 w-3" />
              Implementation Recommendations
            </h5>
            <ul className="text-xs text-muted-foreground space-y-1">
              {buildingPlan.recommendations.map((recommendation, index) => (
                <li key={index}>• {recommendation}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  const startBuildingPlan = async (job: Job) => {
    setGeneratingSteps(true)
    
    const generatingMessage: ChatMessage = {
      id: 'generating-plan',
      type: 'ai_generating',
      content: '🔨 Creating detailed building plan with milestones and deliverables...',
      timestamp: new Date()
    }
    
    setChatMessages(prev => [...prev, generatingMessage])
    
    try {
      const response = await fetch('/api/jobs/building-steps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: job.title,
          description: job.description,
          skills: job.skills,
          price: job.price,
          currency: job.currency,
          jobId: job.internalJobId || job.id.toString(),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setBuildingPlan(result.buildingPlan)
        
        const planMessage: ChatMessage = {
          id: 'plan-completed',
          type: 'ai_building_plan',
          content: '🎯 Building plan ready! Here\'s your project roadmap:',
          timestamp: new Date(),
          data: result.buildingPlan
        }
        
        setChatMessages(prev => prev.filter(msg => msg.id !== 'generating-plan').concat([planMessage]))
        
        setTimeout(() => {
          const followUpMessage: ChatMessage = {
            id: generateMessageId(job.id.toString(), 'ai_question_followup'),
            type: 'ai_question',
            content: '🎯 Building plan ready! Would you like me to analyze this project in detail as well?',
            timestamp: new Date()
          }
          setChatMessages(prev => [...prev, followUpMessage])
        }, 1000)
        
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate building plan')
      }
    } catch (error) {
      console.error('Error generating building plan:', error)
      
      const errorMessage: ChatMessage = {
        id: 'plan-error',
        type: 'ai',
        content: `❌ Sorry, I encountered an error generating the building plan: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      }
      
      setChatMessages(prev => prev.filter(msg => msg.id !== 'generating-plan').concat([errorMessage]))
    } finally {
      setGeneratingSteps(false)
    }
  }

  const fetchAvailableTeams = async () => {
    try {
      const response = await fetch('/api/teams');
      if (response.ok) {
        const data = await response.json();
        const allTeams = [
          ...(data.createdTeams || []).map((team: any) => ({ ...team, isCreator: true })),
          ...(data.memberTeams || []).map((team: any) => ({ ...team, isCreator: false }))
        ];
        setAvailableTeams(allTeams);
      }
    } catch (error) {
      console.error('❌ Error fetching teams:', error);
      toast.error('Failed to load teams');
    }
  };

  const handleCallTeams = async () => {
    if (!selectedJob) return

    await fetchAvailableTeams();
    setTeamSelectionDialogOpen(true);
  };

  const handleTeamSelectionConfirm = async () => {
    if (!selectedJob || selectedTeamIds.length === 0) {
      toast.error('Please select at least one team');
      return;
    }

    if (!selectedJob.internalJobId) {
      toast.error('Job must be analyzed first before calling teams');
      return;
    }

    setLoadingTeamSelection(true);

    try {
      updateLocalJobState(selectedJob.id, 'TEAM_SUMMONED');
      
      await updateJobState('TEAM_SUMMONED', 'User called teams for project collaboration');

      for (const teamId of selectedTeamIds) {
        try {
          const response = await fetch(`/api/teams/${teamId}/assign-job`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              jobId: selectedJob.internalJobId,
              jobTitle: selectedJob.title,
              jobBudget: selectedJob.price,
              jobSkills: selectedJob.skills,
              platform: selectedJob.platform
            })
          });

          if (!response.ok) {
            console.error(`Failed to assign job to team ${teamId}`);
          }
        } catch (error) {
          console.error(`❌ Error assigning job to team ${teamId}:`, error);
        }
      }

      for (const teamId of selectedTeamIds) {
        try {
          await fetch('/api/teams/activity', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              teamId: teamId,
              activityType: 'TEAM_SUMMONED',
              description: `Team summoned for project: ${selectedJob.title}`,
              metadata: {
                jobId: selectedJob.internalJobId,
                jobTitle: selectedJob.title,
                jobBudget: selectedJob.price,
                jobSkills: selectedJob.skills,
                platform: selectedJob.platform
              }
            })
          });
        } catch (activityError) {
          console.error('❌ Error logging team activity:', activityError);
        }
      }

      const selectedTeamNames = availableTeams
        .filter(team => selectedTeamIds.includes(team.id))
        .map(team => team.name)
        .join(', ');

      setChatMessages(prev => [...prev, {
        id: generateMessageId(selectedJob!.id.toString(), 'user_choice'),
        type: 'user_choice',
        content: `User selected: call_teams (${selectedTeamNames})`,
        choice: 'call_teams',
        timestamp: new Date()
      }]);

      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          id: generateMessageId(selectedJob!.id.toString(), 'ai_response'),
          type: 'ai',
          content: `🚀 Teams "${selectedTeamNames}" have been summoned for this project! Your collaboration network has been notified and team members with relevant skills will be available to join this project. You'll receive notifications when team members respond.`,
          timestamp: new Date()
        }]);
        
        toast.success("🚀 Teams Summoned!", {
          description: `Teams "${selectedTeamNames}" have been notified about "${selectedJob.title}"`,
          duration: 4000,
        });
      }, 500);
      
      setTimeout(() => storeChatHistory(), 1000);
      
      localStorage.setItem('team-job-assigned', Date.now().toString());
      window.dispatchEvent(new CustomEvent('team-update', { 
        detail: { 
          jobId: selectedJob.internalJobId, 
          teamIds: selectedTeamIds,
          jobTitle: selectedJob.title 
        } 
      }));
      
      setTeamSelectionDialogOpen(false);
      setSelectedTeamIds([]);
    } catch (error) {
      console.error('❌ Error calling teams:', error);
      updateLocalJobState(selectedJob.id, selectedJob.userJobState || 'PROPOSED');
      toast.error('Failed to call teams. Please try again.');
    } finally {
      setLoadingTeamSelection(false);
    }
  };

  const handleBidSubmission = async () => {
    if (!selectedJob || (!buildingPlan && !jobAnalysis)) {
      alert('Please complete analysis or generate a building plan first.')
      return
    }

    try {
      updateLocalJobState(selectedJob.id, 'PROPOSING')
      await updateJobState('PROPOSING', 'User initiated bid submission')
      let proposalText = `Based on my AI analysis, I can deliver this project with the following approach:\n\n`
      
      if (buildingPlan) {
        proposalText += `${buildingPlan.overview}\n\nTotal estimated time: ${buildingPlan.totalTimeEstimate}\n\nI have experience with: ${buildingPlan.requiredSkills.join(', ')}`
      } else if (jobAnalysis) {
        proposalText += `This is a ${jobAnalysis.technicalRequirements?.complexity || 'medium'} complexity project in the ${jobAnalysis.marketAnalysis?.industry || 'technology'} sector.\n\n`
        proposalText += `Estimated timeline: ${jobAnalysis.technicalRequirements?.estimatedTimeframe || 'several weeks'}\n\n`
        proposalText += `Key technologies: ${jobAnalysis.technicalRequirements?.keyTechnologies?.join(', ') || selectedJob.skills.join(', ')}\n\n`
        proposalText += `My approach: ${jobAnalysis.recommendations?.proposedApproach || 'I will deliver a high-quality solution following industry best practices.'}`
      }
      
      const proposalData = {
        text: proposalText,
        budget: selectedJob.price,
        deadline: null, 
        buildingPlan: buildingPlan
      }

      const response = await fetch('/api/jobs/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit_proposal',
          jobData: { 
            id: selectedJob.id,
            platform: selectedJob.platform 
          },
          proposalData
        })
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Proposal submitted successfully')
        updateLocalJobState(selectedJob.id, 'PROPOSED')
        alert('Proposal submitted successfully! The job state has been updated to PROPOSED.')
        setChatMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'ai',
          content: "🎉 Proposal submitted successfully! I've included the detailed building plan and your expertise. The job is now in PROPOSED state awaiting client response.",
          timestamp: new Date()
        }])
        
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            id: generateMessageId(selectedJob!.id.toString(), 'ai_question'),
            type: 'ai_question',
            content: "💼 Great work on the proposal! For complex projects like this, would you like to call your teams to collaborate? This can strengthen your proposal and ensure you have the right expertise available.",
            timestamp: new Date()
          }])
        }, 2000)
        
        setTimeout(() => storeChatHistory(), 500)
      } else {
        console.error('❌ Failed to submit proposal:', result.error)
        await updateJobState('ERROR', 'Failed to submit proposal')
        updateLocalJobState(selectedJob.id, 'ERROR')
        alert('Failed to submit proposal. Please try again.')
      }
    } catch (error) {
      console.error('❌ Error submitting bid:', error)
      await updateJobState('ERROR', 'Exception occurred during proposal submission')
      updateLocalJobState(selectedJob.id, 'ERROR')
      alert('An error occurred while submitting the proposal.')
    }
  }

  const storeChatHistory = async () => {
    if (!selectedJob || !selectedJob.internalJobId || pendingChatStorage) return
    
    const currentState = selectedJob.userJobState || 'NEW'
    const shouldStoreChatHistory = ['ANALYZING', 'PROPOSED', 'PROPOSING'].includes(currentState)
    
    if (!shouldStoreChatHistory || chatMessages.length === 0) return
    
    setPendingChatStorage(true)
    
    try {
      const chatHistoryToStore = chatMessages.map((msg, index) => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        sequence: index + 1
      }))

      const response = await fetch('/api/jobs/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'store_chat_history',
          jobData: { 
            id: selectedJob.id,
            platform: selectedJob.platform,
            internalJobId: selectedJob.internalJobId
          },
          chatHistory: chatHistoryToStore
        })
      })

      const result = await response.json()
      if (result.success) {
        console.log(`✅ Chat history stored with ${chatHistoryToStore.length} messages`)
      } else {
        console.error('❌ Failed to store chat history:', result.error)
      }
    } catch (error) {
      console.error('❌ Error storing chat history:', error)
    } finally {
      setPendingChatStorage(false)
    }
  }

  const updateJobState = async (newState: string, reason: string, notes?: string) => {
    if (!selectedJob) return

    try {
      const shouldStoreChatHistory = ['ANALYZING', 'PROPOSED', 'PROPOSING'].includes(newState)
      let chatHistoryToStore = null
      
      if (shouldStoreChatHistory && chatMessages.length > 0) {
        chatHistoryToStore = chatMessages.map(msg => ({
          id: msg.id,
          type: msg.type,
          content: msg.content,
          timestamp: msg.timestamp.toISOString()
        }))
      }

      const response = await fetch('/api/jobs/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_state',
          jobData: { 
            id: selectedJob.id,
            platform: selectedJob.platform 
          },
          newState,
          reason,
          notes,
          chatHistory: chatHistoryToStore
        })
      })

      const result = await response.json()
      if (result.success) {
        console.log(`✅ Job state updated to ${newState}`)
        if (chatHistoryToStore) {
          console.log(`✅ Chat history stored with ${chatHistoryToStore.length} messages`)
        }
      }
    } catch (error) {
      console.error('❌ Error updating job state:', error)
    }
  }

  const handleAnalyzeJob = () => {
    if (selectedJob) {
      analyzeJob(selectedJob)
    }
  }

  const handleSendMessage = () => {
    if (message.trim() && selectedJob) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: message,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, userMessage])

      const lowerMessage = message.toLowerCase()
      
      if (lowerMessage.includes('analyz') || lowerMessage.includes('analysis')) {
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: "I'd be happy to analyze this project! You can click the '🧠 Show Analysis' button above to get detailed market insights and technical requirements.",
            timestamp: new Date()
          }])
          setTimeout(() => storeChatHistory(), 500)
        }, 500)
      } else if (lowerMessage.includes('plan') || lowerMessage.includes('steps') || lowerMessage.includes('build')) { 
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: "I can create a detailed building plan for you! Click the '🔨 Show Building Steps' button above to get a step-by-step implementation plan.",
            timestamp: new Date()
          }])
          setTimeout(() => storeChatHistory(), 500)
        }, 500)
      } else if (lowerMessage.includes('both') || lowerMessage.includes('everything')) {
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: "Great! You can get both analysis and building plan by clicking the respective buttons above. Start with whichever interests you more!",
            timestamp: new Date()
          }])
          setTimeout(() => storeChatHistory(), 500)
        }, 500)
      } else if (lowerMessage.includes('yes') || lowerMessage.includes('detailed')) {
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: "Perfect! Use the buttons above to choose what you'd like me to help with - analysis or building steps.",
            timestamp: new Date()
          }])
          setTimeout(() => storeChatHistory(), 500)
        }, 500)
      } else if (lowerMessage.includes('no') || lowerMessage.includes('not')) {
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: "No problem! I'm here when you need me. You can use the choice buttons above or ask me questions about the project.",
            timestamp: new Date()
          }])
          setTimeout(() => storeChatHistory(), 500)
        }, 500)
      } else if (lowerMessage.includes('change') || lowerMessage.includes('modify') || lowerMessage.includes('different') || lowerMessage.includes('update')) {
        if (buildingPlan) {
          generateBuildingSteps(selectedJob, message)
          setTimeout(() => {
            setChatMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              type: 'ai',
              content: "I'll update the building steps based on your feedback.",
              timestamp: new Date()
            }])
            setTimeout(() => storeChatHistory(), 500)
          }, 500)
        } else {
          setTimeout(() => {
            setChatMessages(prev => [...prev, {
              id: (Date.now() + 1).toString(),
              type: 'ai',
              content: "I'd need to create the building plan first before I can modify it. Click the '🔨 Show Building Steps' button to get started!",
              timestamp: new Date()
            }])
            setTimeout(() => storeChatHistory(), 500)
          }, 500)
        }
      } else {
        setTimeout(() => {
          setChatMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            type: 'ai',
            content: "I'm here to help! Use the choice buttons above to get analysis or building steps, or feel free to ask me any questions about this project.",
            timestamp: new Date()
          }])
          setTimeout(() => storeChatHistory(), 500)
        }, 500)
      }
      
      setMessage('')
      
      setTimeout(() => {
        storeChatHistory()
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return (
      <LoadingScreen 
        title="Loading available jobs..."
        subtitle="Fetching the latest opportunities from Freelancer marketplace"
      />
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Failed to Load Jobs</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchJobs()} className="px-6">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const filteredJobs = selectedJobState === 'ALL' 
    ? jobs 
    : jobs.filter(job => (job.userJobState || 'NEW') === selectedJobState)

  return (
    <div className="lg:h-full lg:flex lg:flex-col lg:bg-background fixed inset-0 flex flex-col bg-background lg:relative lg:inset-auto">
      {/* Header - Fixed */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4 lg:px-6 py-4 lg:py-5 z-20 lg:z-auto sticky top-0 lg:relative">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <IconBusinessplan className="h-7 w-7 lg:h-8 lg:w-8 text-primary flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">Job Marketplace</h1>
              <p className="text-muted-foreground text-sm lg:text-base hidden sm:block mt-0.5">
                Browse projects and get AI-powered insights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Job State Summary */}
            {(() => {
              const stateCounts = jobs.reduce((acc, job) => {
                const state = job.userJobState || 'NEW'
                acc[state] = (acc[state] || 0) + 1
                return acc
              }, {} as Record<string, number>)
              
              const activeStates = Object.entries(stateCounts).filter(([state, count]) => 
                state !== 'NEW' && count > 0
              )
              
              return activeStates.length > 0 ? (
                <div className="hidden lg:flex items-center gap-2">
                  {activeStates.slice(0, 2).map(([state, count]) => {
                    const stateInfo = getJobStateInfo(state)
                    return (
                      <Badge 
                        key={state} 
                        variant="outline" 
                        className={`text-xs cursor-pointer hover:bg-primary/10 transition-colors ${stateInfo.className} ${selectedJobState === state ? 'ring-1 ring-primary' : ''}`}
                        onClick={() => setSelectedJobState(state)}
                      >
                        {count} {stateInfo.label}
                      </Badge>
                    )
                  })}
                  {activeStates.length > 2 && (
                    <Badge variant="outline" className="text-xs text-muted-foreground">
                      +{activeStates.length - 2} more
                    </Badge>
                  )}
                </div>
              ) : null
            })()}
            
            {/* Job Count and Refresh */}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="hidden sm:block px-3 py-1.5 text-xs font-medium">
                {filteredJobs.length} of {jobs.length} jobs
                {selectedJobState !== 'ALL' && <span className="text-muted-foreground ml-1">({selectedJobState.toLowerCase()})</span>}
                {hasMore && <span className="text-muted-foreground ml-1">(more available)</span>}
              </Badge>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="h-9 px-3 flex items-center gap-2 hover:bg-primary/10 transition-colors"
              >
                <IconRefresh className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline text-sm font-medium">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Fallback Data Banner */}
        {usingFallback && (
          <div className="px-3 lg:px-6 pb-3">
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-400 rounded">
              <div className="flex items-center">
                <IconTrendingUp className="h-5 w-5 text-amber-500 mr-2" />
                <div>
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">Demo Mode Active</p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">Using sample data - Freelancer API unavailable</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content - Split Layout - Fixed Height */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Jobs List - Fixed */}
        <div className={`border-r border-border bg-card flex flex-col ${
          showMobileChat ? 'hidden lg:flex lg:w-2/5' : 'w-full lg:w-2/5'
        }`}>
          {/* Left Panel Header - Fixed */}
          <div className="flex-shrink-0 p-4 border-b border-border flex justify-between">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-lg">Available Projects</h2>
              {selectedJob && (
                <Badge variant="outline" className="lg:hidden text-xs">
                  1 selected
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">Filter:</span>
              <Select value={selectedJobState} onValueChange={setSelectedJobState}>
                <SelectTrigger className="w-24 sm:w-32">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All States</SelectItem>
                  <SelectItem value="NEW">New</SelectItem>
                  <SelectItem value="ANALYZING">Analyzing</SelectItem>
                  <SelectItem value="DECLINED">Declined</SelectItem>
                  <SelectItem value="PROPOSING">Proposing</SelectItem>
                  <SelectItem value="PROPOSED">Proposed</SelectItem>
                  <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
                  <SelectItem value="TEAM_SUMMONED">Team Ready</SelectItem>
                  <SelectItem value="ORDER_CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

      
          
          {/* Jobs List - Only This Scrolls */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3">
              {filteredJobs.map((job) => (
                <Card 
                  key={job.id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedJob?.id === job.id 
                      ? 'ring-2 ring-primary bg-primary/5' 
                      : job.userJobState && job.userJobState !== 'NEW'
                        ? 'hover:bg-slate-50 dark:hover:bg-slate-700 border-l-4 border-l-primary/50'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => handleJobSelect(job)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <Badge 
                            variant={job.platform === "Freelancer" ? "default" : "secondary"} 
                            className="text-xs"
                          >
                            {job.platform}
                          </Badge>
                          
                          {/* Job State Badge */}
                          {(() => {
                            const stateInfo = getJobStateInfo(job.userJobState || 'NEW')
                            return (
                              <Badge 
                                variant={stateInfo.variant}
                                className={`text-xs ${stateInfo.className}`}
                              >
                                {stateInfo.label}
                              </Badge>
                            )
                          })()}
                          
                          {job.isUrgent && (
                            <Badge variant="destructive" className="text-xs animate-pulse">
                              🔥 Urgent
                            </Badge>
                          )}
                          {job.verified && (
                            <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold text-sm mb-2 line-clamp-2 leading-tight">
                          {job.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                          {job.description}
                        </p>
                      </div>
                      <div className="text-right ml-3 flex-shrink-0">
                        <div className="text-lg font-bold text-foreground">
                          {job.currency === 'USD' ? '$' : job.currency + ' '}{job.price}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {job.type || 'Fixed'}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {job.skills.slice(0, 3).map((skill: string, index: number) => (
                        <Badge key={`${job.id}-skill-${index}`} variant="outline" className="text-xs px-2 py-0">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs px-2 py-0">
                          +{job.skills.length - 3}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <IconMapPin className="h-3 w-3" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IconClock className="h-3 w-3" />
                          <span>{job.postedTime}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-1 rounded">
                        <IconUsers className="h-3 w-3" />
                        {job.proposalCount}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Empty state for filtered results */}
              {filteredJobs.length === 0 && jobs.length > 0 && (
                <div className="text-center py-8">
                  <div className="text-muted-foreground text-sm">
                    No jobs found with state: <strong>{selectedJobState}</strong>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedJobState('ALL')}
                    className="mt-2"
                  >
                    Show All Jobs
                  </Button>
                </div>
              )}
              
              {/* Load More Button */}
              {hasMore && (
                <div className="px-4 pb-4 pt-2">
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      <>
                        <IconRefresh className="h-4 w-4 mr-2 animate-spin" />
                        Loading more...
                      </>
                    ) : (
                      <>
                        Load More Jobs
                      </>
                    )}
                  </Button>
                </div>
              )}
              
              {/* End of list indicator */}
              {!hasMore && jobs.length > 0 && (
                <div className="px-4 pb-4 pt-2 text-center">
                  <p className="text-xs text-muted-foreground">
                    All jobs loaded ({jobs.length} total)
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Chat Interface - Fixed */}
        <div className={`bg-background flex flex-col ${
          showMobileChat ? 'w-full lg:flex-1' : 'hidden lg:flex lg:flex-1'
        }`}>
          {selectedJob ? (
            <>
              {/* Mobile Back Button */}
              <div className="lg:hidden flex-shrink-0 p-3 bg-card border-b border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileChat(false)}
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <IconArrowLeft className="h-4 w-4" />
                  Back to Jobs
                </Button>
              </div>
              
              {/* Job Details Header - Fixed */}
              <div className="flex-shrink-0 p-3 lg:p-6 bg-card border-b border-border">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3 lg:gap-4 mb-3 lg:mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h2 className="text-base lg:text-xl font-bold pr-2 flex-1 min-w-0 leading-tight">{selectedJob.title}</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 lg:h-8 lg:w-8 p-0 text-muted-foreground hover:text-foreground flex-shrink-0"
                        onClick={() => setJobDescriptionExpanded(!jobDescriptionExpanded)}
                      >
                        {jobDescriptionExpanded ? 
                          <IconChevronUp className="h-3 w-3 lg:h-4 lg:w-4" /> : 
                          <IconChevronDown className="h-3 w-3 lg:h-4 lg:w-4" />
                        }
                      </Button>
                    </div>
                    {jobDescriptionExpanded && (
                      <>
                        <p className="text-muted-foreground text-xs lg:text-sm mb-3 lg:mb-4 leading-relaxed line-clamp-3">
                          {selectedJob.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 lg:gap-2">
                          {selectedJob.skills.map((skill: string, index: number) => (
                            <Badge key={`${selectedJob.id}-detail-skill-${index}`} variant="outline" className="text-xs px-2 py-0.5">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </>
                    )}
                    {!jobDescriptionExpanded && (
                      <div className="flex items-center gap-2 lg:gap-3 text-xs lg:text-sm text-muted-foreground">
                        <span>{selectedJob.skills.slice(0, 3).join(', ')}</span>
                        {selectedJob.skills.length > 3 && <span>+{selectedJob.skills.length - 3} more</span>}
                      </div>
                    )}
                  </div>
                  <div className="lg:ml-6 flex-shrink-0 w-full lg:w-auto">
                    {(() => {
                      const jobState = selectedJob.userJobState || 'NEW'
                      
                      // States that come after proposal - no bidding allowed
                      const postProposalStates = ['PROPOSED', 'NEGOTIATING', 'TEAM_SUMMONED', 'ORDER_CONFIRMED', 'IN_PROGRESS', 'COMPLETED']
                      
                      if (postProposalStates.includes(jobState)) {
                        let statusMessage = 'Proposal submitted'
                        
                        switch (jobState) {
                          case 'NEGOTIATING':
                            statusMessage = 'Negotiating terms'
                            break
                          case 'TEAM_SUMMONED':
                            statusMessage = 'Team assigned'
                            break
                          case 'ORDER_CONFIRMED':
                            statusMessage = 'Order confirmed'
                            break
                          case 'IN_PROGRESS':
                            statusMessage = 'Project in progress'
                            break
                          case 'COMPLETED':
                            statusMessage = 'Project completed'
                            break
                        }
                        
                        return (
                          <div className="text-center lg:text-right">
                            <div className="text-xs lg:text-sm text-muted-foreground italic mb-2">
                              {statusMessage}
                            </div>
                            {jobState === 'PROPOSED' && (
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={handleDeclineJob}
                                className="w-full lg:w-auto text-xs dark:hover:text-white"
                              >
                                Not Interested
                              </Button>
                            )}
                          </div>
                        )
                      }
                      
                      return (
                        <div className="space-y-1.5 lg:space-y-2">
                          <Button 
                            className="w-full lg:min-w-[120px] text-sm"
                            onClick={handleBidSubmission}
                            disabled={(!buildingPlan && !jobAnalysis) || generatingSteps || analyzingJob}
                          >
                            Bid Now
                          </Button>
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={handleDeclineJob}
                            className="w-full text-xs dark:hover:text-white"
                          >
                            Not Interested
                          </Button>
                        </div>
                      )
                    })()}
                    {jobDescriptionExpanded && (
                      <div className="text-center lg:text-right mt-2 lg:mt-3">
                        <div className="text-lg lg:text-2xl font-bold text-foreground">
                          {selectedJob.currency === 'USD' ? '$' : selectedJob.currency + ' '}
                          {selectedJob.price.toLocaleString()}
                        </div>
                        <div className="text-xs lg:text-sm text-muted-foreground">{selectedJob.type || 'Fixed Price'}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Content Area - Fixed Container */}
              <div className="flex-1 flex flex-col overflow-hidden relative min-h-0">
                {/* Messages Area - Only This Scrolls */}
                <div className="flex-1 overflow-y-auto overscroll-behavior-contain">
                  <div className="p-3 lg:p-4 space-y-3 lg:space-y-4 pb-safe">
                    {/* Chat Messages in chronological order */}
                    {chatMessages
                      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
                      .map((msg) => (
                        <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[90%] lg:max-w-[85%] rounded-2xl px-3 py-2 lg:px-4 lg:py-3 ${
                            msg.type === 'user' 
                              ? 'bg-primary text-primary-foreground rounded-br-md' 
                              : msg.type === 'ai_generating'
                                ? 'bg-amber-50 border border-amber-200 rounded-bl-md'
                                : 'bg-card border border-border rounded-bl-md'
                          }`}>
                            <div className="flex items-center gap-2 mb-1">
                              {msg.type === 'user' ? (
                                <IconUsers className="h-3 w-3 lg:h-4 lg:w-4" />
                              ) : (
                                <IconBrain className="h-3 w-3 lg:h-4 lg:w-4 text-primary" />
                              )}
                              <span className="text-xs font-medium">
                                {msg.type === 'user' ? 'You' : 'Worksy'}
                              </span>
                            </div>
                            
                            {/* Message content */}
                            <div className="text-sm">
                              {msg.type === 'ai_generating' ? (
                                <div className="flex items-center gap-2">
                                  <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                  </div>
                                  <span>{msg.content}</span>
                                </div>
                              ) : msg.type === 'ai_question' ? (
                                <div>
                                  <p className="mb-3">{msg.content}</p>
                                  {/* Choice buttons - determine which buttons to show based on what's already been completed */}
                                  <div className="flex flex-col gap-2">
                                    {/* Check if analysis has been generated (look for ai_analysis message) */}
                                    {!chatMessages.some(chatMsg => chatMsg.type === 'ai_analysis') && (
                                      <Button
                                        onClick={() => selectedJob && handleButtonClick('analysis', selectedJob)}
                                        className="justify-start text-left dark:hover:text-white text-sm h-auto py-2"
                                        variant="outline"
                                        size="sm"
                                      >
                                        <div className="flex flex-col items-start w-full">
                                          <div className="flex items-center gap-2">
                                            🧠 <span className="font-medium">Show Analysis</span>
                                          </div>
                                          <span className="text-xs text-muted-foreground mt-1">Market insights & technical requirements</span>
                                        </div>
                                      </Button>
                                    )}
                                    {/* Check if building plan has been generated (look for ai_building_plan message) */}
                                    {!chatMessages.some(chatMsg => chatMsg.type === 'ai_building_plan') && (
                                      <Button
                                        onClick={() => selectedJob && handleButtonClick('building_steps', selectedJob)}
                                        className="justify-start text-left dark:hover:text-white text-sm h-auto py-2"
                                        variant="outline"
                                        size="sm"
                                      >
                                        <div className="flex flex-col items-start w-full">
                                          <div className="flex items-center gap-2">
                                            🔨 <span className="font-medium">Show Building Steps</span>
                                          </div>
                                          <span className="text-xs text-muted-foreground mt-1">Detailed implementation plan</span>
                                        </div>
                                      </Button>
                                    )}
                                    {/* Add Call Teams button when appropriate */}
                                    {msg.content.includes('call your teams') && 
                                     selectedJob?.userJobState !== 'TEAM_SUMMONED' && (
                                      <Button
                                        onClick={handleCallTeams}
                                        className="justify-start text-left dark:hover:text-white text-sm h-auto py-2"
                                        variant="outline"
                                        size="sm"
                                      >
                                        <div className="flex flex-col items-start w-full">
                                          <div className="flex items-center gap-2">
                                            🚀 <span className="font-medium">Call Teams</span>
                                          </div>
                                          <span className="text-xs text-muted-foreground mt-1">Summon collaboration network</span>
                                        </div>
                                      </Button>
                                    )}
                                    
                                    {/* Add "No thanks" option for team calling */}
                                    {msg.content.includes('call your teams') && (
                                      <Button
                                        onClick={() => {
                                          const noTeamsMessage: ChatMessage = {
                                            id: generateMessageId(selectedJob!.id.toString(), 'user_choice'),
                                            type: 'user_choice',
                                            content: `User selected: no_teams`,
                                            choice: 'no_teams',
                                            timestamp: new Date()
                                          }
                                          setChatMessages(prev => [...prev, noTeamsMessage])
                                          
                                          setTimeout(() => {
                                            setChatMessages(prev => [...prev, {
                                              id: generateMessageId(selectedJob!.id.toString(), 'ai_response'),
                                              type: 'ai',
                                              content: "No problem! You can handle this project solo. Your proposal is ready and you can manage the project independently when the client responds.",
                                              timestamp: new Date()
                                            }])
                                          }, 500)
                                        }}
                                        className="justify-start text-left dark:hover:text-white"
                                        variant="ghost"
                                        size="sm"
                                      >
                                        ⚡ Work Solo
                                        <span className="text-xs text-muted-foreground ml-2">Handle this project independently</span>
                                      </Button>
                                    )}

                                    {chatMessages.some(chatMsg => chatMsg.type === 'ai_analysis') && 
                                     chatMessages.some(chatMsg => chatMsg.type === 'ai_building_plan') && 
                                     !msg.content.includes('call your teams') && (
                                      <Button
                                        onClick={() => {
                                          const noThanksMessage: ChatMessage = {
                                            id: generateMessageId(selectedJob!.id.toString(), 'user_choice'),
                                            type: 'user_choice',
                                            content: `User selected: no_thanks`,
                                            choice: 'no_thanks',
                                            timestamp: new Date()
                                          }
                                          setChatMessages(prev => [...prev, noThanksMessage])
                                          
                                          setTimeout(() => {
                                            setChatMessages(prev => [...prev, {
                                              id: generateMessageId(selectedJob!.id.toString(), 'ai_response'),
                                              type: 'ai',
                                              content: "Perfect! You now have both the analysis and building plan. You can submit your proposal when ready.",
                                              timestamp: new Date()
                                            }])
                                          }, 500)
                                        }}
                                        className="justify-start text-left dark:hover:text-white"
                                        variant="outline"
                                        size="sm"
                                      >
                                        ✅ All set, thanks!
                                        <span className="text-xs text-muted-foreground ml-2">Ready to submit proposal</span>
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ) : msg.type === 'user_choice' ? (
                                <div className="text-sm italic text-muted-foreground">
                                  {msg.choice === 'analysis' ? '🧠 Requested Analysis' : 
                                   msg.choice === 'building_steps' ? '🔨 Requested Building Steps' :
                                   msg.choice === 'call_teams' ? '🚀 Called Teams for Collaboration' :
                                   msg.choice === 'no_teams' ? '⚡ Chose to Work Solo' :
                                   msg.choice === 'no_thanks' ? '✅ Ready to Proceed' :
                                   'Made a choice'}
                                </div>
                              ) : msg.type === 'ai_analysis' && msg.data ? (
                                <div>
                                  <p className="mb-3">{msg.content}</p>
                                  {renderAnalysisData(msg.data)}
                                </div>
                              ) : msg.type === 'ai_building_plan' && msg.data ? (
                                <div>
                                  <p className="mb-3">{msg.content}</p>
                                  {renderBuildingPlanData(msg.data)}
                                </div>
                              ) : (
                                <p style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        )
                      )}

                  </div>
                </div>

                {/* Floating Edit System Prompt Button */}
                <div className="absolute bottom-20 right-4 z-10">
                  <Dialog open={systemPromptDialogOpen} onOpenChange={setSystemPromptDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="shadow-lg bg-background/95 border-border hover:bg-muted/80 hover:text-foreground backdrop-blur-sm transition-all duration-200 hover:shadow-xl"
                      >
                        <IconSettings className="h-4 w-4 mr-2" />
                        Edit System Prompt
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Edit System Prompt</DialogTitle>
                        <DialogDescription>
                          Customize the AI system prompt to change how the assistant analyzes and responds to projects.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <label htmlFor="system-prompt" className="text-sm font-medium">
                            System Prompt
                          </label>
                          <Textarea
                            id="system-prompt"
                            placeholder="Enter your custom system prompt here..."
                            value={systemPrompt}
                            onChange={(e) => setSystemPrompt(e.target.value)}
                            className="min-h-[200px] resize-none"
                          />
                          <p className="text-xs text-muted-foreground">
                            This prompt will be used to guide the AI's analysis and responses for this project.
                          </p>
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSystemPrompt(`You are Worksy, an expert freelancer assistant that helps analyze projects and create detailed building plans. 

When analyzing projects:
- Focus on market opportunities and technical feasibility
- Identify key requirements and potential challenges
- Provide actionable business insights
- Suggest competitive advantages and differentiators

When creating building plans:
- Break down complex projects into manageable steps
- Estimate realistic timeframes for each phase
- List required tools, technologies, and resources
- Focus on deliverables and milestones

Always be helpful, professional, and provide practical recommendations that help users win projects and deliver excellent results.`)
                              }}
                              className="text-xs"
                            >
                              Reset to Default
                            </Button>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setSystemPromptDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSaveSystemPrompt}
                        >
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Chat Input Area - Fixed */}
                <div className="flex-shrink-0 border-t border-border bg-card p-3 lg:p-4 safe-area-inset-bottom">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        className="h-10 lg:h-11 text-sm border-0 bg-muted/30 focus:bg-background transition-colors"
                        disabled={analyzingJob || generatingSteps}
                      />
                    </div>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!message.trim() || analyzingJob || generatingSteps}
                      className="h-10 lg:h-11 px-3 lg:px-4 flex-shrink-0 rounded-full"
                      size="sm"
                    >
                      <IconSend className="h-4 w-4" />
                      <span className="hidden lg:inline ml-2">Send</span>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8">
                <IconBusinessplan className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a Project</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a project from the list to get AI-powered building steps and analysis
                </p>
                <div className="lg:hidden">
                  <Button
                    variant="outline"
                    onClick={() => setShowMobileChat(false)}
                    className="flex items-center gap-2"
                  >
                    <IconArrowLeft className="h-4 w-4" />
                    View Available Projects
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team Selection Dialog */}
      <Dialog open={teamSelectionDialogOpen} onOpenChange={setTeamSelectionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Teams to Call</DialogTitle>
            <DialogDescription>
              Choose which teams you want to summon for this project: "{selectedJob?.title}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {availableTeams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <IconUsers className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No teams available</p>
                <p className="text-sm">Create a team first to collaborate on projects</p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableTeams.map((team) => (
                  <div
                    key={team.id}
                    className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTeamIds.includes(team.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      setSelectedTeamIds(prev =>
                        prev.includes(team.id)
                          ? prev.filter(id => id !== team.id)
                          : [...prev, team.id]
                      )
                    }}
                  >
                    <div className={`w-4 h-4 border-2 rounded ${
                      selectedTeamIds.includes(team.id)
                        ? 'bg-primary border-primary'
                        : 'border-gray-300'
                    }`}>
                      {selectedTeamIds.includes(team.id) && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{team.name}</h4>
                        {team.isCreator && (
                          <Badge variant="secondary" className="text-xs">
                            Owner
                          </Badge>
                        )}
                      </div>
                      {team.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {team.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>{team.members?.length || 0} members</span>
                        <span>{(team._count?.assignedJobs || 0) + (team._count?.jobAssignments || 0)} active jobs</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTeamSelectionDialogOpen(false);
                setSelectedTeamIds([]);
              }}
              disabled={loadingTeamSelection}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTeamSelectionConfirm}
              disabled={selectedTeamIds.length === 0 || loadingTeamSelection}
            >
              {loadingTeamSelection ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Calling Teams...
                </>
              ) : (
                <>
                  🚀 Call Selected Teams ({selectedTeamIds.length})
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
