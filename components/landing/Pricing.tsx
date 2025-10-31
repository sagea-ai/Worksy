import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

enum PopularPlanType {
  NO = 0,
  YES = 1,
}

interface PricingProps {
  title: string;
  popular: PopularPlanType;
  price: number;
  description: string;
  buttonText: string;
  benefitList: string[];
}

const pricingList: PricingProps[] = [
  {
    title: "Starter",
    popular: 0,
    price: 49,
    description:
      "Perfect for individual freelancers getting started with AI automation",
    buttonText: "Start Free Trial",
    benefitList: [
      "2 Platform connections",
      "50 Auto-bids per month",
      "Basic proposal templates",
      "Email support",
      "Performance analytics",
    ],
  },
  {
    title: "Professional",
    popular: 1,
    price: 149,
    description:
      "Ideal for established freelancers ready to scale their business",
    buttonText: "Start Free Trial",
    benefitList: [
      "5 Platform connections",
      "Unlimited auto-bids",
      "AI-powered proposals",
      "Priority support",
      "Advanced analytics",
      "ROI tracking",
      "Custom bid strategies",
    ],
  },
  {
    title: "Agency",
    popular: 0,
    price: 299,
    description:
      "Built for agencies and teams managing multiple freelancer accounts",
    buttonText: "Contact Sales",
    benefitList: [
      "Unlimited platforms",
      "Multi-user management",
      "White-label options",
      "Dedicated support",
      "Custom integrations",
      "Team collaboration tools",
      "Enterprise security",
    ],
  },
];

export const Pricing = () => {
  return (
    <section
      id="pricing"
      className="container py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-center">
        Choose Your
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          {" "}
          Growth{" "}
        </span>
        Plan
      </h2>
      <h3 className="text-xl text-center text-muted-foreground pt-4 pb-8">
        Start with a 14-day free trial. Scale your freelance business with AI automation that works around the clock.
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pricingList.map((pricing: PricingProps) => (
          <Card
            key={pricing.title}
            className={
              pricing.popular === PopularPlanType.YES
                ? "drop-shadow-xl shadow-black/10 dark:shadow-white/10"
                : ""
            }
          >
            <CardHeader>
              <CardTitle className="flex item-center justify-between">
                {pricing.title}
                {pricing.popular === PopularPlanType.YES ? (
                  <Badge
                    variant="secondary"
                    className="text-sm text-primary"
                  >
                    Most popular
                  </Badge>
                ) : null}
              </CardTitle>
              <div>
                <span className="text-3xl font-bold">${pricing.price}</span>
                <span className="text-muted-foreground"> /month</span>
              </div>

              <CardDescription>{pricing.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <Button className="w-full">{pricing.buttonText}</Button>
            </CardContent>

            <hr className="w-4/5 m-auto mb-4" />

            <CardFooter className="flex">
              <div className="space-y-4">
                {pricing.benefitList.map((benefit: string) => (
                  <span
                    key={benefit}
                    className="flex"
                  >
                    <Check className="text-green-500" />{" "}
                    <h3 className="ml-2">{benefit}</h3>
                  </span>
                ))}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};
