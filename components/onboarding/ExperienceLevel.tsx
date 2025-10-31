"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingData } from '@/app/onboarding/page';

interface ExperienceLevelProps {
  selectedLevel: string;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}

const experienceLevels = [
  {
    id: 'BEGINNER',
    title: 'Beginner',
    description: 'Just starting out or less than 1 year of experience',
    icon: '🌱',
    details: [
      'Learning the basics',
      'First few projects',
      'Building portfolio'
    ]
  },
  {
    id: 'INTERMEDIATE',
    title: 'Intermediate',
    description: '1-3 years of experience',
    icon: '📈',
    details: [
      'Solid foundation',
      'Multiple completed projects',
      'Growing client base'
    ]
  },
  {
    id: 'ADVANCED',
    title: 'Advanced',
    description: '3-5 years of experience',
    icon: '🎯',
    details: [
      'Specialized expertise',
      'Consistent high-quality work',
      'Established reputation'
    ]
  },
  {
    id: 'EXPERT',
    title: 'Expert',
    description: '5+ years of experience',
    icon: '👑',
    details: [
      'Industry recognition',
      'Complex project leadership',
      'Mentoring others'
    ]
  },
];

export function ExperienceLevel({ selectedLevel, onUpdate }: ExperienceLevelProps) {
  const handleLevelSelect = (level: string) => {
    onUpdate({ experienceLevel: level });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {experienceLevels.map((level) => {
          const isSelected = selectedLevel === level.id;
          
          return (
            <Card
              key={level.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-lg' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleLevelSelect(level.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{level.icon}</span>
                  <div>
                    <CardTitle className="text-lg">{level.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {level.description}
                    </CardDescription>
                  </div>
                  {isSelected && (
                    <div className="ml-auto">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-white text-sm">✓</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {level.details.map((detail, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedLevel && (
        <div className="mt-8 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Selected:</strong> {experienceLevels.find(l => l.id === selectedLevel)?.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            This helps us match you with projects appropriate for your skill level and experience.
          </p>
        </div>
      )}
    </div>
  );
}
