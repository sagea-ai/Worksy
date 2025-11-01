import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ 
        error: "Not authenticated",
        userId: null 
      });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true },
    });

    return NextResponse.json({
      authenticated: true,
      userId: userId,
      userExists: !!user,
      userEmail: user?.email,
      profileExists: !!user?.profile,
      profile: {
        selectedSkills: user?.profile?.selectedSkills,
        hourlyRateMin: user?.profile?.hourlyRateMin,
        hourlyRateMax: user?.profile?.hourlyRateMax,
        experienceLevel: user?.profile?.experienceLevel,
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Debug endpoint error", 
      details: error 
    });
  }
}