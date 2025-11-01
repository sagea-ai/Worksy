import { generateObject } from 'ai';
import { z } from 'zod';
import { getAIModel } from './ai-service';

// Schema for job fit analysis response
const jobFitAnalysisSchema = z.object({
  fitScore: z.number().min(0).max(100).describe('Overall compatibility score (0-100)'),
  strengths: z.array(z.string()).describe('User skills that match job requirements'),
  weaknesses: z.array(z.string()).describe('Missing skills or gaps identified'),
  recommendations: z.array(z.string()).describe('Actionable recommendations for improvement'),
  budgetMatch: z.object({
    isGoodMatch: z.boolean().describe('Whether budget aligns with user rate expectations'),
    userRange: z.string().describe('User hourly rate range (e.g., "$50-80/hr")'),
    jobBudget: z.number().describe('Job budget amount'),
    explanation: z.string().describe('Budget compatibility explanation'),
  }),
  skillMatch: z.object({
    matchingSkills: z.array(z.string()).describe('Skills that match between user and job'),
    missingSkills: z.array(z.string()).describe('Skills required by job but not in user profile'),
    overallMatch: z.number().min(0).max(100).describe('Skill match percentage'),
  }),
  experienceMatch: z.object({
    isQualified: z.boolean().describe('Whether user experience level meets job requirements'),
    explanation: z.string().describe('Experience level compatibility explanation'),
  }),
});

export type JobFitAnalysis = z.infer<typeof jobFitAnalysisSchema>;

export interface JobFitRequest {
  userProfile: {
    skills: string[];
    experienceLevel?: string;
    hourlyRateMin?: number;
    hourlyRateMax?: number;
    bio?: string;
    workDescription?: string;
  };
  jobDetails: {
    title: string;
    description: string;
    requirements: string[];
    skills: string[];
    budget?: number;
    currency?: string;
    jobType?: string;
  };
}

export async function analyzeJobFit(
  request: JobFitRequest,
  model: string = 'openai/gpt-4o-mini'
): Promise<JobFitAnalysis> {
  const aiModel = getAIModel(model);

  // Calculate budget range string
  const userRateRange = request.userProfile.hourlyRateMin && request.userProfile.hourlyRateMax
    ? `$${request.userProfile.hourlyRateMin}-${request.userProfile.hourlyRateMax}/hr`
    : 'Not specified';

  // Calculate estimated job hourly rate if budget provided
  const jobHourlyRate = request.jobDetails.budget 
    ? `Approximately $${request.jobDetails.budget} (total budget)`
    : 'Not specified';

  const systemPrompt = `You are an expert job matching analyst. Your task is to analyze the compatibility between a freelancer's profile and a job posting.

Analyze:
1. Skill compatibility - match user skills with job requirements
2. Experience level - assess if user's experience level matches job expectations
3. Budget alignment - compare user's rate expectations with job budget
4. Overall fit - provide a comprehensive compatibility score

Be thorough, honest, and constructive. Highlight both strengths and areas for improvement.`;

  const userPrompt = `Analyze job fit for the following:

USER PROFILE:
- Skills: ${request.userProfile.skills.join(', ')}
- Experience Level: ${request.userProfile.experienceLevel || 'Not specified'}
- Rate Range: ${userRateRange}
- Bio: ${request.userProfile.bio || 'Not provided'}
- Work Description: ${request.userProfile.workDescription || 'Not provided'}

JOB POSTING:
- Title: ${request.jobDetails.title}
- Description: ${request.jobDetails.description}
- Required Skills: ${request.jobDetails.skills.join(', ')}
- Additional Requirements: ${request.jobDetails.requirements.join(', ')}
- Budget: ${request.jobDetails.budget ? `${request.jobDetails.currency || 'USD'} ${request.jobDetails.budget}` : 'Not specified'}
- Job Type: ${request.jobDetails.jobType || 'Not specified'}

Provide a comprehensive fit analysis.`;

  try {
    const result = await generateObject({
      model: aiModel,
      schema: jobFitAnalysisSchema,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    });

    return result.object;
  } catch (error) {
    console.error('Error analyzing job fit:', error);
    throw new Error('Failed to analyze job fit');
  }
}

