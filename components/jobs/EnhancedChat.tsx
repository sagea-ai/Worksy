'use client';

import { useState, useEffect } from 'react';
import { JobFitAnalysis, JobFitAnalysisData } from './JobFitAnalysis';
import { JobPitchDisplay } from './JobPitchDisplay';
import { MVPPromptModal } from './MVPPromptModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { IconBrain, IconUsers, IconLoader2 } from '@tabler/icons-react';

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  data?: any;
}

export type ChatState =
  | 'initial'
  | 'analyzing'
  | 'fit-results'
  | 'decision'
  | 'pitch-question'
  | 'generating-pitch'
  | 'pitch-results'
  | 'actions';

interface EnhancedChatProps {
  job: {
    id: string;
    title: string;
    description: string;
    skills: string[];
    budget?: number;
    currency?: string;
  };
  onDecision?: (decision: 'ACCEPTED' | 'REJECTED', reason?: string) => void;
  onPropose?: (pitch: string) => void;
}

export function EnhancedChat({ job, onDecision, onPropose }: EnhancedChatProps) {
  const [state, setState] = useState<ChatState>('initial');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Utility function to generate unique message IDs
  const generateMessageId = (type: string) => `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Helper function to safely add messages without duplicates
  const addMessage = (newMessage: ChatMessage) => {
    setMessages((prev) => {
      // Check if a similar message already exists to prevent duplicates
      const hasSimilar = prev.some(msg => 
        msg.content === newMessage.content && 
        Math.abs(msg.timestamp.getTime() - newMessage.timestamp.getTime()) < 1000
      );
      if (hasSimilar) {
        return prev;
      }
      return [...prev, newMessage];
    });
  };
  const [fitAnalysis, setFitAnalysis] = useState<JobFitAnalysisData | null>(null);
  const [pitch, setPitch] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [mvpPrompt, setMvpPrompt] = useState<string | null>(null);
  const [mvpLovableUrl, setMvpLovableUrl] = useState<string | null>(null);
  const [mvpAppdeskUrl, setMvpAppdeskUrl] = useState<string | null>(null);
  const [mvpModalOpen, setMvpModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize with welcome message only if messages is empty
    setMessages((prev) => {
      if (prev.length === 0) {
        const welcomeMessage: ChatMessage = {
          id: generateMessageId('welcome'),
          type: 'ai',
          content: "Do you want to see whether you're fit for this job or not?",
          timestamp: new Date(),
        };
        return [welcomeMessage];
      }
      return prev;
    });
  }, []);

  const handleStartAnalysis = async () => {
    setState('analyzing');
    setLoading(true);

    const analyzingMessage: ChatMessage = {
      id: generateMessageId('analyzing'),
      type: 'ai',
      content: 'Analyzing your profile compatibility with this job...',
      timestamp: new Date(),
    };
    addMessage(analyzingMessage);

    try {
      const response = await fetch('/api/jobs/analyze-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze job fit');
      }

      const data = await response.json();
      const analysis: JobFitAnalysisData = data.analysis;

      setFitAnalysis(analysis);
      setState('fit-results');
    } catch (error) {
      console.error('Error analyzing job fit:', error);
      const errorMessage: ChatMessage = {
        id: generateMessageId('error'),
        type: 'ai',
        content: 'Sorry, I encountered an error while analyzing the job fit. Please try again.',
        timestamp: new Date(),
      };
      addMessage(errorMessage);
      setState('initial');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    try {
      await fetch('/api/jobs/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          decision: 'ACCEPTED',
          fitScore: fitAnalysis?.fitScore,
        }),
      });

      const acceptMessage: ChatMessage = {
        id: generateMessageId('accept'),
        type: 'user',
        content: 'I accept this job',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, acceptMessage]);

      const pitchQuestion: ChatMessage = {
        id: generateMessageId('pitch-question'),
        type: 'ai',
        content: 'Should I create a detailed pitch for this job?',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, pitchQuestion]);

      setState('pitch-question');
      if (onDecision) {
        onDecision('ACCEPTED');
      }
    } catch (error) {
      console.error('Error accepting job:', error);
    }
  };

  const handleReject = async (reason?: string) => {
    try {
      await fetch('/api/jobs/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          decision: 'REJECTED',
          reason: reason || rejectionReason,
          fitScore: fitAnalysis?.fitScore,
        }),
      });

      const rejectMessage: ChatMessage = {
        id: generateMessageId('reject'),
        type: 'user',
        content: reason || rejectionReason || 'I reject this job',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, rejectMessage]);

      if (onDecision) {
        onDecision('REJECTED', reason || rejectionReason);
      }

      // Reset to initial state
      setState('initial');
    } catch (error) {
      console.error('Error rejecting job:', error);
    }
  };

  const handleGeneratePitch = async () => {
    setState('generating-pitch');
    setLoading(true);

    const generatingMessage: ChatMessage = {
      id: generateMessageId('generating-pitch'),
      type: 'ai',
      content: 'Generating your personalized pitch...',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, generatingMessage]);

    try {
      const response = await fetch('/api/jobs/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate pitch');
      }

      const data = await response.json();
      setPitch(data.pitch);
      setState('pitch-results');
    } catch (error) {
      console.error('Error generating pitch:', error);
      const errorMessage: ChatMessage = {
        id: generateMessageId('error-pitch'),
        type: 'ai',
        content: 'Sorry, I encountered an error while generating the pitch. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setState('pitch-question');
    } finally {
      setLoading(false);
    }
  };

  const handleBuildMVP = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/jobs/generate-mvp-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate MVP prompt');
      }

      const data = await response.json();
      setMvpPrompt(data.prompt);
      setMvpLovableUrl(data.lovableUrl || null);
      setMvpAppdeskUrl(data.appdeskUrl || null);
      setMvpModalOpen(true);
    } catch (error) {
      console.error('Error generating MVP prompt:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePropose = () => {
    if (pitch && onPropose) {
      onPropose(pitch);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Display */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.type === 'user'
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-card border border-border rounded-bl-md'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.type === 'user' ? (
                  <IconUsers className="h-4 w-4" />
                ) : (
                  <IconBrain className="h-4 w-4 text-primary" />
                )}
                <span className="text-xs font-medium">
                  {msg.type === 'user' ? 'You' : 'Worksy'}
                </span>
              </div>
              <div className="text-sm">{msg.content}</div>
            </div>
          </div>
        ))}

        {/* Fit Analysis Display */}
        {state === 'fit-results' && fitAnalysis && (
          <JobFitAnalysis
            analysis={fitAnalysis}
            onAccept={handleAccept}
            onReject={() => handleReject()}
          />
        )}

        {/* Pitch Display */}
        {state === 'pitch-results' && pitch && (
          <JobPitchDisplay
            pitch={pitch}
            onEdit={(editedPitch) => setPitch(editedPitch)}
            onSubmit={handlePropose}
            onBuildMVP={handleBuildMVP}
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center">
            <IconLoader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Action Buttons / Input */}
      <div className="border-t p-4">
        {state === 'initial' && (
          <Button onClick={handleStartAnalysis} className="w-full" disabled={loading}>
            {loading ? (
              <>
                <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Job Fit'
            )}
          </Button>
        )}

        {state === 'pitch-question' && (
          <div className="flex gap-2">
            <Button onClick={handleGeneratePitch} className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Pitch'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setState('initial');
                if (onPropose && pitch) {
                  onPropose(pitch);
                }
              }}
            >
              Skip
            </Button>
          </div>
        )}
      </div>

      {/* MVP Prompt Modal */}
      <MVPPromptModal
        open={mvpModalOpen}
        onOpenChange={setMvpModalOpen}
        prompt={mvpPrompt || ''}
        lovableUrl={mvpLovableUrl || undefined}
        appdeskUrl={mvpAppdeskUrl || undefined}
      />
    </div>
  );
}

