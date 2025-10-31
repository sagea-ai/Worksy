"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { OnboardingData } from '@/app/onboarding/page';

interface RatePreferencesProps {
  hourlyRateMin: number;
  hourlyRateMax: number;
  availability: string;
  onUpdate: (updates: Partial<OnboardingData>) => void;
}

const availabilityOptions = [
  {
    id: 'full-time',
    title: 'Full-time',
    description: '30+ hours per week',
    icon: '🕒'
  },
  {
    id: 'part-time',
    title: 'Part-time',
    description: '15-30 hours per week',
    icon: '⏰'
  },
  {
    id: 'project-based',
    title: 'Project-based',
    description: 'Flexible hours based on project needs',
    icon: '📋'
  }
];

export function RatePreferences({ 
  hourlyRateMin, 
  hourlyRateMax, 
  availability, 
  onUpdate 
}: RatePreferencesProps) {
  const [minRate, setMinRate] = useState(hourlyRateMin || '');
  const [maxRate, setMaxRate] = useState(hourlyRateMax || '');

  const handleMinRateChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setMinRate(value);
    onUpdate({ hourlyRateMin: numValue });
  };

  const handleMaxRateChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setMaxRate(value);
    onUpdate({ hourlyRateMax: numValue });
  };

  const handleAvailabilityChange = (value: string) => {
    onUpdate({ availability: value });
  };

  return (
    <div className="space-y-8">
      {/* Hourly Rate Range */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>💰</span>
            <span>Hourly Rate Range</span>
          </CardTitle>
          <CardDescription>
            Set your minimum and maximum hourly rates. Our AI will only bid on projects within this range.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="min-rate">Minimum Rate ($/hour)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="min-rate"
                  type="number"
                  placeholder="15"
                  value={minRate}
                  onChange={(e) => handleMinRateChange(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="max-rate">Maximum Rate ($/hour)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="max-rate"
                  type="number"
                  placeholder="100"
                  value={maxRate}
                  onChange={(e) => handleMaxRateChange(e.target.value)}
                  className="pl-8"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Rate Display */}
          {minRate && maxRate && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium">Rate Range: ${minRate} - ${maxRate} per hour</p>
              <p className="text-xs text-muted-foreground mt-1">
                Based on your range, you could earn ${(parseFloat(String(minRate)) * 20).toFixed(0)} - ${(parseFloat(String(maxRate)) * 40).toFixed(0)} per week
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>📅</span>
            <span>Availability</span>
          </CardTitle>
          <CardDescription>
            How much time can you dedicate to freelance work per week?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={availability} onValueChange={handleAvailabilityChange}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availabilityOptions.map((option) => (
                <div key={option.id} className="relative">
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.id}
                    className={`flex flex-col items-center justify-center p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary/5 hover:border-primary/50 ${
                      availability === option.id ? 'border-primary bg-primary/5' : 'border-muted'
                    }`}
                  >
                    <span className="text-3xl mb-2">{option.icon}</span>
                    <span className="font-medium">{option.title}</span>
                    <span className="text-sm text-muted-foreground text-center mt-1">
                      {option.description}
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          {availability && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium">
                Selected: {availabilityOptions.find(opt => opt.id === availability)?.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Our AI will prioritize projects that match your availability preferences.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {minRate && maxRate && availability && (
        <div className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
          <h3 className="font-semibold text-primary mb-2">🎯 Your Freelance Profile</h3>
          <div className="space-y-1 text-sm">
            <p><strong>Rate Range:</strong> ${minRate} - ${maxRate} per hour</p>
            <p><strong>Availability:</strong> {availabilityOptions.find(opt => opt.id === availability)?.title}</p>
            <p className="text-muted-foreground mt-2">
              Ready to start automating your freelance business with these preferences!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
