import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/teams - Get user's teams (created + member of)
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const createdTeams = await prisma.team.findMany({
      where: { createdBy: user.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            assignedJobs: true,
            jobAssignments: true,
          },
        },
      },
    });

    const memberTeams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: user.id,
          },
        },
        createdBy: { not: user.id },
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            assignedJobs: true,
            jobAssignments: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      createdTeams,
      memberTeams,
      totalTeams: createdTeams.length + memberTeams.length,
    });
  } catch (error) {
    console.error("❌ Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description } = await request.json();

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Team name is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        createdBy: user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId: user.id,
      },
    });

    console.log(`✅ Team created: ${team.name} by ${user.email}`);

    return NextResponse.json({
      success: true,
      team,
      message: "Team created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating team:", error);
    return NextResponse.json(
      { error: "Failed to create team" },
      { status: 500 }
    );
  }
}
