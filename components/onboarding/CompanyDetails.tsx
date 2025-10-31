"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HirerOnboardingData {
  companyName?: string;
  companyDescription?: string;
  companySize?: string;
  industry?: string;
  hiringNeeds?: string[];
  typicalBudgetMin?: number;
  typicalBudgetMax?: number;
  preferredRemote?: boolean;
  typicalProjectDuration?: string;
}

interface CompanyDetailsProps {
  companySize: string;
  industry: string;
  onUpdate: (updates: Partial<HirerOnboardingData>) => void;
}

const companySizes = [
  { value: "1", label: "Just me (Solo founder)" },
  { value: "2-10", label: "2-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "500+", label: "500+ employees" },
];

const industries = [
  { value: "technology", label: "Technology & Software" },
  { value: "marketing", label: "Marketing & Advertising" },
  { value: "design", label: "Design & Creative" },
  { value: "ecommerce", label: "E-commerce & Retail" },
  { value: "finance", label: "Finance & Banking" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "consulting", label: "Consulting" },
  { value: "real-estate", label: "Real Estate" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "media", label: "Media & Entertainment" },
  { value: "nonprofit", label: "Non-profit" },
  { value: "other", label: "Other" },
];

export function CompanyDetails({ companySize, industry, onUpdate }: CompanyDetailsProps) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-2">
        <Label htmlFor="companySize" className="text-base">
          Company Size <span className="text-destructive">*</span>
        </Label>
        <Select value={companySize} onValueChange={(value) => onUpdate({ companySize: value })}>
          <SelectTrigger id="companySize" className="h-12">
            <SelectValue placeholder="Select your company size" />
          </SelectTrigger>
          <SelectContent>
            {companySizes.map((size) => (
              <SelectItem key={size.value} value={size.value}>
                {size.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          This helps us understand your hiring needs and scale
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry" className="text-base">
          Industry <span className="text-destructive">*</span>
        </Label>
        <Select value={industry} onValueChange={(value) => onUpdate({ industry: value })}>
          <SelectTrigger id="industry" className="h-12">
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {industries.map((ind) => (
              <SelectItem key={ind.value} value={ind.value}>
                {ind.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          The primary industry your company operates in
        </p>
      </div>
    </div>
  );
}

