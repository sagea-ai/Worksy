import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/teams/[teamId]/members - Invite member to team
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;

    const { emails } = await request.json();

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: "At least one valid email is required" },
        { status: 400 }
      );
    }

    const invalidEmails = emails.filter(
      (email) => !email || !email.includes("@")
    );
    if (invalidEmails.length > 0) {
      return NextResponse.json(
        { error: "All emails must be valid" },
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
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (team.createdBy !== user.id) {
      return NextResponse.json(
        { error: "Only team creators can invite members" },
        { status: 403 }
      );
    }

    const userEmails = emails.map((email) => email.toLowerCase());
    if (userEmails.includes(user.email.toLowerCase())) {
      return NextResponse.json(
        { error: "You cannot invite yourself" },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (const email of emails) {
      const emailLower = email.toLowerCase();

      try {
        const targetUser = await prisma.user.findUnique({
          where: { email: emailLower },
        });

        if (targetUser) {
          const existingMember = await prisma.teamMember.findUnique({
            where: {
              teamId_userId: {
                teamId: teamId,
                userId: targetUser.id,
              },
            },
          });

          if (existingMember) {
            errors.push(`${email} is already a team member`);
            continue;
          }
        }

        const existingInvitation = await prisma.teamInvitation.findUnique({
          where: {
            teamId_invitedUserEmail: {
              teamId: teamId,
              invitedUserEmail: emailLower,
            },
          },
        });

        if (existingInvitation && existingInvitation.status === "PENDING") {
          errors.push(`Invitation already sent to ${email}`);
          continue;
        }

        const invitation = await prisma.teamInvitation.create({
          data: {
            teamId: teamId,
            invitedBy: user.id,
            invitedUserEmail: emailLower,
            invitedUserId: targetUser?.id || null,
            status: "PENDING",
          },
        });

        results.push({
          email,
          success: true,
          invitation,
        });

        console.log(
          `✅ Team invitation sent to ${email} for team ${team.name}`
        );
      } catch (error) {
        errors.push(
          `Failed to invite ${email}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    return NextResponse.json({
      success: results.length > 0,
      results,
      errors: errors.length > 0 ? errors : undefined,
      message: `${results.length} invitation(s) sent successfully${
        errors.length > 0 ? `, ${errors.length} failed` : ""
      }`,
    });
  } catch (error) {
    console.error("❌ Error inviting team member:", error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[teamId]/members - Remove member from team
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;

    const { searchParams } = new URL(request.url);
    const memberUserId = searchParams.get("userId");

    if (!memberUserId) {
      return NextResponse.json(
        { error: "Member user ID is required" },
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
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const isAdmin = team.createdBy === user.id;
    const isRemovingSelf = memberUserId === user.id;

    if (!isAdmin && !isRemovingSelf) {
      return NextResponse.json(
        { error: "Only team creators can remove members" },
        { status: 403 }
      );
    }

    if (memberUserId === team.createdBy) {
      return NextResponse.json(
        { error: "Team creator cannot be removed from the team" },
        { status: 400 }
      );
    }

    const deletedMember = await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId: teamId,
          userId: memberUserId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: isRemovingSelf
        ? "You have left the team"
        : "Member removed successfully",
    });
  } catch (error) {
    console.error("❌ Error removing team member:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}

// POST /api/teams/[teamId]/members/leave - Leave team (self-removal)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { teamId } = await params;

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (team.createdBy === user.id) {
      return NextResponse.json(
        {
          error:
            "Team creators cannot leave their own team. Delete the team instead.",
        },
        { status: 400 }
      );
    }

    const membership = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: teamId,
          userId: user.id,
        },
      },
    });

    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this team" },
        { status: 400 }
      );
    }

    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId: teamId,
          userId: user.id,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `You have left the team "${team.name}"`,
    });
  } catch (error) {
    console.error("❌ Error leaving team:", error);
    return NextResponse.json(
      { error: "Failed to leave team" },
      { status: 500 }
    );
  }
}
