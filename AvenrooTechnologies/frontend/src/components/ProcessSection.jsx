import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Define the outcome",
    description: "We clarify the business goal, audience, scope, and delivery priorities before building.",
    outputs: ["Scope outline", "Key pages or flows", "Success criteria"],
  },
  {
    step: "02",
    title: "Design the experience",
    description: "Structure, hierarchy, and interaction decisions are shaped around clarity and conversion.",
    outputs: ["Wireframe direction", "Visual language", "Responsive layout plan"],
  },
  {
    step: "03",
    title: "Build the system",
    description: "Frontend, backend, forms, integrations, and analytics are implemented as one connected delivery.",
    outputs: ["Production-ready UI", "API and form flows", "Tracking and integrations"],
  },
  {
    step: "04",
    title: "Launch and refine",
    description: "We test, tighten the final details, and leave you with a setup that is easier to maintain.",
    outputs: ["QA pass", "Launch checklist", "Post-launch recommendations"],
  },
];

export default function ProcessSection({
  sectionId = "process",
  eyebrow = "Workflow",
  title = "A delivery rhythm built to keep momentum",
  description = "You get structured milestones, visible progress, and working output every step of the way.",
}) {
  return (
    <section id={sectionId} className="px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="display-font mt-4 text-4xl leading-tight text-[var(--text-strong)] sm:text-5xl">
            {title}
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--text-body)]">{description}</p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              viewport={{ once: true, amount: 0.25 }}
              className="surface-panel rounded-[30px] p-6"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-mint-500">
                Step {step.step}
              </p>
              <h3 className="mt-4 text-2xl font-semibold text-[var(--text-strong)]">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--text-body)]">{step.description}</p>

              <div className="mt-6 space-y-3">
                {step.outputs.map((output) => (
                  <div
                    key={output}
                    className="rounded-2xl border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-3 text-sm leading-6 text-[var(--text-body)]"
                  >
                    {output}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
