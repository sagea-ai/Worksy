import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { generateMVPPrompt, MVPRequest } from '@/lib/services/jobs/mvp-prompt-generator';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { jobId, techStack, projectScope, timeframe } = body;

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

    // Prepare MVP request
    const mvpRequest: MVPRequest = {
      jobDetails: {
        title: job.title,
        description: job.description,
        requirements: job.skills || [],
        skills: job.skills || [],
        techStack: techStack || undefined,
        projectScope: projectScope || undefined,
        timeframe: timeframe || undefined,
      },
      userSkills: user.profile?.selectedSkills || undefined,
    };

    // Generate MVP prompt
    const mvpResponse = await generateMVPPrompt(mvpRequest);

    // Note: These URLs are placeholders. In production, you may need to adjust based on
    // how Lovable.dev and AppDesk.in actually handle prompt input
    return NextResponse.json({
      success: true,
      prompt: mvpResponse.prompt,
      lovableUrl: `https://lovable.dev/create?prompt=${encodeURIComponent(mvpResponse.prompt.substring(0, 1000))}`,
      appdeskUrl: `https://appdesk.in/create?prompt=${encodeURIComponent(mvpResponse.prompt.substring(0, 1000))}`,
    });
  } catch (error) {
    console.error('Error generating MVP prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate MVP prompt' },
      { status: 500 }
    );
  }
}

