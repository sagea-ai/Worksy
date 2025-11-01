import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { JobDecisionType, JobState } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's internal ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all job decisions with job details
    const jobDecisions = await prisma.jobDecision.findMany({
      where: { userId: user.id },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            budget: true,
            currency: true,
            skills: true,
            platform: true,
            isUrgent: true,
            verified: true,
            state: true,
            createdAt: true,
            proposedBudget: true,
            proposalSubmitted: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch all jobs for broader context
    const allJobs = await prisma.job.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        budget: true,
        currency: true,
        skills: true,
        platform: true,
        isUrgent: true,
        verified: true,
        state: true,
        createdAt: true,
        proposedBudget: true,
        proposalSubmitted: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Basic Statistics
    const totalDecisions = jobDecisions.length;
    const acceptedJobs = jobDecisions.filter(d => d.decision === JobDecisionType.ACCEPTED);
    const rejectedJobs = jobDecisions.filter(d => d.decision === JobDecisionType.REJECTED);
    
    const acceptanceRate = totalDecisions > 0 ? (acceptedJobs.length / totalDecisions) * 100 : 0;
    const rejectionRate = totalDecisions > 0 ? (rejectedJobs.length / totalDecisions) * 100 : 0;
    
    const avgFitScore = jobDecisions.length > 0 
      ? jobDecisions.reduce((sum, d) => sum + (d.fitScore || 0), 0) / jobDecisions.length 
      : 0;

    // Monetary Analysis
    const acceptedBudgets = acceptedJobs.map(d => d.job.budget || 0).filter(b => b > 0);
    const rejectedBudgets = rejectedJobs.map(d => d.job.budget || 0).filter(b => b > 0);
    
    const avgAcceptedBudget = acceptedBudgets.length > 0 
      ? acceptedBudgets.reduce((sum, b) => sum + b, 0) / acceptedBudgets.length 
      : 0;
    
    const avgRejectedBudget = rejectedBudgets.length > 0 
      ? rejectedBudgets.reduce((sum, b) => sum + b, 0) / rejectedBudgets.length 
      : 0;

    const totalPotentialEarnings = acceptedBudgets.reduce((sum, b) => sum + b, 0);
    const missedEarnings = rejectedBudgets.reduce((sum, b) => sum + b, 0);

    // Skills Analysis
    const skillStats = new Map<string, {
      total: number;
      accepted: number;
      rejected: number;
      avgFitScore: number;
      totalBudget: number;
      acceptedBudget: number;
    }>();

    jobDecisions.forEach(decision => {
      const skills = decision.job.skills || [];
      const budget = decision.job.budget || 0;
      const fitScore = decision.fitScore || 0;
      
      skills.forEach(skill => {
        if (!skillStats.has(skill)) {
          skillStats.set(skill, {
            total: 0,
            accepted: 0,
            rejected: 0,
            avgFitScore: 0,
            totalBudget: 0,
            acceptedBudget: 0,
          });
        }
        
        const stat = skillStats.get(skill)!;
        stat.total++;
        stat.totalBudget += budget;
        
        if (decision.decision === JobDecisionType.ACCEPTED) {
          stat.accepted++;
          stat.acceptedBudget += budget;
        } else if (decision.decision === JobDecisionType.REJECTED) {
          stat.rejected++;
        }
        
        // Update average fit score
        stat.avgFitScore = (stat.avgFitScore * (stat.total - 1) + fitScore) / stat.total;
      });
    });

    // Convert skill stats to array and calculate rates
    const skillsAnalysis = Array.from(skillStats.entries()).map(([skill, stats]) => ({
      skill,
      ...stats,
      acceptanceRate: stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0,
      rejectionRate: stats.total > 0 ? (stats.rejected / stats.total) * 100 : 0,
      avgBudget: stats.total > 0 ? stats.totalBudget / stats.total : 0,
    })).sort((a, b) => b.acceptanceRate - a.acceptanceRate);

    // Platform Analysis
    const platformStats = new Map<string, {
      total: number;
      accepted: number;
      rejected: number;
      avgFitScore: number;
      totalBudget: number;
    }>();

    jobDecisions.forEach(decision => {
      const platform = decision.job.platform;
      const budget = decision.job.budget || 0;
      const fitScore = decision.fitScore || 0;
      
      if (!platformStats.has(platform)) {
        platformStats.set(platform, {
          total: 0,
          accepted: 0,
          rejected: 0,
          avgFitScore: 0,
          totalBudget: 0,
        });
      }
      
      const stat = platformStats.get(platform)!;
      stat.total++;
      stat.totalBudget += budget;
      
      if (decision.decision === JobDecisionType.ACCEPTED) {
        stat.accepted++;
      } else if (decision.decision === JobDecisionType.REJECTED) {
        stat.rejected++;
      }
      
      stat.avgFitScore = (stat.avgFitScore * (stat.total - 1) + fitScore) / stat.total;
    });

    const platformAnalysis = Array.from(platformStats.entries()).map(([platform, stats]) => ({
      platform,
      ...stats,
      acceptanceRate: stats.total > 0 ? (stats.accepted / stats.total) * 100 : 0,
      avgBudget: stats.total > 0 ? stats.totalBudget / stats.total : 0,
    })).sort((a, b) => b.acceptanceRate - a.acceptanceRate);

    // Budget Range Analysis
    const budgetRanges = [
      { min: 0, max: 500, label: '$0-$500' },
      { min: 500, max: 1000, label: '$500-$1K' },
      { min: 1000, max: 2500, label: '$1K-$2.5K' },
      { min: 2500, max: 5000, label: '$2.5K-$5K' },
      { min: 5000, max: 10000, label: '$5K-$10K' },
      { min: 10000, max: Infinity, label: '$10K+' },
    ];

    const budgetAnalysis = budgetRanges.map(range => {
      const jobsInRange = jobDecisions.filter(d => {
        const budget = d.job.budget || 0;
        return budget >= range.min && budget < range.max;
      });
      
      const accepted = jobsInRange.filter(d => d.decision === JobDecisionType.ACCEPTED).length;
      const rejected = jobsInRange.filter(d => d.decision === JobDecisionType.REJECTED).length;
      const total = jobsInRange.length;
      
      return {
        ...range,
        total,
        accepted,
        rejected,
        acceptanceRate: total > 0 ? (accepted / total) * 100 : 0,
        avgFitScore: total > 0 
          ? jobsInRange.reduce((sum, d) => sum + (d.fitScore || 0), 0) / total 
          : 0,
      };
    }).filter(range => range.total > 0);

    // Improvement Recommendations
    const recommendations = [];

    // Low acceptance rate skills
    const lowAcceptanceSkills = skillsAnalysis.filter(s => s.acceptanceRate < 50 && s.total >= 3);
    if (lowAcceptanceSkills.length > 0) {
      recommendations.push({
        type: 'skill_improvement',
        priority: 'high',
        title: 'Skills with Low Acceptance Rate',
        description: `You're rejecting jobs with ${lowAcceptanceSkills[0].skill}. Consider improving this skill or adjusting your criteria.`,
        action: `Focus on improving ${lowAcceptanceSkills.slice(0, 3).map(s => s.skill).join(', ')}`,
        impact: 'Could increase acceptance rate by 20-30%',
      });
    }

    // High-value rejected skills
    const highValueRejected = skillsAnalysis
      .filter(s => s.rejected > s.accepted && s.avgBudget > avgAcceptedBudget)
      .sort((a, b) => b.avgBudget - a.avgBudget)
      .slice(0, 3);
    
    if (highValueRejected.length > 0) {
      recommendations.push({
        type: 'opportunity_cost',
        priority: 'high',
        title: 'Missing High-Value Opportunities',
        description: `You're rejecting high-budget jobs requiring ${highValueRejected[0].skill} (avg $${highValueRejected[0].avgBudget.toFixed(0)}).`,
        action: `Consider developing skills in ${highValueRejected.map(s => s.skill).join(', ')}`,
        impact: `Potential to increase avg project value by $${(highValueRejected[0].avgBudget - avgAcceptedBudget).toFixed(0)}`,
      });
    }

    // Budget optimization
    const bestBudgetRange = budgetAnalysis.sort((a, b) => b.acceptanceRate - a.acceptanceRate)[0];
    if (bestBudgetRange && bestBudgetRange.acceptanceRate > acceptanceRate + 10) {
      recommendations.push({
        type: 'budget_optimization',
        priority: 'medium',
        title: 'Budget Range Optimization',
        description: `You accept ${bestBudgetRange.acceptanceRate.toFixed(1)}% of jobs in the ${bestBudgetRange.label} range.`,
        action: `Focus on jobs in the ${bestBudgetRange.label} range for higher success rate`,
        impact: 'Could improve acceptance rate and reduce time spent on evaluations',
      });
    }

    // Recent trends (last 30 days vs previous period)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentDecisions = jobDecisions.filter(d => new Date(d.createdAt) >= thirtyDaysAgo);
    const recentAcceptanceRate = recentDecisions.length > 0 
      ? (recentDecisions.filter(d => d.decision === JobDecisionType.ACCEPTED).length / recentDecisions.length) * 100 
      : 0;

    // Time-based analysis
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const weeklyDecisions = jobDecisions.filter(d => new Date(d.createdAt) >= last7Days);
    const weeklyAcceptanceRate = weeklyDecisions.length > 0 
      ? (weeklyDecisions.filter(d => d.decision === JobDecisionType.ACCEPTED).length / weeklyDecisions.length) * 100 
      : 0;

    // Decision speed analysis
    const avgDecisionTime = jobDecisions.length > 0 
      ? jobDecisions.reduce((sum, d) => {
          const decisionTime = new Date(d.createdAt).getTime() - new Date(d.job.createdAt).getTime();
          return sum + decisionTime;
        }, 0) / jobDecisions.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    const response = {
      basicStats: {
        totalDecisions,
        acceptedJobs: acceptedJobs.length,
        rejectedJobs: rejectedJobs.length,
        acceptanceRate: Math.round(acceptanceRate * 100) / 100,
        rejectionRate: Math.round(rejectionRate * 100) / 100,
        averageFitScore: Math.round(avgFitScore * 100) / 100,
        recentAcceptanceRate: Math.round(recentAcceptanceRate * 100) / 100,
        weeklyAcceptanceRate: Math.round(weeklyAcceptanceRate * 100) / 100,
        avgDecisionTimeHours: Math.round(avgDecisionTime * 100) / 100,
        trend: recentAcceptanceRate > acceptanceRate ? 'improving' : recentAcceptanceRate < acceptanceRate ? 'declining' : 'stable',
        weeklyTrend: weeklyAcceptanceRate > acceptanceRate ? 'improving' : weeklyAcceptanceRate < acceptanceRate ? 'declining' : 'stable',
      },
      monetaryStats: {
        averageAcceptedBudget: Math.round(avgAcceptedBudget),
        averageRejectedBudget: Math.round(avgRejectedBudget),
        totalPotentialEarnings: Math.round(totalPotentialEarnings),
        missedEarnings: Math.round(missedEarnings),
        opportunityCost: Math.round(missedEarnings / (totalPotentialEarnings + missedEarnings) * 100),
      },
      skillsAnalysis: skillsAnalysis.slice(0, 15), // Top 15 skills
      platformAnalysis,
      budgetAnalysis,
      recommendations,
      insights: {
        topSkill: skillsAnalysis[0]?.skill || 'N/A',
        weakestSkill: skillsAnalysis[skillsAnalysis.length - 1]?.skill || 'N/A',
        bestPlatform: platformAnalysis[0]?.platform || 'N/A',
        optimalBudgetRange: bestBudgetRange?.label || 'N/A',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats data" },
      { status: 500 }
    );
  }
}