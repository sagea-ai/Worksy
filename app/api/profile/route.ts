import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { ClerkService } from "@/lib/clerk-utils";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { profile: profileData } = data;

    // Get or create user
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: true,
      },
    });

    if (!user) {
      const userProfile = await ClerkService.getUserProfile(userId);

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: userProfile.email,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          imageUrl: userProfile.imageUrl,
          onboardingCompleted: false, // New users should complete onboarding first
        },
        include: {
          profile: true,
        },
      });
    }

    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {
        ...profileData,
      },
      create: {
        userId: user.id,
        ...profileData,
      },
    });

    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
