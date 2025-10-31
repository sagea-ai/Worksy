"use client";

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { SkillSelection } from '@/components/onboarding/SkillSelection';
import { ExperienceLevel } from '@/components/onboarding/ExperienceLevel';
import { PlatformPreferences } from '@/components/onboarding/PlatformPreferences';
import { RatePreferences } from '@/components/onboarding/RatePreferences';
import { UserTypeSelection } from '@/components/onboarding/UserTypeSelection';
import { CompanyInfo } from '@/components/onboarding/CompanyInfo';
import { CompanyDetails } from '@/components/onboarding/CompanyDetails';
import { PositionTypes } from '@/components/onboarding/PositionTypes';
import { HiringNeeds } from '@/components/onboarding/HiringNeeds';
import { HirerBudgetPreferences } from '@/components/onboarding/HirerBudgetPreferences';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { initiateFreelancerOAuth, isFreelancerOAuthConfigured } from '@/lib/freelancer-oauth';
import {
  IconBrandLinkedin,
  IconEdit,
  IconExternalLink,
  IconRocket,
  IconPlayerSkipForward,
  IconSettings
} from '@tabler/icons-react';

export interface OnboardingData {
  userType: "STUDENT" | "HIRER" | "";
  // Student fields
  selectedSkills: string[];
  experienceLevel: string;
  preferredPlatforms: string[];
  hourlyRateMin: number;
  hourlyRateMax: number;
  availability: string;
  // Hirer fields
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

const STUDENT_STEPS = [
  { id: 'skills', title: 'Tell us your top skills', subtitle: 'This helps us recommend jobs for you.' },
  { id: 'experience', title: 'What\'s your experience level?', subtitle: 'This helps us match you with appropriate projects.' },
  { id: 'platforms', title: 'Which platforms do you use?', subtitle: 'We\'ll focus on these platforms for automation.' },
  { id: 'rates', title: 'Set your rate preferences', subtitle: 'This helps us bid within your desired range.' },
];

const HIRER_STEPS = [
  { id: 'company-info', title: 'Tell us about your company', subtitle: 'Help us understand your business.' },
  { id: 'company-details', title: 'Company size and industry', subtitle: 'This helps us personalize your experience.' },
  { id: 'position-types', title: 'What types of positions do you post?', subtitle: 'Select the types of opportunities you offer.' },
  { id: 'hiring-needs', title: 'What do you hire for?', subtitle: 'Select the skills and expertise you typically look for.' },
  { id: 'budget-preferences', title: 'Budget and project preferences', subtitle: 'Set your typical budget range and work preferences.' },
];

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <LoadingScreen 
        title="Loading onboarding..."
        subtitle="Setting up your experience"
      />
    }>
      <OnboardingPageContent />
    </Suspense>
  );
}

function OnboardingPageContent() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showManualForm, setShowManualForm] = useState(false);
  const [userTypeSelected, setUserTypeSelected] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    userType: "",
    selectedSkills: [],
    experienceLevel: '',
    preferredPlatforms: [],
    hourlyRateMin: 0,
    hourlyRateMax: 0,
    availability: '',
    companyName: '',
    companyDescription: '',
    companySize: '',
    industry: '',
    positionTypes: [],
    hiringNeeds: [],
    typicalBudgetMin: 0,
    typicalBudgetMax: 0,
    preferredRemote: undefined,
    typicalProjectDuration: '',
  });

  useEffect(() => {
    if (isLoaded && user) {
      // Check for OAuth error from URL params
      const error = searchParams.get('error');
      if (error === 'oauth_failed') {
        setOauthError('Failed to connect Freelancer account. You can set up manually below.');
      }
      
      const timer = setTimeout(() => {
        setIsPageReady(true);
      }, 300); 
      
      return () => clearTimeout(timer);
    }
  }, [isLoaded, user, searchParams]);

  const handleFreelancerConnect = useCallback(() => {
    if (!isFreelancerOAuthConfigured()) {
      setOauthError('Freelancer integration is not configured. Please use manual setup.');
      setShowManualForm(true);
      return;
    }

    try {
      console.log('🔗 Initiating Freelancer OAuth...');
      initiateFreelancerOAuth();
    } catch (error) {
      console.error('❌ OAuth initiation failed:', error);
      setOauthError('Failed to start OAuth flow. Please try manual setup.');
      setShowManualForm(true);
    }
  }, []);

  const handleSkipToDeals = useCallback(() => {
    router.push('/deals');
  }, [router]);

  const updateOnboardingData = useCallback((updates: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...updates }));
  }, []);

  const handleUserTypeSelect = useCallback((type: "STUDENT" | "HIRER") => {
    updateOnboardingData({ userType: type });
    setUserTypeSelected(true);
    setShowManualForm(true);
    setCurrentStep(0);
  }, [updateOnboardingData]);

  const getCurrentSteps = useCallback(() => {
    if (onboardingData.userType === "STUDENT") return STUDENT_STEPS;
    if (onboardingData.userType === "HIRER") return HIRER_STEPS;
    return [];
  }, [onboardingData.userType]);

  const handleNext = useCallback(() => {
    const steps = getCurrentSteps();
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  }, [currentStep, getCurrentSteps]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else if (userTypeSelected) {
      // Go back to user type selection
      setUserTypeSelected(false);
      setShowManualForm(false);
      updateOnboardingData({ userType: "" });
    }
  }, [currentStep, userTypeSelected, updateOnboardingData]);

  const isStepValid = useCallback(() => {
    const steps = getCurrentSteps();
    if (onboardingData.userType === "STUDENT") {
      switch (currentStep) {
        case 0: return onboardingData.selectedSkills.length > 0;
        case 1: return !!onboardingData.experienceLevel;
        case 2: return onboardingData.preferredPlatforms.length > 0;
        case 3: return !!onboardingData.hourlyRateMin && !!onboardingData.hourlyRateMax && !!onboardingData.availability;
        default: return false;
      }
    } else if (onboardingData.userType === "HIRER") {
      switch (currentStep) {
        case 0: return !!onboardingData.companyName;
        case 1: return !!onboardingData.companySize && !!onboardingData.industry;
        case 2: return onboardingData.positionTypes && onboardingData.positionTypes.length > 0;
        case 3: return onboardingData.hiringNeeds && onboardingData.hiringNeeds.length > 0;
        case 4: return !!onboardingData.typicalBudgetMin && !!onboardingData.typicalBudgetMax && !!onboardingData.typicalProjectDuration && onboardingData.preferredRemote !== undefined;
        default: return false;
      }
    }
    return false;
  }, [currentStep, onboardingData, getCurrentSteps]);

  const handleSubmit = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...onboardingData,
          source: 'manual'
        }),
      });

      if (response.ok) {
        console.log('✅ Manual onboarding completed');
        router.push('/deals?onboarded=manual');
      } else {
        throw new Error('Failed to save onboarding data');
      }
    } catch (error) {
      console.error('❌ Error submitting onboarding:', error);
      // Could show an error toast here
    } finally {
      setIsLoading(false);
    }
  }, [onboardingData, router]);

  if (!isLoaded || !isPageReady) {
    return (
      <LoadingScreen 
        title="Setting up your workspace..."
        subtitle="Get ready to supercharge your freelance career"
      />
    );
  }

  // Show user type selection if not selected yet
  if (!userTypeSelected && !showManualForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome to Worksy</h1>
            <p className="text-lg text-muted-foreground">Let's get started - choose how you'd like to use our platform</p>
          </div>
          <UserTypeSelection
            selectedType={onboardingData.userType as "STUDENT" | "HIRER" | ""}
            onSelect={handleUserTypeSelect}
          />
        </div>
      </div>
    );
  }

  // Show manual onboarding form
  if (showManualForm && userTypeSelected) {
    const steps = getCurrentSteps();
    return (
      <OnboardingLayout
        currentStep={currentStep}
        totalSteps={steps.length}
        title={steps[currentStep].title}
        subtitle={steps[currentStep].subtitle}
        isLoading={isLoading}
        onNext={handleNext}
        onBack={handleBack}
        canProceed={Boolean(isStepValid())}
        isLastStep={currentStep === steps.length - 1}
      >
        {onboardingData.userType === "STUDENT" && (
          <>
            {currentStep === 0 && (
              <SkillSelection
                selectedSkills={onboardingData.selectedSkills}
                onUpdate={updateOnboardingData}
              />
            )}
            {currentStep === 1 && (
              <ExperienceLevel
                selectedLevel={onboardingData.experienceLevel}
                onUpdate={updateOnboardingData}
              />
            )}
            {currentStep === 2 && (
              <PlatformPreferences
                selectedPlatforms={onboardingData.preferredPlatforms}
                onUpdate={updateOnboardingData}
              />
            )}
            {currentStep === 3 && (
              <RatePreferences
                hourlyRateMin={onboardingData.hourlyRateMin}
                hourlyRateMax={onboardingData.hourlyRateMax}
                availability={onboardingData.availability}
                onUpdate={updateOnboardingData}
              />
            )}
          </>
        )}
        {onboardingData.userType === "HIRER" && (
          <>
            {currentStep === 0 && (
              <CompanyInfo
                companyName={onboardingData.companyName || ''}
                companyDescription={onboardingData.companyDescription || ''}
                onUpdate={updateOnboardingData}
              />
            )}
            {currentStep === 1 && (
              <CompanyDetails
                companySize={onboardingData.companySize || ''}
                industry={onboardingData.industry || ''}
                onUpdate={updateOnboardingData}
              />
            )}
            {currentStep === 2 && (
              <PositionTypes
                positionTypes={onboardingData.positionTypes || []}
                onUpdate={updateOnboardingData}
              />
            )}
            {currentStep === 3 && (
              <HiringNeeds
                hiringNeeds={onboardingData.hiringNeeds || []}
                onUpdate={updateOnboardingData}
              />
            )}
            {currentStep === 4 && (
              <HirerBudgetPreferences
                typicalBudgetMin={onboardingData.typicalBudgetMin || 0}
                typicalBudgetMax={onboardingData.typicalBudgetMax || 0}
                preferredRemote={onboardingData.preferredRemote}
                typicalProjectDuration={onboardingData.typicalProjectDuration || ''}
                onUpdate={updateOnboardingData}
              />
            )}
          </>
        )}
      </OnboardingLayout>
    );
  }

  // Show initial choice screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-card/95 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <IconRocket className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome to Worksy</CardTitle>
          <CardDescription className="text-base">
            Let's get you set up in seconds and start winning projects
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-2">
          {/* OAuth Error Message */}
          {oauthError && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">{oauthError}</p>
            </div>
          )}

          {/* Primary Option: OAuth */}
          {isFreelancerOAuthConfigured() && (
            <Button 
              onClick={handleFreelancerConnect}
              className="w-full h-14 text-left flex items-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              <div className="flex-1">
                <div className="font-semibold">Connect Freelancer Account</div>
                <div className="text-xs opacity-80">Auto-fill profile & sync your work history</div>
              </div>
              <IconExternalLink className="h-4 w-4 opacity-80" />
            </Button>
          )}
          
          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-sm text-muted-foreground bg-background px-2 rounded">OR</span>
            <Separator className="flex-1" />
          </div>
          
          {/* Secondary Option: Manual */}
          <Button 
            onClick={() => setShowManualForm(true)}
            variant="outline" 
            className="w-full h-12 border-2 hover:bg-muted/50 transition-colors"
            size="lg"
          >
            <IconEdit className="h-5 w-5 mr-3" />
            <div>
              <div className="font-medium">Quick Manual Setup</div>
              <div className="text-xs text-muted-foreground">2 minutes to complete</div>
            </div>
          </Button>
          
          <Separator />
          
          {/* Skip Option */}
          <Button 
            onClick={handleSkipToDeals}
            variant="ghost" 
            className="w-full text-muted-foreground hover:text-foreground"
            size="sm"
          >
            <IconPlayerSkipForward className="h-4 w-4 mr-2" />
            Skip setup and explore jobs
          </Button>
          
          {/* Benefits */}
          <div className="pt-2">
            <p className="text-xs text-muted-foreground text-center mb-3">
              Setting up helps us provide:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Badge variant="secondary" className="justify-center py-1">
                <IconSettings className="h-3 w-3 mr-1" />
                Better job matches
              </Badge>
              <Badge variant="secondary" className="justify-center py-1">
                <IconRocket className="h-3 w-3 mr-1" />
                AI-powered insights
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
