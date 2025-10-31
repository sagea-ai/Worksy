import { generateText } from 'ai';
import { getAIModel } from './ai-service';

export interface MVPRequest {
  jobDetails: {
    title: string;
    description: string;
    requirements: string[];
    skills: string[];
    techStack?: string[];
    projectScope?: string;
    timeframe?: string;
  };
  userSkills?: string[];
}

export interface MVPResponse {
  prompt: string;
  lovableUrl: string;
  appdeskUrl: string;
}

export async function generateMVPPrompt(
  request: MVPRequest,
  model: string = 'openai/gpt-4o'
): Promise<MVPResponse> {
  const aiModel = getAIModel(model);

  const systemPrompt = `You are an expert at creating detailed project specifications for MVP (Minimum Viable Product) development tools like Lovable.dev and AppDesk.in.

Your task is to create a comprehensive, detailed prompt that these tools can use to generate a working MVP demonstration.

Guidelines:
- Be extremely detailed and specific
- Include all technical specifications
- Define all features and functionalities
- Specify UI/UX requirements
- Include data models and schemas
- Provide clear user flows
- Include any necessary integrations
- Make it actionable and clear
- Format it for easy copy-paste into external tools
- Keep technical requirements clear and precise`;

  const userPrompt = `Create a detailed MVP specification prompt for the following job:

JOB POSTING:
Title: ${request.jobDetails.title}
Description: ${request.jobDetails.description}
Required Skills: ${request.jobDetails.skills.join(', ')}
Requirements: ${request.jobDetails.requirements.join(', ')}
${request.jobDetails.techStack?.length ? `Tech Stack: ${request.jobDetails.techStack.join(', ')}` : ''}
${request.jobDetails.projectScope ? `Project Scope: ${request.jobDetails.projectScope}` : ''}
${request.jobDetails.timeframe ? `Timeframe: ${request.jobDetails.timeframe}` : ''}
${request.userSkills?.length ? `Developer Skills Available: ${request.userSkills.join(', ')}` : ''}

Create a comprehensive MVP specification that can be used in Lovable.dev or AppDesk.in to generate a working demo. Include:
1. Project overview and goals
2. Core features to implement
3. Technical requirements and stack
4. UI/UX specifications
5. Data models and relationships
6. User flows and interactions
7. Any specific integrations or third-party services

Make it detailed enough that the AI tool can build a complete, functional MVP demo.`;

  try {
    const result = await generateText({
      model: aiModel,
      system: systemPrompt,
      prompt: userPrompt,
      maxTokens: 2000,
    });

    const prompt = result.text.trim();

    // URLs will be generated in the API route to keep service layer clean
    return {
      prompt,
      lovableUrl: '', // Generated in API route
      appdeskUrl: '', // Generated in API route
    };
  } catch (error) {
    console.error('Error generating MVP prompt:', error);
    throw new Error('Failed to generate MVP prompt');
  }
}

