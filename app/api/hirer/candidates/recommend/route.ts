import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user || user.userType !== "HIRER") {
      return NextResponse.json(
        { error: "User is not a hirer" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { requiredSkills, preferredExperience, positionType } = body;

    if (!requiredSkills || requiredSkills.length === 0) {
      return NextResponse.json(
        { error: "Required skills are needed to find candidates" },
        { status: 400 }
      );
    }

    // Find candidates with matching skills
    const candidates = await prisma.user.findMany({
      where: {
        userType: "STUDENT",
        onboardingCompleted: true,
        profile: {
          is: {
            selectedSkills: {
              hasSome: requiredSkills,
            },
          },
        },
      },
      include: {
        profile: true,
        jobs: {
          where: {
            state: {
              in: ["COMPLETED", "IN_PROGRESS"],
            },
          },
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      take: 20, // Get more candidates to rank
    });

    // Score candidates based on:
    // 1. Skill match overlap
    // 2. Experience level match
    // 3. Relevant completed projects
    const scoredCandidates = candidates.map((candidate) => {
      const candidateSkills = candidate.profile?.selectedSkills || [];
      const matchingSkills = candidateSkills.filter((skill) =>
        requiredSkills.includes(skill)
      );
      
      let score = 0;
      
      // Skill match score (0-50 points)
      const skillMatchRatio = matchingSkills.length / requiredSkills.length;
      score += skillMatchRatio * 50;
      
      // Experience match score (0-25 points)
      if (preferredExperience && candidate.profile?.experienceLevel === preferredExperience) {
        score += 25;
      } else if (preferredExperience && candidate.profile?.experienceLevel) {
        // Partial match based on experience levels
        const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];
        const preferredIndex = levels.indexOf(preferredExperience);
        const candidateIndex = levels.indexOf(candidate.profile.experienceLevel);
        if (candidateIndex >= preferredIndex - 1) {
          score += 15;
        }
      }
      
      // Relevant project score (0-25 points)
      const relevantProjects = candidate.jobs.filter((job) => {
        const jobSkills = job.skills || [];
        return jobSkills.some((skill) => requiredSkills.includes(skill));
      });
      if (relevantProjects.length > 0) {
        score += Math.min(relevantProjects.length * 5, 25);
      }

      return {
        id: candidate.id,
        firstName: candidate.firstName,
        lastName: candidate.lastName,
        email: candidate.email,
        imageUrl: candidate.imageUrl,
        skills: candidateSkills,
        matchingSkills: matchingSkills,
        experienceLevel: candidate.profile?.experienceLevel,
        hourlyRateMin: candidate.profile?.hourlyRateMin,
        hourlyRateMax: candidate.profile?.hourlyRateMax,
        availability: candidate.profile?.availability,
        bio: candidate.profile?.bio,
        location: candidate.profile?.location,
        relevantProjects: relevantProjects.map((job) => ({
          id: job.id,
          title: job.title,
          skills: job.skills,
          state: job.state,
        })),
        score: Math.round(score),
      };
    });

    // Sort by score (descending) and take top 3
    scoredCandidates.sort((a, b) => b.score - a.score);
    const topCandidates = scoredCandidates.slice(0, 3);

    return NextResponse.json({
      candidates: topCandidates,
      total: candidates.length,
    });
  } catch (error) {
    console.error("Error recommending candidates:", error);
    return NextResponse.json(
      { error: "Failed to recommend candidates" },
      { status: 500 }
    );
  }
}

