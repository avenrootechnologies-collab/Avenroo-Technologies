import { useState } from "react";
import { ArrowUpRight, Clock3, Menu, MoonStar, Sparkles, SunMedium, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import useTheme from "./useTheme";
import BrandLogo from "./BrandLogo";

const pageNavigation = {
  home: [
    { label: "Students", type: "route", to: "/" },
    { label: "Services", type: "anchor", href: "#services" },
    { label: "Process", type: "anchor", href: "#process" },
    { label: "Results", type: "anchor", href: "#results" },
    { label: "Reviews", type: "anchor", href: "#reviews" },
    { label: "Contact", type: "route", to: "/contact" },
  ],
  services: [
    { label: "Students", type: "route", to: "/" },
    { label: "Deliverables", type: "anchor", href: "#deliverables" },
    { label: "Workflow", type: "anchor", href: "#workflow" },
    { label: "Engagement", type: "anchor", href: "#engagement" },
    { label: "Contact", type: "route", to: "/contact" },
  ],
  contact: [
    { label: "Students", type: "route", to: "/" },
    { label: "Brief", type: "anchor", href: "#project-brief" },
    { label: "Process", type: "anchor", href: "#contact-process" },
    { label: "Services", type: "route", to: "/services" },
    { label: "Home", type: "route", to: "/clients" },
  ],
};

function getNavItems(pathname) {
  if (pathname === "/services") {
    return pageNavigation.services;
  }

  if (pathname === "/contact") {
    return pageNavigation.contact;
  }

  if (pathname === "/" || pathname === "/students") {
    return [
      { label: "Programs", type: "anchor", href: "#student-programs" },
      { label: "Courses", type: "anchor", href: "#student-courses" },
      { label: "Projects", type: "anchor", href: "#student-projects" },
      { label: "Learning path", type: "anchor", href: "#learning-path" },
      { label: "Reviews", type: "anchor", href: "#reviews" },
      { label: "Enquire / Apply", type: "student-form" },
    ];
  }

  return pageNavigation.home;
}

const clientLanes = ["Websites", "Apps", "Automation", "Security"];
const studentLanes = ["Courses", "Internships", "Projects", "Industry sessions"];

export default function Navbar({ onStudentEnquiry }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const navItems = getNavItems(pathname);
  const isStudentView = pathname === "/" || pathname === "/students";
  const switchPath = isStudentView ? "/clients" : "/";
  const switchLabel = isStudentView ? "For businesses" : "For students";
  const serviceLanes = isStudentView ? studentLanes : clientLanes;

  const secondaryAction =
    pathname === "/services"
      ? { label: "Back home", to: "/clients" }
      : pathname === "/contact"
        ? { label: "See services", to: "/services" }
        : isStudentView
          ? { label: "Client site", to: "/clients" }
        : { label: "Service scope", to: "/services" };

  const primaryAction = isStudentView
    ? null
    : pathname === "/contact"
      ? { label: "Review services", to: "/services" }
      : { label: "Start a project", to: "/contact" };

  const themeLabel = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
  const ThemeIcon = theme === "dark" ? SunMedium : MoonStar;

  const renderItem = (item) => {
    if (item.type === "route") {
      return (
        <Link
          key={item.label}
          to={item.to}
          className="nav-link"
          onClick={() => setOpen(false)}
        >
          {item.label}
        </Link>
      );
    }

    if (item.type === "student-form") {
      return (
        <button
          key={item.label}
          type="button"
          className="nav-link nav-link--student-form"
          aria-haspopup="dialog"
          aria-label="Open the student enquiry and internship application form"
          onClick={() => {
            setOpen(false);
            onStudentEnquiry?.();
          }}
        >
          {item.label}
        </button>
      );
    }

    return (
      <a
        key={item.label}
        href={item.href}
        className="nav-link"
        onClick={() => setOpen(false)}
      >
        {item.label}
      </a>
    );
  };

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 sm:px-6">
      <div className="nav-shell mx-auto max-w-7xl rounded-[26px] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <Link to="/" className="nav-brand shrink-0" aria-label="Avenroo Technologies student home">
            <BrandLogo />
          </Link>

          <nav className="nav-links-wrap hidden min-w-0 flex-1 items-center justify-center gap-1 text-sm xl:flex">
            {navItems.map(renderItem)}
          </nav>

          <Link
            to={switchPath}
            className="view-switch hidden xl:inline-flex"
            aria-label={`Switch to ${switchLabel.toLowerCase()} website`}
          >
            {switchLabel}
            <ArrowUpRight size={15} />
          </Link>

          <div className="hidden shrink-0 items-center gap-2 xl:flex">
            {!isStudentView && <div className="hidden 2xl:block">
              <div className="nav-meta-card">
                <Clock3 size={16} className="text-mint-500" />
                <div>
                  <p className="nav-meta-card__title">Response</p>
                  <p className="nav-meta-card__detail">1 business day</p>
                </div>
              </div>
            </div>}

            <button
              type="button"
              className="theme-button"
              onClick={toggleTheme}
              aria-label={themeLabel}
              title={themeLabel}
            >
              <ThemeIcon size={18} />
            </button>

            <Link
              to={secondaryAction.to}
              className="secondary-button hidden items-center justify-center rounded-full px-4 py-2 text-sm font-semibold 2xl:inline-flex"
            >
              {secondaryAction.label}
            </Link>

            {primaryAction && (
              <Link to={primaryAction.to} className="brand-button inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold">
                {primaryAction.label}<ArrowUpRight size={16} />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 xl:hidden">
            <Link
              to={switchPath}
              className="view-switch view-switch--compact"
              aria-label={`Switch to ${switchLabel.toLowerCase()} website`}
            >
              {isStudentView ? "Clients" : "Students"}
            </Link>
            <button
              className="theme-button"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close navigation" : "Open navigation"}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {open && (
          <div className="surface-panel-solid mt-4 rounded-[24px] p-6 xl:hidden">
            <nav className="flex flex-col gap-4 text-base text-[var(--text-strong)]">
              <div className="rounded-[22px] border border-[var(--chip-border)] bg-[var(--chip-bg)] p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-2xl bg-mint-500/12 p-3 text-mint-500">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-strong)]">
                      {isStudentView ? "Learn, build, and explore" : "Professional digital delivery"}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--text-body)]">
                      {isStudentView ? "Explore courses, internship opportunities, and real industry perspectives." : "Clear scope, responsive execution, and support that stays practical after launch."}
                    </p>
                  </div>
                </div>
              </div>

              {navItems.map(renderItem)}

              <Link to={switchPath} className="view-switch w-fit" onClick={() => setOpen(false)}>
                {switchLabel}<ArrowUpRight size={15} />
              </Link>

              <div className="mt-2 flex items-center justify-between rounded-[22px] border border-[var(--chip-border)] bg-[var(--chip-bg)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-strong)]">Theme</p>
                  <p className="text-xs text-[var(--text-body)]">
                    {theme === "dark" ? "Dark studio mode" : "Light editorial mode"}
                  </p>
                </div>
                <button
                  type="button"
                  className="theme-button"
                  onClick={toggleTheme}
                  aria-label={themeLabel}
                >
                  <ThemeIcon size={18} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {serviceLanes.map((lane) => (
                  <span key={lane} className="nav-lane">
                    {lane}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <Link
                  to={secondaryAction.to}
                  className="secondary-button rounded-full px-4 py-3 text-center font-medium"
                  onClick={() => setOpen(false)}
                >
                  {secondaryAction.label}
                </Link>

                {primaryAction && (
                  <Link to={primaryAction.to} className="brand-button rounded-full px-4 py-3 text-center font-semibold" onClick={() => setOpen(false)}>
                    {primaryAction.label}
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
