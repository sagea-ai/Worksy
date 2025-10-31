import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
  jobId?: string; // Optional job ID to update the database
}

interface BuildingStep {
  id: number;
  title: string;
  description: string;
  timeEstimate: string;
  resources: string[];
  deliverables: string[];
}

interface BuildingPlan {
  overview: string;
  totalTimeEstimate: string;
  steps: BuildingStep[];
  requiredSkills: string[];
  recommendations: string[];
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

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY not found in environment variables");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    console.log("🔨 Generating technical building steps for:", title);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
As an expert web developer and technical architect, create a detailed technical implementation plan for building this website:

**Project Title:** ${title}

**Project Description:** ${description}

**Required Skills:** ${skills?.join(", ") || "Not specified"}

**Budget:** ${currency} ${price}

${feedback ? `**Developer Feedback/Changes Requested:** ${feedback}` : ""}

Please provide a comprehensive technical building plan focused on the actual development and implementation steps to build this website. Focus on:

1. **Overview**: Technical approach summary (2-3 sentences)
2. **Total Time Estimate**: Development timeline
3. **Steps**: Detailed technical implementation steps including:
   - Setup and configuration
   - Frontend development
   - Backend development (if needed)
   - Database setup (if needed)
   - Integration and testing
   - Deployment
4. **Required Skills**: Technical skills needed for implementation
5. **Recommendations**: Technical best practices and implementation tips

Make the steps actionable, technical, and focused on actual coding/development tasks. Each step should be something a developer can immediately start working on.

IMPORTANT: Return ONLY a valid JSON object with this exact structure (no markdown, no explanations, just JSON):
{
  "overview": "string",
  "totalTimeEstimate": "string",
  "steps": [
    {
      "id": number,
      "title": "string",
      "description": "string", 
      "timeEstimate": "string",
      "resources": ["string"],
      "deliverables": ["string"]
    }
  ],
  "requiredSkills": ["string"],
  "recommendations": ["string"]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("🤖 Raw Gemini response:", text);

    let buildingPlan: BuildingPlan;
    try {
      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      buildingPlan = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("❌ Failed to parse Gemini response as JSON:", parseError);
      console.error("Raw response:", text);

      buildingPlan = {
        overview:
          "Technical implementation plan for building the website with modern web technologies.",
        totalTimeEstimate: "1-3 weeks",
        steps: [
          {
            id: 1,
            title: "Project Setup & Environment Configuration",
            description:
              "Set up development environment, create project structure, and configure build tools.",
            timeEstimate: "4-6 hours",
            resources: ["IDE/Code Editor", "Node.js", "Package Manager", "Git"],
            deliverables: [
              "Project repository",
              "Build configuration",
              "Development environment",
            ],
          },
          {
            id: 2,
            title: "Frontend Implementation",
            description:
              "Develop the user interface, implement responsive design, and create interactive components.",
            timeEstimate: "1-2 weeks",
            resources: ["Frontend Framework", "CSS Framework", "UI Components"],
            deliverables: [
              "Responsive UI",
              "Interactive components",
              "Cross-browser compatibility",
            ],
          },
          {
            id: 3,
            title: "Backend Development (if needed)",
            description:
              "Implement server-side logic, API endpoints, and data processing functionality.",
            timeEstimate: "3-5 days",
            resources: ["Backend Framework", "Database", "API Tools"],
            deliverables: ["API endpoints", "Server logic", "Data validation"],
          },
          {
            id: 4,
            title: "Testing & Deployment",
            description:
              "Test functionality, optimize performance, and deploy to production environment.",
            timeEstimate: "2-3 days",
            resources: ["Testing Tools", "Hosting Platform", "Domain"],
            deliverables: [
              "Live website",
              "Performance optimization",
              "Documentation",
            ],
          },
        ],
        requiredSkills: skills || ["HTML/CSS", "JavaScript", "Web Development"],
        recommendations: [
          "Use version control for all code changes",
          "Test on multiple devices and browsers",
          "Optimize images and assets for web performance",
          "Implement responsive design from the start",
        ],
      };
    }

    console.log("✅ Technical building steps generated successfully");

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
