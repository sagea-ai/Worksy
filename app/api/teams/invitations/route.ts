import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const invitations = await prisma.teamInvitation.findMany({
      where: {
        OR: [{ invitedUserId: user.id }, { invitedUserEmail: user.email }],
        status: "PENDING",
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        inviter: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      invitations,
      count: invitations.length,
    });
  } catch (error) {
    console.error("❌ Error fetching team invitations:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { invitationId, action } = await request.json();

    if (!invitationId || !action || !["accept", "decline"].includes(action)) {
      return NextResponse.json(
        {
          error: "Valid invitation ID and action (accept/decline) are required",
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

    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: invitationId },
      include: {
        team: true,
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    if (
      invitation.invitedUserId !== user.id &&
      invitation.invitedUserEmail !== user.email
    ) {
      return NextResponse.json(
        { error: "This invitation is not for you" },
        { status: 403 }
      );
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json(
        { error: "This invitation has already been responded to" },
        { status: 400 }
      );
    }

    if (action === "accept") {
      const existingMember = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: invitation.teamId,
            userId: user.id,
          },
        },
      });

      if (existingMember) {
        await prisma.teamInvitation.update({
          where: { id: invitationId },
          data: {
            status: "ACCEPTED",
            respondedAt: new Date(),
            invitedUserId: user.id,
          },
        });

        return NextResponse.json({
          success: true,
          message: "You are already a member of this team",
        });
      }

      await prisma.$transaction(async (tx) => {
        await tx.teamMember.create({
          data: {
            teamId: invitation.teamId,
            userId: user.id,
          },
        });

        await tx.teamInvitation.update({
          where: { id: invitationId },
          data: {
            status: "ACCEPTED",
            respondedAt: new Date(),
            invitedUserId: user.id,
          },
        });
      });

      console.log(`✅ User ${user.email} joined team ${invitation.team.name}`);

      return NextResponse.json({
        success: true,
        message: `You have joined the team "${invitation.team.name}"`,
      });
    } else {
      await prisma.teamInvitation.update({
        where: { id: invitationId },
        data: {
          status: "DECLINED",
          respondedAt: new Date(),
          invitedUserId: user.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Invitation declined",
      });
    }
  } catch (error) {
    console.error("❌ Error responding to team invitation:", error);
    return NextResponse.json(
      { error: "Failed to respond to invitation" },
      { status: 500 }
    );
  }
}
