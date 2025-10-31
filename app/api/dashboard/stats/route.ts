import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { JobState } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's internal ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch all jobs for the user
    const allJobs = await prisma.job.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        state: true,
        proposedBudget: true,
        platform: true,
        updatedAt: true,
        proposalSubmitted: true,
      },
    });

    // Calculate statistics
    const totalJobs = allJobs.length;
    const proposedJobs = allJobs.filter(
      (job) => job.state === JobState.PROPOSED
    ).length;
    const completedJobs = allJobs.filter(
      (job) => job.state === JobState.COMPLETED
    ).length;
    const inProgressJobs = allJobs.filter(
      (job) => job.state === JobState.IN_PROGRESS
    ).length;

    // Calculate total proposed budget
    const totalProposedBudget = allJobs
      .filter((job) => job.proposedBudget && job.state === JobState.PROPOSED)
      .reduce((sum, job) => sum + (job.proposedBudget || 0), 0);

    // Get recent jobs (last 10)
    const recentJobs = allJobs.slice(0, 10).map((job) => ({
      id: job.id,
      title: job.title,
      state: job.state,
      proposedBudget: job.proposedBudget || 0,
      platform: job.platform,
      updatedAt: job.updatedAt.toISOString(),
    }));

    // Additional insights
    const jobsByState = {
      NEW: allJobs.filter((job) => job.state === JobState.NEW).length,
      ANALYZING: allJobs.filter((job) => job.state === JobState.ANALYZING)
        .length,
      PROPOSING: allJobs.filter((job) => job.state === JobState.PROPOSING)
        .length,
      PROPOSED: proposedJobs,
      NEGOTIATING: allJobs.filter((job) => job.state === JobState.NEGOTIATING)
        .length,
      IN_PROGRESS: inProgressJobs,
      COMPLETED: completedJobs,
      DECLINED: allJobs.filter((job) => job.state === JobState.DECLINED).length,
      CANCELLED: allJobs.filter((job) => job.state === JobState.CANCELLED)
        .length,
      ERROR: allJobs.filter((job) => job.state === JobState.ERROR).length,
    };

    const response = {
      totalJobs,
      proposedJobs,
      completedJobs,
      inProgressJobs,
      totalProposedBudget,
      recentJobs,
      jobsByState,
      insights: {
        proposalRate:
          totalJobs > 0 ? Math.round((proposedJobs / totalJobs) * 100) : 0,
        completionRate:
          proposedJobs > 0
            ? Math.round((completedJobs / proposedJobs) * 100)
            : 0,
        averageProposalAmount:
          proposedJobs > 0 ? Math.round(totalProposedBudget / proposedJobs) : 0,
      },
    };

    console.log(`📊 Dashboard stats for user ${userId}:`, {
      totalJobs,
      proposedJobs,
      completedJobs,
      totalProposedBudget,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
