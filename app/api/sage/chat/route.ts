import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const prisma = new PrismaClient();

// Initialize OpenAI with SAGE-specific API key
const openai = createOpenAI({ apiKey: process.env.SAGEA_API_KEY });

function buildUserContext(params: {
  bio?: string | null;
  workDescription?: string | null;
  companyDescription?: string | null;
  selectedSkills?: string[];
  location?: string | null;
  decisions?: Array<{
    decision: string;
    fitScore: number | null;
    reason: string | null;
    createdAt: Date;
  }>;
}) {
  const description =
    params.bio || params.workDescription || params.companyDescription || "";

  const skills = (params.selectedSkills || []).join(", ") || "Not specified";
  const location = params.location || "Not specified";

  const decisionsText = (params.decisions || [])
    .map((d) => {
      const date = d.createdAt.toISOString().split("T")[0];
      const score = d.fitScore != null ? ` (fitScore: ${d.fitScore})` : "";
      const reason = d.reason ? ` — ${d.reason}` : "";
      return `- ${date}: ${d.decision}${score}${reason}`;
    })
    .join("\n");

  return `USER PROFILE
- Location: ${location}
- Skills: ${skills}
- Description: ${description}

RECENT JOB DECISIONS
${decisionsText || "No prior decisions on record."}`;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const messages: Array<{ role: "user" | "assistant" | "system"; content: string }> =
      body?.messages || [];

    // Load user, profile, and recent job decisions
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const decisions = await prisma.jobDecision.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { decision: true, fitScore: true, reason: true, createdAt: true },
    });

    const ctx = buildUserContext({
      bio: user.profile?.bio ?? null,
      workDescription: user.profile?.workDescription ?? null,
      companyDescription: user.profile?.companyDescription ?? null,
      selectedSkills: user.profile?.selectedSkills ?? [],
      location: user.profile?.location ?? null,
      decisions,
    });

    const systemPrompt = `You are SAGE, the Worksy AI assistant. Your purpose is to help the user with personalized, actionable answers.
- Always stay concise and practical.
- Use the provided user context to tailor your responses.
- If information is missing, ask a brief, targeted follow-up question.
- If asked about your identity, your name is SAGE.`;

    const modelName = process.env.SAGEA_MODEL || "gpt-4o-mini";

    const { text } = await generateText({
      model: openai(modelName),
      system: `${systemPrompt}\n\n${ctx}`,
      messages,
      maxTokens: 500,
      temperature: 0.3,
    });

    return NextResponse.json({ reply: text, identity: "SAGE" });
  } catch (error: any) {
    console.error("SAGE chat error:", error);
    const msg = error?.message || "Failed to generate response";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
