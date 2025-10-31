"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle: string;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
  isLastStep: boolean;
  isLoading: boolean;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  title,
  subtitle,
  onNext,
  onBack,
  canProceed,
  isLastStep,
  isLoading,
}: OnboardingLayoutProps) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-white dark:bg-background">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold">
                <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                  Worksy
                </span>
              </h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Step Title */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{title}</h2>
            <p className="text-xl text-muted-foreground">{subtitle}</p>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {children}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={currentStep === 0}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>

            <Button
              onClick={onNext}
              disabled={!canProceed || isLoading}
              className="flex items-center space-x-2"
            >
              <span>{isLastStep ? 'Complete Setup' : 'Next'}</span>
              {!isLastStep && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
