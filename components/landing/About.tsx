import { Statistics } from "../Statistics";
import Image from "next/image";

export const About = () => {
  return (
    <section
      id="about"
      className="container py-24 sm:py-32"
    >
      <div className="bg-muted/50 border rounded-lg py-12">
        <div className="px-6 flex flex-col-reverse md:flex-row gap-8 md:gap-12">
          <Image
            src="/assets/pilot.png"
            alt="About us"
            width={300}
            height={300}
            className="w-[300px] object-contain rounded-lg"
          />
          <div className="bg-green-0 flex flex-col justify-between">
            <div className="pb-6">
              <h2 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
                  About{" "}
                </span>
                Gigstar AI
              </h2>
              <p className="text-xl text-muted-foreground mt-4">
                We're revolutionizing the freelance industry by connecting talented professionals 
                with opportunities through intelligent automation. Our AI-powered platform helps 
                freelancers and agencies scale their businesses by automating job discovery, 
                proposal generation, and client communication across major marketplaces like 
                Freelancer, Upwork, and more.
              </p>
            </div>

            <Statistics />
          </div>
        </div>
      </div>
    </section>
  );
};
