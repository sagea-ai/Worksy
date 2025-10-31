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

    // Fetch only jobs with active proposals (PROPOSED state and proposalSubmitted = true)
    const activeProposals = await prisma.job.findMany({
      where: {
        userId: user.id,
        state: JobState.PROPOSED,
        proposalSubmitted: true,
        proposalText: {
          not: null,
        },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        externalId: true,
        title: true,
        proposalText: true,
        proposedBudget: true,
        proposedDeadline: true,
        platform: true,
        updatedAt: true,
        state: true,
        currency: true,
      },
    });

    // Format the proposals data
    const proposals = activeProposals.map((proposal) => ({
      id: proposal.id,
      externalId: proposal.externalId,
      title: proposal.title,
      proposalText: proposal.proposalText || "",
      proposedBudget: proposal.proposedBudget || 0,
      proposedDeadline: proposal.proposedDeadline?.toISOString() || null,
      platform: proposal.platform,
      updatedAt: proposal.updatedAt.toISOString(),
      state: proposal.state,
      currency: proposal.currency || "USD",
    }));

    // Calculate summary statistics
    const totalProposals = proposals.length;
    const totalValue = proposals.reduce((sum, p) => sum + p.proposedBudget, 0);
    const averageBid = totalProposals > 0 ? totalValue / totalProposals : 0;

    // Group by platform for insights
    const proposalsByPlatform = proposals.reduce((acc, proposal) => {
      acc[proposal.platform] = (acc[proposal.platform] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    console.log(`📝 Active proposals for user ${userId}:`, {
      totalProposals,
      totalValue,
      proposalsByPlatform,
    });

    return NextResponse.json({
      proposals,
      summary: {
        totalProposals,
        totalValue,
        averageBid,
        proposalsByPlatform,
      },
    });
  } catch (error) {
    console.error("❌ Error fetching active proposals:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 }
    );
  }
}
