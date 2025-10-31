"use client";

import { useEffect, useState } from 'react';
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TalentPool } from "@/components/hirer/talent-pool";
import { JobCreation } from "@/components/hirer/job-creation";
import { JobPostingsList } from "@/components/hirer/job-postings-list";
import { 
  IconUsers, 
  IconBriefcase, 
  IconPlus,
  IconFileText,
  IconTrendingUp
} from "@tabler/icons-react";

interface HirerDashboardStats {
  totalJobPostings: number;
  publishedJobPostings: number;
  totalTalents: number;
  totalApplications: number;
}

export default function HirerDashboardPage() {
  const { user } = useUser();
  const [stats, setStats] = useState<HirerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('talent-pool');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch job postings and talent pool - handle failures gracefully
      const [jobPostingsRes, talentPoolRes] = await Promise.allSettled([
        fetch('/api/hirer/job-postings'),
        fetch('/api/hirer/talent-pool')
      ]);

      // Handle job postings
      let jobPostings: any[] = [];
      if (jobPostingsRes.status === 'fulfilled' && jobPostingsRes.value.ok) {
        const jobPostingsData = await jobPostingsRes.value.json();
        jobPostings = jobPostingsData.jobPostings || [];
      } else {
        console.warn('Failed to fetch job postings:', jobPostingsRes);
      }

      // Handle talent pool - don't fail if this doesn't work
      let totalTalents = 0;
      if (talentPoolRes.status === 'fulfilled' && talentPoolRes.value.ok) {
        try {
          const talentPoolData = await talentPoolRes.value.json();
          totalTalents = talentPoolData.total || (talentPoolData.talents?.length || 0);
        } catch (e) {
          console.warn('Error parsing talent pool data:', e);
        }
      } else {
        console.warn('Failed to fetch talent pool (non-critical):', talentPoolRes);
        // This is okay - talent pool might be empty or user might not have hiring needs configured
      }
      
      setStats({
        totalJobPostings: jobPostings.length,
        publishedJobPostings: jobPostings.filter((jp: any) => jp.status === 'PUBLISHED').length,
        totalTalents: totalTalents,
        totalApplications: jobPostings.reduce((sum: number, jp: any) => sum + (jp.applicationCount || 0), 0),
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Even on error, try to set defaults so dashboard can still load
      setStats({
        totalJobPostings: 0,
        publishedJobPostings: 0,
        totalTalents: 0,
        totalApplications: 0,
      });
      // Only set error if it's critical
      setError(null); // Don't block dashboard loading for non-critical errors
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <LoadingScreen 
        title="Loading your dashboard..."
        subtitle="Fetching your hiring activity and talent pool"
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

  return (
    <div className="space-y-6 px-4 lg:px-6 mt-6">
      {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.firstName || 'Hirer'}! 👋
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your job postings and discover talented candidates
            </p>
          </div>
          <Button 
            className="bg-primary hover:bg-primary/90"
            onClick={() => setActiveTab('create-job')}
          >
            <IconPlus className="mr-2 h-4 w-4" />
            Create Job Posting
          </Button>
        </div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Job Postings</CardTitle>
            <IconFileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalJobPostings || 0}</div>
            <p className="text-xs text-muted-foreground">
              All job postings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <IconBriefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.publishedJobPostings || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active job postings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Talent Pool</CardTitle>
            <IconUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalTalents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Matching candidates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalApplications || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all postings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="talent-pool">Talent Pool</TabsTrigger>
          <TabsTrigger value="job-postings">My Job Postings</TabsTrigger>
          <TabsTrigger value="create-job">Create Job</TabsTrigger>
        </TabsList>

        <TabsContent value="talent-pool" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Talent Pool</CardTitle>
              <CardDescription>
                Discover candidates whose skills match your hiring needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TalentPool />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="job-postings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Job Postings</CardTitle>
              <CardDescription>
                Manage your job postings and view applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobPostingsList onRefresh={fetchDashboardData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-job" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Job Posting</CardTitle>
              <CardDescription>
                Post a new job opportunity and get matched with top candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <JobCreation onSuccess={fetchDashboardData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

