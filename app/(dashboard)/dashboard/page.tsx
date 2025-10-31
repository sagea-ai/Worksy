"use client";

import { useEffect, useState } from 'react';
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { 
  BarChart3, 
  DollarSign, 
  Target,
  CheckCircle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ExternalLink,
  FileText
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalJobs: number;
  proposedJobs: number;
  completedJobs: number;
  inProgressJobs: number;
  totalProposedBudget: number;
  recentJobs: Array<{
    id: string;
    title: string;
    state: string;
    proposedBudget: number;
    platform: string;
    updatedAt: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <LoadingScreen 
        title="Loading your dashboard..."
        subtitle="Fetching your latest activity and stats"
      />
    );
  }

  if (error) {
    return (
      <div className="space-y-6 px-4 lg:px-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-red-600">Error loading dashboard: {error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStateColor = (state: string) => {
    switch (state) {
      case 'PROPOSED': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'IN_PROGRESS': return 'bg-orange-500';
      case 'ANALYZING': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStateLabel = (state: string) => {
    switch (state) {
      case 'PROPOSED': return 'Proposed';
      case 'COMPLETED': return 'Completed';
      case 'IN_PROGRESS': return 'In Progress';
      case 'ANALYZING': return 'Analyzing';
      case 'PROPOSING': return 'Proposing';
      default: return state;
    }
  };

  return (
    <div className="space-y-6 px-4 lg:px-6 mt-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.firstName || 'Freelancer'}! 👋
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's your freelance automation overview
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/profile">
            <Button variant="outline" size="sm">
              Profile Settings
            </Button>
          </Link>
          <Link href="/deals">
            <Button className="bg-primary hover:bg-primary/90">
              <Target className="mr-2 h-4 w-4" />
              Browse Deals
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalJobs || 0}</div>
            <p className="text-xs text-muted-foreground">
              Jobs in your pipeline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Proposals</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.proposedJobs || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting client response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Proposed</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalProposedBudget?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all active bids
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.inProgressJobs || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity - 2/3 width */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Jobs</CardTitle>
                  <CardDescription>
                    Your latest job activity and proposals
                  </CardDescription>
                </div>
                <Link href="/deals">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {!stats?.recentJobs || stats.recentJobs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No jobs yet</p>
                  <Link href="/deals">
                    <Button className="mt-4">
                      Browse Available Jobs
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.recentJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getStateColor(job.state)}`}></div>
                        <div>
                          <span className="font-medium line-clamp-1">{job.title}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {job.platform}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {getStateLabel(job.state)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {job.proposedBudget > 0 && (
                          <span className="text-sm font-semibold">
                            ${job.proposedBudget.toLocaleString()}
                          </span>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(job.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions - 1/3 width */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/deals" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <Target className="mr-2 h-4 w-4" />
                  Browse New Jobs
                </Button>
              </Link>
              <Link href="/proposals" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  View Proposals
                </Button>
              </Link>
              <Link href="/profile" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Update Profile
                </Button>
              </Link>
              <Link href="/deals?state=PROPOSED" className="block">
                <Button className="w-full justify-start" variant="outline">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Review Proposals
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Platform Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <a 
                href="https://www.freelancer.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full justify-start" variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Freelancer.com
                </Button>
              </a>
              <a 
                href="https://www.upwork.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full justify-start" variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Upwork.com
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
