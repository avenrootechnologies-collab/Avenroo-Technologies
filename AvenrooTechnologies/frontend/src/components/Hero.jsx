import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  MessagesSquare,
  Rocket,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { editorialPhotos } from "../content/visuals";
import EditorialPhotoCard from "./EditorialPhotoCard";
import PosterCard from "./PosterCard";

const trustSignals = [
  "Positioning and UX that explain the offer clearly",
  "Frontend and backend delivery that stays maintainable",
  "Analytics, automation, and launch support built in",
];

const heroHighlights = [
  {
    title: "Editorial-quality presentation",
    description: "Interfaces that feel intentional, premium, and grounded in real business context.",
    icon: Sparkles,
  },
  {
    title: "Clear project communication",
    description: "Faster decisions because the build path, progress, and blockers stay visible.",
    icon: MessagesSquare,
  },
  {
    title: "Launch systems, not mockups",
    description: "Frontends, backend logic, forms, and automation wired into one deployable product.",
    icon: Rocket,
  },
];

export default function Hero() {
  return (
    <section className="px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:gap-12">
        <div>
          <div className="surface-panel inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-[var(--text-body)] shadow-sm">
            <BadgeCheck size={16} className="text-mint-500" />
            Professional digital delivery for growing teams
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
            className="display-font mt-8 max-w-5xl text-4xl leading-[1.08] text-[var(--text-strong)] sm:text-5xl sm:leading-[1.06] lg:text-6xl xl:text-7xl"
          >
            Build digital systems that look sharp, load fast, and sell with intent.
            <span className="mt-2 block bg-gradient-to-r from-mint-500 via-mint-400 to-coral-500 bg-clip-text text-transparent">
              No template feel. No scattered execution.
            </span>
          </motion.h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--text-body)]">
            Avenroo Technologies helps founders, operators, and service businesses ship
            websites, applications, automation systems, and security-ready launch surfaces that
            feel premium from day one and stay easy to manage after launch.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link to="/contact" className="brand-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold">
              Start a project
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/services"
              className="secondary-button inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-semibold"
            >
              Explore the delivery scope
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {trustSignals.map((signal) => (
              <div key={signal} className="surface-panel rounded-[22px] p-4">
                <p className="text-sm leading-6 text-[var(--text-body)]">{signal}</p>
              </div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="grid gap-4"
        >
          <EditorialPhotoCard
            src={editorialPhotos.studio}
            alt="Modern office studio with screens and collaborative workspace"
            label="Recent launch direction"
            title="Positioning, interface design, and delivery planning framed like one serious product."
            detail="Built to feel credible on the first screen, not improvised after launch."
            className="min-h-[24rem] sm:min-h-[30rem]"
            loading="eager"
            fetchPriority="high"
          />

          <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <PosterCard
              eyebrow="Launch poster"
              title="Websites, portals, and automation that feel commercially ready."
              copy="Less decorative filler. More structure, stronger hierarchy, and cleaner follow-through after the click."
              items={["Marketing site", "Client portal", "CRM handoff"]}
              tone="light"
            />

            <div className="grid gap-4">
              <EditorialPhotoCard
                src={editorialPhotos.desk}
                alt="Developer and designer desk with laptop and workspace setup"
                label="Build station"
                title="Design and implementation stay connected."
                className="min-h-[12rem]"
              />

              <div className="surface-panel-inverse rounded-[24px] p-5 text-white sm:p-6">
                <div className="grid gap-3">
                  {heroHighlights.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.title} className="border-b border-white/10 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-start gap-3 text-mint-400">
                          <Icon size={16} />
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/78">
                            {item.title}
                          </p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-white/68">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
