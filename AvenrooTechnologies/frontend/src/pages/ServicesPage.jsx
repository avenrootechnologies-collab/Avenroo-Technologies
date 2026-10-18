import { motion } from "framer-motion";
import CTASection from "../components/CTASection";
import FAQSection from "../components/FAQSection";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import PricingSection from "../components/PricingSection";
import ProcessSection from "../components/ProcessSection";
import ServicesSection from "../components/ServicesSection";
import Spotlight from "../components/Spotlight";
import TechStackSection from "../components/TechStackSection";
import { editorialPhotos } from "../content/visuals";
import EditorialPhotoCard from "../components/EditorialPhotoCard";
import PosterCard from "../components/PosterCard";

const serviceHighlights = [
  "Clear offer positioning and interface design",
  "Production-ready frontend and backend implementation",
  "Analytics, integrations, and post-launch support",
];

export default function ServicesPage() {
  return (
    <div className="page-shell relative overflow-hidden">
      <Spotlight />
      <Navbar />

      <main className="relative z-10">
        <section className="px-4 pb-8 pt-10 sm:px-6 sm:pt-12">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="surface-panel rounded-[30px] p-6 sm:rounded-[38px] sm:p-10">
              <p className="eyebrow">Services</p>
              <h1 className="display-font mt-4 max-w-4xl text-4xl leading-[1.04] text-[var(--text-strong)] sm:text-5xl sm:leading-[1] lg:text-6xl">
                Delivery designed for teams that need more than surface-level design.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--text-body)]">
                Whether you need a sharper public-facing site, an internal workflow that removes
                operational drag, or a dependable product build partner, the goal is the same:
                cleaner execution and better business leverage.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.6 }}
              className="grid gap-4"
            >
              <EditorialPhotoCard
                src={editorialPhotos.studio}
                alt="Creative technology studio with collaborative screens and workspace"
                label="Delivery snapshot"
                title="Web presence, product surfaces, and internal systems scoped by the actual business need."
                detail="Organized to look polished externally and stay usable internally."
                className="min-h-[24rem] sm:min-h-[29rem]"
              />

              <div className="grid gap-4 sm:grid-cols-[1.05fr_0.95fr]">
                <PosterCard
                  eyebrow="Typical scope"
                  title="Strategy, implementation, and refinement in one lane."
                  copy="Enough design discipline to look sharp. Enough engineering discipline to stay useful after launch."
                  items={serviceHighlights}
                  tone="dark"
                />

                <PosterCard
                  eyebrow="Common lanes"
                  title="Marketing site, dashboard surface, or automation cleanup."
                  copy="The point is not to sell every service at once. It is to fix the real bottleneck without adding more project drag."
                  items={["Clear offer", "Connected systems", "Support after launch"]}
                  tone="light"
                />
              </div>
            </motion.div>
          </div>
        </section>

        <ServicesSection
          sectionId="deliverables"
          eyebrow="Delivery scope"
          title="Choose the lane that matches the problem"
          description="Every engagement is scoped to remove a specific bottleneck: positioning, execution speed, product clarity, or operational overhead."
        />
        <ProcessSection
          sectionId="workflow"
          eyebrow="Execution model"
          title="How the work stays organized from kickoff to launch"
          description="Clear checkpoints, visible progress, and enough documentation that your team is not stranded after release."
        />
        <TechStackSection />
        <PricingSection sectionId="engagement" />
        <FAQSection sectionId="faq" />
        <CTASection />
        <Footer />
      </main>
    </div>
  );
}
