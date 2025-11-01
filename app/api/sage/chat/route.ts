import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

interface UserContext {
  profile: any;
  stats: {
    basicStats: any;
    monetaryStats: any;
    skillsAnalysis: any[];
    platformAnalysis: any[];
    recentTrends: any;
  };
  jobHistory: any[];
}

// Initialize OpenAI with SAGE-specific API key
const openai = createOpenAI({ apiKey: process.env.SAGEA_API_KEY });

async function getUserContext(userId: string): Promise<UserContext> {
  try {
    // Get user and profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true }
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Get comprehensive stats
    const stats = await getStatsData(user.id);
    
    // Get recent job decisions for context
    const recentJobs = await prisma.jobDecision.findMany({
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
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    return {
      profile: user.profile,
      stats,
      jobHistory: recentJobs
    };
  } catch (error) {
    console.error("Error getting user context:", error);
    return {
      profile: null,
      stats: {
        basicStats: { totalDecisions: 0, acceptanceRate: 0, trend: 'neutral' },
        monetaryStats: { averageAcceptedBudget: 0 },
        skillsAnalysis: [],
        platformAnalysis: [],
        recentTrends: {}
      },
      jobHistory: []
    };
  }
}

async function getStatsData(userId: string) {
  try {
    const jobDecisions = await prisma.jobDecision.findMany({
      where: { userId: userId },
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
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const validDecisions = jobDecisions.filter(d => d && d.job);
    const totalDecisions = validDecisions.length;
    const acceptedDecisions = validDecisions.filter(d => d.decision === 'ACCEPTED');
    
    const acceptanceRate = totalDecisions > 0 ? Math.round((acceptedDecisions.length / totalDecisions) * 100) : 0;
    
    // Calculate average budget for accepted jobs
    const acceptedBudgets = acceptedDecisions
      .map(d => d.job.budget)
      .filter((budget): budget is number => budget !== null && budget !== undefined && budget > 0);
    
    const averageAcceptedBudget = acceptedBudgets.length > 0 
      ? Math.round(acceptedBudgets.reduce((sum, budget) => sum + budget, 0) / acceptedBudgets.length)
      : 0;

    // Skills analysis
    const skillsMap = new Map();
    validDecisions.forEach(decision => {
      if (decision.job.skills && Array.isArray(decision.job.skills)) {
        decision.job.skills.forEach(skill => {
          if (!skillsMap.has(skill)) {
            skillsMap.set(skill, { total: 0, accepted: 0, budget: 0, budgetCount: 0 });
          }
          const skillData = skillsMap.get(skill);
          skillData.total++;
          if (decision.decision === 'ACCEPTED') {
            skillData.accepted++;
            if (decision.job.budget && decision.job.budget > 0) {
              skillData.budget += decision.job.budget;
              skillData.budgetCount++;
            }
          }
        });
      }
    });

    const skillsAnalysis = Array.from(skillsMap.entries())
      .map(([skill, data]) => ({
        skill,
        total: data.total,
        accepted: data.accepted,
        acceptanceRate: Math.round((data.accepted / data.total) * 100),
        avgBudget: data.budgetCount > 0 ? Math.round(data.budget / data.budgetCount) : 0
      }))
      .sort((a, b) => b.acceptanceRate - a.acceptanceRate);

    // Platform analysis
    const platformsMap = new Map();
    validDecisions.forEach(decision => {
      const platform = decision.job.platform;
      if (!platformsMap.has(platform)) {
        platformsMap.set(platform, { total: 0, accepted: 0 });
      }
      const platformData = platformsMap.get(platform);
      platformData.total++;
      if (decision.decision === 'ACCEPTED') {
        platformData.accepted++;
      }
    });

    const platformAnalysis = Array.from(platformsMap.entries())
      .map(([platform, data]) => ({
        platform,
        total: data.total,
        accepted: data.accepted,
        acceptanceRate: Math.round((data.accepted / data.total) * 100)
      }))
      .sort((a, b) => b.acceptanceRate - a.acceptanceRate);

    // Recent trend
    const recent10 = validDecisions.slice(0, 10);
    const recentAcceptanceRate = recent10.length > 0 
      ? Math.round((recent10.filter(d => d.decision === 'ACCEPTED').length / recent10.length) * 100)
      : 0;

    let trend = 'neutral';
    if (recentAcceptanceRate > acceptanceRate + 10) trend = 'improving';
    else if (recentAcceptanceRate < acceptanceRate - 10) trend = 'declining';

    return {
      basicStats: {
        totalDecisions,
        acceptanceRate,
        recentAcceptanceRate,
        trend,
        acceptedJobs: acceptedDecisions.length,
        rejectedJobs: validDecisions.length - acceptedDecisions.length
      },
      monetaryStats: {
        averageAcceptedBudget,
        totalEarningsPotential: acceptedBudgets.length > 0 ? acceptedBudgets.reduce((sum, budget) => sum + budget, 0) : 0
      },
      skillsAnalysis: skillsAnalysis.slice(0, 10),
      platformAnalysis,
      recentTrends: {
        recentAcceptanceRate,
        trend
      }
    };
  } catch (error) {
    console.error("Error in getStatsData:", error);
    return {
      basicStats: { totalDecisions: 0, acceptanceRate: 0, trend: 'neutral' },
      monetaryStats: { averageAcceptedBudget: 0 },
      skillsAnalysis: [],
      platformAnalysis: [],
      recentTrends: {}
    };
  }
}

function buildAdvancedUserContext(context: UserContext): string {
  const profile = context.profile || {};
  const stats = context.stats.basicStats || {};
  const monetary = context.stats.monetaryStats || {};
  const skills = context.stats.skillsAnalysis || [];
  const platforms = context.stats.platformAnalysis || [];

  return `USER PROFILE:
- Skills: ${profile.selectedSkills?.join(', ') || 'Not specified'}
- Experience Level: ${profile.experienceLevel || 'Unknown'}
- Hourly Rate Range: $${profile.hourlyRateMin || 'Not set'}-$${profile.hourlyRateMax || 'Not set'}
- Location: ${profile.location || 'Not specified'}
- Preferred Platforms: ${profile.preferredPlatforms?.join(', ') || 'Not specified'}
- Bio: ${profile.bio || 'No bio available'}

PERFORMANCE ANALYTICS:
- Total Job Decisions: ${stats.totalDecisions || 0}
- Overall Acceptance Rate: ${stats.acceptanceRate || 0}%
- Recent Acceptance Rate (Last 10): ${stats.recentAcceptanceRate || 0}%
- Performance Trend: ${stats.trend || 'neutral'}
- Average Accepted Budget: $${monetary.averageAcceptedBudget || 0}
- Total Earnings Potential: $${monetary.totalEarningsPotential || 0}

TOP SKILLS PERFORMANCE:
${skills.slice(0, 5).map(skill => 
  `- ${skill.skill}: ${skill.acceptanceRate}% acceptance rate, $${skill.avgBudget} avg budget (${skill.total} opportunities)`
).join('\n') || 'No skill data available'}

PLATFORM PERFORMANCE:
${platforms.map(platform => 
  `- ${platform.platform}: ${platform.acceptanceRate}% acceptance rate (${platform.total} opportunities)`
).join('\n') || 'No platform data available'}

RECENT JOB DECISIONS:
${context.jobHistory.slice(0, 5).map(job => {
  const date = job.createdAt.toISOString().split('T')[0];
  const title = job.job?.title || 'Unknown job';
  const budget = job.job?.budget ? `$${job.job.budget}` : 'No budget';
  return `- ${date}: ${job.decision} "${title}" (${budget})`;
}).join('\n') || 'No recent decisions'}`;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const messages: Array<{ role: "user" | "assistant" | "system"; content: string }> =
      body?.messages || [];

    // Get comprehensive user context with stats
    const userContext = await getUserContext(userId);
    
    // Build advanced context with performance analytics
    const ctx = buildAdvancedUserContext(userContext);

    const systemPrompt = `You are SAGE, a personal AI advisor for freelancers. You have deep insights into the user's freelancing journey and provide actionable, data-driven advice in a conversational tone.

PERSONALITY & APPROACH:
- Be conversational, encouraging, and insightful
- Use the user's actual performance data to provide personalized advice
- Focus on actionable growth opportunities and specific improvements
- Keep responses concise but valuable (2-3 short paragraphs max)
- Suggest concrete next steps based on their data
- Be honest about areas for improvement while staying positive
- If data is limited, acknowledge this and provide general but relevant advice
- Use emojis sparingly for personality

RESPONSE GUIDELINES:
- Start responses naturally, don't always say "Based on your data..."
- Be specific with numbers when relevant
- Offer 1-2 concrete actionable suggestions
- Ask follow-up questions when appropriate
- Focus on scaling opportunities, skill development, and market positioning`;

    const modelName = process.env.SAGEA_MODEL || "gpt-4o-mini";

    const { text } = await generateText({
      model: openai(modelName),
      system: `${systemPrompt}\n\n${ctx}`,
      messages,
      temperature: 0.7,
    });

    return NextResponse.json({ 
      reply: text, 
      identity: "SAGE",
      context: {
        totalDecisions: userContext.stats.basicStats.totalDecisions,
        acceptanceRate: userContext.stats.basicStats.acceptanceRate,
        topSkill: userContext.stats.skillsAnalysis[0]?.skill || 'N/A',
        trend: userContext.stats.basicStats.trend
      }
    });
  } catch (error: any) {
    console.error("SAGE chat error:", error);
    const msg = error?.message || "Failed to generate response";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
