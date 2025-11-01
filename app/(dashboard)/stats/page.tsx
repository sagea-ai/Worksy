"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoadingScreen } from "@/components/ui/loading-screen"
import {
  IconChartBar,
  IconTrendingUp,
  IconTrendingDown,
  IconTarget,
  IconBulb,
  IconCoin,
  IconUsers,
  IconBrain,
  IconRefresh,
  IconAlertTriangle,
  IconCircleCheck,
  IconArrowUp,
  IconArrowDown,
  IconEqual,
  IconStar,
  IconGlobe,
  IconCash,
  IconChartLine,
  IconFilter
} from '@tabler/icons-react'
import { toast } from 'sonner'

interface StatsData {
  basicStats: {
    totalDecisions: number
    acceptedJobs: number
    rejectedJobs: number
    pendingJobs: number
    acceptanceRate: number
    rejectionRate: number
    averageFitScore: number
    recentAcceptanceRate: number
    weeklyAcceptanceRate: number
    avgDecisionTimeHours: number
    trend: 'improving' | 'declining' | 'stable'
    weeklyTrend: 'improving' | 'declining' | 'stable'
  }
  monetaryStats: {
    averageAcceptedBudget: number
    averageRejectedBudget: number
    totalPotentialEarnings: number
    missedEarnings: number
    opportunityCost: number
  }
  skillsAnalysis: Array<{
    skill: string
    total: number
    accepted: number
    rejected: number
    acceptanceRate: number
    rejectionRate: number
    avgFitScore: number
    avgBudget: number
  }>
  platformAnalysis: Array<{
    platform: string
    total: number
    accepted: number
    rejected: number
    acceptanceRate: number
    avgFitScore: number
    avgBudget: number
  }>
  budgetAnalysis: Array<{
    label: string
    total: number
    accepted: number
    rejected: number
    acceptanceRate: number
    avgFitScore: number
  }>
  aiInsights: {
    generalInsights: Array<{
      title: string
      description: string
      action: string
      impact: string
      priority: 'high' | 'medium' | 'low'
    }>
    skillsInsights: Array<{
      title: string
      description: string
      action: string
      impact: string
      priority: 'high' | 'medium' | 'low'
    }>
    performanceInsights: Array<{
      title: string
      description: string
      action: string
      impact: string
      priority: 'high' | 'medium' | 'low'
    }>
    monetaryInsights: Array<{
      title: string
      description: string
      action: string
      impact: string
      priority: 'high' | 'medium' | 'low'
    }>
    platformInsights: Array<{
      title: string
      description: string
      action: string
      impact: string
      priority: 'high' | 'medium' | 'low'
    }>
    budgetInsights: Array<{
      title: string
      description: string
      action: string
      impact: string
      priority: 'high' | 'medium' | 'low'
    }>
  }
  insights: {
    topSkill: string
    weakestSkill: string
    bestPlatform: string
    optimalBudgetRange: string
  }
}

// Safe data handling utilities for frontend
const safeNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? defaultValue : num;
};

const safeString = (value: any, defaultValue: string = 'N/A'): string => {
  return typeof value === 'string' && value.trim() ? value : defaultValue;
};

const safeArray = (value: any): any[] => {
  return Array.isArray(value) ? value : [];
};

const formatCurrency = (value: any): string => {
  const num = safeNumber(value);
  return num === 0 ? '$0' : `$${num.toLocaleString()}`;
};

const formatPercentage = (value: any): string => {
  const num = safeNumber(value);
  return `${num.toFixed(1)}%`;
};

export default function StatsPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError(null)

      const response = await fetch('/api/stats')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stats: ${response.status}`)
      }

      const data: StatsData = await response.json()
      setStats(data)
    } catch (err) {
      console.error('❌ Error fetching stats:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const handleRefresh = () => {
    fetchStats(true)
    toast.success('Stats refreshed!')
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <IconTrendingUp className="h-4 w-4 text-green-600" />
      case 'declining':
        return <IconTrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <IconEqual className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/20 dark:text-red-300'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-300'
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/20 dark:text-blue-300'
    }
  }

  const renderInsights = (insights: any[], icon: React.ReactNode, sectionTitle: string) => {
    if (!insights || insights.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-muted-foreground/30 mb-3 flex justify-center">{icon}</div>
              <h4 className="font-medium mb-2">AI Analysis in Progress</h4>
              <p className="text-sm">Generating personalized {sectionTitle.toLowerCase()} insights based on your data...</p>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-3">
        {insights.map((insight: any, index: number) => (
          <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-blue-600 mt-0.5">{icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-semibold text-sm leading-tight">{safeString(insight.title)}</h4>
                    <Badge 
                      variant={insight.priority === 'high' ? 'destructive' : insight.priority === 'medium' ? 'default' : 'secondary'}
                      className="text-xs shrink-0"
                    >
                      {safeString(insight.priority, 'medium')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{safeString(insight.description)}</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-green-700 dark:text-green-400 shrink-0">Action:</span>
                      <span className="text-muted-foreground">{safeString(insight.action)}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-medium text-blue-700 dark:text-blue-400 shrink-0">Impact:</span>
                      <span className="text-muted-foreground">{safeString(insight.impact)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <LoadingScreen 
        title="Loading your analytics..."
        subtitle="Analyzing your job decision patterns and opportunities"
      />
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">Failed to Load Stats</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => fetchStats()} className="px-6">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!stats || !stats.basicStats) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="text-center py-12">
          <IconChartBar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-muted-foreground">Start analyzing jobs to see your stats here!</p>
          <Button 
            onClick={() => fetchStats()}
            className="mt-4"
            variant="outline"
          >
            <IconRefresh className="h-4 w-4 mr-2" />
            Refresh Stats
          </Button>
        </div>
      </div>
    )
  }

  // Check if we have any meaningful data
  const hasData = safeNumber(stats.basicStats?.totalDecisions) > 0 || 
                  safeArray(stats.skillsAnalysis).length > 0 || 
                  safeArray(stats.platformAnalysis).length > 0;

  if (!hasData) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="text-center py-12">
          <IconTarget className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Ready to Track Your Progress</h2>
          <p className="text-muted-foreground mb-4">
            Your analytics dashboard is ready! Start by analyzing some jobs to see insights about your decision patterns.
          </p>
          <div className="text-sm text-muted-foreground">
            Visit the <strong>Deals</strong> page to analyze job opportunities and build your statistics.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 text-white p-8 mb-8">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <IconChartBar className="h-8 w-8" />
              Your Analytics Dashboard
            </h1>
            <p className="text-emerald-100 dark:text-emerald-200 text-lg">
              AI-powered insights into your freelance journey and opportunities
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm text-blue-200">
              <span className="flex items-center gap-1">
                <IconCircleCheck className="h-4 w-4" />
                {safeNumber(stats.basicStats?.totalDecisions)} decisions analyzed
              </span>
              <span className="flex items-center gap-1">
                <IconTrendingUp className="h-4 w-4" />
                {formatPercentage(stats.basicStats?.acceptanceRate)} acceptance rate
              </span>
            </div>
          </div>
          <Button 
            variant="secondary" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <IconRefresh className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </div>
        <div className="absolute inset-0 bg-grid-white/10 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      </div>

      {/* Quick Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            {getTrendIcon(safeString(stats.basicStats?.trend, 'stable'))}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(stats.basicStats?.acceptanceRate)}</div>
            <p className="text-xs text-muted-foreground">
              {safeNumber(stats.basicStats?.acceptedJobs)} of {safeNumber(stats.basicStats?.totalDecisions)} jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Fit Score</CardTitle>
            <IconTarget className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{safeNumber(stats.basicStats?.averageFitScore).toFixed(1)}/100</div>
            <p className="text-xs text-muted-foreground">
              Average job compatibility
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Earnings</CardTitle>
            <IconCoin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monetaryStats?.totalPotentialEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              From accepted jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missed Earnings</CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.monetaryStats?.missedEarnings)}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage(stats.monetaryStats?.opportunityCost)} opportunity cost
            </p>
          </CardContent>
        </Card>
      </div>



      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="skills" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="monetary">Monetary Insights</TabsTrigger>
          <TabsTrigger value="platforms">Platform Performance</TabsTrigger>
          <TabsTrigger value="trends">Budget Trends</TabsTrigger>
        </TabsList>

        {/* Skills Analysis */}
        <TabsContent value="skills" className="space-y-6">
          {/* AI Insights for Skills */}
          <Card className="mb-6 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-900 dark:text-blue-100">
                <IconBulb className="h-5 w-5 text-blue-600" />
                AI-Powered Skills Insights
              </CardTitle>
              <CardDescription className="text-blue-700/70 dark:text-blue-300/70">
                Personalized recommendations based on your job decision patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {renderInsights(stats.aiInsights?.skillsInsights, <IconBrain className="h-4 w-4" />, "Skills")}
            </CardContent>
          </Card>

          {/* Learning Path & Key Insights - Only in Skills Tab */}
          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconTarget className="h-5 w-5" />
                  Learning Path
                </CardTitle>
                <CardDescription>
                  Skills to focus on for maximum impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.skillsAnalysis && stats.skillsAnalysis.length > 0 ? (
                  <div className="space-y-4">
                    {(() => {
                      const improvementSkills = safeArray(stats.skillsAnalysis)
                        .filter(skill => safeNumber(skill?.rejected) > 0)
                        .sort((a, b) => safeNumber(a?.acceptanceRate) - safeNumber(b?.acceptanceRate))
                        .slice(0, 3);
                      
                      const skillsToShow = improvementSkills.length > 0 
                        ? improvementSkills 
                        : safeArray(stats.skillsAnalysis)
                            .sort((a, b) => safeNumber(a?.acceptanceRate) - safeNumber(b?.acceptanceRate))
                            .slice(0, 3);
                      
                      return skillsToShow.map((skill, index) => (
                        <div key={safeString(skill?.skill, `skill-${index}`)} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{safeString(skill?.skill)}</h4>
                            <p className="text-xs text-muted-foreground">
                              {formatPercentage(skill?.acceptanceRate)} acceptance rate • 
                              {formatCurrency(skill?.avgBudget)} avg budget
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {improvementSkills.length > 0 ? `Improve ${index + 1}` : `Develop ${index + 1}`}
                          </Badge>
                        </div>
                      ));
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <IconTarget className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Start analyzing jobs to get personalized learning recommendations</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconStar className="h-5 w-5" />
                  Key Insights
                </CardTitle>
                <CardDescription>
                  Your top performing areas and optimization opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div>
                      <h4 className="font-medium text-sm text-green-800 dark:text-green-300">Top Performing Skill</h4>
                      <p className="text-xs text-green-600 dark:text-green-400">{safeString(stats.insights?.topSkill)}</p>
                    </div>
                    <IconArrowUp className="h-4 w-4 text-green-600" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div>
                      <h4 className="font-medium text-sm text-green-800 dark:text-green-300">Best Platform</h4>
                      <p className="text-xs text-green-600 dark:text-green-400">{safeString(stats.insights?.bestPlatform)}</p>
                    </div>
                    <IconGlobe className="h-4 w-4 text-green-600" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div>
                      <h4 className="font-medium text-sm text-green-800 dark:text-green-300">Optimal Budget Range</h4>
                      <p className="text-xs text-green-600 dark:text-green-400">{safeString(stats.insights?.optimalBudgetRange)}</p>
                    </div>
                    <IconCash className="h-4 w-4 text-green-600" />
                  </div>
                  
                  {stats.insights?.weakestSkill && stats.insights.weakestSkill !== 'N/A' && (
                    <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 dark:bg-green-950/20">
                      <div>
                        <h4 className="font-medium text-sm text-green-800 dark:text-green-300">Improvement Focus</h4>
                        <p className="text-xs text-green-600 dark:text-green-400">{safeString(stats.insights.weakestSkill)}</p>
                      </div>
                      <IconTarget className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills Performance Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconBrain className="h-5 w-5" />
                Skills Performance Analysis
              </CardTitle>
              <CardDescription>
                How different skills affect your job acceptance rates and earnings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {safeArray(stats.skillsAnalysis).slice(0, 10).map((skill, index) => (
                  <div key={safeString(skill?.skill, `skill-${index}`)} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{safeString(skill?.skill)}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{safeNumber(skill?.total)} jobs</span>
                          <span>Avg {formatCurrency(skill?.avgBudget)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Progress value={safeNumber(skill?.acceptanceRate)} className="h-2" />
                        </div>
                        <div className="text-sm font-medium min-w-0">
                          {formatPercentage(skill?.acceptanceRate)} acceptance
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{safeNumber(skill?.accepted)} accepted</span>
                        <span>{safeNumber(skill?.rejected)} rejected</span>
                        <span>Fit: {safeNumber(skill?.avgFitScore).toFixed(1)}/100</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Analysis */}
        <TabsContent value="performance" className="space-y-6">
          {/* AI Insights for Performance */}
          <Card className="mb-6 bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-green-900 dark:text-green-100">
                <IconBulb className="h-5 w-5 text-green-600" />
                Performance Intelligence
              </CardTitle>
              <CardDescription className="text-green-700/70 dark:text-green-300/70">
                AI analysis of your decision-making patterns and efficiency
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {renderInsights(stats.aiInsights?.performanceInsights, <IconChartLine className="h-4 w-4" />, "Performance")}
            </CardContent>
          </Card>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconChartLine className="h-5 w-5" />
                  Recent Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Last 30 Days</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(safeString(stats.basicStats?.trend, 'stable'))}
                        <span className="font-medium">{formatPercentage(stats.basicStats?.recentAcceptanceRate)}</span>
                      </div>
                    </div>
                    <Progress value={safeNumber(stats.basicStats?.recentAcceptanceRate)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Last 7 Days</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(safeString(stats.basicStats?.weeklyTrend, 'stable'))}
                        <span className="font-medium">{formatPercentage(stats.basicStats?.weeklyAcceptanceRate)}</span>
                      </div>
                    </div>
                    <Progress value={safeNumber(stats.basicStats?.weeklyAcceptanceRate)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Overall Average</span>
                      <span className="font-medium">{formatPercentage(stats.basicStats?.acceptanceRate)}</span>
                    </div>
                    <Progress value={safeNumber(stats.basicStats?.acceptanceRate)} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Decision Speed</CardTitle>
                <CardDescription>How quickly you evaluate opportunities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {(() => {
                      const hours = safeNumber(stats.basicStats?.avgDecisionTimeHours);
                      return hours < 1 
                        ? `${Math.round(hours * 60)}m`
                        : `${hours.toFixed(1)}h`;
                    })()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Average decision time
                  </p>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      {(() => {
                        const hours = safeNumber(stats.basicStats?.avgDecisionTimeHours);
                        return hours < 2 
                          ? "⚡ Very fast decision making"
                          : hours < 12
                          ? "✅ Good response time"
                          : "⏰ Consider faster evaluation";
                      })()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Metrics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Decision Accuracy</span>
                    <span className="font-medium">{stats.basicStats.averageFitScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Acceptance Rate</span>
                    <span className="font-medium">{stats.basicStats.acceptanceRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Jobs Evaluated</span>
                    <span className="font-medium">{stats.basicStats.totalDecisions}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Efficiency Score</span>
                      <span className="font-bold">
                        {Math.round((stats.basicStats.acceptanceRate + stats.basicStats.averageFitScore) / 2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Monetary Analysis */}
        <TabsContent value="monetary" className="space-y-6">
          {/* AI Insights for Monetary */}
          <Card className="mb-6 bg-linear-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-900 dark:text-amber-100">
                <IconBulb className="h-5 w-5 text-amber-600" />
                Financial Optimization
              </CardTitle>
              <CardDescription className="text-amber-700/70 dark:text-amber-300/70">
                Smart insights to maximize your earning potential
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {renderInsights(stats.aiInsights?.monetaryInsights, <IconCoin className="h-4 w-4" />, "Monetary")}
            </CardContent>
          </Card>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconCash className="h-5 w-5" />
                  Budget Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Accepted Budget</span>
                    <span className="font-bold text-green-600">
                      ${stats.monetaryStats.averageAcceptedBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Avg Rejected Budget</span>
                    <span className="font-bold text-red-600">
                      ${stats.monetaryStats.averageRejectedBudget.toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Opportunity Cost</span>
                      <span className="font-bold">
                        {stats.monetaryStats.opportunityCost}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Earnings Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Potential Earnings</span>
                      <span>${stats.monetaryStats.totalPotentialEarnings.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={stats.monetaryStats.totalPotentialEarnings / (stats.monetaryStats.totalPotentialEarnings + stats.monetaryStats.missedEarnings) * 100} 
                      className="h-2" 
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Missed Earnings</span>
                      <span>${stats.monetaryStats.missedEarnings.toLocaleString()}</span>
                    </div>
                    <Progress 
                      value={stats.monetaryStats.missedEarnings / (stats.monetaryStats.totalPotentialEarnings + stats.monetaryStats.missedEarnings) * 100} 
                      className="h-2" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Platform Analysis */}
        <TabsContent value="platforms" className="space-y-6">
          {/* AI Insights for Platforms */}
          <Card className="mb-6 bg-linear-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-purple-900 dark:text-purple-100">
                <IconBulb className="h-5 w-5 text-purple-600" />
                Platform Strategy
              </CardTitle>
              <CardDescription className="text-purple-700/70 dark:text-purple-300/70">
                Optimize your approach across different freelance platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {renderInsights(stats.aiInsights?.platformInsights, <IconGlobe className="h-4 w-4" />, "Platform")}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconGlobe className="h-5 w-5" />
                Platform Performance
              </CardTitle>
              <CardDescription>
                Which platforms work best for your profile and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {stats.platformAnalysis.map((platform) => (
                  <div key={platform.platform} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{platform.platform}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{platform.total} jobs</span>
                        <span>Avg ${platform.avgBudget.toFixed(0)}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-green-600">{platform.accepted}</div>
                        <div className="text-muted-foreground">Accepted</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-red-600">{platform.rejected}</div>
                        <div className="text-muted-foreground">Rejected</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold">{platform.acceptanceRate.toFixed(1)}%</div>
                        <div className="text-muted-foreground">Rate</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budget Trends */}
        <TabsContent value="trends" className="space-y-6">
          {/* AI Insights for Budget */}
          <Card className="mb-6 bg-linear-to-r from-rose-50 to-pink-50 dark:from-rose-950/20 dark:to-pink-950/20 border-rose-200 dark:border-rose-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-rose-900 dark:text-rose-100">
                <IconBulb className="h-5 w-5 text-rose-600" />
                Budget Intelligence
              </CardTitle>
              <CardDescription className="text-rose-700/70 dark:text-rose-300/70">
                Strategic insights for optimal project pricing and selection
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {renderInsights(stats.aiInsights?.budgetInsights, <IconChartLine className="h-4 w-4" />, "Budget")}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconChartLine className="h-5 w-5" />
                Budget Range Analysis
              </CardTitle>
              <CardDescription>
                Your acceptance patterns across different budget ranges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.budgetAnalysis.map((range) => (
                  <div key={range.label} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{range.label}</h4>
                      <Badge variant="outline">{range.total} jobs</Badge>
                    </div>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex-1">
                        <Progress value={range.acceptanceRate} className="h-2" />
                      </div>
                      <div className="text-sm font-medium min-w-0">
                        {range.acceptanceRate.toFixed(1)}% acceptance
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{range.accepted} accepted, {range.rejected} rejected</span>
                      <span>Avg fit score: {range.avgFitScore.toFixed(1)}/100</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


    </div>
  )
}