import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { ClerkService } from "@/lib/clerk-utils";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await ClerkService.getUserProfile(userId);

    if (!userProfile.email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    const data = await request.json();
    const {
      userType,
      // Student fields
      selectedSkills,
      experienceLevel,
      preferredPlatforms,
      hourlyRateMin,
      hourlyRateMax,
      availability,
      // Hirer fields
      companyName,
      companyDescription,
      companySize,
      industry,
      hiringNeeds,
      typicalBudgetMin,
      typicalBudgetMax,
      preferredRemote,
      typicalProjectDuration,
      source, // 'manual' or 'freelancer_oauth'
      freelancerProfile,
      accessToken,
    } = data;

    console.log(
      `📝 Processing onboarding data from source: ${source || "manual"}, userType: ${userType}`
    );

    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: userProfile.email,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          imageUrl: userProfile.imageUrl,
          userType: userType || undefined,
          onboardingCompleted: true,
        },
      });
    } else {
      user = await prisma.user.update({
        where: { clerkId: userId },
        data: { 
          onboardingCompleted: true,
          userType: userType || undefined,
        },
      });
    }

    // Build profile data based on user type
    let profileData: any = {};

    if (userType === "STUDENT") {
      profileData = {
        selectedSkills: selectedSkills || [],
        experienceLevel: experienceLevel || undefined,
        preferredPlatforms: preferredPlatforms || [],
        hourlyRateMin: hourlyRateMin || undefined,
        hourlyRateMax: hourlyRateMax || undefined,
        availability: availability || undefined,
      };

      if (source === "freelancer_oauth" && freelancerProfile) {
        console.log("🔗 Enhancing profile with Freelancer data");
        profileData = {
          ...profileData,
          bio: freelancerProfile.profileDescription,
          location:
            freelancerProfile.location?.city &&
            freelancerProfile.location?.country
              ? `${freelancerProfile.location.city}, ${freelancerProfile.location.country}`
              : undefined,
        };
      }
    } else if (userType === "HIRER") {
      profileData = {
        companyName: companyName || undefined,
        companyDescription: companyDescription || undefined,
        companySize: companySize || undefined,
        industry: industry || undefined,
        hiringNeeds: hiringNeeds || [],
        typicalBudgetMin: typicalBudgetMin || undefined,
        typicalBudgetMax: typicalBudgetMax || undefined,
        preferredRemote: preferredRemote !== undefined ? preferredRemote : undefined,
        typicalProjectDuration: typicalProjectDuration || undefined,
      };
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: {
        userId: user.id,
        ...profileData,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        source === "freelancer_oauth"
          ? "Freelancer account connected successfully"
          : "Onboarding completed successfully",
      source: source || "manual",
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    );
  }
}
