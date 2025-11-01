import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { JobDecisionType, JobState } from "@prisma/client";

// Type definitions for safe data handling
type SafeJobDecision = {
  id: string;
  decision: JobDecisionType | null;
  fitScore: number | null;
  createdAt: Date;
  job: {
    id: string;
    title: string | null;
    budget: number | null;
    currency: string | null;
    skills: string[] | null;
    platform: string;
    isUrgent: boolean | null;
    verified: boolean | null;
    state: JobState;
    createdAt: Date;
    proposedBudget: number | null;
    proposalSubmitted: boolean | null;
  };
};

// Utility functions for safe data handling
const safeNumber = (value: any, defaultValue: number = 0): number => {
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? defaultValue : num;
};

const safeArray = <T>(value: any): T[] => {
  return Array.isArray(value) ? value : [];
};

const safeString = (value: any, defaultValue: string = ''): string => {
  return typeof value === 'string' ? value : defaultValue;
};

const safeDivision = (numerator: number, denominator: number, defaultValue: number = 0): number => {
  if (denominator === 0 || !isFinite(denominator) || !isFinite(numerator)) {
    return defaultValue;
  }
  const result = numerator / denominator;
  return isFinite(result) ? result : defaultValue;
};

const safePercentage = (numerator: number, denominator: number): number => {
  return Math.round(safeDivision(numerator, denominator, 0) * 100 * 100) / 100;
};

const safeAverage = (values: number[]): number => {
  const validValues = values.filter(v => isFinite(v) && !isNaN(v));
  return validValues.length > 0 ? validValues.reduce((sum, v) => sum + v, 0) / validValues.length : 0;
};

const isValidJobDecision = (d: any): d is SafeJobDecision => {
  return d && typeof d === 'object' && d.job && typeof d.job === 'object';
};

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

    // Fetch all job decisions with job details - with safe error handling
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
    }).catch(() => []);

    // Fetch all jobs for broader context - with safe error handling
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
    }).catch(() => []);

    // Ensure we have valid arrays with proper type safety
    const validJobDecisions = safeArray(jobDecisions).filter(isValidJobDecision);
    const validAllJobs = safeArray(allJobs);

    // Basic Statistics with safe calculations
    const totalDecisions = validJobDecisions.length;
    const acceptedJobs = validJobDecisions.filter(d => d.decision === JobDecisionType.ACCEPTED);
    const rejectedJobs = validJobDecisions.filter(d => d.decision === JobDecisionType.REJECTED);
    const pendingJobs = validJobDecisions.filter(d => !d.decision || (d.decision !== JobDecisionType.ACCEPTED && d.decision !== JobDecisionType.REJECTED));
    
    const acceptanceRate = safePercentage(acceptedJobs.length, totalDecisions);
    const rejectionRate = safePercentage(rejectedJobs.length, totalDecisions);
    
    const fitScores = validJobDecisions.map(d => safeNumber(d.fitScore)).filter(score => score > 0);
    const avgFitScore = Math.round(safeAverage(fitScores) * 100) / 100;

    // Monetary Analysis with safe budget extraction
    const acceptedBudgets = acceptedJobs.map(d => safeNumber(d.job.budget)).filter(b => b > 0);
    const rejectedBudgets = rejectedJobs.map(d => safeNumber(d.job.budget)).filter(b => b > 0);
    
    const avgAcceptedBudget = Math.round(safeAverage(acceptedBudgets));
    const avgRejectedBudget = Math.round(safeAverage(rejectedBudgets));

    const totalPotentialEarnings = acceptedBudgets.reduce((sum, b) => sum + safeNumber(b), 0);
    const missedEarnings = rejectedBudgets.reduce((sum, b) => sum + safeNumber(b), 0);

    // Skills Analysis with safe data handling
    const skillStats = new Map<string, {
      total: number;
      accepted: number;
      rejected: number;
      avgFitScore: number;
      totalBudget: number;
      acceptedBudget: number;
      fitScores: number[];
    }>();

    validJobDecisions.forEach(decision => {
      if (!decision || !decision.job) return;
      
      const skills = safeArray(decision.job.skills).filter(skill => skill && typeof skill === 'string');
      const budget = safeNumber(decision.job.budget);
      const fitScore = safeNumber(decision.fitScore);
      
      skills.forEach(skill => {
        const skillKey = safeString(skill).trim();
        if (!skillKey) return;
        
        if (!skillStats.has(skillKey)) {
          skillStats.set(skillKey, {
            total: 0,
            accepted: 0,
            rejected: 0,
            avgFitScore: 0,
            totalBudget: 0,
            acceptedBudget: 0,
            fitScores: [],
          });
        }
        
        const stat = skillStats.get(skillKey)!;
        stat.total++;
        stat.totalBudget += budget;
        stat.fitScores.push(fitScore);
        
        if (decision.decision === JobDecisionType.ACCEPTED) {
          stat.accepted++;
          stat.acceptedBudget += budget;
        } else if (decision.decision === JobDecisionType.REJECTED) {
          stat.rejected++;
        }
        
        // Update average fit score safely
        stat.avgFitScore = safeAverage(stat.fitScores);
      });
    });

    // Convert skill stats to array and calculate rates safely
    const skillsAnalysis = Array.from(skillStats.entries())
      .map(([skill, stats]) => {
        const { fitScores, ...restStats } = stats;
        return {
          skill: safeString(skill),
          ...restStats,
          acceptanceRate: safePercentage(stats.accepted, stats.total),
          rejectionRate: safePercentage(stats.rejected, stats.total),
          avgBudget: Math.round(safeDivision(stats.totalBudget, stats.total)),
          avgFitScore: Math.round(stats.avgFitScore * 100) / 100,
        };
      })
      .filter(skill => skill.total > 0)
      .sort((a, b) => b.acceptanceRate - a.acceptanceRate);

    // Platform Analysis with safe data handling
    const platformStats = new Map<string, {
      total: number;
      accepted: number;
      rejected: number;
      totalBudget: number;
      fitScores: number[];
    }>();

    validJobDecisions.forEach(decision => {
      if (!decision || !decision.job) return;
      
      const platform = safeString(decision.job.platform, 'Unknown');
      const budget = safeNumber(decision.job.budget);
      const fitScore = safeNumber(decision.fitScore);
      
      if (!platformStats.has(platform)) {
        platformStats.set(platform, {
          total: 0,
          accepted: 0,
          rejected: 0,
          totalBudget: 0,
          fitScores: [],
        });
      }
      
      const stat = platformStats.get(platform)!;
      stat.total++;
      stat.totalBudget += budget;
      stat.fitScores.push(fitScore);
      
      if (decision.decision === JobDecisionType.ACCEPTED) {
        stat.accepted++;
      } else if (decision.decision === JobDecisionType.REJECTED) {
        stat.rejected++;
      }
    });

    const platformAnalysis = Array.from(platformStats.entries())
      .map(([platform, stats]) => ({
        platform: safeString(platform),
        total: stats.total,
        accepted: stats.accepted,
        rejected: stats.rejected,
        acceptanceRate: safePercentage(stats.accepted, stats.total),
        avgBudget: Math.round(safeDivision(stats.totalBudget, stats.total)),
        avgFitScore: Math.round(safeAverage(stats.fitScores) * 100) / 100,
      }))
      .filter(platform => platform.total > 0)
      .sort((a, b) => b.acceptanceRate - a.acceptanceRate);

    // Budget Range Analysis with safe data handling
    const budgetRanges = [
      { min: 0, max: 500, label: '$0-$500' },
      { min: 500, max: 1000, label: '$500-$1K' },
      { min: 1000, max: 2500, label: '$1K-$2.5K' },
      { min: 2500, max: 5000, label: '$2.5K-$5K' },
      { min: 5000, max: 10000, label: '$5K-$10K' },
      { min: 10000, max: Infinity, label: '$10K+' },
    ];

    const budgetAnalysis = budgetRanges
      .map(range => {
        const jobsInRange = validJobDecisions.filter(d => {
          if (!d || !d.job) return false;
          const budget = safeNumber(d.job.budget);
          return budget >= range.min && (range.max === Infinity ? true : budget < range.max);
        });
        
        const accepted = jobsInRange.filter(d => d.decision === JobDecisionType.ACCEPTED).length;
        const rejected = jobsInRange.filter(d => d.decision === JobDecisionType.REJECTED).length;
        const total = jobsInRange.length;
        const fitScores = jobsInRange.map(d => safeNumber(d.fitScore));
        
        return {
          ...range,
          total,
          accepted,
          rejected,
          acceptanceRate: safePercentage(accepted, total),
          avgFitScore: Math.round(safeAverage(fitScores) * 100) / 100,
        };
      })
      .filter(range => range.total > 0);

    // Improvement Recommendations with safe data handling
    const recommendations: Array<{
      type: string;
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      action: string;
      impact: string;
    }> = [];

    try {
      // Low acceptance rate skills
      const lowAcceptanceSkills = skillsAnalysis.filter(s => 
        safeNumber(s.acceptanceRate) < 50 && safeNumber(s.total) >= 3
      );
      
      if (lowAcceptanceSkills.length > 0 && lowAcceptanceSkills[0]) {
        recommendations.push({
          type: 'skill_improvement',
          priority: 'high' as const,
          title: 'Skills with Low Acceptance Rate',
          description: `You're rejecting jobs with ${safeString(lowAcceptanceSkills[0].skill, 'certain skills')}. Consider improving this skill or adjusting your criteria.`,
          action: `Focus on improving ${lowAcceptanceSkills.slice(0, 3).map(s => safeString(s.skill, 'Unknown')).filter(s => s !== 'Unknown').join(', ') || 'identified skills'}`,
          impact: 'Could increase acceptance rate by 20-30%',
        });
      }

      // High-value rejected skills
      const highValueRejected = skillsAnalysis
        .filter(s => safeNumber(s.rejected) > safeNumber(s.accepted) && safeNumber(s.avgBudget) > avgAcceptedBudget)
        .sort((a, b) => safeNumber(b.avgBudget) - safeNumber(a.avgBudget))
        .slice(0, 3);
      
      if (highValueRejected.length > 0 && highValueRejected[0] && avgAcceptedBudget > 0) {
        const skill = highValueRejected[0];
        const budgetDiff = safeNumber(skill.avgBudget) - avgAcceptedBudget;
        
        recommendations.push({
          type: 'opportunity_cost',
          priority: 'high' as const,
          title: 'Missing High-Value Opportunities',
          description: `You're rejecting high-budget jobs requiring ${safeString(skill.skill, 'certain skills')} (avg $${safeNumber(skill.avgBudget).toFixed(0)}).`,
          action: `Consider developing skills in ${highValueRejected.map(s => safeString(s.skill, 'Unknown')).filter(s => s !== 'Unknown').join(', ') || 'identified areas'}`,
          impact: `Potential to increase avg project value by $${Math.max(0, budgetDiff).toFixed(0)}`,
        });
      }

      // Budget optimization
      const bestBudgetRange = [...budgetAnalysis].sort((a, b) => safeNumber(b.acceptanceRate) - safeNumber(a.acceptanceRate))[0];
      if (bestBudgetRange && safeNumber(bestBudgetRange.acceptanceRate) > acceptanceRate + 10) {
        recommendations.push({
          type: 'budget_optimization',
          priority: 'medium' as const,
          title: 'Budget Range Optimization',
          description: `You accept ${safeNumber(bestBudgetRange.acceptanceRate).toFixed(1)}% of jobs in the ${safeString(bestBudgetRange.label, 'optimal')} range.`,
          action: `Focus on jobs in the ${safeString(bestBudgetRange.label, 'optimal')} range for higher success rate`,
          impact: 'Could improve acceptance rate and reduce time spent on evaluations',
        });
      }
    } catch (error) {
      console.warn('Error generating recommendations:', error);
      // Continue without recommendations rather than failing
    }

    // Recent trends (last 30 days vs previous period) with safe date handling
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentDecisions = validJobDecisions.filter(d => {
      try {
        return new Date(d.createdAt).getTime() >= thirtyDaysAgo.getTime();
      } catch {
        return false;
      }
    });
    const recentAcceptanceRate = safePercentage(
      recentDecisions.filter(d => d.decision === JobDecisionType.ACCEPTED).length,
      recentDecisions.length
    );

    // Time-based analysis with safe date handling
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    const weeklyDecisions = validJobDecisions.filter(d => {
      try {
        return new Date(d.createdAt).getTime() >= last7Days.getTime();
      } catch {
        return false;
      }
    });
    const weeklyAcceptanceRate = safePercentage(
      weeklyDecisions.filter(d => d.decision === JobDecisionType.ACCEPTED).length,
      weeklyDecisions.length
    );

    // Decision speed analysis with safe calculations
    const decisionTimes = validJobDecisions
      .map(d => {
        try {
          const decisionTime = new Date(d.createdAt).getTime() - new Date(d.job.createdAt).getTime();
          return decisionTime / (1000 * 60 * 60); // Convert to hours
        } catch {
          return 0;
        }
      })
      .filter(time => time > 0 && isFinite(time));
    
    const avgDecisionTime = Math.round(safeAverage(decisionTimes) * 100) / 100;

    // Find optimal budget range for insights
    const optimalBudgetRange = [...budgetAnalysis]
      .sort((a, b) => safeNumber(b.acceptanceRate) - safeNumber(a.acceptanceRate))[0];

    const response = {
      basicStats: {
        totalDecisions,
        acceptedJobs: acceptedJobs.length,
        rejectedJobs: rejectedJobs.length,
        pendingJobs: pendingJobs.length,
        acceptanceRate,
        rejectionRate,
        averageFitScore: avgFitScore,
        recentAcceptanceRate,
        weeklyAcceptanceRate,
        avgDecisionTimeHours: avgDecisionTime,
        trend: recentAcceptanceRate > acceptanceRate ? 'improving' : recentAcceptanceRate < acceptanceRate ? 'declining' : 'stable',
        weeklyTrend: weeklyAcceptanceRate > acceptanceRate ? 'improving' : weeklyAcceptanceRate < acceptanceRate ? 'declining' : 'stable',
      },
      monetaryStats: {
        averageAcceptedBudget: avgAcceptedBudget,
        averageRejectedBudget: avgRejectedBudget,
        totalPotentialEarnings: Math.round(totalPotentialEarnings),
        missedEarnings: Math.round(missedEarnings),
        opportunityCost: Math.round(safeDivision(missedEarnings, totalPotentialEarnings + missedEarnings) * 100),
      },
      skillsAnalysis: skillsAnalysis.slice(0, 15), // Top 15 skills
      platformAnalysis: platformAnalysis.slice(0, 10), // Top 10 platforms
      budgetAnalysis: budgetAnalysis,
      recommendations: recommendations,
      insights: {
        topSkill: skillsAnalysis[0]?.skill || 'N/A',
        weakestSkill: skillsAnalysis.length > 1 ? skillsAnalysis[skillsAnalysis.length - 1]?.skill || 'N/A' : 'N/A',
        bestPlatform: platformAnalysis[0]?.platform || 'N/A',
        optimalBudgetRange: optimalBudgetRange?.label || 'N/A',
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