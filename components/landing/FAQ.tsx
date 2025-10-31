import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "How does Worksy help Nepali tech talents compete globally?",
    answer: "Our AI analyzes what successful global freelancers are doing and adapts their strategies to your unique positioning. It understands market dynamics, pricing strategies, and positioning tactics that work, then helps you implement them strategically.",
    value: "item-1",
  },
  {
    question: "Which freelance platforms does Worksy support?",
    answer:
      "We support Upwork, Fiverr, Freelancer, Guru, and PeoplePerHour, with more platforms being added regularly. Our competitive intelligence spans the entire freelance ecosystem to give you maximum market insight.",
    value: "item-2",
  },
  {
    question:
      "Can Worksy really help me beat established, experienced freelancers?",
    answer:
      "Yes! By understanding exactly what you're competing against and positioning you strategically. We analyze successful proposals, pricing patterns, and market positioning to help you find your competitive edge and exploit market gaps.",
    value: "item-3",
  },
  {
    question: "What if I'm new to freelancing and don't have much experience?",
    answer: "That's exactly who Worksy is built for. We level the playing field by giving you the market intelligence and strategic positioning that usually takes years to develop. You'll compete with data, not just hope.",
    value: "item-4",
  },
  {
    question:
      "How much of a competitive advantage can I realistically expect?",
    answer:
      "Most Nepali tech talents see significant improvement in their win rates within the first month. By understanding what you're competing for and positioning strategically, you'll move from random applications to targeted, intelligent market entry.",
    value: "item-5",
  },
];

export const FAQ = () => {
  return (
    <section
      id="faq"
      className="container py-24 sm:py-32"
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Frequently Asked{" "}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Questions
        </span>
      </h2>

      <Accordion
        type="single"
        collapsible
        className="w-full AccordionRoot"
      >
        {FAQList.map(({ question, answer, value }: FAQProps) => (
          <AccordionItem
            key={value}
            value={value}
          >
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <h3 className="font-medium mt-4">
        Still have questions?{" "}
        <a
          rel="noreferrer noopener"
          href="#"
          className="text-primary transition-all border-primary hover:border-b-2"
        >
          Contact us
        </a>
      </h3>
    </section>
  );
};
