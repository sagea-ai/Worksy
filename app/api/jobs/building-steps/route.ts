import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { JobState } from "@prisma/client";

interface BuildingStepsRequest {
  title: string;
  description: string;
  skills: string[];
  price: number;
  currency: string;
  feedback?: string;
  jobId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      title,
      description,
      skills,
      price,
      currency,
      feedback,
      jobId,
    }: BuildingStepsRequest = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const crewUrl = "https://crew.jarvis.datagraph.in/build-plan";

    console.log("🔨 Generating technical building steps with Crew AI for:", title);

    const response = await fetch(crewUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        description,
        skills,
        price,
        currency,
        feedback: feedback || "",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Crew AI build plan failed:", errorText);
      return NextResponse.json(
        { error: `Failed to get build plan from AI: ${response.statusText}` },
        { status: response.status }
      );
    }

    const buildingPlan = await response.json();
    console.log("✅ Crew AI build plan completed");

    if (jobId) {
      try {
        const user = await prisma.user.findUnique({
          where: { clerkId: userId },
        });

        if (user) {
          let job = await prisma.job.findFirst({
            where: {
              id: jobId,
              userId: user.id,
            },
          });

          if (!job) {
            job = await prisma.job.findFirst({
              where: {
                externalId: jobId,
                userId: user.id,
              },
            });
          }

          if (job) {
            const updateData: any = {
              buildingPlan: {
                ...buildingPlan,
                status: "completed",
                completedAt: new Date().toISOString(),
                generatedAt: new Date().toISOString(),
              } as any,
            };

            if (job.state !== JobState.PROPOSING) {
              updateData.state = JobState.PROPOSING;
            }

            await prisma.job.update({
              where: { id: job.id },
              data: updateData,
            });
            console.log("✅ Updated job record with building plan");
          } else {
            console.log(
              "ℹ️ Job not found in database, building plan completed without DB update"
            );
          }
        }
      } catch (dbError) {
        console.error("❌ Failed to update job record:", dbError);
      }
    }

    return NextResponse.json({
      buildingPlan,
      message: "Technical building steps generated successfully",
    });
  } catch (error) {
    console.error("❌ Error generating building steps:", error);
    return NextResponse.json(
      {
        error: "Failed to generate building steps. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}