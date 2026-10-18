import { motion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  Handshake,
  MessagesSquare,
  Quote,
  ShieldCheck,
  Star,
  UsersRound,
} from "lucide-react";

const proofMetrics = [
  {
    value: "1 day",
    label: "Reply target",
    detail: "Qualified briefs get a clear next step without a long waiting loop.",
  },
  {
    value: "7",
    label: "Service lanes",
    detail: "Websites, apps, automation, integrations, performance, security, and support.",
  },
  {
    value: "100%",
    label: "Custom build",
    detail: "The interface is shaped around the business instead of a generic layout.",
  },
];

const reviews = [
  {
    quote:
      "The site finally explains what we do in a way customers understand. The inquiries became clearer because the offer was easier to trust.",
    name: "Founder",
    company: "Service business",
    result: "Clearer inquiries",
    icon: BadgeCheck,
  },
  {
    quote:
      "The workflow felt organized from the first brief. We always knew what was moving, what was blocked, and what decision came next.",
    name: "Operations lead",
    company: "Growth team",
    result: "Faster decisions",
    icon: MessagesSquare,
  },
  {
    quote:
      "The design looked premium, but the bigger value was the structure underneath. Our team can update the site with less friction now.",
    name: "Product owner",
    company: "Digital platform",
    result: "Cleaner handoff",
    icon: ShieldCheck,
  },
];

const audiences = [
  {
    title: "Customers",
    description: "Clear journeys, stronger trust signals, and fewer doubts before they contact you.",
    icon: UsersRound,
  },
  {
    title: "Partners",
    description: "A more credible digital presence that makes collaboration feel structured.",
    icon: Handshake,
  },
  {
    title: "Clients",
    description: "Better intake, clearer updates, and delivery that feels accountable.",
    icon: Building2,
  },
];

export default function TestimonialsSection() {
  return (
    <section id="reviews" className="px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="eyebrow">Client reviews</p>
            <h2 className="display-font mt-4 text-3xl leading-tight text-[var(--text-strong)] sm:text-5xl">
              Proof that helps users, customers, partners, and clients trust the next step.
            </h2>
          </div>

          <p className="max-w-3xl text-base leading-7 text-[var(--text-body)] lg:justify-self-end">
            The UI should do more than look polished. It should make the business feel credible,
            the offer easy to understand, and the contact path safe enough to take.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {proofMetrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              viewport={{ once: true, amount: 0.25 }}
              className="surface-panel rounded-[24px] p-5"
            >
              <p className="display-font text-3xl text-[var(--text-strong)]">{metric.value}</p>
              <h3 className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-body)]">
                {metric.label}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--text-body)]">{metric.detail}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {reviews.map((review, index) => {
            const Icon = review.icon;

            return (
              <motion.article
                key={`${review.name}-${review.company}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true, amount: 0.25 }}
                className="surface-panel-inverse flex min-h-full flex-col rounded-[24px] p-6 text-white"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="inline-flex rounded-2xl bg-white/10 p-3 text-mint-400">
                    <Quote size={18} />
                  </div>
                  <div className="flex gap-1 text-mint-400" aria-label="Five star review">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} size={14} fill="currentColor" />
                    ))}
                  </div>
                </div>

                <p className="mt-6 flex-1 text-sm leading-7 text-white/76">{review.quote}</p>

                <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-5">
                  <div className="rounded-2xl bg-white/10 p-3 text-mint-400">
                    <Icon size={17} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{review.name}</p>
                    <p className="mt-1 text-xs text-white/52">{review.company}</p>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-white/78">
                  {review.result}
                </div>
              </motion.article>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {audiences.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                viewport={{ once: true, amount: 0.25 }}
                className="flex items-start gap-4 rounded-[24px] border border-[var(--chip-border)] bg-[var(--chip-bg)] p-5"
              >
                <div className="shrink-0 rounded-2xl bg-mint-500/12 p-3 text-mint-500">
                  <Icon size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-strong)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
