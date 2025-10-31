import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { generatePitch, PitchRequest } from '@/lib/services/jobs/pitch-generator';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, employerPreferences } = body;

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

    // Fetch existing job decision to get fit analysis
    const jobDecision = await prisma.jobDecision.findUnique({
      where: {
        jobId_userId: {
          jobId: job.id,
          userId: user.id,
        },
      },
    });

    // Prepare pitch request
    const pitchRequest: PitchRequest = {
      userProfile: {
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        skills: user.profile.selectedSkills || [],
        experienceLevel: user.profile.experienceLevel || undefined,
        bio: user.profile.bio || undefined,
        workDescription: user.profile.workDescription || undefined,
        portfolioLinks: [
          user.profile.website,
          user.profile.linkedIn,
          user.profile.github,
        ].filter(Boolean) as string[],
      },
      jobDetails: {
        title: job.title,
        description: job.description,
        requirements: job.skills || [],
        skills: job.skills || [],
        employerPreferences: employerPreferences || undefined,
      },
      fitAnalysis: jobDecision?.fitAnalysis
        ? {
            strengths: (jobDecision.fitAnalysis as any).strengths || [],
            fitScore: jobDecision.fitScore || undefined,
          }
        : undefined,
    };

    // Generate pitch
    const pitch = await generatePitch(pitchRequest);

    // Store pitch in database
    const jobPitch = await prisma.jobPitch.create({
      data: {
        jobId: job.id,
        userId: user.id,
        pitch,
      },
    });

    return NextResponse.json({
      success: true,
      pitch,
      pitchId: jobPitch.id,
    });
  } catch (error) {
    console.error('Error generating pitch:', error);
    return NextResponse.json(
      { error: 'Failed to generate pitch' },
      { status: 500 }
    );
  }
}

