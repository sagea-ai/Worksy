import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { JobState, JobPlatform } from "@prisma/client";

// POST /api/jobs/manage - Create or update job state
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      action,
      jobData,
      newState,
      reason,
      notes,
      proposalData,
      teamSummoned,
      chatHistory,
    } = body;

    switch (action) {
      case "select_job":
        return await handleJobSelection(userId, jobData);

      case "update_state":
        return await handleStateUpdate(
          userId,
          jobData,
          newState,
          reason,
          notes
        );

      case "submit_proposal":
        return await handleProposalSubmission(userId, jobData, proposalData);

      case "toggle_team_summon":
        return await handleTeamSummon(userId, jobData, teamSummoned);

      case "store_chat_history":
        return await handleChatHistoryStorage(userId, jobData, chatHistory);

      case "assign_team_to_job":
        return await handleTeamAssignmentToJob(userId, jobData, body.teamId);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("❌ Error in job management:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle job selection (store job in DB with ANALYZING state)
async function handleJobSelection(userId: string, jobData: any) {
  try {
    console.log("🔍 handleJobSelection called with:", { userId, jobData });
    console.log("🔧 Prisma client status:", !!prisma);

    // Find the internal user ID from Clerk user ID
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      console.error("❌ User not found for clerkId:", userId);
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    console.log("✅ Found user:", user.id);

    const platformEnum = mapPlatform(jobData.platform);
    console.log("🔧 Platform mapping:", jobData.platform, "->", platformEnum);

    // Check if job already exists for this user
    const existingJob = await prisma.job.findFirst({
      where: {
        platform: platformEnum,
        externalId: jobData.id.toString(),
        userId: user.id,
      },
    });

    if (existingJob) {
      // Job already exists for this user - just return it without changing state
      console.log(
        "✅ Job already exists for this user, returning existing job:",
        existingJob.id
      );

      return NextResponse.json({
        success: true,
        job: existingJob,
        message: "Job already exists for this user",
      });
    }

    // Check if job exists for other users (different approach needed)
    const existingJobForOtherUser = await prisma.job.findFirst({
      where: {
        platform: platformEnum,
        externalId: jobData.id.toString(),
        userId: { not: user.id }, // Different user
      },
    });

    let finalExternalId = jobData.id.toString();

    // If job exists for other users, create user-specific external ID
    if (existingJobForOtherUser) {
      finalExternalId = `${jobData.id}-${user.id}`;
      console.log(
        "ℹ️ Job exists for other user, using user-specific external ID:",
        finalExternalId
      );

      // Check if user-specific version already exists (double-check)
      const existingUserSpecificJob = await prisma.job.findFirst({
        where: {
          platform: platformEnum,
          externalId: finalExternalId,
          userId: user.id,
        },
      });

      if (existingUserSpecificJob) {
        console.log(
          "✅ User-specific job already exists, returning existing job:",
          existingUserSpecificJob.id
        );
        return NextResponse.json({
          success: true,
          job: existingUserSpecificJob,
          message: "User-specific job already exists",
        });
      }
    }

    const newJob = await prisma.job.create({
      data: {
        externalId: finalExternalId,
        platform: platformEnum,
        title: jobData.title,
        description: jobData.description,
        budget: jobData.price,
        currency: jobData.currency || "USD",
        skills: jobData.skills || [],
        location: jobData.location || null,
        isRemote: true,
        isUrgent: jobData.isUrgent || false,
        verified: jobData.verified || false,
        clientRating: null,
        state: JobState.ANALYZING,
        userId: user.id,
        aiAnalysis: {
          status: "analyzing",
          startedAt: new Date().toISOString(),
          initialMessage:
            "🧠 I'm analyzing this project to understand the market, technical requirements, and business opportunities. This analysis will help us create a winning proposal!",
          project: {
            title: jobData.title,
            budget: `${jobData.currency || "USD"} ${jobData.price}`,
            skills: jobData.skills || [],
            description:
              jobData.description.substring(0, 200) +
              (jobData.description.length > 200 ? "..." : ""),
          },
        },
      },
    });

    console.log("✅ Created new job:", newJob.id);

    await createStateHistory(
      newJob.id,
      null,
      JobState.ANALYZING,
      "Job selected for analysis",
      user.id
    );

    return NextResponse.json({
      success: true,
      job: newJob,
      message: "Job created and set to analyzing state",
    });
  } catch (error) {
    console.error("❌ Error handling job selection:", error);
    throw error;
  }
}

// Helper function to get internal user ID from Clerk ID
async function getInternalUserId(clerkId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  // If user doesn't exist, we might need to create it
  if (!user) {
    console.log(
      "⚠️ User not found, this might be a first-time user. ClerkId:",
      clerkId
    );
    // For now, return null and let the calling function handle it
    // In a production system, you might want to create the user here
    // or redirect to onboarding
  }

  return user?.id || null;
}

// Helper function to find job by external ID
async function findJobByExternalId(
  externalId: string,
  platform: string,
  userId: string
) {
  const platformEnum = mapPlatform(platform);

  // First try to find with the original external ID
  let job = await prisma.job.findFirst({
    where: {
      externalId: externalId,
      platform: platformEnum,
      userId: userId,
    },
  });

  // If not found, try with the user-specific external ID format
  if (!job) {
    const userSpecificExternalId = `${externalId}-${userId}`;
    job = await prisma.job.findFirst({
      where: {
        externalId: userSpecificExternalId,
        platform: platformEnum,
        userId: userId,
      },
    });
  }

  return job;
}

// Handle state updates
async function handleStateUpdate(
  clerkUserId: string,
  jobData: any,
  newState: JobState,
  reason?: string,
  notes?: string
) {
  try {
    const userId = await getInternalUserId(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const job = await findJobByExternalId(
      jobData.id.toString(),
      jobData.platform || "Freelancer",
      userId
    );

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const updatedJob = await prisma.job.update({
      where: { id: job.id },
      data: {
        state: newState,
        updatedAt: new Date(),
      },
    });

    // Record state change
    await createStateHistory(
      job.id,
      job.state,
      newState,
      reason,
      userId,
      notes
    );

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: `Job state updated to ${newState}`,
    });
  } catch (error) {
    console.error("❌ Error updating job state:", error);
    throw error;
  }
}

// Handle proposal submission
async function handleProposalSubmission(
  clerkUserId: string,
  jobData: any,
  proposalData: any
) {
  try {
    console.log("🔍 Proposal submission debug:", {
      clerkUserId,
      jobData,
      proposalData: proposalData ? "present" : "missing",
    });

    const userId = await getInternalUserId(clerkUserId);
    if (!userId) {
      console.log("❌ User not found for clerkUserId:", clerkUserId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("✅ Found internal userId:", userId);

    // First, let's try to find the job with better debugging
    const externalId = jobData.id.toString();
    const platform = jobData.platform || "Freelancer";

    console.log("🔍 Looking for job with:", {
      externalId,
      platform,
      userId,
    });

    const job = await findJobByExternalId(externalId, platform, userId);

    if (!job) {
      console.log(
        "❌ Job not found. Let's check what jobs exist for this user:"
      );

      // Debug: List all jobs for this user
      const userJobs = await prisma.job.findMany({
        where: { userId },
        select: {
          id: true,
          externalId: true,
          platform: true,
          title: true,
          state: true,
        },
      });

      console.log("📋 User's jobs:", userJobs);

      return NextResponse.json(
        {
          error: "Job not found",
          debug: {
            searchedFor: { externalId, platform, userId },
            userJobs: userJobs,
          },
        },
        { status: 404 }
      );
    }

    console.log("✅ Found job:", {
      id: job.id,
      externalId: job.externalId,
      platform: job.platform,
      state: job.state,
    });

    const updatedJob = await prisma.job.update({
      where: { id: job.id },
      data: {
        state: JobState.PROPOSED,
        proposalSubmitted: true,
        proposalText: proposalData.text,
        proposedBudget: proposalData.budget,
        proposedDeadline: proposalData.deadline
          ? new Date(proposalData.deadline)
          : null,
        buildingPlan: proposalData.buildingPlan,
        updatedAt: new Date(),
      },
    });

    // Record state change
    await createStateHistory(
      job.id,
      job.state,
      JobState.PROPOSED,
      "Proposal submitted",
      userId,
      "Proposal submitted with AI-generated building plan"
    );

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: "Proposal submitted successfully",
      followUp: {
        type: "team_assignment_question",
        message:
          "🎉 Great! Your proposal has been submitted successfully. Would you like to assemble your team for this project?",
        options: [
          {
            action: "assign_team",
            label: "Yes, assign my team",
            description: "Select a team to work on this project together",
          },
          {
            action: "work_solo",
            label: "No, I'll work solo",
            description: "Continue working on this project individually",
          },
        ],
      },
    });
  } catch (error) {
    console.error("❌ Error submitting proposal:", error);
    return NextResponse.json(
      {
        error: "Failed to submit proposal. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function handleTeamSummon(
  clerkUserId: string,
  jobData: any,
  teamSummoned: boolean
) {
  try {
    const userId = await getInternalUserId(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const job = await findJobByExternalId(
      jobData.id.toString(),
      jobData.platform || "Freelancer",
      userId
    );

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const updateData: any = {
      teamSummoned: teamSummoned,
      updatedAt: new Date(),
    };

    if (teamSummoned) {
      updateData.teamSummonedAt = new Date();
      updateData.state = JobState.TEAM_SUMMONED;
    }

    const updatedJob = await prisma.job.update({
      where: { id: job.id },
      data: updateData,
    });

    if (teamSummoned) {
      await createStateHistory(
        job.id,
        job.state,
        JobState.TEAM_SUMMONED,
        "Team summoned for project",
        userId
      );
    }

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: teamSummoned
        ? "Team summoned successfully"
        : "Team summon removed",
    });
  } catch (error) {
    console.error("❌ Error handling team summon:", error);
    throw error;
  }
}

async function handleTeamAssignmentToJob(
  clerkUserId: string,
  jobData: any,
  teamId: string
) {
  try {
    if (!teamId) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 }
      );
    }

    const userId = await getInternalUserId(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (team.createdBy !== userId) {
      return NextResponse.json(
        { error: "Only team creators can assign jobs to teams" },
        { status: 403 }
      );
    }

    const job = await findJobByExternalId(
      jobData.id.toString(),
      jobData.platform || "Freelancer",
      userId
    );

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.state !== JobState.PROPOSED) {
      return NextResponse.json(
        { error: "Only proposed jobs can be assigned to teams" },
        { status: 400 }
      );
    }

    if (job.assignedTeamId) {
      return NextResponse.json(
        { error: "Job is already assigned to a team" },
        { status: 400 }
      );
    }

    const updatedJob = await prisma.job.update({
      where: { id: job.id },
      data: {
        assignedTeamId: teamId,
        state: JobState.TEAM_SUMMONED,
        teamSummoned: true,
        teamSummonedAt: new Date(),
      },
    });

    await createStateHistory(
      job.id,
      job.state,
      JobState.TEAM_SUMMONED,
      "Team assigned to job",
      userId,
      `Job assigned to team: ${team.name}`
    );

    console.log(`✅ Job ${job.title} assigned to team ${team.name}`);

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: `Job assigned to team "${team.name}" successfully`,
    });
  } catch (error) {
    console.error("❌ Error assigning job to team:", error);
    return NextResponse.json(
      { error: "Failed to assign job to team" },
      { status: 500 }
    );
  }
}

async function handleChatHistoryStorage(
  clerkUserId: string,
  jobData: any,
  chatHistory: any[]
) {
  try {
    const userId = await getInternalUserId(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const job = await findJobByExternalId(
      jobData.id.toString(),
      jobData.platform || "Freelancer",
      userId
    );

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Store entire chat history as JSON
    const chatHistoryData = {
      messages: chatHistory,
      lastUpdated: new Date().toISOString(),
      messageCount: chatHistory.length,
    };

    const updatedJob = await prisma.job.update({
      where: { id: job.id },
      data: {
        chatHistory: chatHistoryData,
        updatedAt: new Date(),
      },
    });

    console.log(
      `✅ Chat history stored with ${chatHistory.length} messages for job ${job.id}`
    );

    return NextResponse.json({
      success: true,
      message: "Chat history stored successfully",
      messageCount: chatHistory.length,
    });
  } catch (error) {
    console.error("❌ Error storing chat history:", error);
    throw error;
  }
}

// Helper function to create state history
async function createStateHistory(
  jobId: string,
  fromState: JobState | null,
  toState: JobState,
  reason?: string,
  changedBy?: string,
  notes?: string
) {
  await prisma.jobStateHistory.create({
    data: {
      jobId,
      fromState,
      toState,
      reason,
      notes,
      changedBy,
    },
  });
}

// Helper function to map platform names
function mapPlatform(platformName: string): JobPlatform {
  const platformMap: { [key: string]: JobPlatform } = {
    Freelancer: JobPlatform.FREELANCER,
    Upwork: JobPlatform.UPWORK,
    Fiverr: JobPlatform.FIVERR,
    Toptal: JobPlatform.TOPTAL,
    Guru: JobPlatform.GURU,
    PeoplePerHour: JobPlatform.PEOPLEPERHOUR,
  };

  return platformMap[platformName] || JobPlatform.OTHER;
}

// GET /api/jobs/manage - Get user's managed jobs or a specific job
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = await getInternalUserId(clerkUserId);
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");
    const platform = searchParams.get("platform");
    const jobId = searchParams.get("jobId");
    const externalId = searchParams.get("externalId");
    const platformName = searchParams.get("platform");

    // If requesting a specific job by external ID
    if (externalId && platformName) {
      const job = await findJobByExternalId(externalId, platformName, userId);

      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        job: job,
      });
    }

    // If requesting a specific job by internal ID
    if (jobId) {
      const job = await prisma.job.findFirst({
        where: { id: jobId, userId },
        include: {
          stateHistory: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        job: job,
      });
    }

    // Default: Get all user's managed jobs
    const whereClause: any = { userId };

    if (state) {
      whereClause.state = state as JobState;
    }

    if (platform) {
      whereClause.platform = platform as JobPlatform;
    }

    const jobs = await prisma.job.findMany({
      where: whereClause,
      include: {
        stateHistory: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      jobs,
      count: jobs.length,
    });
  } catch (error) {
    console.error("❌ Error fetching managed jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
