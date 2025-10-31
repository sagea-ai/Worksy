"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBriefcase, IconSchool, IconUsers } from "@tabler/icons-react";

interface HirerOnboardingData {
  companyName?: string;
  companyDescription?: string;
  companySize?: string;
  industry?: string;
  positionTypes?: string[];
  hiringNeeds?: string[];
  typicalBudgetMin?: number;
  typicalBudgetMax?: number;
  preferredRemote?: boolean;
  typicalProjectDuration?: string;
}

interface PositionTypesProps {
  positionTypes: string[];
  onUpdate: (updates: Partial<HirerOnboardingData>) => void;
}

const positionOptions = [
  {
    id: "freelancers",
    title: "Freelancers",
    description: "Contract-based project work and services",
    icon: IconBriefcase,
    details: [
      "Short-term projects",
      "Project-based work",
      "Hourly or fixed-rate contracts",
      "Flexible engagement"
    ]
  },
  {
    id: "internships",
    title: "Internships",
    description: "Learning opportunities for students and graduates",
    icon: IconSchool,
    details: [
      "Paid or unpaid internships",
      "Part-time or full-time",
      "Learn while working",
      "Build experience"
    ]
  },
  {
    id: "jobs",
    title: "Full-time Jobs",
    description: "Permanent positions and career opportunities",
    icon: IconUsers,
    details: [
      "Full-time employment",
      "Salary positions",
      "Long-term commitment",
      "Benefits included"
    ]
  }
];

export function PositionTypes({ positionTypes, onUpdate }: PositionTypesProps) {
  const handleTypeToggle = (typeId: string) => {
    const updatedTypes = positionTypes.includes(typeId)
      ? positionTypes.filter(id => id !== typeId)
      : [...positionTypes, typeId];
    
    onUpdate({ positionTypes: updatedTypes });
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-6">
          What types of positions do you typically post?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {positionOptions.map((option) => {
            const isSelected = positionTypes.includes(option.id);
            const Icon = option.icon;
            
            return (
              <Card
                key={option.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handleTypeToggle(option.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {option.description}
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
                    {option.details.map((detail, index) => (
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
      </div>

      {positionTypes.length > 0 && (
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Selected:</strong> {positionTypes.map(id => positionOptions.find(o => o.id === id)?.title).join(", ")}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            You can post multiple types of positions on our platform.
          </p>
        </div>
      )}
    </div>
  );
}

