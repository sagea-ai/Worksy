"use client";

import { Button } from "../ui/button";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export const Cta = () => {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  };

  return (
    <section
      id="cta"
      className="bg-muted/50 py-16 my-24 sm:my-32 w-full"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 lg:grid lg:grid-cols-2 place-items-center">
        <div className="lg:col-start-1">
          <h2 className="text-3xl md:text-4xl font-bold ">
            All Your
            <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
              {" "}
              Freelance Platforms{" "}
            </span>
            In One Dashboard
          </h2>
          <p className="text-muted-foreground text-xl mt-4 mb-8 lg:mb-0">
            Manage Upwork, Fiverr, Freelancer, Guru, and PeoplePerHour from a single 
            interface. Track performance, analyze wins, and optimize your strategy 
            across all platforms with AI-powered insights.
          </p>
        </div>

        <div className="space-y-4 lg:col-start-2">
          {isSignedIn ? (
            <Button 
              className="w-full md:mr-4 md:w-auto" 
              onClick={handleGetStarted}
            >
              Go to Dashboard
            </Button>
          ) : (
            <SignUpButton mode="modal">
              <Button className="w-full md:mr-4 md:w-auto">
                Start Free Trial
              </Button>
            </SignUpButton>
          )}
          <Button
            variant="outline"
            className="w-full md:w-auto"
          >
            Watch Demo
          </Button>
        </div>
      </div>
    </section>
  );
};
