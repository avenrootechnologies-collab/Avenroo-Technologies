const groups = [
  {
    label: "Frontend",
    items: ["React", "Vite", "Tailwind CSS", "Framer Motion"],
  },
  {
    label: "Backend",
    items: ["Node.js", "Express", "MongoDB", "REST APIs"],
  },
  {
    label: "Operations",
    items: ["Automation flows", "Analytics", "Form pipelines", "Documentation"],
  },
];

export default function TechStackSection() {
  return (
    <section className="px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="surface-panel rounded-[34px] p-8 sm:p-10">
          <p className="eyebrow">Technology</p>
          <h2 className="display-font mt-4 text-4xl leading-tight text-[var(--text-strong)] sm:text-5xl">
            Modern tools, selected for stability and speed.
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--text-body)]">
            The stack is chosen to support a clean build, easier iteration, and fewer surprises
            once the project needs to evolve.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {groups.map((group) => (
            <div
              key={group.label}
              className="surface-panel rounded-[30px] p-6"
            >
              <h3 className="text-lg font-semibold text-[var(--text-strong)]">{group.label}</h3>

              <div className="mt-5 flex flex-wrap gap-3">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-2 text-sm font-medium text-[var(--text-body)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
