'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { IconCopy, IconCheck, IconExternalLink } from '@tabler/icons-react';
import { useState } from 'react';

interface MVPPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prompt: string;
  lovableUrl?: string;
  appdeskUrl?: string;
  onCopy?: () => void;
}

export function MVPPromptModal({
  open,
  onOpenChange,
  prompt,
  lovableUrl,
  appdeskUrl,
}: MVPPromptModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy prompt:', err);
    }
  };

  const handleOpenLovable = () => {
    if (lovableUrl) {
      window.open(lovableUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenAppdesk = () => {
    if (appdeskUrl) {
      window.open(appdeskUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>MVP Prompt</DialogTitle>
          <DialogDescription>
            Copy this prompt and use it in Lovable.dev or AppDesk.in to generate your MVP demo
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <IconCheck className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <IconCopy className="h-4 w-4" />
                  Copy Prompt
                </>
              )}
            </Button>
            {lovableUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenLovable}
                className="gap-2"
              >
                <IconExternalLink className="h-4 w-4" />
                Open in Lovable.dev
              </Button>
            )}
            {appdeskUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenAppdesk}
                className="gap-2"
              >
                <IconExternalLink className="h-4 w-4" />
                Open in AppDesk.in
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-auto">
            <Textarea
              value={prompt}
              readOnly
              className="min-h-[400px] font-mono text-sm"
              style={{ resize: 'none' }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

