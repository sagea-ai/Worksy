"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

interface CompanyInfoProps {
  companyName: string;
  companyDescription: string;
  onUpdate: (updates: Partial<HirerOnboardingData>) => void;
}

export function CompanyInfo({ companyName, companyDescription, onUpdate }: CompanyInfoProps) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-base">
          Company Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="companyName"
          placeholder="Enter your company name"
          value={companyName}
          onChange={(e) => onUpdate({ companyName: e.target.value })}
          className="h-12"
        />
        <p className="text-sm text-muted-foreground">
          The name of your company or organization
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyDescription" className="text-base">
          Company Description
        </Label>
        <Textarea
          id="companyDescription"
          placeholder="Tell us about your company, what you do, and your mission..."
          value={companyDescription}
          onChange={(e) => onUpdate({ companyDescription: e.target.value })}
          className="min-h-32 resize-none"
        />
        <p className="text-sm text-muted-foreground">
          A brief description of your company helps candidates understand your business
        </p>
      </div>
    </div>
  );
}

