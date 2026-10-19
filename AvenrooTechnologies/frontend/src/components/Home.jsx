import AboutSection from "./AboutSection";
import CTASection from "./CTASection";
import FAQSection from "./FAQSection";
import Footer from "./Footer";
import Hero from "./Hero";
import Navbar from "./Navbar";
import PricingSection from "./PricingSection";
import ProcessSection from "./ProcessSection";
import ResultsSection from "./ResultsSection";
import ServicesSection from "./ServicesSection";
import Spotlight from "./Spotlight";
import StatsSection from "./StatsSection";
import TechStackSection from "./TechStackSection";
import TestimonialsSection from "./TestimonialsSection";
import WhyUsSection from "./WhyUsSection";

export default function Home() {
  return (
    <div className="page-shell relative overflow-x-clip">
      <Spotlight />
      <Navbar />

      <main className="relative z-10">
        <Hero />
        <StatsSection />
        <AboutSection />
        <ServicesSection
          sectionId="services"
          eyebrow="Capabilities"
          title="What you can hand off without losing quality"
          description="From first impression to post-launch support, every service is designed to tighten execution, reduce friction, and move the business forward."
        />
        <WhyUsSection />
        <ProcessSection
          sectionId="process"
          eyebrow="Workflow"
          title="A delivery rhythm built to keep momentum"
          description="You get structured milestones, visible progress, and working output every step of the way."
        />
        <ResultsSection />
        <TechStackSection />
        <TestimonialsSection />
        <PricingSection sectionId="engagement" />
        <FAQSection sectionId="faq" />
        <CTASection />
        <Footer />
      </main>
    </div>
  );
}

