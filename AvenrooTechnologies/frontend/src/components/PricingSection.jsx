import { Link } from "react-router-dom";

const plans = [
  {
    name: "Launch sprint",
    price: "From INR 35k",
    description: "Best for focused landing pages, offer positioning, or a tightly scoped launch.",
    features: [
      "Strategy and section planning",
      "Responsive interface design",
      "Build, QA, and launch support",
    ],
  },
  {
    name: "Growth build",
    price: "From INR 75k",
    description: "Ideal when the project includes deeper UI, backend logic, integrations, or multiple flows.",
    features: [
      "Multi-section or multi-page delivery",
      "Forms, API work, and analytics setup",
      "Clear handoff and refinement pass",
    ],
  },
  {
    name: "Ongoing partner",
    price: "Custom scope",
    description: "For teams that need continuous product support, feature delivery, and improvements after launch.",
    features: [
      "Prioritized delivery rhythm",
      "Continuous optimization",
      "Support for evolving product needs",
    ],
  },
];

const serviceRates = [
  {
    service: "Positioning websites",
    startingRate: "From INR 35k",
    model: "Launch sprint",
    bestFor: "Landing pages, offer sites, and focused launch builds",
    includes: ["Strategy plan", "Responsive UI", "Launch support"],
  },
  {
    service: "Product and dashboard interfaces",
    startingRate: "From INR 75k",
    model: "Growth build",
    bestFor: "Dashboards, internal tools, and customer-facing workflows",
    includes: ["Multi-page UI", "Reusable structure", "Clear handoff"],
  },
  {
    service: "Automation systems",
    startingRate: "From INR 75k",
    model: "Growth build",
    bestFor: "Workflow cleanup, repetitive admin tasks, and process automation",
    includes: ["Process mapping", "Trigger flows", "Operational visibility"],
  },
  {
    service: "Integrations and data flows",
    startingRate: "From INR 75k",
    model: "Growth build",
    bestFor: "Forms, CRMs, APIs, dashboards, and connected data pipelines",
    includes: ["API work", "Analytics setup", "System wiring"],
  },
  {
    service: "Performance optimization",
    startingRate: "From INR 35k",
    model: "Launch sprint",
    bestFor: "Speed improvements, UI cleanup, and focused quality passes",
    includes: ["Frontend cleanup", "UX polish", "Performance fixes"],
  },
  {
    service: "Launch and support care",
    startingRate: "Custom scope",
    model: "Ongoing partner",
    bestFor: "Continuous support, refinements, experiments, and evolving product needs",
    includes: ["Priority queue", "Continuous optimization", "Ongoing support"],
  },
];

const packageCoverage = [
  {
    service: "Positioning websites",
    startingRate: "From INR 35k",
    launchSprint: "Up to 5 focused sections, offer hierarchy, responsive build, inquiry form.",
    growthBuild: "Multi-page site, service subpages, case-study sections, CRM or analytics handoff.",
    ongoingPartner: "Conversion experiments, seasonal landing pages, content updates, and support refinements.",
  },
  {
    service: "Product and dashboard interfaces",
    startingRate: "From INR 75k",
    launchSprint: "Light MVP surface or admin module when the workflow is tightly scoped.",
    growthBuild: "Core dashboard UI, reusable components, states, responsive views, and handoff-ready structure.",
    ongoingPartner: "Feature rollout, dashboard expansions, usability refinements, and ongoing interface polish.",
  },
  {
    service: "Automation systems",
    startingRate: "From INR 75k",
    launchSprint: "Single flow cleanup or one operational automation with limited touchpoints.",
    growthBuild: "Multi-step automation, trigger logic, integrations, monitoring, and exception handling.",
    ongoingPartner: "Continuous automation improvement, new flows, operational reviews, and support care.",
  },
  {
    service: "Integrations and data flows",
    startingRate: "From INR 75k",
    launchSprint: "One core connection such as form-to-CRM or a focused data-routing setup.",
    growthBuild: "API wiring, dashboard connections, analytics events, validation, and pipeline cleanup.",
    ongoingPartner: "New integrations, maintenance, reporting changes, and evolving data handoff support.",
  },
  {
    service: "Performance optimization",
    startingRate: "From INR 35k",
    launchSprint: "Targeted speed pass, UX cleanup, and focused technical fixes on an existing site.",
    growthBuild: "Broader frontend cleanup, code restructuring, asset optimization, and deeper technical quality work.",
    ongoingPartner: "Recurring audits, incremental tuning, and ongoing performance maintenance after launch.",
  },
  {
    service: "Launch and support care",
    startingRate: "Custom scope",
    launchSprint: "Best used as a short post-launch buffer after a focused project.",
    growthBuild: "Handoff support, refinement queue, QA fixes, and transition support after a larger build.",
    ongoingPartner: "Primary model for continuous delivery, prioritized requests, support, and optimization.",
  },
];

export default function PricingSection({ sectionId = "engagement" }) {
  return (
    <section id={sectionId} className="px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="eyebrow">Engagement models</p>
          <h2 className="display-font mt-4 text-4xl leading-tight text-[var(--text-strong)] sm:text-5xl">
            Scope the work by outcome, not by guesswork.
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--text-body)]">
            Final pricing depends on the real scope, but these lanes make it easier to choose the
            right starting point.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`rounded-[32px] p-7 ${
                index === 1
                  ? "surface-panel-muted border border-mint-500/25"
                  : "surface-panel border border-[var(--border)]"
              }`}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-mint-500">
                {plan.name}
              </p>
              <h3 className="mt-4 text-3xl font-semibold text-[var(--text-strong)]">{plan.price}</h3>
              <p className="mt-4 text-sm leading-6 text-[var(--text-body)]">{plan.description}</p>

              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="rounded-2xl border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-3 text-sm leading-6 text-[var(--text-body)]"
                  >
                    {feature}
                  </div>
                ))}
              </div>

              <Link
                to="/contact"
                className="brand-button mt-6 inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold"
              >
                Discuss this scope
              </Link>
            </div>
          ))}
        </div>

        <div className="surface-panel mt-10 rounded-[34px] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">Service Rate Chart</p>
              <h3 className="display-font mt-3 text-3xl leading-tight text-[var(--text-strong)] sm:text-4xl">
                Indicative starting rates across every service lane.
              </h3>
              <p className="mt-4 text-sm leading-7 text-[var(--text-body)] sm:text-base">
                These starting rates map each service to the most common engagement model. Final
                pricing depends on scope depth, integrations, content readiness, and handoff needs.
              </p>
            </div>

            <p className="hidden text-sm text-[var(--text-body)] md:block sm:text-right">
              Swipe horizontally on smaller screens to view the full chart.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:hidden">
            {serviceRates.map((item) => (
              <div
                key={item.service}
                className="rounded-[24px] border border-[var(--chip-border)] bg-[var(--chip-bg)] p-5"
              >
                <div className="flex flex-col gap-3">
                  <p className="text-lg font-semibold leading-snug text-[var(--text-strong)]">
                    {item.service}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-[var(--chip-border)] bg-[var(--surface-strong)] px-3 py-1.5 text-sm font-semibold text-[var(--text-strong)]">
                      {item.startingRate}
                    </span>
                    <span className="rounded-full bg-mint-500/12 px-3 py-1.5 text-sm font-semibold text-mint-500">
                      {item.model}
                    </span>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-7 text-[var(--text-body)]">{item.bestFor}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.includes.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full border border-[var(--chip-border)] bg-[var(--surface-strong)] px-3 py-1.5 text-sm text-[var(--text-body)]"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[940px] border-separate border-spacing-0">
              <thead>
                <tr>
                  {["Service", "Starting Rate", "Typical Model", "Best For", "Includes"].map((heading) => (
                    <th
                      key={heading}
                      className="border-b border-[var(--chip-border)] px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-body)]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {serviceRates.map((item) => (
                  <tr key={item.service}>
                    <td className="border-b border-[var(--chip-border)] px-4 py-5 align-top">
                      <p className="text-lg font-semibold text-[var(--text-strong)]">{item.service}</p>
                    </td>

                    <td className="border-b border-[var(--chip-border)] px-4 py-5 align-top">
                      <span className="inline-flex rounded-full border border-[var(--chip-border)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--text-strong)]">
                        {item.startingRate}
                      </span>
                    </td>

                    <td className="border-b border-[var(--chip-border)] px-4 py-5 align-top">
                      <span className="inline-flex rounded-full bg-mint-500/12 px-3 py-1.5 text-sm font-semibold text-mint-500">
                        {item.model}
                      </span>
                    </td>

                    <td className="border-b border-[var(--chip-border)] px-4 py-5 align-top text-sm leading-7 text-[var(--text-body)]">
                      {item.bestFor}
                    </td>

                    <td className="border-b border-[var(--chip-border)] px-4 py-5 align-top">
                      <div className="flex flex-wrap gap-2">
                        {item.includes.map((feature) => (
                          <span
                            key={feature}
                            className="rounded-full border border-[var(--chip-border)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--text-body)]"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="surface-panel mt-10 rounded-[34px] p-6 sm:p-8">
          <div className="max-w-4xl">
            <p className="eyebrow">Package Coverage</p>
            <h3 className="display-font mt-3 text-3xl leading-tight text-[var(--text-strong)] sm:text-4xl">
              What each package typically covers for each service lane.
            </h3>
            <p className="mt-4 text-sm leading-7 text-[var(--text-body)] sm:text-base">
              This matrix is designed to make package fit clearer. It shows how the same service
              can be handled as a focused sprint, a broader build, or an ongoing engagement.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:hidden">
            {packageCoverage.map((item) => (
              <div
                key={item.service}
                className="rounded-[24px] border border-[var(--chip-border)] bg-[var(--chip-bg)] p-5"
              >
                <div className="flex flex-col gap-3">
                  <p className="text-lg font-semibold leading-snug text-[var(--text-strong)]">
                    {item.service}
                  </p>
                  <span className="w-fit rounded-full border border-[var(--chip-border)] bg-[var(--surface-strong)] px-3 py-1.5 text-sm font-semibold text-[var(--text-strong)]">
                    {item.startingRate}
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {[
                    { label: "Launch sprint", detail: item.launchSprint, tone: "bg-coral-500/12 text-coral-500" },
                    { label: "Growth build", detail: item.growthBuild, tone: "bg-mint-500/12 text-mint-500" },
                    { label: "Ongoing partner", detail: item.ongoingPartner, tone: "bg-[var(--surface-strong)] text-[var(--text-strong)]" },
                  ].map((column) => (
                    <div key={`${item.service}-${column.label}`} className="space-y-2">
                      <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${column.tone}`}>
                        {column.label}
                      </span>
                      <p className="text-sm leading-7 text-[var(--text-body)]">{column.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 hidden overflow-x-auto md:block">
            <table className="w-full min-w-[1220px] border-separate border-spacing-0">
              <thead>
                <tr>
                  {["Service", "Starts At", "Launch Sprint", "Growth Build", "Ongoing Partner"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="border-b border-[var(--chip-border)] px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-body)]"
                      >
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {packageCoverage.map((item) => (
                  <tr key={item.service}>
                    <td className="border-b border-[var(--chip-border)] px-4 py-5 align-top">
                      <p className="text-lg font-semibold text-[var(--text-strong)]">{item.service}</p>
                    </td>

                    <td className="border-b border-[var(--chip-border)] px-4 py-5 align-top">
                      <span className="inline-flex rounded-full border border-[var(--chip-border)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm font-semibold text-[var(--text-strong)]">
                        {item.startingRate}
                      </span>
                    </td>

                    {[
                      { label: "Launch sprint", detail: item.launchSprint, tone: "bg-coral-500/12 text-coral-500" },
                      { label: "Growth build", detail: item.growthBuild, tone: "bg-mint-500/12 text-mint-500" },
                      { label: "Ongoing partner", detail: item.ongoingPartner, tone: "bg-[var(--chip-bg)] text-[var(--text-strong)]" },
                    ].map((column) => (
                      <td
                        key={`${item.service}-${column.label}`}
                        className="border-b border-[var(--chip-border)] px-4 py-5 align-top"
                      >
                        <div className="space-y-3">
                          <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-semibold ${column.tone}`}>
                            {column.label}
                          </span>
                          <p className="text-sm leading-7 text-[var(--text-body)]">{column.detail}</p>
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
