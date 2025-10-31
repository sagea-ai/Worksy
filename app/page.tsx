import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Sponsors } from "@/components/landing/Sponsors";
import { About } from "@/components/landing/About";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { Services } from "@/components/landing/Services";
import { Cta } from "@/components/landing/Cta";
import { Testimonials } from "@/components/landing/Testimonials";
import { Team } from "@/components/landing/Team";
import { Pricing } from "@/components/landing/Pricing";
import { Newsletter } from "@/components/landing/Newsletter";
import { FAQ } from "@/components/landing/FAQ";
import { Footer } from "@/components/landing/Footer";
import { ScrollToTop } from "@/components/landing/ScrollToTop";

export default function Home() {
  return (
    <main className="min-h-screen w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Navbar />
        <Hero />
        <Sponsors />
        <About />
        <HowItWorks />
        <Features />
        <Services />
      </div>
      <Cta />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Testimonials />
        {/* <Team /> */}
        <Pricing />
        <Newsletter />
        <FAQ />
        <Footer />
        <ScrollToTop />
      </div>
    </main>
  );
}
