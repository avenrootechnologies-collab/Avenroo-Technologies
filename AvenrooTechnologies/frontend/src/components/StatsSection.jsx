const stats = [
  {
    value: "07",
    label: "Service lanes",
    detail: "Websites, apps, automation, performance, integrations, cybersecurity, and support.",
  },
  {
    value: "02",
    label: "Core engagement modes",
    detail: "Project-based delivery or ongoing product support.",
  },
  {
    value: "01",
    label: "Accountable delivery partner",
    detail: "Clear ownership from strategy through launch and refinement.",
  },
  {
    value: "100%",
    label: "Custom implementation",
    detail: "No off-the-shelf layouts forced onto your business.",
  },
];

export default function StatsSection() {
  return (
    <section className="px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="surface-panel rounded-[30px] p-6"
          >
            <p className="display-font text-4xl text-[var(--text-strong)]">{stat.value}</p>
            <h3 className="mt-4 text-lg font-semibold text-[var(--text-strong)]">{stat.label}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">{stat.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
