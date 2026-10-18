import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { editorialPhotos } from "../content/visuals";
import EditorialPhotoCard from "./EditorialPhotoCard";
import PosterCard from "./PosterCard";

const outcomes = [
  {
    title: "Clearer first impressions",
    description: "Visitors understand the offer faster because the structure, copy, and hierarchy work together.",
    signals: ["Sharper positioning", "Better CTA flow", "More confident brand presentation"],
  },
  {
    title: "Faster internal execution",
    description: "The site or product is easier to update because the system underneath it is cleaner and more deliberate.",
    signals: ["Maintainable components", "Connected APIs", "Less manual patchwork"],
  },
  {
    title: "Less operational friction",
    description: "Forms, handoffs, and repetitive tasks are wired into simpler workflows so the team can move faster.",
    signals: ["Integrated intake", "Cleaner follow-up", "Reduced repetitive admin work"],
  },
];

export default function ResultsSection() {
  return (
    <section id="results" className="px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="eyebrow">Outcomes</p>
          <h2 className="display-font mt-4 text-4xl leading-tight text-[var(--text-strong)] sm:text-5xl">
            The work is meant to improve how the business moves, not just how it looks.
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--text-body)]">
            Good design and engineering should create sharper positioning, better user confidence,
            and fewer operational headaches once the project is live.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              className="depth-panel"
            >
              <EditorialPhotoCard
                src={editorialPhotos.review}
                alt="Team reviewing launch materials and performance data"
                label="Review cycle"
                title="Better results usually come from cleaner systems, sharper positioning, and fewer patchwork handoffs."
                detail="The visual layer matters, but the operational layer decides whether the site actually helps the business."
                className="min-h-[24rem] sm:min-h-[30rem]"
              />
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2">
              <PosterCard
                eyebrow="Operational lift"
                title="Clearer messaging. Stronger follow-through."
                copy="The business looks more credible because the message, structure, and next step all support each other."
                items={["Sharper offer", "Better CTA path", "More trust on contact"]}
                tone="light"
              />

              <PosterCard
                eyebrow="After launch"
                title="Trust and flow improve together when the intake path is cleaner."
                copy="That shows up in first-contact quality, internal follow-up, and how easy the site is to evolve later."
                items={["Better first contact", "Cleaner handoff", "Lower maintenance drag"]}
                tone="soft"
              />
            </div>
          </div>

          <div className="grid gap-5">
            {outcomes.map((outcome, index) => (
              <motion.div
                key={outcome.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true, amount: 0.25 }}
                className="surface-panel-inverse rounded-[32px] p-7 text-white"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/45">
                    Outcome focus
                  </p>
                  <ArrowUpRight size={18} className="text-mint-400" />
                </div>

                <h3 className="mt-5 text-2xl font-semibold">{outcome.title}</h3>
                <p className="mt-4 text-sm leading-6 text-white/70">{outcome.description}</p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {outcome.signals.map((signal) => (
                    <div
                      key={signal}
                      className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm leading-6 text-white/72"
                    >
                      {signal}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
