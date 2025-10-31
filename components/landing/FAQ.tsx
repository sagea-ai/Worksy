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
    question: "How does Gigstar AI's automated bidding work?",
    answer: "Our AI analyzes job postings across multiple platforms, matches them to your skills and preferences, then submits personalized proposals 24/7. You set the parameters, and our AI handles the rest while you focus on delivering great work.",
    value: "item-1",
  },
  {
    question: "Which freelance platforms does Gigstar AI support?",
    answer:
      "We currently support Upwork, Fiverr, Freelancer, Guru, and PeoplePerHour, with more platforms being added regularly. Our multi-platform approach helps you maximize your opportunities across the entire freelance ecosystem.",
    value: "item-2",
  },
  {
    question:
      "Can I customize the AI-generated proposals to match my writing style?",
    answer:
      "Absolutely! Our AI learns from your successful proposals and adapts to your unique voice and style. You can also set custom templates, keywords, and tone preferences to ensure every proposal feels authentically yours.",
    value: "item-3",
  },
  {
    question: "What happens if I want to pause or modify my bidding strategy?",
    answer: "You have complete control over your account. Pause bidding anytime, adjust your criteria, modify budget ranges, or fine-tune your targeting preferences through our intuitive dashboard - all changes take effect immediately.",
    value: "item-4",
  },
  {
    question:
      "How much time can I realistically save using Gigstar AI?",
    answer:
      "Most freelancers save 15-20 hours per week on proposal writing and job searching. This allows you to focus entirely on client work and skill development, often leading to higher rates and better project outcomes.",
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
