import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { PositionType, JobPostingStatus, ExperienceLevel } from "@prisma/client";

// GET - List job postings for the hirer
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {
      postedBy: user.id,
    };

    if (status && ["DRAFT", "PUBLISHED", "CLOSED", "EXPIRED"].includes(status)) {
      where.status = status;
    }

    const jobPostings = await prisma.jobPosting.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ jobPostings });
  } catch (error) {
    console.error("Error fetching job postings:", error);
    return NextResponse.json(
      { error: "Failed to fetch job postings" },
      { status: 500 }
    );
  }
}

// POST - Create a new job posting
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
    const {
      title,
      description,
      positionType,
      requiredSkills,
      preferredExperience,
      budgetMin,
      budgetMax,
      currency,
      isNegotiable,
      location,
      isRemote,
      duration,
      status,
      expiresAt,
    } = body;

    if (!title || !description || !positionType) {
      return NextResponse.json(
        { error: "Title, description, and position type are required" },
        { status: 400 }
      );
    }

    const jobPosting = await prisma.jobPosting.create({
      data: {
        title,
        description,
        positionType: positionType as PositionType,
        requiredSkills: requiredSkills || [],
        preferredExperience: preferredExperience
          ? (preferredExperience as ExperienceLevel)
          : null,
        budgetMin: budgetMin || null,
        budgetMax: budgetMax || null,
        currency: currency || "USD",
        isNegotiable: isNegotiable !== undefined ? isNegotiable : true,
        location: location || null,
        isRemote: isRemote !== undefined ? isRemote : true,
        duration: duration || null,
        status: status || "DRAFT",
        postedBy: user.id,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json({
      success: true,
      jobPosting,
    });
  } catch (error) {
    console.error("Error creating job posting:", error);
    return NextResponse.json(
      { error: "Failed to create job posting" },
      { status: 500 }
    );
  }
}

