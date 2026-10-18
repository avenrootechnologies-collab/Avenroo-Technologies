import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, GraduationCap, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const slides = [
  {
    eyebrow: "For students and fresh graduates",
    title: "Learn the work. Meet the industry. Build your next step.",
    copy: "Explore practical courses and internship pathways designed to connect learning with real workplace expectations.",
    tag: "Internship opportunities",
  },
  {
    eyebrow: "Go beyond the classroom",
    title: "Build skills with corporate and industry exposure.",
    copy: "Get introduced to how teams work through exposure sessions, practical learning, and guidance from working professionals.",
    tag: "Corporate and industry sessions",
  },
  {
    eyebrow: "Start with the fundamentals",
    title: "A clearer introduction to your future career.",
    copy: "Join introductory sessions to explore technology roles, learning paths, and the skills employers look for.",
    tag: "Introductory sessions",
  },
];

export default function StudentBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const slide = slides[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  const move = (direction) => {
    setActiveIndex((index) => (index + direction + slides.length) % slides.length);
  };

  return (
    <section className="px-4 py-5 sm:px-6 sm:py-8" aria-label="Student programs">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[30px] border border-[var(--border)] bg-[var(--surface-inverse)] p-6 text-white shadow-[var(--shadow-panel)] sm:rounded-[38px] sm:p-9 lg:p-12">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <div key={activeIndex} className="student-banner-copy">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-mint-400">
                <GraduationCap size={15} /> Student programs
              </span>
              <span className="inline-flex items-center gap-2 text-sm text-white/65">
                <Sparkles size={15} className="text-coral-500" /> {slide.eyebrow}
              </span>
            </div>
            <p className="mt-6 text-sm font-semibold text-mint-400">{slide.tag}</p>
            <h2 className="display-font mt-3 max-w-3xl text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
              {slide.title}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/70 sm:text-lg sm:leading-8">
              {slide.copy}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link to="/students" className="brand-button inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">
                Explore student programs <ArrowRight size={16} />
              </Link>
              <div className="flex items-center gap-2" aria-label={`Slide ${activeIndex + 1} of ${slides.length}`}>
                {slides.map((item, index) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    aria-label={`Show slide ${index + 1}: ${item.tag}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                    className={`h-2.5 rounded-full transition-all ${index === activeIndex ? "w-8 bg-mint-400" : "w-2.5 bg-white/35 hover:bg-white/65"}`}
                  />
                ))}
              </div>
              <div className="ml-auto flex gap-2">
                <button type="button" onClick={() => move(-1)} className="theme-button border-white/15 text-white" aria-label="Previous student program slide"><ArrowLeft size={17} /></button>
                <button type="button" onClick={() => move(1)} className="theme-button border-white/15 text-white" aria-label="Next student program slide"><ArrowRight size={17} /></button>
              </div>
            </div>
          </div>
          <div className="hidden h-44 w-44 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] lg:flex">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-mint-400/25 to-coral-500/20 text-mint-400">
              <GraduationCap size={62} strokeWidth={1.25} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
