import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  Code2,
  Layers3,
  Quote,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Spotlight from "../components/Spotlight";
import "./PortfolioPage.css";

const projects = [
  {
    number: "01",
    name: "Coding Club Frontend",
    category: "Learning platform",
    description:
      "A welcoming frontend for a coding community, with a clear path into its learning and project experiences.",
    deliverables: ["Frontend experience", "Responsive layouts", "Program discovery"],
    visual: "learning",
    icon: Code2,
    href: "",
    linkLabel: "Ask us about this build",
  },
  {
    number: "02",
    name: "CoreHire Solutions",
    category: "Recruitment & careers",
    description:
      "A digital home for a recruiting team, helping employers and candidates understand the services and next steps.",
    deliverables: ["Recruitment website", "Role discovery", "Candidate journeys"],
    visual: "hiring",
    icon: BriefcaseBusiness,
    href: "https://corehiresolutions.in/",
    linkLabel: "Visit CoreHire",
  },
  {
    number: "03",
    name: "Clickkdesi Store",
    category: "E-commerce",
    description:
      "An online storefront for premium cotton wear, designed to make browsing the collection feel simple and inviting.",
    deliverables: ["Online storefront", "Product discovery", "Shopping experience"],
    visual: "commerce",
    icon: ShoppingBag,
    href: "https://clickkdesistore.in/",
    linkLabel: "Visit Clickkdesi",
  },
];

const approach = [
  {
    number: "01",
    title: "Get the real brief",
    description: "We start with the people, goals, and constraints behind the request.",
  },
  {
    number: "02",
    title: "Make the path clear",
    description: "We shape the structure and visual direction before polishing details.",
  },
  {
    number: "03",
    title: "Build, review, launch",
    description: "You see working progress, give focused feedback, and get a clean handoff.",
  },
];

const testimonials = [
  {
    quote:
      "The experience feels much easier to follow. It finally brings the right information together in one place.",
    name: "Ananya Sharma",
    role: "Founder, consumer brand",
    initials: "AS",
    tone: "mint",
  },
  {
    quote:
      "The team kept the process clear at every step, and the finished experience feels considered on mobile too.",
    name: "Rohan Mehta",
    role: "Operations lead, hiring team",
    initials: "RM",
    tone: "peach",
  },
  {
    quote:
      "We could focus on the goals while the details were handled thoughtfully. The handoff was easy to work with.",
    name: "Priya Nair",
    role: "Project partner, India",
    initials: "PN",
    tone: "lavender",
  },
];

function ProjectVisual({ project }) {
  const Icon = project.icon;

  return (
    <div className={`portfolio-project-art portfolio-project-art--${project.visual}`}>
      <div className="portfolio-art-topline">
        <span className="portfolio-art-brand">
          <span className="portfolio-art-brand__mark">{project.name.slice(0, 1)}</span>
          {project.name}
        </span>
        <span className="portfolio-art-indicator" aria-label="Project preview">
          <span /> Preview
        </span>
      </div>

      {project.visual === "learning" && (
        <div className="portfolio-learning-scene" aria-hidden="true">
          <div className="portfolio-learning-copy">
            <span className="portfolio-art-kicker">LEARN BY MAKING</span>
            <span className="portfolio-learning-headline">Your next idea<br />starts here.</span>
            <span className="portfolio-learning-button">Explore programs <ArrowUpRight size={13} /></span>
          </div>
          <div className="portfolio-code-window">
            <div className="portfolio-code-window__bar"><i /><i /><i /></div>
            <div className="portfolio-code-window__body">
              <span className="code-line code-line--short" />
              <span className="code-line code-line--long" />
              <span className="code-line code-line--medium" />
              <span className="code-line code-line--small" />
              <span className="code-line code-line--long" />
            </div>
            <span className="portfolio-code-badge"><Code2 size={15} /> Build something real</span>
          </div>
          <div className="portfolio-learning-sticker"><Sparkles size={15} /> Made to explore</div>
        </div>
      )}

      {project.visual === "hiring" && (
        <div className="portfolio-hiring-scene" aria-hidden="true">
          <div className="portfolio-hiring-copy">
            <span className="portfolio-art-kicker">PEOPLE FIRST, ALWAYS</span>
            <span className="portfolio-hiring-headline">The right fit<br />moves everyone.</span>
            <span className="portfolio-hiring-link">Find your next step <ArrowUpRight size={13} /></span>
          </div>
          <div className="portfolio-hiring-card">
            <div className="portfolio-hiring-card__header"><Icon size={16} /><span>Career pathways</span><span className="portfolio-hiring-dots">•••</span></div>
            <div className="portfolio-role"><span className="portfolio-role__icon">IT</span><span><b>IT Support</b><small>Technology · Full time</small></span><ArrowUpRight size={14} /></div>
            <div className="portfolio-role"><span className="portfolio-role__icon portfolio-role__icon--coral">CS</span><span><b>Customer Support</b><small>People · Multiple roles</small></span><ArrowUpRight size={14} /></div>
            <span className="portfolio-hiring-card__foot"><Check size={13} /> Clear next steps for every candidate</span>
          </div>
          <span className="portfolio-orbit portfolio-orbit--one" />
          <span className="portfolio-orbit portfolio-orbit--two" />
        </div>
      )}

      {project.visual === "commerce" && (
        <div className="portfolio-commerce-scene" aria-hidden="true">
          <div className="portfolio-commerce-copy">
            <span className="portfolio-art-kicker">EVERYDAY, MADE BETTER</span>
            <span className="portfolio-commerce-headline">Cotton comfort,<br />with a little character.</span>
            <span className="portfolio-commerce-link">Discover the collection <ArrowUpRight size={13} /></span>
          </div>
          <div className="portfolio-product-tile portfolio-product-tile--one">
            <span className="portfolio-product-fabric portfolio-product-fabric--sand" />
            <span>Everyday cotton</span>
            <small>Made for the long run</small>
          </div>
          <div className="portfolio-product-tile portfolio-product-tile--two">
            <span className="portfolio-product-fabric portfolio-product-fabric--rose" />
            <span>Soft by nature</span>
            <small>Find your favourite</small>
          </div>
          <span className="portfolio-commerce-stamp">MADE TO<br />BE WORN</span>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, index }) {
  return (
    <motion.article
      className="portfolio-project-card"
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.55, delay: index * 0.08 }}
    >
      <ProjectVisual project={project} />
      <div className="portfolio-project-content">
        <div className="portfolio-project-meta">
          <span className="portfolio-project-number">{project.number}</span>
          <span className="portfolio-project-category">{project.category}</span>
        </div>
        <h3>{project.name}</h3>
        <p>{project.description}</p>
        <ul className="portfolio-deliverables" aria-label={`${project.name} project scope`}>
          {project.deliverables.map((item) => <li key={item}>{item}</li>)}
        </ul>
        {project.href ? (
          <a className="portfolio-project-link" href={project.href} target="_blank" rel="noreferrer">
            {project.linkLabel}<ArrowUpRight size={16} />
          </a>
        ) : (
          <Link className="portfolio-project-link" to="/contact">
            {project.linkLabel}<ArrowUpRight size={16} />
          </Link>
        )}
      </div>
    </motion.article>
  );
}

export default function PortfolioPage() {
  useEffect(() => {
    const metadata = [
      ["meta[name=\"description\"]", "Selected websites and digital experiences by Avenroo Technologies, including learning, recruitment, and e-commerce projects."],
      ["meta[property=\"og:title\"]", "Avenroo Technologies Portfolio | Selected Work"],
      ["meta[property=\"og:description\"]", "Thoughtful websites and digital experiences shaped around real people and business goals."],
      ["meta[property=\"og:url\"]", `${window.location.origin}/portfolio`],
      ["meta[name=\"twitter:title\"]", "Avenroo Technologies Portfolio | Selected Work"],
      ["meta[name=\"twitter:description\"]", "Thoughtful websites and digital experiences shaped around real people and business goals."],
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
    document.title = "Avenroo Technologies Portfolio | Selected Work";

    return () => {
      document.title = previousTitle;
      metadata.forEach(({ element, previousContent }) => {
        if (element && previousContent !== null) element.setAttribute("content", previousContent);
      });
      if (canonical && previousCanonical !== null) canonical.setAttribute("href", previousCanonical);
    };
  }, []);

  return (
    <div className="page-shell portfolio-page relative overflow-x-clip">
      <Spotlight />
      <Navbar />

      <main className="relative z-10">
        <section className="portfolio-hero px-4 pb-14 pt-7 sm:px-6 sm:pb-20 sm:pt-10">
          <motion.div
            className="portfolio-hero-inner mx-auto max-w-7xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65 }}
          >
            <div className="portfolio-hero-copy">
              <p className="eyebrow"><span className="portfolio-eyebrow-dot" /> Selected work · Avenroo Technologies</p>
              <h1 className="display-font">Good work should make the next step <em>feel easy.</em></h1>
              <p className="portfolio-hero-description">
                Websites and digital experiences shaped around real people, clear goals, and the way a business actually works.
              </p>
              <div className="portfolio-hero-actions">
                <a className="brand-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold" href="#work">
                  Explore selected work <ArrowDown size={16} />
                </a>
                <Link className="portfolio-text-link" to="/contact">Have a project in mind? <ArrowUpRight size={15} /></Link>
              </div>
              <div className="portfolio-hero-proof">
                <span><b>03</b> selected builds</span><i />
                <span><b>03</b> distinct journeys</span><i />
                <span><b>01</b> thoughtful team</span>
              </div>
            </div>

            <div className="portfolio-hero-art" aria-hidden="true">
              <div className="portfolio-hero-art__ring portfolio-hero-art__ring--outer" />
              <div className="portfolio-hero-art__ring portfolio-hero-art__ring--inner" />
              <div className="portfolio-hero-art__panel">
                <span className="portfolio-hero-art__overline">Avenroo · Digital studio</span>
                <span className="portfolio-hero-art__heading">From first<br />sketch to <em>shipped.</em></span>
                <div className="portfolio-hero-art__progress">
                  <span><i className="is-filled" /><i className="is-filled" /><i className="is-filled" /><i /></span>
                  <small>Build journey</small>
                </div>
                <div className="portfolio-hero-art__tag"><Sparkles size={14} /> Built around your goals</div>
              </div>
              <div className="portfolio-hero-art__orbit-dot portfolio-hero-art__orbit-dot--mint" />
              <div className="portfolio-hero-art__orbit-dot portfolio-hero-art__orbit-dot--coral" />
              <div className="portfolio-hero-art__caption"><Layers3 size={15} /> Digital work, made useful.</div>
            </div>
          </motion.div>
        </section>

        <section id="work" className="portfolio-work-section px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="portfolio-section-heading">
              <div>
                <p className="eyebrow">A few things we’ve made</p>
                <h2 className="display-font">Different businesses.<br /><em>Thoughtful digital work.</em></h2>
              </div>
              <p>Each project starts with a different audience and a different challenge. The common thread is a clear experience, built to be useful beyond launch day.</p>
            </div>

            <div className="portfolio-project-grid">
              {projects.map((project, index) => <ProjectCard key={project.number} project={project} index={index} />)}
            </div>
            <p className="portfolio-source-note">Project previews are visual summaries. The live project links open the public sites where available.</p>
          </div>
        </section>

        <section id="approach" className="portfolio-approach-section px-4 py-14 sm:px-6 sm:py-20">
          <div className="portfolio-approach-wrap mx-auto max-w-7xl">
            <div className="portfolio-approach-intro">
              <p className="eyebrow">A clear path from brief to launch</p>
              <h2 className="display-font">Good work comes from <em>good collaboration.</em></h2>
              <p>You stay close to the decisions that matter. We keep the details moving and the next step visible.</p>
              <Link to="/services" className="portfolio-text-link">How we work <ArrowUpRight size={15} /></Link>
            </div>
            <div className="portfolio-approach-list">
              {approach.map((step) => (
                <article className="portfolio-approach-step" key={step.number}>
                  <span className="portfolio-approach-number">{step.number}</span>
                  <div><h3>{step.title}</h3><p>{step.description}</p></div>
                  <Check size={17} aria-hidden="true" />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="portfolio-testimonials-section px-4 py-14 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="portfolio-section-heading portfolio-testimonials-heading">
              <div>
                <p className="eyebrow">The experience matters too</p>
                <h2 className="display-font">Good collaboration is part of <em>the deliverable.</em></h2>
              </div>
              <div className="portfolio-testimonial-disclosure"><Quote size={16} /> Sample testimonial copy · replace with client-approved quotes before publishing.</div>
            </div>
            <div className="portfolio-testimonial-grid">
              {testimonials.map((testimonial, index) => (
                <motion.article
                  className="portfolio-testimonial-card"
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                >
                  <div className="portfolio-quote-mark"><Quote size={19} fill="currentColor" /></div>
                  <p className="portfolio-testimonial-quote">“{testimonial.quote}”</p>
                  <div className="portfolio-testimonial-person">
                    <span className={`portfolio-avatar portfolio-avatar--${testimonial.tone}`}>{testimonial.initials}</span>
                    <span><b>{testimonial.name}</b><small>{testimonial.role}</small></span>
                    <span className="portfolio-sample-label">Sample</span>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        <section className="portfolio-cta-section px-4 pb-16 pt-8 sm:px-6 sm:pb-24 sm:pt-12">
          <div className="portfolio-cta-card mx-auto max-w-7xl">
            <div className="portfolio-cta-orb portfolio-cta-orb--one" />
            <div className="portfolio-cta-orb portfolio-cta-orb--two" />
            <div className="portfolio-cta-content">
              <p className="eyebrow">Your next build starts here</p>
              <h2 className="display-font">Bring us the idea.<br /><em>We’ll help make it real.</em></h2>
              <p>Tell us what you’re trying to improve, launch, or make simpler. We’ll help shape a useful next step.</p>
              <Link className="brand-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold" to="/contact">
                Start a conversation <ArrowUpRight size={16} />
              </Link>
            </div>
            <div className="portfolio-cta-signature"><span>AV</span><small>Avenroo Technologies<br />Build with clarity.</small></div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
