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
  recommendations: Array<{
    type: string
    priority: 'high' | 'medium' | 'low'
    title: string
    description: string
    action: string
    impact: string
  }>
  insights: {
    topSkill: string
    weakestSkill: string
    bestPlatform: string
    optimalBudgetRange: string
  }
}

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

  if (!stats) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="text-center py-12">
          <IconChartBar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-muted-foreground">Start analyzing jobs to see your stats here!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Your Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Deep insights into your job decision patterns and opportunities
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <IconRefresh className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Quick Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
            {getTrendIcon(stats.basicStats.trend)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.basicStats.acceptanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.basicStats.acceptedJobs} of {stats.basicStats.totalDecisions} jobs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Fit Score</CardTitle>
            <IconTarget className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.basicStats.averageFitScore}/100</div>
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
            <div className="text-2xl font-bold">${stats.monetaryStats.totalPotentialEarnings.toLocaleString()}</div>
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
            <div className="text-2xl font-bold">${stats.monetaryStats.missedEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.monetaryStats.opportunityCost}% opportunity cost
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations Section */}
      {stats.recommendations.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBulb className="h-5 w-5" />
              Recommendations
            </CardTitle>
            <CardDescription>
              Actionable insights to improve your success rate and earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {stats.recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{rec.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {rec.priority} priority
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{rec.description}</p>
                      <div className="text-sm font-medium">
                        <span className="text-muted-foreground">Action: </span>
                        {rec.action}
                      </div>
                      <div className="text-sm font-medium">
                        <span className="text-muted-foreground">Impact: </span>
                        {rec.impact}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
                {stats.skillsAnalysis.slice(0, 10).map((skill, index) => (
                  <div key={skill.skill} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{skill.skill}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{skill.total} jobs</span>
                          <span>Avg ${skill.avgBudget.toFixed(0)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <Progress value={skill.acceptanceRate} className="h-2" />
                        </div>
                        <div className="text-sm font-medium min-w-0">
                          {skill.acceptanceRate.toFixed(1)}% acceptance
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{skill.accepted} accepted</span>
                        <span>{skill.rejected} rejected</span>
                        <span>Fit: {skill.avgFitScore.toFixed(1)}/100</span>
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
                        {getTrendIcon(stats.basicStats.trend)}
                        <span className="font-medium">{stats.basicStats.recentAcceptanceRate}%</span>
                      </div>
                    </div>
                    <Progress value={stats.basicStats.recentAcceptanceRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Last 7 Days</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(stats.basicStats.weeklyTrend)}
                        <span className="font-medium">{stats.basicStats.weeklyAcceptanceRate}%</span>
                      </div>
                    </div>
                    <Progress value={stats.basicStats.weeklyAcceptanceRate} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Overall Average</span>
                      <span className="font-medium">{stats.basicStats.acceptanceRate}%</span>
                    </div>
                    <Progress value={stats.basicStats.acceptanceRate} className="h-2" />
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
                    {stats.basicStats.avgDecisionTimeHours < 1 
                      ? `${Math.round(stats.basicStats.avgDecisionTimeHours * 60)}m`
                      : `${stats.basicStats.avgDecisionTimeHours.toFixed(1)}h`}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Average decision time
                  </p>
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      {stats.basicStats.avgDecisionTimeHours < 2 
                        ? "⚡ Very fast decision making"
                        : stats.basicStats.avgDecisionTimeHours < 12
                        ? "✅ Good response time"
                        : "⏰ Consider faster evaluation"}
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

      {/* Learning Path & Action Items */}
      <div className="grid gap-6 lg:grid-cols-2 mt-8">
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
            {stats.skillsAnalysis.length > 0 ? (
              <div className="space-y-4">
                {/* Show bottom 3 skills as improvement opportunities */}
                {stats.skillsAnalysis
                  .filter(skill => skill.rejected > 0)
                  .sort((a, b) => a.acceptanceRate - b.acceptanceRate)
                  .slice(0, 3)
                  .map((skill, index) => (
                  <div key={skill.skill} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{skill.skill}</h4>
                      <p className="text-xs text-muted-foreground">
                        {skill.acceptanceRate.toFixed(1)}% acceptance rate • 
                        ${skill.avgBudget.toFixed(0)} avg budget
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Priority {index + 1}
                    </Badge>
                  </div>
                ))}
                {stats.skillsAnalysis.filter(skill => skill.rejected > 0).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <IconTarget className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Great job! No obvious skill gaps detected.</p>
                  </div>
                )}
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
                  <p className="text-xs text-green-600 dark:text-green-400">{stats.insights.topSkill}</p>
                </div>
                <IconArrowUp className="h-4 w-4 text-green-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <div>
                  <h4 className="font-medium text-sm text-blue-800 dark:text-blue-300">Best Platform</h4>
                  <p className="text-xs text-blue-600 dark:text-blue-400">{stats.insights.bestPlatform}</p>
                </div>
                <IconGlobe className="h-4 w-4 text-blue-600" />
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <div>
                  <h4 className="font-medium text-sm text-purple-800 dark:text-purple-300">Optimal Budget Range</h4>
                  <p className="text-xs text-purple-600 dark:text-purple-400">{stats.insights.optimalBudgetRange}</p>
                </div>
                <IconCash className="h-4 w-4 text-purple-600" />
              </div>
              
              {stats.insights.weakestSkill !== 'N/A' && (
                <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-50 dark:bg-orange-950/20">
                  <div>
                    <h4 className="font-medium text-sm text-orange-800 dark:text-orange-300">Improvement Focus</h4>
                    <p className="text-xs text-orange-600 dark:text-orange-400">{stats.insights.weakestSkill}</p>
                  </div>
                  <IconTarget className="h-4 w-4 text-orange-600" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}