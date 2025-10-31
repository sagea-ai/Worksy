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
    name: "Rajesh Shrestha",
    userName: "@rajeshdev",
    comment: "Worksy helped me understand what I was competing against. Now I position myself strategically instead of just hoping to get lucky. Win rate tripled!",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Priya Gurung",
    userName: "@priyauxui",
    comment:
      "As a Nepali designer competing globally, I felt lost. Worksy showed me exactly how successful freelancers position themselves. Now I'm beating established competitors regularly!",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Bibek Tamang",
    userName: "@bibekweb",
    comment:
      "Being from Nepal, I thought I'd always be at a disadvantage. Worksy turned that into my competitive edge by helping me understand what clients really want.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Sarita Magar",
    userName: "@saritamarketing",
    comment:
      "The competitive intelligence is incredible. I can see exactly what winning proposals look like and adapt my approach. Went from random applications to strategic positioning.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Dipesh Karki",
    userName: "@dipeshdata",
    comment:
      "Worksy helped me move from competing on price to competing on value. Now I understand what I'm up against and how to position myself to win consistently.",
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Anita Rai",
    userName: "@anitawriter",
    comment:
      "The market positioning insights are game-changing. Instead of feeling like David fighting Goliath blindfolded, now I know exactly where to aim my stones.",
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
          Nepali Tech Talents Choose{" "}
        </span>
        Worksy
      </h2>

      <p className="text-xl text-muted-foreground pt-4 pb-8">
        Real success stories from Nepali talents who turned their geographic disadvantage into a competitive advantage
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
