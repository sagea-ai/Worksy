"use client";

import { Button } from "../ui/button";
import { HeroCards } from "../HeroCards";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export const Hero = () => {
  const { isSignedIn } = useUser();
  const router = useRouter();

  const handleGetStarted = () => {
    if (isSignedIn) {
      router.push("/dashboard");
    }
  };
  return (
    <section className="container grid lg:grid-cols-2 place-items-center py-20 md:py-32 gap-10">
      <div className="text-center lg:text-start space-y-6">
        <main className="text-5xl md:text-6xl font-bold">
          <h1 className="inline">
            <span className="inline bg-gradient-to-r from-[#F596D3]  to-[#D247BF] text-transparent bg-clip-text">
              Worksy
            </span>{" "}
            for Nepali tech talents
          </h1>{" "}
          that{" "}
          <h2 className="inline">
            <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
              Beat the Competition
            </span>{" "}
            effortlessly
          </h2>
        </main>

        <p className="text-xl text-muted-foreground md:w-10/12 mx-auto lg:mx-0">
          Level the playing field against global freelancers. AI agents help Nepali tech talents discover opportunities, 
          craft winning proposals, and understand exactly what you're competing for across 5+ major marketplaces.
        </p>

        <div className="space-y-4 md:space-y-0 md:space-x-4">
          {isSignedIn ? (
            <Button 
              className="w-full md:w-1/3" 
              onClick={handleGetStarted}
            >
              Go to Dashboard
            </Button>
          ) : (
            <SignUpButton mode="modal">
              <Button className="w-full md:w-1/3">
                Get Started
              </Button>
            </SignUpButton>
          )}
        </div>
      </div>

      {/* Hero cards sections */}
      <div className="z-10">
        <HeroCards />
      </div>

      {/* Shadow effect */}
      <div className="shadow"></div>
    </section>
  );
};
