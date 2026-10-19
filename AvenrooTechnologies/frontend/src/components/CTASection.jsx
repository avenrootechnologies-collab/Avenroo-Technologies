import { motion } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, Sparkles, TimerReset } from "lucide-react";
import { Link } from "react-router-dom";

const fitPoints = [
  {
    title: "Ship something important",
    description: "Landing pages, internal tools, or product surfaces that need to feel sharper fast.",
    icon: Sparkles,
  },
  {
    title: "Untangle delivery",
    description: "Replace scattered freelancers or stalled sprints with one clear build partner.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Keep momentum after launch",
    description: "Add improvements, experiments, and support without restarting the whole process.",
    icon: TimerReset,
  },
];

export default function CTASection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          className="surface-panel-inverse relative overflow-hidden rounded-[28px] p-7 text-white sm:p-10"
        >
          <div className="relative z-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="eyebrow text-mint-400">Ready when you are</p>
              <h2 className="display-font mt-4 text-3xl leading-tight sm:text-5xl">
                Move from scattered ideas to a launch-ready system.
              </h2>

              <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">
                If you already know the offer and the goal, we can turn that into a website,
                product surface, or internal workflow that feels deliberate and performs like it
                belongs to a serious business.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/#student-connect"
                  className="brand-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold"
                >
                  Start the brief
                  <ArrowRight size={16} />
                </Link>

                <Link
                  to="/services"
                  className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/6 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Review services
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              {fitPoints.map((point) => {
                const Icon = point.icon;

                return (
                  <div
                    key={point.title}
                    className="flex items-start gap-4 border-b border-white/10 pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="inline-flex shrink-0 rounded-2xl bg-white/10 p-3 text-mint-400">
                      <Icon size={18} />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold">{point.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/65">{point.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
