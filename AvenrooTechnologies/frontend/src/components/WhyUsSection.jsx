import { motion } from "framer-motion";
import { LineChart, MessageSquareMore, ShieldCheck, Zap } from "lucide-react";

const principles = [
  {
    title: "Business-first decisions",
    description: "The visual system, page flow, and feature choices are made around the business goal.",
    icon: LineChart,
  },
  {
    title: "Fast, visible communication",
    description: "You should always know what is moving, what is blocked, and what is next.",
    icon: MessageSquareMore,
  },
  {
    title: "Stable implementation",
    description: "Quality matters because rushed code becomes expensive the moment you need to evolve it.",
    icon: ShieldCheck,
  },
  {
    title: "Momentum over noise",
    description: "Less ceremony, more output. Meetings only when they materially improve the result.",
    icon: Zap,
  },
];

export default function WhyUsSection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="eyebrow">Why teams choose this setup</p>
          <h2 className="display-font mt-4 text-4xl leading-tight text-[var(--text-strong)] sm:text-5xl">
            Designed to reduce project drag, not add more of it.
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--text-body)]">
            Strong delivery is usually less about flashy process and more about consistent
            decisions, clear communication, and output that does not collapse under the next round
            of changes.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {principles.map((principle, index) => {
            const Icon = principle.icon;

            return (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true, amount: 0.25 }}
                className="surface-panel rounded-[30px] p-6"
              >
                <div className="inline-flex rounded-2xl bg-mint-500/12 p-3 text-mint-500">
                  <Icon size={18} />
                </div>

                <h3 className="mt-5 text-xl font-semibold text-[var(--text-strong)]">
                  {principle.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-[var(--text-body)]">
                  {principle.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
