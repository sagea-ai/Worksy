import { generateText } from 'ai';
import { getAIModel } from './ai-service';

export interface PitchRequest {
  userProfile: {
    firstName?: string;
    lastName?: string;
    skills: string[];
    experienceLevel?: string;
    bio?: string;
    workDescription?: string;
    portfolioLinks?: string[];
    previousWork?: string[];
  };
  jobDetails: {
    title: string;
    description: string;
    requirements: string[];
    skills: string[];
    employerPreferences?: string;
  };
  fitAnalysis?: {
    strengths: string[];
    fitScore?: number;
  };
}

export async function generatePitch(
  request: PitchRequest,
  model: string = 'openai/gpt-4o'
): Promise<string> {
  const aiModel = getAIModel(model);

  const systemPrompt = `You are an expert freelance proposal writer. Your task is to create a compelling, personalized pitch for a job posting.

Guidelines:
- Keep it professional yet personable
- Highlight relevant skills and experience
- Address specific job requirements
- Show genuine interest in the project
- Be concise (150-250 words)
- Focus on value you can bring to the client
- Use the employer's language when possible
- Avoid generic templates
- Make it stand out while remaining professional`;

  const userPrompt = `Create a personalized pitch for the following job:

JOB POSTING:
Title: ${request.jobDetails.title}
Description: ${request.jobDetails.description}
Required Skills: ${request.jobDetails.skills.join(', ')}
Requirements: ${request.jobDetails.requirements.join(', ')}
${request.jobDetails.employerPreferences ? `Employer Preferences: ${request.jobDetails.employerPreferences}` : ''}

FREELANCER PROFILE:
Name: ${request.userProfile.firstName || ''} ${request.userProfile.lastName || ''}
Skills: ${request.userProfile.skills.join(', ')}
Experience Level: ${request.userProfile.experienceLevel || 'Not specified'}
Bio: ${request.userProfile.bio || 'Not provided'}
Work Description: ${request.userProfile.workDescription || 'Not provided'}
${request.userProfile.portfolioLinks?.length ? `Portfolio: ${request.userProfile.portfolioLinks.join(', ')}` : ''}

${request.fitAnalysis ? `
FIT ANALYSIS:
Strengths: ${request.fitAnalysis.strengths.join(', ')}
Fit Score: ${request.fitAnalysis.fitScore || 'N/A'}
` : ''}

Create a compelling, personalized pitch that showcases why this freelancer is perfect for this job.`;

  try {
    const result = await generateText({
      model: aiModel,
      system: systemPrompt,
      prompt: userPrompt,
    });

    return result.text.trim();
  } catch (error) {
    console.error('Error generating pitch:', error);
    throw new Error('Failed to generate pitch');
  }
}

