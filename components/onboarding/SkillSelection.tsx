"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Check } from "lucide-react";
import { OnboardingData } from '@/app/onboarding/page';

interface Category {
  id: string;
  name: string;
  icon: string;
  skills: Skill[];
}

interface Skill {
  name: string;
  jobCount: number;
}

interface SkillSelectionProps {
  selectedSkills: string[];
  onUpdate: (updates: Partial<OnboardingData>) => void;
}

// Mock data based on the image - simplified to use skill names directly
const categories: Category[] = [
  {
    id: 'websites-it-software',
    name: 'Websites, IT & Software',
    icon: '💻',
    skills: [
      { name: 'PHP', jobCount: 1465 },
      { name: 'HTML', jobCount: 1140 },
      { name: 'Web Development', jobCount: 1112 },
      { name: 'JavaScript', jobCount: 625 },
      { name: 'SEO', jobCount: 615 },
      { name: 'Digital Marketing', jobCount: 599 },
      { name: 'Web Design', jobCount: 576 },
      { name: 'Adobe Illustrator', jobCount: 461 },
      { name: 'WordPress', jobCount: 404 },
      { name: 'React', jobCount: 380 },
      { name: 'Node.js', jobCount: 342 },
      { name: 'Python', jobCount: 298 },
    ]
  },
  {
    id: 'writing-content',
    name: 'Writing & Content',
    icon: '✍️',
    skills: [
      { name: 'Content Writing', jobCount: 850 },
      { name: 'Copywriting', jobCount: 720 },
      { name: 'Blog Writing', jobCount: 650 },
      { name: 'Technical Writing', jobCount: 430 },
      { name: 'Proofreading', jobCount: 380 },
    ]
  },
  {
    id: 'design-media-architecture',
    name: 'Design, Media & Architecture',
    icon: '🎨',
    skills: [
      { name: 'Graphic Design', jobCount: 920 },
      { name: 'Logo Design', jobCount: 780 },
      { name: 'Photoshop', jobCount: 650 },
      { name: 'UI/UX Design', jobCount: 540 },
      { name: 'Video Editing', jobCount: 480 },
    ]
  },
  {
    id: 'data-entry-admin',
    name: 'Data Entry & Admin',
    icon: '📊',
    skills: [
      { name: 'Data Entry', jobCount: 1200 },
      { name: 'Excel', jobCount: 890 },
      { name: 'Virtual Assistant', jobCount: 670 },
      { name: 'Data Analysis', jobCount: 520 },
    ]
  },
  {
    id: 'engineering-science',
    name: 'Engineering & Science',
    icon: '🔬',
    skills: [
      { name: 'Machine Learning', jobCount: 420 },
      { name: 'Data Science', jobCount: 380 },
      { name: 'Artificial Intelligence', jobCount: 290 },
      { name: 'Blockchain', jobCount: 180 },
    ]
  },
  {
    id: 'sales-marketing',
    name: 'Sales & Marketing',
    icon: '📈',
    skills: [
      { name: 'Social Media Marketing', jobCount: 780 },
      { name: 'Facebook Ads', jobCount: 650 },
      { name: 'Google Ads', jobCount: 580 },
      { name: 'Email Marketing', jobCount: 420 },
    ]
  },
  {
    id: 'business-accounting',
    name: 'Business, Accounting, Human Resources & Legal',
    icon: '💼',
    skills: [
      { name: 'Bookkeeping', jobCount: 520 },
      { name: 'Accounting', jobCount: 480 },
      { name: 'Business Consulting', jobCount: 350 },
      { name: 'Legal Writing', jobCount: 280 },
    ]
  },
  {
    id: 'product-sourcing',
    name: 'Product Sourcing & Manufacturing',
    icon: '🏭',
    skills: [
      { name: 'Product Sourcing', jobCount: 220 },
      { name: 'Manufacturing', jobCount: 180 },
      { name: 'Supply Chain', jobCount: 150 },
    ]
  },
  {
    id: 'mobile-computing',
    name: 'Mobile Phones & Computing',
    icon: '📱',
    skills: [
      { name: 'iOS Development', jobCount: 380 },
      { name: 'Android Development', jobCount: 350 },
      { name: 'Mobile App Development', jobCount: 520 },
      { name: 'Flutter', jobCount: 280 },
    ]
  },
];

export function SkillSelection({ selectedSkills, onUpdate }: SkillSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSkills, setCurrentSkills] = useState<string[]>(selectedSkills);

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
  const maxSkills = 20;

  // Initialize state from props only once
  useEffect(() => {
    setCurrentSkills(selectedSkills);
  }, []); // Empty dependency array - only run once

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSearchTerm('');
    onUpdate({ 
      selectedSkills: currentSkills
    });
  };

  const handleSkillToggle = (skillName: string) => {
    let newSkills: string[];
    if (currentSkills.includes(skillName)) {
      newSkills = currentSkills.filter(name => name !== skillName);
    } else if (currentSkills.length < maxSkills) {
      newSkills = [...currentSkills, skillName];
    } else {
      return; // Can't add more skills
    }
    
    setCurrentSkills(newSkills);
    onUpdate({ 
      selectedSkills: newSkills
    });
  };

  const filteredSkills = selectedCategoryData?.skills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getSkillName = (skillName: string) => {
    // Since we're now using skill names directly, just return the name
    return skillName;
  };

  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <p className="text-muted-foreground">OR</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Select a category</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
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
                        {category.skills.length} skills available
                      </p>
                    </div>
                    <div className="ml-auto">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <span className="sr-only">Select category</span>
                        →
                      </Button>
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
      {/* Selected Skills Summary */}
      {currentSkills.length > 0 && (
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Selected Skills</h3>
            <span className="text-sm text-muted-foreground">
              {currentSkills.length} out of {maxSkills} skills selected
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {currentSkills.map((skillName) => (
              <Badge
                key={skillName}
                variant="secondary"
                className="flex items-center space-x-1"
              >
                <span>{skillName}</span>
                <button
                  onClick={() => handleSkillToggle(skillName)}
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
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedCategory('')}
        >
          Change Category
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search a skill"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Skills Grid */}
      <div className="space-y-3">
        {filteredSkills.map((skill) => {
          const isSelected = currentSkills.includes(skill.name);
          const canSelect = currentSkills.length < maxSkills || isSelected;

          return (
            <div
              key={skill.name}
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : canSelect 
                    ? 'hover:border-primary/50 hover:bg-muted/50' 
                    : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => canSelect && handleSkillToggle(skill.name)}
            >
              <div className="flex items-center space-x-3">
                <span className="font-medium">{skill.name}</span>
                <span className="text-sm text-muted-foreground">
                  ({skill.jobCount} jobs)
                </span>
              </div>
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
        {currentSkills.length} of {maxSkills} skills selected
      </div>
    </div>
  );
}
