import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TestimonialProps {
  image: string;
  name: string;
  userName: string;
  comment: string;
}

const testimonials: TestimonialProps[] = [
  {
    image: "https://github.com/shadcn.png",
    name: "Sarah Chen",
    userName: "@sarahwrites",
    comment: "Gigstar AI tripled my proposal acceptance rate! The automated bidding is incredibly smart and saves me hours every day.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Marcus Rodriguez",
    userName: "@marcusdev",
    comment:
      "As a developer, I was skeptical about AI automation. But Gigstar AI's proposals are so well-crafted, clients often think I wrote them personally. Game changer!",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Emily Thompson",
    userName: "@emdesigner",
    comment:
      "Managing multiple platforms was exhausting until I found Gigstar AI. Now I'm active on 5 platforms simultaneously with better results than when I manually handled just 2.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "David Kim",
    userName: "@davidconsults",
    comment:
      "The ROI tracking feature helped me identify which platforms and project types are most profitable. I've increased my hourly rate by 40% in just 3 months.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Lisa Martinez",
    userName: "@lisamarketing",
    comment:
      "Gigstar AI's 24/7 monitoring means I never miss opportunities. I've landed projects in different time zones while sleeping!",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "James Wilson",
    userName: "@jameswrites",
    comment:
      "The proposal generation is so sophisticated, it captures my writing style perfectly. Clients can't tell the difference, and my win rate has skyrocketed.",
  },
];

export const Testimonials = () => {
  return (
    <section
      id="testimonials"
      className="container py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold">
        See Why
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          {" "}
          Freelancers Choose{" "}
        </span>
        Gigstar AI
      </h2>

      <p className="text-xl text-muted-foreground pt-4 pb-8">
        Real success stories from freelancers who transformed their business with AI automation
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 sm:block columns-2  lg:columns-3 lg:gap-6 mx-auto space-y-4 lg:space-y-6">
        {testimonials.map(
          ({ image, name, userName, comment }: TestimonialProps) => (
            <Card
              key={userName}
              className="max-w-md md:break-inside-avoid overflow-hidden"
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                  <AvatarImage
                    alt=""
                    src={image}
                  />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <CardTitle className="text-lg">{name}</CardTitle>
                  <CardDescription>{userName}</CardDescription>
                </div>
              </CardHeader>

              <CardContent>{comment}</CardContent>
            </Card>
          )
        )}
      </div>
    </section>
  );
};
