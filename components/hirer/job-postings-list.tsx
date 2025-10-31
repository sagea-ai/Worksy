"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  IconEye, 
  IconUsers, 
  IconCalendar,
  IconCurrencyDollar,
  IconMapPin,
  IconClock
} from "@tabler/icons-react";

interface JobPosting {
  id: string;
  title: string;
  description: string;
  positionType: string;
  requiredSkills: string[];
  status: string;
  budgetMin?: number;
  budgetMax?: number;
  currency: string;
  location?: string;
  isRemote: boolean;
  duration?: string;
  viewCount: number;
  applicationCount: number;
  createdAt: string;
  publishedAt?: string;
}

export function JobPostingsList({ onRefresh }: { onRefresh?: () => void }) {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobPostings();
  }, [statusFilter]);

  const fetchJobPostings = async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' 
        ? '/api/hirer/job-postings'
        : `/api/hirer/job-postings?status=${statusFilter}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch job postings');
      }

      const data = await response.json();
      setJobPostings(data.jobPostings || []);
    } catch (err) {
      console.error('Error fetching job postings:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-green-500';
      case 'DRAFT': return 'bg-gray-500';
      case 'CLOSED': return 'bg-red-500';
      case 'EXPIRED': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatBudget = (min?: number, max?: number, currency: string = 'USD') => {
    if (!min && !max) return 'Not specified';
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    if (min) return `${currency} ${min.toLocaleString()}+`;
    if (max) return `Up to ${currency} ${max.toLocaleString()}`;
    return 'Not specified';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchJobPostings} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  if (jobPostings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          No job postings found. Create your first job posting to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Job Postings</h3>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {jobPostings.map((posting) => (
          <Card key={posting.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{posting.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={getStatusColor(posting.status)}
                        >
                          {posting.status}
                        </Badge>
                        <Badge variant="outline">
                          {posting.positionType}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {posting.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {posting.requiredSkills.slice(0, 6).map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {posting.requiredSkills.length > 6 && (
                      <Badge variant="secondary" className="text-xs">
                        +{posting.requiredSkills.length - 6} more
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <IconCurrencyDollar className="h-4 w-4" />
                      {formatBudget(posting.budgetMin, posting.budgetMax, posting.currency)}
                    </div>
                    {posting.location && (
                      <div className="flex items-center gap-1">
                        <IconMapPin className="h-4 w-4" />
                        {posting.isRemote ? 'Remote' : posting.location}
                      </div>
                    )}
                    {posting.duration && (
                      <div className="flex items-center gap-1">
                        <IconClock className="h-4 w-4" />
                        {posting.duration}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <IconCalendar className="h-4 w-4" />
                      {formatDate(posting.publishedAt || posting.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <IconEye className="h-4 w-4" />
                      {posting.viewCount}
                    </div>
                    <div className="flex items-center gap-1">
                      <IconUsers className="h-4 w-4" />
                      {posting.applicationCount}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

