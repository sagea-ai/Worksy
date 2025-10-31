import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JobState } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { teamId } = await params;

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          where: { userId: user.id },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const isCreator = team.createdBy === user.id;
    const isMember = team.members.length > 0;

    if (!isCreator && !isMember) {
      return NextResponse.json(
        { error: "You must be a team creator or member to assign jobs" },
        { status: 403 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        teamAssignments: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.userId !== user.id) {
      return NextResponse.json(
        { error: "You can only assign your own jobs to teams" },
        { status: 403 }
      );
    }

    const existingAssignment = job.teamAssignments.find(
      (assignment) => assignment.teamId === teamId
    );
    if (existingAssignment) {
      return NextResponse.json(
        { error: "Team is already assigned to this job" },
        { status: 400 }
      );
    }

    await prisma.jobTeam.create({
      data: {
        jobId: jobId,
        teamId: teamId,
      },
    });

    let updatedJob = job;
    if (job.teamAssignments.length === 0) {
      updatedJob = await prisma.job.update({
        where: { id: jobId },
        data: {
          state: JobState.TEAM_SUMMONED,
          teamSummoned: true,
          teamSummonedAt: new Date(),
        },
        include: {
          teamAssignments: true,
        },
      });

      await prisma.jobStateHistory.create({
        data: {
          jobId: jobId,
          fromState: job.state,
          toState: JobState.TEAM_SUMMONED,
          reason: "Teams assigned to job",
          notes: `First team assigned: ${team.name}`,
          changedBy: user.id,
        },
      });
    }

    console.log(`✅ Team ${team.name} assigned to job ${job.title}`);

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: `Team "${team.name}" assigned to job successfully`,
    });
  } catch (error) {
    console.error("❌ Error assigning job to team:", error);
    return NextResponse.json(
      { error: "Failed to assign job to team" },
      { status: 500 }
    );
  }
}
