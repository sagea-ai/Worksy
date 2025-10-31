"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Check } from "lucide-react";

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

interface HiringNeedsProps {
  hiringNeeds: string[];
  onUpdate: (updates: Partial<HirerOnboardingData>) => void;
}

// Using similar skills categories as SkillSelection but focused on what employers hire for
const skillCategories = [
  {
    id: 'websites-it-software',
    name: 'Websites, IT & Software',
    icon: '💻',
    skills: [
      'PHP', 'HTML', 'Web Development', 'JavaScript', 'SEO',
      'Digital Marketing', 'Web Design', 'WordPress', 'React',
      'Node.js', 'Python', 'Full Stack Development', 'Backend Development'
    ]
  },
  {
    id: 'writing-content',
    name: 'Writing & Content',
    icon: '✍️',
    skills: [
      'Content Writing', 'Copywriting', 'Blog Writing',
      'Technical Writing', 'Proofreading', 'SEO Writing'
    ]
  },
  {
    id: 'design-media',
    name: 'Design, Media & Architecture',
    icon: '🎨',
    skills: [
      'Graphic Design', 'Logo Design', 'Photoshop',
      'UI/UX Design', 'Video Editing', 'Brand Design'
    ]
  },
  {
    id: 'data-admin',
    name: 'Data Entry & Admin',
    icon: '📊',
    skills: [
      'Data Entry', 'Excel', 'Virtual Assistant',
      'Data Analysis', 'Administrative Support'
    ]
  },
  {
    id: 'engineering-science',
    name: 'Engineering & Science',
    icon: '🔬',
    skills: [
      'Machine Learning', 'Data Science',
      'Artificial Intelligence', 'Blockchain'
    ]
  },
  {
    id: 'sales-marketing',
    name: 'Sales & Marketing',
    icon: '📈',
    skills: [
      'Social Media Marketing', 'Facebook Ads',
      'Google Ads', 'Email Marketing', 'Marketing Strategy'
    ]
  },
];

export function HiringNeeds({ hiringNeeds, onUpdate }: HiringNeedsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentNeeds, setCurrentNeeds] = useState<string[]>(hiringNeeds);

  const selectedCategoryData = skillCategories.find(cat => cat.id === selectedCategory);
  const maxNeeds = 15;

  useEffect(() => {
    setCurrentNeeds(hiringNeeds);
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchTerm('');
    onUpdate({ hiringNeeds: currentNeeds });
  };

  const handleSkillToggle = (skillName: string) => {
    let newNeeds: string[];
    if (currentNeeds.includes(skillName)) {
      newNeeds = currentNeeds.filter(name => name !== skillName);
    } else if (currentNeeds.length < maxNeeds) {
      newNeeds = [...currentNeeds, skillName];
    } else {
      return;
    }
    
    setCurrentNeeds(newNeeds);
    onUpdate({ hiringNeeds: newNeeds });
  };

  const filteredSkills = selectedCategoryData?.skills.filter(skill =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">What skills or expertise do you typically hire for?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Select categories to find the skills you need
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skillCategories.map((category) => (
              <Card 
                key={category.id}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h4 className="font-medium text-sm">{category.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.skills.length} skills
                      </p>
                    </div>
                    <div className="ml-auto">
                      <span className="text-muted-foreground">→</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Selected Needs Summary */}
      {currentNeeds.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Selected Hiring Needs</h3>
            <span className="text-sm text-muted-foreground">
              {currentNeeds.length} out of {maxNeeds} selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentNeeds.map((need) => (
              <Badge
                key={need}
                variant="secondary"
                className="flex items-center space-x-1"
              >
                <span>{need}</span>
                <button
                  onClick={() => handleSkillToggle(need)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Category Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{selectedCategoryData?.icon}</span>
          <h3 className="text-xl font-semibold">{selectedCategoryData?.name}</h3>
        </div>
        <button
          onClick={() => setSelectedCategory('')}
          className="text-sm text-primary hover:underline"
        >
          Change Category
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search skills"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Skills Grid */}
      <div className="space-y-3">
        {filteredSkills.map((skill) => {
          const isSelected = currentNeeds.includes(skill);
          const canSelect = currentNeeds.length < maxNeeds || isSelected;

          return (
            <div
              key={skill}
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : canSelect 
                    ? 'hover:border-primary/50 hover:bg-muted/50' 
                    : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => canSelect && handleSkillToggle(skill)}
            >
              <span className="font-medium">{skill}</span>
              <div className="flex items-center space-x-2">
                {isSelected ? (
                  <Check className="w-5 h-5 text-primary" />
                ) : (
                  canSelect && <Plus className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress indicator */}
      <div className="text-center text-sm text-muted-foreground">
        {currentNeeds.length} of {maxNeeds} skills selected
      </div>
    </div>
  );
}

