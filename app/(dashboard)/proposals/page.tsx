"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { 
  FileText, 
  DollarSign, 
  Clock, 
  ExternalLink,
  Eye,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Link from "next/link";

interface Proposal {
  id: string;
  externalId: string;
  title: string;
  proposalText: string;
  proposedBudget: number;
  proposedDeadline: string | null;
  platform: string;
  updatedAt: string;
  state: string;
  currency: string;
}

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statsExpanded, setStatsExpanded] = useState(false);
  const proposalsPerPage = 5;

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/proposals');
        
        if (!response.ok) {
          throw new Error('Failed to fetch proposals');
        }
        
        const data = await response.json();
        setProposals(data.proposals || []);
      } catch (err) {
        console.error('Error fetching proposals:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  if (loading) {
    return (
      <LoadingScreen 
        title="Loading your proposals..."
        subtitle="Fetching your active proposals and bid status"
      />
    );
  }

  if (error) {
    return (
      <div className="space-y-6 px-4 lg:px-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Error loading proposals: {error}</p>
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

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(proposals.length / proposalsPerPage);
  const startIndex = (currentPage - 1) * proposalsPerPage;
  const endIndex = startIndex + proposalsPerPage;
  const currentProposals = proposals.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const generatePageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Fixed Header Section */}
      <div className="flex-shrink-0 px-4 lg:px-6 py-6 border-b">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Active Proposals
            </h1>
            <p className="text-muted-foreground mt-2">
              Track your submitted proposals and their status
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/deals">
              <Button variant="outline" size="sm">
                Browse New Jobs
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Stats Toggle */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setStatsExpanded(!statsExpanded)}
            className="w-full flex items-center justify-between"
          >
            <span className="text-sm font-medium">Stats Overview</span>
            {statsExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Summary Stats */}
        <div className={`grid gap-3 lg:gap-4 grid-cols-1 sm:grid-cols-3 lg:grid transition-all duration-300 ${
          statsExpanded ? 'block' : 'hidden lg:grid'
        }`}>
          <Card className="p-3 lg:p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 lg:pb-2 p-0">
              <CardTitle className="text-xs lg:text-sm font-medium">Total Proposals</CardTitle>
              <FileText className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-lg lg:text-2xl font-bold">{proposals.length}</div>
              <p className="text-xs text-muted-foreground">
                Active proposals submitted
              </p>
            </CardContent>
          </Card>

          <Card className="p-3 lg:p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 lg:pb-2 p-0">
              <CardTitle className="text-xs lg:text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-lg lg:text-2xl font-bold">
                {formatCurrency(proposals.reduce((sum, p) => sum + p.proposedBudget, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                Combined proposal value
              </p>
            </CardContent>
          </Card>

          <Card className="p-3 lg:p-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 lg:pb-2 p-0">
              <CardTitle className="text-xs lg:text-sm font-medium">Average Bid</CardTitle>
              <DollarSign className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="text-lg lg:text-2xl font-bold">
                {proposals.length > 0 
                  ? formatCurrency(proposals.reduce((sum, p) => sum + p.proposedBudget, 0) / proposals.length)
                  : '$0'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Per proposal
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Scrollable Proposals Section */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4">
        <div className="space-y-4 pb-15">
          {proposals.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Proposals</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't submitted any proposals yet. Start by browsing available jobs.
                </p>
                <Link href="/deals">
                  <Button>
                    Browse Jobs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            currentProposals.map((proposal) => (
              <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                        {proposal.title}
                      </h3>
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant="secondary">
                          {proposal.platform}
                        </Badge>
                        <Badge variant="outline">
                          {proposal.state}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(proposal.proposedBudget, proposal.currency)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Proposed amount
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      Proposal Preview:
                    </h4>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm line-clamp-3">
                        {proposal.proposalText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Submitted {getTimeAgo(proposal.updatedAt)}
                      </div>
                      {proposal.proposedDeadline && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Deadline: {formatDate(proposal.proposedDeadline)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/deals?highlight=${proposal.externalId}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View Job
                        </Button>
                      </Link>
                      {proposal.platform.toLowerCase() === 'freelancer' && (
                        <Button variant="outline" size="sm" asChild>
                          <a 
                            href={`https://www.freelancer.com/projects/${proposal.externalId}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Freelancer
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Fixed Pagination Footer */}
      {proposals.length > 0 && totalPages > 1 && (
        <div className="flex-shrink-0 px-4 lg:px-6 py-4 border-t bg-background">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, proposals.length)} of {proposals.length} proposals
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              {generatePageNumbers().map((pageNumber) => (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNumber)}
                  className="min-w-[40px]"
                >
                  {pageNumber}
                </Button>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
