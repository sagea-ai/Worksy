"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { OnboardingData } from '@/app/onboarding/page';

interface PlatformPreferencesProps {
  selectedPlatforms: string[];
  onUpdate: (updates: Partial<OnboardingData>) => void;
}

const platforms = [
  {
    id: 'upwork',
    name: 'Upwork',
    description: 'Largest freelance marketplace with diverse project types',
    icon: '🟢',
    features: ['Global clients', 'Hourly & fixed projects', 'Payment protection'],
    popularity: 'Most Popular'
  },
  {
    id: 'fiverr',
    name: 'Fiverr',
    description: 'Service-based marketplace for quick deliverables',
    icon: '🟡',
    features: ['Gig-based selling', 'Quick turnaround', 'Creative services'],
    popularity: 'High Volume'
  },
  {
    id: 'freelancer',
    name: 'Freelancer.com',
    description: 'Competitive bidding platform with contests',
    icon: '🔵',
    features: ['Contest participation', 'Global reach', 'Skill tests'],
    popularity: 'Competitive'
  },
  {
    id: 'guru',
    name: 'Guru',
    description: 'Professional network for business services',
    icon: '🟠',
    features: ['Work room collaboration', 'Business focus', 'Flexible payments'],
    popularity: 'Professional'
  },
  {
    id: 'peopleperhour',
    name: 'PeoplePerHour',
    description: 'UK-focused platform with project and hourly work',
    icon: '🟣',
    features: ['Proposal system', 'UK market focus', 'SEO friendly'],
    popularity: 'Regional'
  }
];

export function PlatformPreferences({ selectedPlatforms, onUpdate }: PlatformPreferencesProps) {
  const handlePlatformToggle = (platformId: string) => {
    const updatedPlatforms = selectedPlatforms.includes(platformId)
      ? selectedPlatforms.filter(id => id !== platformId)
      : [...selectedPlatforms, platformId];
    
    onUpdate({ preferredPlatforms: updatedPlatforms });
  };

  return (
    <div className="space-y-6">
      {/* Selected Summary */}
      {selectedPlatforms.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Selected Platforms</h3>
            <span className="text-sm text-muted-foreground">
              {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedPlatforms.map((platformId) => {
              const platform = platforms.find(p => p.id === platformId);
              return (
                <Badge key={platformId} variant="secondary" className="flex items-center space-x-1">
                  <span>{platform?.icon}</span>
                  <span>{platform?.name}</span>
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Platform Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id);
          
          return (
            <Card
              key={platform.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-lg' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handlePlatformToggle(platform.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{platform.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {platform.popularity}
                      </Badge>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <CardDescription className="text-sm mt-2">
                  {platform.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Key Features:</h4>
                  <ul className="space-y-1">
                    {platform.features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recommendation */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">💡 Recommendation</h4>
        <p className="text-sm text-blue-800 dark:text-blue-200">
          We recommend starting with 2-3 platforms to effectively manage your proposals and maintain quality. 
          You can always add more platforms later as you scale your automation.
        </p>
      </div>

      {/* Info */}
      {selectedPlatforms.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Our AI will automatically discover and bid on relevant projects across your selected platforms
        </div>
      )}
    </div>
  );
}
