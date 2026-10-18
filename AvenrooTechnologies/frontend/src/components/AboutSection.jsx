import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Telescope, Workflow } from "lucide-react";
import { editorialPhotos } from "../content/visuals";
import EditorialPhotoCard from "./EditorialPhotoCard";
import PosterCard from "./PosterCard";

const pillars = [
  {
    title: "Strategy before surface",
    description: "We tighten the offer, audience path, and conversion goal before adding polish.",
    icon: Telescope,
  },
  {
    title: "Execution that holds up",
    description: "Interfaces, APIs, and integrations are built with maintainability in mind.",
    icon: Workflow,
  },
  {
    title: "Quality you can hand over",
    description: "Launch documentation and clean structure make future changes less painful.",
    icon: ShieldCheck,
  },
];

const deliverables = [
  "Messaging structure and section planning",
  "Responsive UI with premium visual direction",
  "Backend, forms, integrations, and analytics wiring",
  "Polish, QA, launch checklist, and support handoff",
];

export default function AboutSection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:gap-10">
        <div className="grid gap-4">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            className="depth-panel"
          >
            <EditorialPhotoCard
              src={editorialPhotos.team}
              alt="Team workshop discussing project planning and product delivery"
              label="Working session"
              title="Messaging, visual direction, and technical delivery stay in the same conversation."
              detail="That usually means fewer revisions, better prioritization, and cleaner launches."
              className="min-h-[24rem] sm:min-h-[30rem]"
            />
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-[0.92fr_1.08fr]">
            <PosterCard
              eyebrow="Build principle"
              title="Reduce noise. Keep momentum."
              copy="Fewer disconnected handoffs. Fewer revisions caused by weak early thinking."
              items={["Scope clarity", "Responsive system", "Clean handoff"]}
              tone="light"
            />

            <PosterCard
              eyebrow="Typical handoff"
              title="What the client actually gets at the end."
              copy="Enough structure to keep moving after launch instead of starting from scratch again."
              items={deliverables.slice(0, 3)}
              tone="dark"
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          className="surface-panel rounded-[34px] p-8 sm:p-10"
        >
          <p className="eyebrow">Delivery approach</p>
          <h2 className="display-font mt-4 text-4xl leading-tight text-[var(--text-strong)] sm:text-5xl">
            Built like a serious partner, not a patchwork freelancer chain.
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--text-body)]">
            The goal is not just to ship a better-looking interface. It is to create an asset
            that explains the business more clearly, feels faster to use, and stays easier to
            operate once real users start depending on it.
          </p>

          <div className="mt-8 space-y-4">
            {deliverables.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-3"
              >
                <CheckCircle2 size={18} className="mt-1 text-mint-500" />
                <p className="text-sm leading-6 text-[var(--text-body)]">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-4">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;

              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  viewport={{ once: true, amount: 0.25 }}
                  className="surface-panel-muted rounded-[30px] p-7"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-mint-500/12 p-3 text-mint-500">
                      <Icon size={18} />
                    </div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--text-body)]">
                      Pillar {index + 1}
                    </p>
                  </div>

                  <h3 className="mt-5 text-2xl font-semibold text-[var(--text-strong)]">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-[var(--text-body)]">
                    {pillar.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
