'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconCopy, IconCheck, IconEdit } from '@tabler/icons-react';
import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';

interface JobPitchDisplayProps {
  pitch: string;
  onEdit?: (editedPitch: string) => void;
  onSubmit?: () => void;
  onBuildMVP?: () => void;
}

export function JobPitchDisplay({ pitch, onEdit, onSubmit, onBuildMVP }: JobPitchDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPitch, setEditedPitch] = useState(pitch);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editedPitch);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy pitch:', err);
    }
  };

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(editedPitch);
    }
    setIsEditing(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Generated Pitch</CardTitle>
          <Button
            variant="ghost"
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
                Copy
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedPitch}
              onChange={(e) => setEditedPitch(e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveEdit} size="sm">
                Save Changes
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditedPitch(pitch);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                {editedPitch}
              </p>
            </div>
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <IconEdit className="h-4 w-4" />
                  Edit Pitch
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          {onSubmit && (
            <Button
              onClick={onSubmit}
              className="flex-1"
            >
              Propose
            </Button>
          )}
          {onBuildMVP && (
            <Button
              variant="outline"
              onClick={onBuildMVP}
              className="flex-1"
            >
              Build MVP
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

