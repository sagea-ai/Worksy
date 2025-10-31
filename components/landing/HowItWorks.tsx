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
    title: "Analyze Competition",
    description:
      "Understand what you're competing against. AI analyzes successful proposals, pricing patterns, and market positioning across platforms.",
  },
  {
    icon: <MapIcon />,
    title: "Strategic Discovery", 
    description:
      "Find opportunities where Nepali tech talents have the best chance to win. AI matches projects to your competitive advantages.",
  },
  {
    icon: <PlaneIcon />,
    title: "Precision Bidding",
    description:
      "AI crafts proposals that position you strategically against established competitors, highlighting your unique value proposition.",
  },
  {
    icon: <GiftIcon />,
    title: "Competitive Edge",
    description:
      "Monitor your success rate against global competition and continuously optimize your market positioning strategy.",
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
        Get started with Worksy in four strategic steps and transform from underdog to market contender using competitive intelligence.
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
