import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  DatabaseZap,
  Gauge,
  Layers3,
  MonitorSmartphone,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import API from "../api/axios";

const fallbackServices = [
  {
    _id: "positioning-sites",
    title: "Positioning websites",
    description: "High-conviction websites that explain the offer clearly and make the next step obvious.",
    category: "Marketing",
    icon: "website",
    highlights: ["Offer clarity", "Premium responsive UI", "Lead-focused structure"],
    outcome: "Built to reduce hesitation and improve first-contact quality.",
  },
  {
    _id: "web-apps",
    title: "Product and dashboard interfaces",
    description: "Clean product surfaces for customer workflows, admin panels, and internal team tools.",
    category: "Product",
    icon: "app",
    highlights: ["Role-based flows", "Reusable components", "Scalable UI structure"],
    outcome: "Designed to support iteration without turning into a maintenance problem.",
  },
  {
    _id: "automation",
    title: "Automation systems",
    description: "Operational workflows that remove repetitive admin tasks and reduce handoff friction.",
    category: "Operations",
    icon: "automation",
    highlights: ["Process mapping", "Trigger-based flows", "Operational visibility"],
    outcome: "Better consistency with less manual work from the team.",
  },
  {
    _id: "integrations",
    title: "Integrations and data flows",
    description: "Forms, CRMs, dashboards, and API connections aligned into one cleaner pipeline.",
    category: "Systems",
    icon: "integration",
    highlights: ["API wiring", "Data flow cleanup", "Event tracking"],
    outcome: "Information moves where it should without constant human intervention.",
  },
  {
    _id: "performance",
    title: "Performance optimization",
    description: "Improve speed, usability, and technical quality on existing products or sites.",
    category: "Optimization",
    icon: "performance",
    highlights: ["Core web vitals", "Frontend cleanup", "Faster page experience"],
    outcome: "Users get a more responsive experience and the business looks more credible.",
  },
  {
    _id: "cybersecurity",
    title: "Cybersecurity checks",
    description: "Focused security reviews for websites, forms, APIs, and launch surfaces before they go live.",
    category: "Security",
    icon: "security",
    highlights: ["Security header review", "Form and API checks", "Credential exposure pass"],
    outcome: "Common launch risks are found earlier, documented clearly, and fixed before they become business problems.",
  },
  {
    _id: "support",
    title: "Launch and support care",
    description: "Stay supported after release with fixes, refinements, and focused follow-up improvements.",
    category: "Support",
    icon: "support",
    highlights: ["Launch oversight", "Refinement queue", "Ongoing product support"],
    outcome: "Momentum continues after version one instead of stalling immediately.",
  },
];

function resolveIcon(service) {
  const token = `${service.icon || ""} ${service.category || ""} ${service.title || ""}`.toLowerCase();

  if (token.includes("security") || token.includes("cyber") || token.includes("audit")) {
    return ShieldCheck;
  }

  if (token.includes("automation") || token.includes("workflow")) {
    return Workflow;
  }

  if (token.includes("integration") || token.includes("api") || token.includes("data")) {
    return DatabaseZap;
  }

  if (token.includes("performance") || token.includes("speed") || token.includes("optimization")) {
    return Gauge;
  }

  if (token.includes("support") || token.includes("care") || token.includes("maintenance")) {
    return ShieldCheck;
  }

  if (token.includes("app") || token.includes("product") || token.includes("dashboard")) {
    return Layers3;
  }

  return MonitorSmartphone;
}

function buildHighlights(service) {
  if (Array.isArray(service.highlights) && service.highlights.length) {
    return service.highlights.slice(0, 3);
  }

  const token = `${service.category || ""} ${service.title || ""} ${service.description || ""}`.toLowerCase();

  if (token.includes("automation")) {
    return ["Process cleanup", "Workflow visibility", "Reduced repetitive work"];
  }

  if (token.includes("integration") || token.includes("api")) {
    return ["Connected systems", "Cleaner data flow", "Fewer manual handoffs"];
  }

  if (token.includes("support")) {
    return ["Faster refinements", "Lower launch anxiety", "Ongoing technical support"];
  }

  if (token.includes("app") || token.includes("product")) {
    return ["Reusable UI", "Clear states and flows", "Scalable structure"];
  }

  if (token.includes("performance")) {
    return ["Speed improvements", "UX cleanup", "Technical quality pass"];
  }

  if (token.includes("security") || token.includes("cyber") || token.includes("audit")) {
    return ["Header review", "Sensitive data check", "Launch risk notes"];
  }

  return ["Premium presentation", "Responsive execution", "Clear conversion path"];
}

function normalizeService(service) {
  return {
    id: service._id || service.title,
    title: service.title || "Custom delivery",
    description: service.description || "Scope tailored to the needs of the business.",
    category: service.category || "Custom scope",
    outcome:
      service.outcome ||
      "Scoped around a real business bottleneck so the work creates momentum instead of more noise.",
    highlights: buildHighlights(service),
    Icon: resolveIcon(service),
  };
}

export default function ServicesSection({
  sectionId = "services",
  eyebrow = "Capabilities",
  title = "What you can hand off without losing quality",
  description = "From first impression to post-launch support, every service is designed to tighten execution, reduce friction, and move the business forward.",
}) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    let active = true;

    API.get("/services")
      .then((response) => {
        if (active) {
          setData(Array.isArray(response.data) ? response.data : []);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setData([]);
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const services = (data.length ? data : fallbackServices).map(normalizeService).slice(0, 8);

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

        <div className="mt-12 grid gap-5 xl:grid-cols-3">
          {isLoading
            ? Array.from({ length: 7 }).map((_, index) => (
                <div key={`service-skeleton-${index}`} className="surface-panel rounded-[32px] p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div className="skeleton-block h-12 w-12 rounded-2xl" />
                    <div className="skeleton-block h-8 w-24 rounded-full" />
                  </div>
                  <div className="mt-5 skeleton-block h-8 w-3/4 rounded-[14px]" />
                  <div className="mt-4 space-y-3">
                    <div className="skeleton-block h-4 w-full rounded-full" />
                    <div className="skeleton-block h-4 w-5/6 rounded-full" />
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="skeleton-block h-12 w-full rounded-2xl" />
                    <div className="skeleton-block h-12 w-full rounded-2xl" />
                    <div className="skeleton-block h-12 w-full rounded-2xl" />
                  </div>
                  <div className="mt-6 skeleton-block h-24 w-full rounded-[24px]" />
                </div>
              ))
            : services.map((service, index) => {
            const Icon = service.Icon;

            return (
              <motion.article
                key={service.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                viewport={{ once: true, amount: 0.2 }}
                className="surface-panel rounded-[32px] p-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="rounded-2xl bg-mint-500/12 p-3 text-mint-500">
                    <Icon size={18} />
                  </div>
                  <span className="rounded-full border border-[var(--chip-border)] bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-body)]">
                    {service.category}
                  </span>
                </div>

                <h3 className="mt-5 text-2xl font-semibold text-[var(--text-strong)]">{service.title}</h3>
                <p className="mt-4 text-sm leading-6 text-[var(--text-body)]">{service.description}</p>

                <div className="mt-6 space-y-3">
                  {service.highlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="rounded-2xl border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-3 text-sm leading-6 text-[var(--text-body)]"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-start gap-3 rounded-[24px] border border-[var(--chip-border)] bg-[var(--surface-strong)] px-4 py-4">
                  <ArrowUpRight size={18} className="mt-1 text-mint-500" />
                  <p className="text-sm leading-6 text-[var(--text-body)]">{service.outcome}</p>
                </div>
              </motion.article>
            );
          })}
        </div>

        {location.pathname !== "/services" && (
          <div className="mt-10 flex justify-start">
            <Link
              to="/services"
              className="secondary-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
            >
              View the full service page
              <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
