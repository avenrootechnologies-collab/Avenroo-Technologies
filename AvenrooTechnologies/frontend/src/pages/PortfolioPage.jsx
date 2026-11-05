import { createElement, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Code2,
  BriefcaseBusiness,
  Layers3,
  Pause,
  Play,
  Quote,
  ShoppingBag,
  UsersRound,
  Workflow,
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Spotlight from "../components/Spotlight";
import API from "../api/axios";
import { defaultPortfolioContent } from "../content/defaultPortfolio";
import "./PortfolioPage.css";

const iconMap = { Code2, Layers3, ShoppingBag, UsersRound, Workflow, BriefcaseBusiness };
const iconFor = (name) => iconMap[name] || BriefcaseBusiness;

function PortfolioIcon({ name, size }) {
  return createElement(iconFor(name), { size, "aria-hidden": true });
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function CarouselControls({ activeIndex, count, onSelect, label, isPlaying, onTogglePlay }) {
  return (
    <div className="portfolio-carousel-controls" role="group" aria-label={`${label} carousel controls`}>
      <button
        type="button"
        className="portfolio-carousel-arrow"
        onClick={() => onSelect((activeIndex - 1 + count) % count)}
        aria-label={`Previous ${label.toLowerCase()}`}
      >
        <ChevronLeft size={17} />
      </button>
      <div className="portfolio-carousel-dots" role="group" aria-label={`${label} slides`}>
        {Array.from({ length: count }, (_, index) => (
          <button
            key={index}
            type="button"
            className={index === activeIndex ? "is-active" : ""}
            onClick={() => onSelect(index)}
            aria-label={`Show ${label.toLowerCase()} ${index + 1}`}
            aria-current={index === activeIndex ? "true" : undefined}
          />
        ))}
      </div>
      <button
        type="button"
        className="portfolio-carousel-arrow"
        onClick={() => onSelect((activeIndex + 1) % count)}
        aria-label={`Next ${label.toLowerCase()}`}
      >
        <ChevronRight size={17} />
      </button>
      <button
        type="button"
        className="portfolio-carousel-arrow portfolio-carousel-play"
        onClick={onTogglePlay}
        aria-label={isPlaying ? `Pause ${label.toLowerCase()} carousel` : `Play ${label.toLowerCase()} carousel`}
        aria-pressed={!isPlaying}
        title={isPlaying ? "Pause automatic rotation" : "Resume automatic rotation"}
      >
        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
      </button>
    </div>
  );
}

function HeroPrincipleCarousel({ slides, principles }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(() => !prefersReducedMotion());
  const selectedIndex = slides.length ? activeIndex % slides.length : 0;
  const slide = slides[selectedIndex] || slides[0];

  useEffect(() => {
    if (!isPlaying || slides.length < 2) return undefined;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [isPlaying, slides.length]);

  if (!slide) return null;

  return (
    <div className="portfolio-hero-art" role="region" aria-roledescription="carousel" aria-label="Avenroo principles">
      <div className="portfolio-hero-art__topline"><span>OUR APPROACH</span><span>{String(selectedIndex + 1).padStart(2, "0")} — {String(slides.length).padStart(2, "0")}</span></div>
      <div key={slide.id || activeIndex} className="portfolio-hero-art__slide" aria-live={isPlaying ? "off" : "polite"}>
        <p className="portfolio-hero-art__statement">{slide.first}<br />{slide.second} <em>{slide.emphasis}</em></p>
        <p className="portfolio-hero-art__caption">{slide.caption}</p>
      </div>
      <div className="portfolio-hero-art__footer">
        <div className="portfolio-hero-art__principles">
          {principles.map((principle, index) => <span key={`${principle}-${index}`}><Check size={15} /> {principle}</span>)}
        </div>
        <CarouselControls activeIndex={selectedIndex} count={slides.length} onSelect={setActiveIndex} label="Principle" isPlaying={isPlaying} onTogglePlay={() => setIsPlaying((playing) => !playing)} />
      </div>
      <div className="portfolio-hero-art__mark" aria-hidden="true">A<span>.</span></div>
    </div>
  );
}

function ProjectReviewsCarousel({ projects, section }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(() => !prefersReducedMotion());
  const slides = projects.filter((project) => project.isPublished !== false).flatMap((project) => {
    const published = (project.reviews || []).filter((review) => review.isPublished && review.quote && review.attribution);
    return published.length
      ? published.map((review) => ({ ...review, project }))
      : [{ project, quote: "", attribution: section.pendingLabel, role: "" }];
  });
  const selectedIndex = slides.length ? activeIndex % slides.length : 0;
  const review = slides[selectedIndex] || slides[0];

  useEffect(() => {
    if (!isPlaying || slides.length < 2) return undefined;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(interval);
  }, [isPlaying, slides.length]);

  if (!review) return null;

  return (
    <section id="client-feedback" className="portfolio-reviews-section px-4 py-16 sm:px-6 sm:py-20">
      <div className="portfolio-reviews-wrap mx-auto max-w-7xl">
        <div className="portfolio-reviews-heading">
          <p className="eyebrow">{section.eyebrow}</p>
          <h2 className="display-font">{section.title}</h2>
          <p>{section.description}</p>
        </div>
        <div className="portfolio-review-card" role="region" aria-roledescription="carousel" aria-label="Project client reviews">
          <div className="portfolio-review-project">
            <span>{review.project.number}</span>
            <span>{review.project.name}</span>
            <span>{review.project.category}</span>
          </div>
          <div key={`${review.project.id}-${activeIndex}`} className="portfolio-review-quote" aria-live={isPlaying ? "off" : "polite"}>
            <Quote size={20} aria-hidden="true" />
            <blockquote>
              {review.quote || `Approved client feedback for ${review.project.name} will appear here.`}
            </blockquote>
          </div>
          <div className="portfolio-review-footer">
            <div className="portfolio-review-attribution">
              <strong>{review.attribution || section.pendingLabel}</strong>
              {review.role && <span>{review.role}</span>}
            </div>
            <CarouselControls activeIndex={selectedIndex} count={slides.length} onSelect={setActiveIndex} label="Project review" isPlaying={isPlaying} onTogglePlay={() => setIsPlaying((playing) => !playing)} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectPreview({ project }) {
  return (
    <div className={`portfolio-preview portfolio-preview--${project.visual}`} aria-hidden="true">
      <div className="portfolio-preview-window">
        <div className="portfolio-preview-bar">
          <span className="portfolio-preview-dots"><i /><i /><i /></span>
          <span className="portfolio-preview-url">{project.name.toLowerCase().replaceAll(" ", "-")}.in</span>
          <PortfolioIcon name={project.icon} size={15} />
        </div>
        <div className="portfolio-preview-content">
          <span className="portfolio-preview-kicker">{project.previewKicker}</span>
          <strong>{project.previewTitle}</strong>
          <span className="portfolio-preview-link">{project.previewLinkLabel} <ArrowUpRight size={13} /></span>
          {project.visual === "learning" && <div className="portfolio-preview-cards"><i /><i /><i /></div>}
          {project.visual === "hiring" && <div className="portfolio-preview-list"><i /><i /></div>}
          {project.visual === "commerce" && <div className="portfolio-preview-products"><i /><i /><i /></div>}
          {project.visual === "generic" && <div className="portfolio-preview-list"><i /><i /><i /></div>}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, index }) {
  const isExternal = project.href?.startsWith("https://") || false;

  return (
    <motion.article
      className="portfolio-project-card"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
    >
      <ProjectPreview project={project} />
      <div className="portfolio-project-content">
        <div className="portfolio-project-meta">
          <span>{project.number}</span>
          <span>{project.category}</span>
        </div>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <span className="portfolio-project-scope">{project.scope}</span>
        {project.href && <a
            className="portfolio-project-link"
            href={project.href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer" : undefined}
          >
            {project.linkLabel}<ArrowUpRight size={15} />
          </a>}
      </div>
    </motion.article>
  );
}

export default function PortfolioPage() {
  const [content, setContent] = useState(defaultPortfolioContent);

  useEffect(() => {
    let active = true;
    API.get("/portfolio")
      .then((response) => {
        if (active && response.data?.content) setContent(response.data.content);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const pageTitle = "Avenroo Technologies | Digital Work for Business";
    const description = "Selected digital work, capabilities, and delivery approach from Avenroo Technologies.";
    const metadata = [
      ["meta[name=\"description\"]", description],
      ["meta[property=\"og:title\"]", pageTitle],
      ["meta[property=\"og:description\"]", description],
      ["meta[property=\"og:url\"]", `${window.location.origin}/portfolio`],
      ["meta[name=\"twitter:title\"]", pageTitle],
      ["meta[name=\"twitter:description\"]", description],
    ].map(([selector, content]) => {
      const element = document.querySelector(selector);
      const previousContent = element?.getAttribute("content");
      if (element) element.setAttribute("content", content);
      return { element, previousContent };
    });
    const canonical = document.querySelector("link[rel=\"canonical\"]");
    const previousCanonical = canonical?.getAttribute("href");
    if (canonical) canonical.setAttribute("href", `${window.location.origin}/portfolio`);
    const previousTitle = document.title;
    document.title = pageTitle;

    return () => {
      document.title = previousTitle;
      metadata.forEach(({ element, previousContent }) => {
        if (element && previousContent !== null) element.setAttribute("content", previousContent);
      });
      if (canonical && previousCanonical !== null) canonical.setAttribute("href", previousCanonical);
    };
  }, []);

  const hero = content.hero || defaultPortfolioContent.hero;
  const projects = (content.projects || []).filter((project) => project.isPublished !== false);
  const heroSlides = hero.slides?.length ? hero.slides : defaultPortfolioContent.hero.slides;
  const direction = content.direction || defaultPortfolioContent.direction;
  const capabilitySection = content.capabilitySection || defaultPortfolioContent.capabilitySection;
  const processSection = content.processSection || defaultPortfolioContent.processSection;
  const cta = content.cta || defaultPortfolioContent.cta;

  return (
    <div className="page-shell portfolio-page relative overflow-x-clip">
      <Spotlight />
      <Navbar />

      <main className="relative z-10">
        <section className="portfolio-hero px-4 sm:px-6">
          <motion.div
            className="portfolio-hero-inner mx-auto max-w-7xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="portfolio-hero-copy">
              <p className="eyebrow">{hero.eyebrow}</p>
              <h1 className="display-font">{hero.title} <em>{hero.emphasis}</em></h1>
              <p className="portfolio-hero-description">{hero.description}</p>
              <div className="portfolio-hero-actions">
                <a className="brand-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold" href="#work">
                  {hero.workCtaLabel} <ArrowDown size={15} />
                </a>
                <Link className="portfolio-text-link" to="/contact">{hero.contactCtaLabel} <ArrowRight size={15} /></Link>
              </div>
              <div className="portfolio-hero-tags" aria-label="Capabilities">
                {hero.tags.map((tag, index) => <span className="portfolio-hero-tag" key={`${tag}-${index}`}>{index > 0 && <i aria-hidden="true" />}{tag}</span>)}
              </div>
            </div>

            <HeroPrincipleCarousel slides={heroSlides} principles={hero.principles || []} />
          </motion.div>
        </section>

        <section id="work" className="portfolio-work-section px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="portfolio-section-heading">
              <div>
                <p className="eyebrow">{content.workSection.eyebrow}</p>
                <h2 className="display-font">{content.workSection.title}<br /><em>{content.workSection.emphasis}</em></h2>
              </div>
              <p>{content.workSection.description}</p>
            </div>
            <div className="portfolio-project-grid">
              {projects.map((project, index) => <ProjectCard key={project.id || project.number} project={project} index={index} />)}
            </div>
            <p className="portfolio-source-note">{content.workSection.previewNote}</p>
          </div>
        </section>

        <ProjectReviewsCarousel projects={projects} section={content.reviewsSection} />

        <section id="direction" className="portfolio-direction-section px-4 py-16 sm:px-6 sm:py-20">
          <div className="portfolio-direction-wrap mx-auto max-w-7xl">
            <div className="portfolio-direction-heading">
              <p className="eyebrow">{direction.eyebrow}</p>
              <h2 className="display-font">{direction.title} <em>{direction.emphasis}</em></h2>
            </div>
            <div className="portfolio-direction-copy">
              <p>{direction.description}</p>
              <ul>
                {direction.principles.map((principle, index) => <li key={`${principle}-${index}`}><Check size={16} />{principle}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section id="capabilities" className="portfolio-capabilities-section px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="portfolio-section-heading">
              <div>
                <p className="eyebrow">{capabilitySection.eyebrow}</p>
                <h2 className="display-font">{capabilitySection.title} <em>{capabilitySection.emphasis}</em></h2>
              </div>
              <p>{capabilitySection.description}</p>
            </div>
            <div className="portfolio-capability-grid">
              {content.capabilities.map((item) => {
                return (
                  <article className="portfolio-capability" key={item.id || item.number}>
                    <div className="portfolio-capability-top"><span>{item.number}</span><PortfolioIcon name={item.icon} size={20} /></div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </article>
                );
              })}
            </div>
            <Link className="portfolio-text-link portfolio-services-link" to="/services">{capabilitySection.linkLabel} <ArrowUpRight size={15} /></Link>
          </div>
        </section>

        <section id="approach" className="portfolio-process-section px-4 py-16 sm:px-6 sm:py-20">
          <div className="portfolio-process-wrap mx-auto max-w-7xl">
            <div className="portfolio-process-intro">
              <p className="eyebrow">{processSection.eyebrow}</p>
              <h2 className="display-font">{processSection.title}<br /><em>{processSection.emphasis}</em></h2>
              <p>{processSection.description}</p>
            </div>
            <div className="portfolio-process-list">
              {content.process.map((step) => (
                <article className="portfolio-process-step" key={step.id || step.number}>
                  <span className="portfolio-process-number">{step.number}</span>
                  <div><h3>{step.title}</h3><p>{step.description}</p></div>
                  <ArrowRight size={17} aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="portfolio-cta-section px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
          <div className="portfolio-cta-card mx-auto max-w-7xl">
            <div className="portfolio-cta-content">
              <p className="eyebrow">{cta.eyebrow}</p>
              <h2 className="display-font">{cta.title}<br /><em>{cta.emphasis}</em></h2>
              <p>{cta.description}</p>
              <Link className="brand-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold" to="/contact">
                {cta.buttonLabel} <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="portfolio-cta-signature"><span>A.</span><small>Avenroo Technologies<br />Gurugram, India</small></div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
