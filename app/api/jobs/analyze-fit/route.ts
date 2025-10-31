import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { analyzeJobFit, JobFitRequest } from '@/lib/services/jobs/job-fit-analyzer';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Fetch user and profile
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.profile) {
      return NextResponse.json(
        { error: 'User profile not found. Please complete your profile first.' },
        { status: 400 }
      );
    }

    // Fetch job details
    const job = await prisma.job.findFirst({
      where: {
        OR: [
          { id: jobId },
          { externalId: jobId.toString(), userId: user.id },
        ],
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Prepare job fit request
    const jobFitRequest: JobFitRequest = {
      userProfile: {
        skills: user.profile.selectedSkills || [],
        experienceLevel: user.profile.experienceLevel || undefined,
        hourlyRateMin: user.profile.hourlyRateMin || undefined,
        hourlyRateMax: user.profile.hourlyRateMax || undefined,
        bio: user.profile.bio || undefined,
        workDescription: user.profile.workDescription || undefined,
      },
      jobDetails: {
        title: job.title,
        description: job.description,
        requirements: job.skills || [],
        skills: job.skills || [],
        budget: job.budget || undefined,
        currency: job.currency || 'USD',
        jobType: undefined,
      },
    };

    // Analyze job fit
    const fitAnalysis = await analyzeJobFit(jobFitRequest);

    // Store or update job decision with fit analysis
    await prisma.jobDecision.upsert({
      where: {
        jobId_userId: {
          jobId: job.id,
          userId: user.id,
        },
      },
      create: {
        jobId: job.id,
        userId: user.id,
        decision: 'PENDING',
        fitScore: fitAnalysis.fitScore,
        fitAnalysis: fitAnalysis as any,
      },
      update: {
        fitScore: fitAnalysis.fitScore,
        fitAnalysis: fitAnalysis as any,
      },
    });

    return NextResponse.json({
      success: true,
      analysis: fitAnalysis,
    });
  } catch (error) {
    console.error('Error analyzing job fit:', error);
    return NextResponse.json(
      { error: 'Failed to analyze job fit' },
      { status: 500 }
    );
  }
}

