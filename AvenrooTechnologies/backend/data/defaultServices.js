const defaultServices = [
  {
    title: "Positioning websites",
    slug: "positioning-websites",
    description:
      "High-conviction websites that explain the offer clearly, present the business credibly, and make the next step obvious.",
    price: 35000,
    startingPriceLabel: "From INR 35k",
    recommendedPackage: "Launch sprint",
    bestFor: "Landing pages, offer sites, and focused launch builds",
    includedItems: ["Strategy and section planning", "Responsive interface design", "Build, QA, and launch support"],
    packageCoverage: {
      launchSprint:
        "Up to 5 focused sections, offer hierarchy, responsive build, and a working inquiry form.",
      growthBuild:
        "Multi-page site delivery, service subpages, case-study sections, and analytics or CRM handoff.",
      ongoingPartner:
        "Conversion experiments, seasonal landing pages, content updates, and post-launch refinements.",
    },
    icon: "website",
    category: "Marketing",
    highlights: ["Offer clarity", "Premium responsive UI", "Lead-focused structure"],
    outcome: "Built to reduce hesitation, improve first-contact quality, and make the business look credible.",
    sortOrder: 10,
    isActive: true,
  },
  {
    title: "Product and dashboard interfaces",
    slug: "product-and-dashboard-interfaces",
    description:
      "Clean product surfaces for customer workflows, admin panels, and internal team tools that need to stay usable as they grow.",
    price: 75000,
    startingPriceLabel: "From INR 75k",
    recommendedPackage: "Growth build",
    bestFor: "Dashboards, internal tools, and customer-facing workflows",
    includedItems: ["Multi-section or multi-page delivery", "Reusable interface structure", "Clear handoff and refinement pass"],
    packageCoverage: {
      launchSprint:
        "A tightly scoped MVP surface or one admin module when the workflow is clearly defined.",
      growthBuild:
        "Core dashboard UI, reusable components, responsive views, state coverage, and handoff-ready structure.",
      ongoingPartner:
        "Feature rollout, dashboard expansions, usability refinements, and ongoing interface polish.",
    },
    icon: "app",
    category: "Product",
    highlights: ["Role-based flows", "Reusable components", "Scalable UI structure"],
    outcome: "Designed to support iteration without turning into a maintenance problem.",
    sortOrder: 20,
    isActive: true,
  },
  {
    title: "Automation systems",
    slug: "automation-systems",
    description:
      "Operational workflows that remove repetitive admin work, reduce handoff friction, and make delivery more consistent.",
    price: 75000,
    startingPriceLabel: "From INR 75k",
    recommendedPackage: "Growth build",
    bestFor: "Workflow cleanup, repetitive admin tasks, and process automation",
    includedItems: ["Process mapping", "Trigger-based flows", "Operational visibility"],
    packageCoverage: {
      launchSprint:
        "A single workflow cleanup or one automation with limited touchpoints and a clear trigger path.",
      growthBuild:
        "Multi-step automation, trigger logic, integrations, monitoring, and exception handling.",
      ongoingPartner:
        "Continuous automation improvement, new flow delivery, operational reviews, and support care.",
    },
    icon: "automation",
    category: "Operations",
    highlights: ["Process mapping", "Trigger-based flows", "Operational visibility"],
    outcome: "Better consistency with less manual work from the team.",
    sortOrder: 30,
    isActive: true,
  },
  {
    title: "Integrations and data flows",
    slug: "integrations-and-data-flows",
    description:
      "Forms, CRMs, dashboards, and API connections aligned into one cleaner pipeline so information moves where it should.",
    price: 75000,
    startingPriceLabel: "From INR 75k",
    recommendedPackage: "Growth build",
    bestFor: "Forms, CRMs, APIs, dashboards, and connected data pipelines",
    includedItems: ["Forms and API work", "Analytics setup", "System wiring and validation"],
    packageCoverage: {
      launchSprint:
        "One core connection such as form-to-CRM wiring or a focused data-routing setup.",
      growthBuild:
        "API wiring, dashboard connections, analytics events, validation, and pipeline cleanup.",
      ongoingPartner:
        "New integrations, maintenance work, reporting changes, and evolving data-handoff support.",
    },
    icon: "integration",
    category: "Systems",
    highlights: ["API wiring", "Data flow cleanup", "Event tracking"],
    outcome: "Information moves where it should without constant human intervention.",
    sortOrder: 40,
    isActive: true,
  },
  {
    title: "Performance optimization",
    slug: "performance-optimization",
    description:
      "Improve speed, usability, and technical quality on an existing site or product without rebuilding everything from scratch.",
    price: 35000,
    startingPriceLabel: "From INR 35k",
    recommendedPackage: "Launch sprint",
    bestFor: "Speed improvements, UI cleanup, and focused quality passes",
    includedItems: ["Frontend cleanup", "UX polish", "Performance fixes"],
    packageCoverage: {
      launchSprint:
        "A targeted speed pass, UX cleanup, and focused technical fixes on an existing site.",
      growthBuild:
        "Broader frontend cleanup, code restructuring, asset optimization, and deeper technical quality work.",
      ongoingPartner:
        "Recurring audits, incremental tuning, and ongoing performance maintenance after launch.",
    },
    icon: "performance",
    category: "Optimization",
    highlights: ["Core web vitals", "Frontend cleanup", "Faster page experience"],
    outcome: "Users get a more responsive experience and the business looks more credible.",
    sortOrder: 50,
    isActive: true,
  },
  {
    title: "Cybersecurity checks",
    slug: "cybersecurity-checks",
    description:
      "Focused security reviews for websites, forms, APIs, and launch surfaces before they go live.",
    price: 35000,
    startingPriceLabel: "From INR 35k",
    recommendedPackage: "Launch sprint",
    bestFor: "Security header checks, form reviews, API risk passes, and credential exposure cleanup",
    includedItems: ["Security header review", "Form and API checks", "Credential exposure pass"],
    packageCoverage: {
      launchSprint:
        "A focused review of public pages, forms, headers, environment handling, and obvious exposure risks.",
      growthBuild:
        "Broader application review covering API behavior, data handling, admin routes, and remediation notes.",
      ongoingPartner:
        "Recurring launch checks, dependency review support, and security-minded maintenance after release.",
    },
    icon: "security",
    category: "Security",
    highlights: ["Security header review", "Form and API checks", "Credential exposure pass"],
    outcome:
      "Common launch risks are found earlier, documented clearly, and fixed before they become business problems.",
    sortOrder: 60,
    isActive: true,
  },
  {
    title: "Launch and support care",
    slug: "launch-and-support-care",
    description:
      "Stay supported after release with fixes, refinements, experiments, and focused improvements that keep momentum going.",
    price: 0,
    startingPriceLabel: "Custom scope",
    recommendedPackage: "Ongoing partner",
    bestFor: "Continuous support, refinements, experiments, and evolving product needs",
    includedItems: ["Prioritized delivery rhythm", "Continuous optimization", "Support for evolving product needs"],
    packageCoverage: {
      launchSprint:
        "A short post-launch buffer after a focused project for fixes, QA, and essential cleanup.",
      growthBuild:
        "Handoff support, a refinement queue, QA fixes, and transition support after a larger build.",
      ongoingPartner:
        "Primary model for continuous delivery, prioritized requests, support, and optimization.",
    },
    icon: "support",
    category: "Support",
    highlights: ["Launch oversight", "Refinement queue", "Ongoing product support"],
    outcome: "Momentum continues after version one instead of stalling immediately.",
    sortOrder: 70,
    isActive: true,
  },
];

export default defaultServices;
