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
    title: "Competitive Intelligence",
    description:
      "Understand exactly what you're competing against. Analyze winning proposals, pricing strategies, and market positioning from one dashboard.",
    image: "/assets/looking-ahead.png",
  },
  {
    title: "Global Market Access", 
    description:
      "Access 5+ major freelance marketplaces with equal footing. No more geographic disadvantages or cultural barriers.",
    image: "/assets/reflecting.png",
  },
  {
    title: "AI-Powered Advantage",
    description:
      "Level the playing field with AI that crafts winning proposals, analyzes competition, and positions you strategically against established freelancers.",
    image: "/assets/growth.png",
  },
];

const featureList: string[] = [
  "Competitive analysis",
  "Market positioning",
  "AI proposal crafting",
  "Strategic bidding",
  "Global market access",
  "Performance benchmarking",
  "Smart opportunity matching",
  "Pricing intelligence",
];

export const Features = () => {
  return (
    <section
      id="features"
      className="container py-24 sm:py-32 space-y-8"
    >
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        Competitive{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          AI Advantage
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
