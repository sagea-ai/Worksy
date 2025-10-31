import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";

interface FeatureProps {
  title: string;
  description: string;
  image: string;
}

const features: FeatureProps[] = [
  {
    title: "Unified Workspace",
    description:
      "One workspace for all clients (direct and marketplaces). Manage your entire freelance business from a single dashboard.",
    image: "/assets/looking-ahead.png",
  },
  {
    title: "Platform Aggregation", 
    description:
      "Aggregates 5+ major freelance marketplaces for unlimited demand. Never miss an opportunity again.",
    image: "/assets/reflecting.png",
  },
  {
    title: "AI-Powered Delivery",
    description:
      "AI agents power 80% of delivery (humans only where it matters). Focus on high-value work while AI handles the rest.",
    image: "/assets/growth.png",
  },
];

const featureList: string[] = [
  "Multi-platform integration",
  "Automated bidding",
  "AI proposal generation",
  "Client communication management",
  "Revenue tracking",
  "Performance analytics",
  "Smart project matching",
  "Competitive pricing analysis",
];

export const Features = () => {
  return (
    <section
      id="features"
      className="container py-24 sm:py-32 space-y-8"
    >
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        Powerful{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          AI Features
        </span>
      </h2>

      <div className="flex flex-wrap md:justify-center gap-4">
        {featureList.map((feature: string) => (
          <div key={feature}>
            <Badge
              variant="secondary"
              className="text-sm"
            >
              {feature}
            </Badge>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map(({ title, description, image }: FeatureProps) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>

            <CardContent>{description}</CardContent>

            <CardFooter>
              <Image
                src={image}
                alt="About feature"
                width={300}
                height={200}
                className="w-[200px] lg:w-[300px] mx-auto"
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};
