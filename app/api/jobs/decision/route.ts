import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { JobDecisionType } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, decision, reason, fitScore } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    if (!decision || !['ACCEPTED', 'REJECTED'].includes(decision)) {
      return NextResponse.json(
        { error: 'Decision must be ACCEPTED or REJECTED' },
        { status: 400 }
      );
    }

    // Fetch user
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch job
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

    // Update or create job decision
    const jobDecision = await prisma.jobDecision.upsert({
      where: {
        jobId_userId: {
          jobId: job.id,
          userId: user.id,
        },
      },
      create: {
        jobId: job.id,
        userId: user.id,
        decision: decision as JobDecisionType,
        reason: reason || null,
        fitScore: fitScore || null,
      },
      update: {
        decision: decision as JobDecisionType,
        reason: reason || null,
        fitScore: fitScore || null,
      },
    });

    // Update job state if accepted
    if (decision === 'ACCEPTED') {
      await prisma.job.update({
        where: { id: job.id },
        data: {
          state: 'PROPOSING',
        },
      });
    } else if (decision === 'REJECTED') {
      await prisma.job.update({
        where: { id: job.id },
        data: {
          state: 'DECLINED',
        },
      });
    }

    return NextResponse.json({
      success: true,
      decision: jobDecision,
    });
  } catch (error) {
    console.error('Error logging job decision:', error);
    return NextResponse.json(
      { error: 'Failed to log job decision' },
      { status: 500 }
    );
  }
}

