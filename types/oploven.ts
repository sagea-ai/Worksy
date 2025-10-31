// Open Lovable AI Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface SandboxConfig {
  provider: 'vercel' | 'e2b';
  template?: string;
  environment?: Record<string, string>;
}

export interface AIProvider {
  name: string;
  model: string;
  apiKey: string;
  endpoint?: string;
}

export interface GeneratedComponent {
  id: string;
  name: string;
  code: string;
  dependencies?: string[];
  preview?: string;
  createdAt: Date;
}

export interface WebScrapingResult {
  url: string;
  title?: string;
  content: string;
  metadata?: Record<string, any>;
}