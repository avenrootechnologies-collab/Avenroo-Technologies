import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BriefcaseBusiness, Building2, Code2, GraduationCap, MonitorPlay, PanelsTopLeft, ShieldCheck, Workflow } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import StudentConnectForm from "../components/StudentConnectForm";
import Spotlight from "../components/Spotlight";
import TestimonialsSection from "../components/TestimonialsSection";

const studentSlides = [
  {
    eyebrow: "Learn by building",
    title: "Make your first idea work in the real world.",
    copy: "Build practical skills through guided projects, creative challenges, and a clear path from concept to portfolio.",
    icon: Code2,
    label: "Project based learning",
    theme: "from-[#123d3a] via-[#126a5c] to-[#19a58c]",
  },
  {
    eyebrow: "See the industry up close",
    title: "Meet the people and teams behind the work.",
    copy: "Explore corporate exposure, industry sessions, and introductory conversations that help you understand what comes next.",
    icon: Building2,
    label: "Industry exposure",
    theme: "from-[#202b57] via-[#364b8a] to-[#6176c5]",
  },
  {
    eyebrow: "Take your next step",
    title: "Turn new skills into experience.",
    copy: "Discover internship opportunities and ways to apply what you learn as your confidence and interests grow.",
    icon: BriefcaseBusiness,
    label: "Internship pathways",
    theme: "from-[#503228] via-[#985138] to-[#df8555]",
  },
];

const opportunities = [
  {
    icon: GraduationCap,
    eyebrow: "Learn by doing",
    title: "Career focused courses",
    copy: "Build practical foundations in digital and technology skills through guided, hands-on learning.",
  },
  {
    icon: BriefcaseBusiness,
    eyebrow: "Put skills to work",
    title: "Internship opportunities",
    copy: "Explore internship pathways that help students apply what they learn and understand real project workflows.",
  },
  {
    icon: Building2,
    eyebrow: "See how teams work",
    title: "Corporate and industry exposure",
    copy: "Get closer to professional environments with exposure sessions focused on workplace practices and industry expectations.",
  },
  {
    icon: MonitorPlay,
    eyebrow: "Get oriented",
    title: "Introductory sessions",
    copy: "Join beginner friendly sessions to explore career paths, essential skills, and how to get started.",
  },
];

const steps = [
  ["01", "Explore", "Find a course or introductory session that matches your interests."],
  ["02", "Build", "Learn core concepts and practice them through guided activities."],
  ["03", "Experience", "Take part in corporate or industry exposure sessions and learn how work happens."],
  ["04", "Take the next step", "Explore internship opportunities and plan your next move with greater confidence."],
];

const courses = [
  { icon: Code2, category: "Build for the web", title: "Website Development", copy: "Learn the building blocks of responsive websites, from structure and styling to interactive pages.", gradient: "from-cyan-300/30 via-teal-500/15 to-slate-950", number: "01" },
  { icon: PanelsTopLeft, category: "Design useful products", title: "Web Apps & Dashboards", copy: "Explore the components and flows behind dashboards, portals, and practical web applications.", gradient: "from-orange-300/30 via-rose-500/15 to-slate-950", number: "02" },
  { icon: Workflow, category: "Make work flow", title: "Automation & Workflows", copy: "Understand how digital tools can connect repeatable tasks and make everyday processes smoother.", gradient: "from-violet-300/30 via-indigo-500/15 to-slate-950", number: "03" },
  { icon: ShieldCheck, category: "Build safer habits", title: "Security Fundamentals", copy: "Get an introduction to practical security concepts and responsible habits for digital products.", gradient: "from-emerald-300/30 via-teal-500/15 to-slate-950", number: "04" },
];

const projectIdeas = [
  { icon: PanelsTopLeft, type: "Web experience", title: "A small business website", copy: "Plan a clear page structure, build responsive sections, and make the contact path easy to use.", colors: "from-mint-400/25 to-cyan-500/10" },
  { icon: Code2, type: "Product interface", title: "A simple service dashboard", copy: "Map a user journey and turn it into a useful dashboard with organized information and controls.", colors: "from-coral-500/20 to-orange-400/10" },
  { icon: Workflow, type: "Workflow concept", title: "An everyday task automation", copy: "Spot a repeatable task, sketch a better flow, and prototype how connected steps could work.", colors: "from-violet-500/20 to-indigo-400/10" },
];

export default function StudentsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isConnectRequested, setIsConnectRequested] = useState(true);
  const [requestedFormIntent, setRequestedFormIntent] = useState("enquiry");
  const [activeSlide, setActiveSlide] = useState(0);
  const hasStudentFormHash = ["#student-connect", "#student-internship"].includes(location.hash);
  const isConnectOpen = hasStudentFormHash || isConnectRequested;
  const formIntent = location.hash === "#student-internship"
    ? "internship"
    : hasStudentFormHash
      ? "enquiry"
      : requestedFormIntent;

  const showSlide = useCallback((index) => {
    setActiveSlide((index + studentSlides.length) % studentSlides.length);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((slide) => (slide + 1) % studentSlides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, []);

  const openStudentForm = (intent) => {
    setRequestedFormIntent(intent);
    setIsConnectRequested(true);
  };

  const closeConnect = useCallback(() => {
    setIsConnectRequested(false);
    if (["#student-connect", "#student-internship"].includes(location.hash)) {
      navigate({ pathname: location.pathname, search: location.search }, { replace: true });
    }
  }, [location.hash, location.pathname, location.search, navigate]);

  return (
    <div className="page-shell relative overflow-x-clip">
      <Spotlight />
      <Navbar onStudentEnquiry={() => openStudentForm("enquiry")} />
      <main className="relative z-10">
        <section className="px-4 pb-10 pt-10 sm:px-6 sm:pt-14">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.12fr_0.88fr]">
            <div className="surface-panel rounded-[30px] p-6 sm:rounded-[38px] sm:p-10 lg:p-12">
              <p className="eyebrow">Student programs</p>
              <h1 className="display-font mt-4 max-w-4xl text-4xl leading-[1.04] text-[var(--text-strong)] sm:text-5xl lg:text-6xl">
                Turn what you learn into experience that moves you forward.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--text-body)]">
                Explore practical courses, internship opportunities, corporate and industry exposure, and introductory sessions designed to help students take a confident first step.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" onClick={() => openStudentForm("enquiry")} aria-haspopup="dialog" className="brand-button inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold">
                  Ask about student programs <ArrowRight size={17} />
                </button>
                <button type="button" onClick={() => openStudentForm("internship")} aria-haspopup="dialog" className="secondary-button inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold">
                  Apply for an internship <BriefcaseBusiness size={16} />
                </button>
                <a href="#student-programs" className="secondary-button rounded-full px-5 py-3 font-semibold">Explore opportunities</a>
              </div>
              <div className="mt-8 flex flex-wrap gap-2">
                {["Hands-on projects", "Industry exposure sessions", "Internship opportunities"].map((item) => (
                  <span key={item} className="rounded-full border border-[var(--chip-border)] bg-[var(--chip-bg)] px-3 py-2 text-xs font-semibold text-[var(--text-body)]">{item}</span>
                ))}
              </div>
            </div>

            <div className="student-carousel relative min-h-[25rem] overflow-hidden rounded-[30px] p-6 text-white sm:rounded-[38px] sm:p-9" aria-roledescription="carousel" aria-label="Student opportunities">
              <AnimatePresence mode="wait">
                {studentSlides.map((slide, index) => {
                  if (index !== activeSlide) return null;
                  const SlideIcon = slide.icon;
                  return (
                    <motion.div key={slide.title} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className={`absolute inset-0 flex flex-col justify-between bg-gradient-to-br ${slide.theme} p-6 sm:p-9`} aria-live="polite">
                      <div className="absolute -right-10 -top-12 h-56 w-56 rounded-full border border-white/15 bg-white/[0.06]" />
                      <div className="absolute -bottom-24 right-10 h-64 w-64 rounded-full border border-white/10" />
                      <div className="relative flex items-center justify-between gap-3">
                        <span className="rounded-full border border-white/20 bg-black/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em]">{slide.eyebrow}</span>
                        <SlideIcon size={24} className="text-white/85" />
                      </div>
                      <div className="relative my-8">
                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/20 bg-white/10 shadow-lg backdrop-blur-sm"><SlideIcon size={38} strokeWidth={1.4} /></div>
                        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-white/70">{slide.label}</p>
                        <h2 className="display-font max-w-lg text-3xl leading-[1.1] sm:text-4xl">{slide.title}</h2>
                        <p className="mt-4 max-w-lg text-sm leading-6 text-white/80 sm:text-base">{slide.copy}</p>
                      </div>
                      <div className="relative flex items-center justify-between gap-4 border-t border-white/20 pt-5">
                        <Link to={activeSlide === 2 ? "#student-internship" : "#student-connect"} className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-white/80">{activeSlide === 2 ? "Apply for an internship" : "Explore student programs"} <ArrowRight size={16} /></Link>
                        <div className="flex items-center gap-2">
                          <button type="button" onClick={() => showSlide(activeSlide - 1)} className="carousel-control" aria-label="Previous student highlight"><ArrowLeft size={17} /></button>
                          <span className="px-1 text-xs font-semibold text-white/75">0{activeSlide + 1} / 0{studentSlides.length}</span>
                          <button type="button" onClick={() => showSlide(activeSlide + 1)} className="carousel-control" aria-label="Next student highlight"><ArrowRight size={17} /></button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <section id="student-programs" className="scroll-mt-28 px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="eyebrow">What you can explore</p>
              <h2 className="display-font mt-3 text-3xl text-[var(--text-strong)] sm:text-4xl">A practical bridge between learning and work.</h2>
              <p className="mt-4 text-base leading-7 text-[var(--text-body)]">Build foundations, understand the workplace, and discover which next step fits your goals.</p>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {opportunities.map(({ icon: Icon, eyebrow, title, copy }, index) => (
                <motion.article key={title} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, delay: index * 0.08 }} whileHover={{ y: -5 }} className="surface-panel rounded-[28px] p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-[0.16em] text-mint-500">0{index + 1}</span>
                    <span className="rounded-2xl bg-mint-500/10 p-3 text-mint-500"><Icon size={21} /></span>
                  </div>
                  <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--text-soft)]">{eyebrow}</p>
                  <h3 className="mt-2 text-xl font-semibold text-[var(--text-strong)]">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--text-body)]">{copy}</p>
                  <Link to={index === 1 ? "#student-internship" : "#student-connect"} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mint-500">{index === 1 ? "Apply for an internship" : "Ask about this program"}<ArrowUpRight size={15} /></Link>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="student-courses" className="scroll-mt-28 px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div className="max-w-3xl">
                <p className="eyebrow">Course pathways</p>
                <h2 className="display-font mt-3 text-3xl text-[var(--text-strong)] sm:text-4xl">Choose a skill track. Build something real.</h2>
                <p className="mt-4 leading-7 text-[var(--text-body)]">Our practical learning tracks connect course work with sample projects, internship opportunities, corporate exposure, industry sessions, and introductory sessions.</p>
              </div>
              <Link to="#student-connect" className="secondary-button inline-flex w-fit items-center gap-2 rounded-full px-5 py-3 font-semibold">Find your course <ArrowRight size={16} /></Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {courses.map(({ icon: Icon, category, title, copy, gradient, number }, index) => (
                <motion.article key={title} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.18 }} transition={{ duration: 0.5, delay: index * 0.09 }} whileHover={{ y: -7, rotate: index % 2 ? 0.35 : -0.35 }} className="surface-panel group overflow-hidden rounded-[28px]">
                  <div className={`relative flex h-48 flex-col justify-between overflow-hidden bg-gradient-to-br ${gradient} p-5 text-white`}>
                    <div className="absolute -right-7 -top-10 h-36 w-36 rounded-full border border-white/10 bg-white/[0.04] transition-transform duration-500 group-hover:scale-125" />
                    <div className="relative flex items-center justify-between">
                      <span className="rounded-full border border-white/15 bg-black/10 px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.15em]">Course poster</span>
                      <span className="text-sm font-bold text-white/70">{number}</span>
                    </div>
                    <div className="relative flex items-end justify-between">
                      <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/65">{category}</p><p className="mt-2 max-w-[13rem] text-2xl font-semibold leading-tight">{title}</p></div>
                      <Icon size={36} strokeWidth={1.3} className="shrink-0 text-white/85" />
                    </div>
                  </div>
                  <div className="p-5">
                    <p className="min-h-[4.5rem] text-sm leading-6 text-[var(--text-body)]">{copy}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {["Project practice", "Internship opportunity", "Industry sessions"].map((tag) => <span key={tag} className="rounded-full bg-[var(--chip-bg)] px-2.5 py-1.5 text-[0.68rem] font-semibold text-[var(--text-body)]">{tag}</span>)}
                    </div>
                    <Link to="#student-connect" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-mint-500">Ask about this track <ArrowUpRight size={15} /></Link>
                  </div>
                </motion.article>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-[var(--text-soft)]">Internship opportunities and program details are shared during enquiry and depend on the specific track and availability.</p>
          </div>
        </section>

        <section id="student-projects" className="scroll-mt-28 px-4 py-10 sm:px-6 sm:py-14">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="eyebrow">Project studio</p>
              <h2 className="display-font mt-3 text-3xl text-[var(--text-strong)] sm:text-4xl">Learn through projects you can explain and show.</h2>
              <p className="mt-4 leading-7 text-[var(--text-body)]">These sample project briefs show the kind of practical work students can explore as they build confidence.</p>
            </div>
            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {projectIdeas.map(({ icon: Icon, type, title, copy, colors }, index) => (
                <motion.article key={title} initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ y: -5 }} className="surface-panel overflow-hidden rounded-[28px] p-4">
                  <div className={`relative flex h-48 items-end overflow-hidden rounded-[21px] bg-gradient-to-br ${colors} p-5`}>
                    <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px)", backgroundSize: "28px 28px", maskImage: "linear-gradient(180deg, black, transparent)" }} />
                    <div className="absolute right-5 top-5 flex h-20 w-20 items-center justify-center rounded-[24px] border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-sm"><Icon size={36} strokeWidth={1.3} /></div>
                    <div className="relative rounded-full border border-white/20 bg-slate-950/25 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">Sample project {index + 1}</div>
                  </div>
                  <div className="px-2 pb-2 pt-5">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-coral-500">{type}</p>
                    <h3 className="mt-2 text-xl font-semibold text-[var(--text-strong)]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">{copy}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section id="learning-path" className="scroll-mt-28 px-4 py-10 sm:px-6 sm:py-14">
          <div className="surface-panel mx-auto max-w-7xl rounded-[30px] p-6 sm:rounded-[38px] sm:p-10 lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <p className="eyebrow">A clear learning path</p>
                <h2 className="display-font mt-3 text-3xl text-[var(--text-strong)] sm:text-4xl">Go from curious to career ready, one step at a time.</h2>
                <p className="mt-4 leading-7 text-[var(--text-body)]">Start where you are. Learn the fundamentals, get a view of the industry, then explore ways to apply your skills.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {steps.map(([number, title, copy]) => (
                  <div key={number} className="rounded-[24px] border border-[var(--chip-border)] bg-[var(--surface-strong)] p-5">
                    <span className="text-sm font-bold text-coral-500">{number}</span>
                    <h3 className="mt-3 text-lg font-semibold text-[var(--text-strong)]">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--text-body)]">{copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <TestimonialsSection />

        <StudentConnectForm isOpen={isConnectOpen} onClose={closeConnect} intent={formIntent} />

        <Footer />
      </main>
    </div>
  );
}

