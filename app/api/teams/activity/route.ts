import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ActivityType } from "@prisma/client";

// POST /api/teams/activity - Log team activity
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId, activityType, description, metadata } =
      await request.json();

    if (!teamId || !activityType || !description) {
      return NextResponse.json(
        { error: "Team ID, activity type, and description are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
        { error: "Access denied. You must be a team member or creator." },
        { status: 403 }
      );
    }

    const activity = await prisma.teamActivity.create({
      data: {
        teamId,
        userId: user.id,
        activityType: activityType as ActivityType,
        description,
        metadata: metadata || null,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    console.log(`✅ Team activity logged: ${activityType} for team ${teamId}`);

    return NextResponse.json({
      success: true,
      activity,
      message: "Activity logged successfully",
    });
  } catch (error) {
    console.error("❌ Error logging team activity:", error);
    return NextResponse.json(
      { error: "Failed to log team activity" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId");

    if (!teamId) {
      return NextResponse.json(
        {
          error:
            "Team ID is required. Use 'all' to get activities from all teams.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (teamId === "all") {
      const userTeams = await prisma.team.findMany({
        where: {
          OR: [
            { createdBy: user.id },
            { members: { some: { userId: user.id } } },
          ],
        },
        select: { id: true },
      });

      const teamIds = userTeams.map((team) => team.id);

      const activities = await prisma.teamActivity.findMany({
        where: { teamId: { in: teamIds } },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100, 
      });

      return NextResponse.json({
        success: true,
        activities,
        teamName: "All Teams",
      });
    }

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
        { error: "Access denied. You must be a team member or creator." },
        { status: 403 }
      );
    }

    const activities = await prisma.teamActivity.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({
      success: true,
      activities,
      teamName: team.name,
    });
  } catch (error) {
    console.error("❌ Error fetching team activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch team activities" },
      { status: 500 }
    );
  }
}
