"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

interface HirerBudgetPreferencesProps {
  typicalBudgetMin: number;
  typicalBudgetMax: number;
  preferredRemote: boolean | undefined;
  typicalProjectDuration: string;
  onUpdate: (updates: Partial<HirerOnboardingData>) => void;
}

const projectDurations = [
  { value: "1-week", label: "Less than 1 week" },
  { value: "2-4-weeks", label: "2-4 weeks" },
  { value: "1-3-months", label: "1-3 months" },
  { value: "3-6-months", label: "3-6 months" },
  { value: "6-months+", label: "6 months or more" },
];

export function HirerBudgetPreferences({
  typicalBudgetMin,
  typicalBudgetMax,
  preferredRemote,
  typicalProjectDuration,
  onUpdate,
}: HirerBudgetPreferencesProps) {
  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Budget Range */}
      <div className="space-y-4">
        <div>
          <Label className="text-base mb-4 block">Typical Budget/Compensation Range</Label>
          <p className="text-sm text-muted-foreground mb-4">
            What budget or compensation range do you typically work with? (Projects for freelancers, stipends/salary for internships and jobs)
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budgetMin">Minimum (USD)</Label>
            <Input
              id="budgetMin"
              type="number"
              placeholder="e.g. 500"
              value={typicalBudgetMin || ''}
              onChange={(e) => onUpdate({ typicalBudgetMin: parseFloat(e.target.value) || 0 })}
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="budgetMax">Maximum (USD)</Label>
            <Input
              id="budgetMax"
              type="number"
              placeholder="e.g. 5000"
              value={typicalBudgetMax || ''}
              onChange={(e) => onUpdate({ typicalBudgetMax: parseFloat(e.target.value) || 0 })}
              className="h-12"
            />
          </div>
        </div>
      </div>

      {/* Remote Preference */}
      <div className="space-y-4">
        <div>
          <Label className="text-base mb-4 block">Work Location Preference</Label>
          <p className="text-sm text-muted-foreground mb-4">
            Do you prefer remote workers or on-site?
          </p>
        </div>
        <RadioGroup
          value={preferredRemote === true ? "remote" : preferredRemote === false ? "onsite" : ""}
          onValueChange={(value) => onUpdate({ preferredRemote: value === "remote" })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Card className="cursor-pointer hover:shadow-lg transition-all">
            <label className="cursor-pointer">
              <RadioGroupItem value="remote" className="sr-only" />
              <CardContent className="p-6 pt-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl">🌐</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Remote</CardTitle>
                    <CardDescription>
                      Work from anywhere in the world
                    </CardDescription>
                  </div>
                </div>
              </CardContent>
            </label>
          </Card>
          <Card className="cursor-pointer hover:shadow-lg transition-all">
            <label className="cursor-pointer">
              <RadioGroupItem value="onsite" className="sr-only" />
              <CardContent className="p-6 pt-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl">🏢</span>
                  </div>
                  <div>
                    <CardTitle className="text-lg">On-site</CardTitle>
                    <CardDescription>
                      Prefer candidates to work on-site
                    </CardDescription>
                  </div>
                </div>
              </CardContent>
            </label>
          </Card>
        </RadioGroup>
      </div>

      {/* Project Duration */}
      <div className="space-y-4">
        <div>
          <Label className="text-base mb-4 block">Typical Position Duration</Label>
          <p className="text-sm text-muted-foreground mb-4">
            How long do your positions typically last? (For internships and jobs, this refers to contract length)
          </p>
        </div>
        <RadioGroup
          value={typicalProjectDuration}
          onValueChange={(value) => onUpdate({ typicalProjectDuration: value })}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {projectDurations.map((duration) => (
            <Card
              key={duration.value}
              className={`cursor-pointer hover:shadow-lg transition-all ${
                typicalProjectDuration === duration.value
                  ? 'border-primary bg-primary/5'
                  : ''
              }`}
              onClick={() => onUpdate({ typicalProjectDuration: duration.value })}
            >
              <label className="cursor-pointer">
                <RadioGroupItem value={duration.value} className="sr-only" />
                <CardContent className="p-6 pt-6">
                  <CardTitle className="text-base">{duration.label}</CardTitle>
                </CardContent>
              </label>
            </Card>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}

