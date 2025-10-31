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
                Worksy
              </h2>
              <p className="text-xl text-muted-foreground mt-4">
                We're empowering Nepali tech talents to compete and win in the global freelance marketplace. 
                While others were born and bred in the freelance darkness, we help you become the David that 
                beats the Goliaths. Our AI-powered platform levels the playing field by automating job discovery, 
                intelligent proposal crafting, and strategic market analysis across major platforms like 
                Freelancer, Upwork, and more.
              </p>
            </div>

            {/* <Statistics /> */}
          </div>
        </div>
      </div>
    </section>
  );
};
