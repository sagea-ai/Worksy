import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { MedalIcon, MapIcon, PlaneIcon, GiftIcon } from "../Icons";

interface FeatureProps {
  icon: React.ReactElement;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: <MedalIcon />,
    title: "Connect Platforms",
    description:
      "Securely link your freelance marketplace accounts. Our platform integrates with Freelancer, Upwork, and more.",
  },
  {
    icon: <MapIcon />,
    title: "AI Discovery", 
    description:
      "Our AI agents continuously scan for projects matching your skills, budget, and preferences across all platforms.",
  },
  {
    icon: <PlaneIcon />,
    title: "Smart Bidding",
    description:
      "AI generates personalized proposals and automatically submits competitive bids based on market analysis.",
  },
  {
    icon: <GiftIcon />,
    title: "Automated Management",
    description:
      "Track applications, manage client communications, and monitor project progress from one unified dashboard.",
  },
];

export const HowItWorks = () => {
  return (
    <section
      id="howItWorks"
      className="container text-center py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold ">
        How It{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Works{" "}
        </span>
        Step-by-Step Guide
      </h2>
      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
        Get started with Gigstar AI in four simple steps and transform your freelance business with intelligent automation.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon, title, description }: FeatureProps) => (
          <Card
            key={title}
            className="bg-muted/50"
          >
            <CardHeader>
              <CardTitle className="grid gap-4 place-items-center">
                {icon}
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
