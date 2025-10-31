'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { IconCheck, IconX, IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export interface JobFitAnalysisData {
  fitScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  budgetMatch: {
    isGoodMatch: boolean;
    userRange: string;
    jobBudget: number;
    explanation: string;
  };
  skillMatch: {
    matchingSkills: string[];
    missingSkills: string[];
    overallMatch: number;
  };
  experienceMatch: {
    isQualified: boolean;
    explanation: string;
  };
}

interface JobFitAnalysisProps {
  analysis: JobFitAnalysisData;
  onAccept?: () => void;
  onReject?: (reason?: string) => void;
}

export function JobFitAnalysis({ analysis, onAccept, onReject }: JobFitAnalysisProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 75) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Job Fit Analysis</CardTitle>
          <div className="flex items-center gap-2">
            <span className={cn('text-3xl font-bold', getScoreColor(analysis.fitScore))}>
              {analysis.fitScore}%
            </span>
          </div>
        </div>
        <Progress 
          value={analysis.fitScore} 
          className="h-2 mt-2"
        />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Strengths */}
        {analysis.strengths.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <IconCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-sm">Strengths</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.strengths.map((strength, idx) => (
                <Badge key={idx} variant="secondary" className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300">
                  {strength}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Weaknesses */}
        {analysis.weaknesses.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <IconX className="h-4 w-4 text-red-600 dark:text-red-400" />
              <h3 className="font-semibold text-sm">Areas to Improve</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.weaknesses.map((weakness, idx) => (
                <Badge key={idx} variant="secondary" className="bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300">
                  {weakness}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Skill Match */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Skill Match</h3>
            <span className="text-sm text-muted-foreground">{analysis.skillMatch.overallMatch}%</span>
          </div>
          <div className="space-y-2">
            {analysis.skillMatch.matchingSkills.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Matching Skills</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.skillMatch.matchingSkills.map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {analysis.skillMatch.missingSkills.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Missing Skills</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.skillMatch.missingSkills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs bg-yellow-50 dark:bg-yellow-950">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Budget Match */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {analysis.budgetMatch.isGoodMatch ? (
              <IconTrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <IconTrendingDown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            )}
            <h3 className="font-semibold text-sm">Budget Compatibility</h3>
          </div>
          <p className="text-sm text-muted-foreground">{analysis.budgetMatch.explanation}</p>
        </div>

        {/* Experience Match */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {analysis.experienceMatch.isQualified ? (
              <IconCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <IconX className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <h3 className="font-semibold text-sm">Experience Level</h3>
          </div>
          <p className="text-sm text-muted-foreground">{analysis.experienceMatch.explanation}</p>
        </div>

        {/* Recommendations */}
        {analysis.recommendations.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm mb-2">Recommendations</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        {(onAccept || onReject) && (
          <div className="flex gap-2 pt-4 border-t">
            {onAccept && (
              <button
                onClick={() => onAccept()}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                Accept Job
              </button>
            )}
            {onReject && (
              <button
                onClick={() => onReject()}
                className="flex-1 bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors text-sm font-medium"
              >
                Reject Job
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

