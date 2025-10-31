import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { JobState } from "@prisma/client";

interface JobAnalysisRequest {
  title: string;
  description: string;
  skills: string[];
  price: number;
  currency: string;
  jobId?: string;
  feedback?: string;
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
      jobId,
      feedback,
    }: JobAnalysisRequest = await request.json();

    const crewUrl = "https://crew.jarvis.datagraph.in/analyze";

    console.log("🧠 Analyzing job with Crew AI...");
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
      console.error("❌ Crew AI analysis failed:", errorText);
      return NextResponse.json(
        { error: `Failed to analyze job with AI: ${response.statusText}` },
        { status: response.status }
      );
    }

    const analysisData = await response.json();
    console.log("✅ Crew AI analysis completed");

    if (jobId) {
      try {
        let job = await prisma.job.findUnique({
          where: { id: jobId },
        });

        if (!job) {
          job = await prisma.job.findFirst({
            where: {
              externalId: jobId,
              userId: userId,
            },
          });
        }

        if (job) {
          const updateData: any = {
            aiAnalysis: {
              ...analysisData,
              status: "completed",
              completedAt: new Date().toISOString(),
              startedAt: new Date().toISOString(),
            } as any,
          };

          if (job.state !== JobState.PROPOSING) {
            updateData.state = JobState.PROPOSING;
          }

          await prisma.job.update({
            where: { id: job.id },
            data: updateData,
          });
          console.log("✅ Updated job record with analysis");
        } else {
          console.log(
            "ℹ️ Job not found in database, analysis completed without DB update"
          );
        }
      } catch (dbError) {
        console.error("❌ Failed to update job record:", dbError);
      }
    }

    return NextResponse.json({
      analysis: analysisData,
      success: true,
    });
  } catch (error) {
    console.error("💥 Error analyzing job with Crew AI:", error);
    return NextResponse.json(
      { error: "Failed to analyze job with AI" },
      { status: 500 }
    );
  }
}