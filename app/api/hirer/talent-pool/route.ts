import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the hirer user and their hiring needs
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        profile: true,
      },
    });

    if (!user || user.userType !== "HIRER") {
      return NextResponse.json(
        { error: "User is not a hirer" },
        { status: 403 }
      );
    }

    // If no profile, return empty results instead of error
    if (!user.profile) {
      return NextResponse.json({
        talents: [],
        total: 0,
        message: "Profile not found. Complete your onboarding to see matching talents.",
      });
    }

    const hiringNeeds = user.profile.hiringNeeds || [];
    
    if (hiringNeeds.length === 0) {
      return NextResponse.json({
        talents: [],
        total: 0,
        message: "No hiring needs configured. Update your profile to see matching talents.",
      });
    }

    // Find students (STUDENT userType) whose skills match the hirer's hiring needs
    const matchingTalents = await prisma.user.findMany({
      where: {
        userType: "STUDENT",
        onboardingCompleted: true,
        profile: {
          isNot: null,
          selectedSkills: {
            hasSome: hiringNeeds, // At least one skill matches
          },
        },
      },
      include: {
        profile: true,
      },
      take: 50, // Limit results
      orderBy: {
        createdAt: "desc",
      },
    });

    // Score and rank talents based on skill overlap
    const scoredTalents = matchingTalents.map((talent) => {
      const talentSkills = talent.profile?.selectedSkills || [];
      const matchingSkills = talentSkills.filter((skill) =>
        hiringNeeds.includes(skill)
      );
      const matchScore = matchingSkills.length / hiringNeeds.length;
      const skillOverlap = (matchingSkills.length / talentSkills.length) * 100;

      return {
        id: talent.id,
        firstName: talent.firstName,
        lastName: talent.lastName,
        email: talent.email,
        imageUrl: talent.imageUrl,
        skills: talentSkills,
        matchingSkills: matchingSkills,
        matchScore: Math.round(matchScore * 100),
        skillOverlap: Math.round(skillOverlap),
        experienceLevel: talent.profile?.experienceLevel,
        hourlyRateMin: talent.profile?.hourlyRateMin,
        hourlyRateMax: talent.profile?.hourlyRateMax,
        availability: talent.profile?.availability,
        bio: talent.profile?.bio,
        location: talent.profile?.location,
      };
    });

    // Sort by match score (descending)
    scoredTalents.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      talents: scoredTalents,
      total: scoredTalents.length,
      hiringNeeds: hiringNeeds,
    });
  } catch (error) {
    console.error("Error fetching talent pool:", error);
    return NextResponse.json(
      { error: "Failed to fetch talent pool" },
      { status: 500 }
    );
  }
}

