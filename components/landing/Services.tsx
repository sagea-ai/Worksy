import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { MagnifierIcon, WalletIcon, ChartIcon } from "../Icons";
import Image from "next/image";

interface ServiceProps {
  title: string;
  description: string;
  icon: React.ReactElement;
}

const serviceList: ServiceProps[] = [
  {
    title: "Smart Bidding Engine",
    description:
      "AI analyzes project requirements, competition, and success rates to submit optimal bids automatically across all connected platforms.",
    icon: <ChartIcon />,
  },
  {
    title: "Proposal Generation",
    description:
      "Generate personalized, compelling proposals using AI that understands client needs and your unique value proposition.",
    icon: <WalletIcon />,
  },
  {
    title: "Multi-Platform Management",
    description:
      "Centralized dashboard to monitor all your freelance activities, from bid tracking to client communications across 5+ marketplaces.",
    icon: <MagnifierIcon />,
  },
];

export const Services = () => {
  return (
    <section className="container py-24 sm:py-32">
      <div className="grid lg:grid-cols-[1fr,1fr] gap-8 place-items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold">
            <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
              AI-Powered{" "}
            </span>
            Services
          </h2>

          <p className="text-muted-foreground text-xl mt-4 mb-8 ">
            Comprehensive automation tools designed to maximize your freelance success and streamline your workflow.
          </p>

          <div className="flex flex-col gap-8">
            {serviceList.map(({ icon, title, description }: ServiceProps) => (
              <Card key={title}>
                <CardHeader className="space-y-1 flex md:flex-row justify-start items-start gap-4">
                  <div className="mt-1 bg-primary/20 p-1 rounded-2xl">
                    {icon}
                  </div>
                  <div>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription className="text-md mt-2">
                      {description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <Image
          src="/assets/cube-leg.png"
          width={600}
          height={400}
          className="w-[300px] md:w-[500px] lg:w-[600px] object-contain"
          alt="About services"
        />
      </div>
    </section>
  );
};
