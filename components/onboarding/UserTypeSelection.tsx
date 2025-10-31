"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBriefcase, IconSchool } from "@tabler/icons-react";

interface UserTypeSelectionProps {
  selectedType: "STUDENT" | "HIRER" | "";
  onSelect: (type: "STUDENT" | "HIRER") => void;
}

export function UserTypeSelection({ selectedType, onSelect }: UserTypeSelectionProps) {
  const options = [
    {
      id: "STUDENT" as const,
      title: "Student",
      description: "I'm looking for freelance opportunities and projects",
      icon: IconSchool,
      features: [
        "Find freelance jobs",
        "Build your portfolio",
        "Connect with clients",
        "Grow your skills"
      ],
      color: ""
    },
    {
      id: "HIRER" as const,
      title: "Hirer",
      description: "I'm looking to hire freelancers for my company",
      icon: IconBriefcase,
      features: [
        "Post job opportunities",
        "Find talented freelancers",
        "Manage projects",
        "Scale your team"
      ],
      color: ""
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {options.map((option) => {
          const isSelected = selectedType === option.id;
          const Icon = option.icon;
          
          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-xl ${
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => onSelect(option.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-14 h-14 rounded-lg bg-primary flex items-center justify-center text-primary-foreground`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl">{option.title}</CardTitle>
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
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedType && (
        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Selected:</strong> {options.find(o => o.id === selectedType)?.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {selectedType === "STUDENT" 
              ? "We'll help you find the best freelance opportunities tailored to your skills."
              : "We'll help you find talented freelancers and manage your hiring needs."}
          </p>
        </div>
      )}
    </div>
  );
}

