import { ArrowDown, Mail } from "lucide-react";
import CTASection from "../components/CTASection";
import ContactSection from "../components/ContactSection";
import FAQSection from "../components/FAQSection";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Spotlight from "../components/Spotlight";
import { editorialPhotos } from "../content/visuals";
import EditorialPhotoCard from "../components/EditorialPhotoCard";
import PosterCard from "../components/PosterCard";

const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || "avenrootechnologies@gmail.com";

export default function ContactPage() {
  return (
    <div className="page-shell relative overflow-x-clip">
      <Spotlight />
      <Navbar />

      <main className="relative z-10">
        <section className="px-4 pb-10 pt-10 sm:px-6 sm:pt-12">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.86fr]">
            <div className="surface-panel rounded-[30px] p-6 sm:rounded-[38px] sm:p-10">
              <p className="eyebrow">Contact</p>
              <h1 className="display-font mt-4 max-w-4xl text-4xl leading-[1.04] text-[var(--text-strong)] sm:text-5xl sm:leading-[1] lg:text-6xl">
                Contact us without the back-and-forth.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--text-body)]">
                Send one clear enquiry and get a practical reply. Share your goal, timeline, and
                the main blocker. We will help you choose the right next step without forcing a
                long sales process.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#contact-form"
                  className="brand-button inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
                >
                  Start contact form
                  <ArrowDown size={16} />
                </a>
                <a
                  href={`mailto:${contactEmail}`}
                  className="secondary-button inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
                >
                  Email us
                  <Mail size={16} />
                </a>
              </div>

              <div className="mt-6 grid gap-3 text-sm text-[var(--text-body)] sm:grid-cols-3">
                <div className="rounded-[20px] border border-[var(--chip-border)] bg-[var(--chip-bg)] p-4">
                  <p className="font-semibold text-[var(--text-strong)]">Fastest start</p>
                  <p className="mt-1 leading-6">Use the form for a complete first reply.</p>
                </div>
                <div className="rounded-[20px] border border-[var(--chip-border)] bg-[var(--chip-bg)] p-4">
                  <p className="font-semibold text-[var(--text-strong)]">Direct email</p>
                  <p className="mt-1 leading-6">Use Email us for files or detailed briefs.</p>
                </div>
                <div className="rounded-[20px] border border-[var(--chip-border)] bg-[var(--chip-bg)] p-4">
                  <p className="font-semibold text-[var(--text-strong)]">Expected reply</p>
                  <p className="mt-1 leading-6">Within one business day.</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <EditorialPhotoCard
                src={editorialPhotos.strategy}
                alt="Planning desk with laptop, notebook, and project documents"
                label="Project brief"
                title="A short message is enough when the important details are clear."
                detail="Goal, timeline, and blocker usually give us enough context to reply usefully."
                className="min-h-[24rem] sm:min-h-[29rem]"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <PosterCard
                  eyebrow="Best input"
                  title="Goal. Timeline. Blockers."
                  copy="Those three points help us understand the starting point quickly."
                  items={["What to ship", "Important date", "Current friction"]}
                  tone="light"
                />

                <PosterCard
                  eyebrow="Reply model"
                  title="A clear next step, not a sales script."
                  copy="The reply should clarify scope, timing, and the most sensible delivery lane."
                  items={["Scope", "Timing", "Next action"]}
                  tone="soft"
                />
              </div>
            </div>
          </div>
        </section>

        <ContactSection />
        <FAQSection sectionId="faq" />
        <CTASection />
        <Footer />
      </main>
    </div>
  );
}

