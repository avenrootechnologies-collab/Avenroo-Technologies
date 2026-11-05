import { randomUUID } from "node:crypto";
import PortfolioContent from "../models/PortfolioContent.js";
import { isDatabaseReady } from "../config/db.js";
import defaultPortfolioContent from "../data/defaultPortfolio.js";

const cleanText = (value, maxLength = 500) =>
  (typeof value === "string" ? value : "").trim().slice(0, maxLength);
const asObject = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});
const asArray = (value, maxItems) => (Array.isArray(value) ? value.slice(0, maxItems) : []);
const makeId = (value) => cleanText(value, 80).replace(/[^a-zA-Z0-9_-]/g, "-") || randomUUID();
const safeHref = (value) => {
  const href = cleanText(value, 500);
  if (!href || href.includes("\\")) return "";

  try {
    const parsed = new URL(href, "https://avenroo.invalid");
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return "";
    if (href.startsWith("/") && !href.startsWith("//") && parsed.origin === "https://avenroo.invalid") {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
    return /^https:\/\//i.test(href) ? parsed.href : "";
  } catch {
    return "";
  }
};

const iconNames = new Set(["Code2", "UsersRound", "ShoppingBag", "Layers3", "Workflow", "BriefcaseBusiness"]);
const visualNames = new Set(["learning", "hiring", "commerce", "generic"]);

const normalizeReview = (review = {}) => ({
  id: makeId(review.id),
  quote: cleanText(review.quote, 2000),
  attribution: cleanText(review.attribution, 160),
  role: cleanText(review.role, 180),
  isPublished: review.isPublished === true,
});

const normalizeProject = (project = {}, index = 0) => ({
  id: makeId(project.id),
  number: cleanText(project.number, 20) || String(index + 1).padStart(2, "0"),
  name: cleanText(project.name, 120),
  category: cleanText(project.category, 80),
  description: cleanText(project.description, 1000),
  scope: cleanText(project.scope, 240),
  previewKicker: cleanText(project.previewKicker, 100),
  previewTitle: cleanText(project.previewTitle, 200),
  previewLinkLabel: cleanText(project.previewLinkLabel, 100),
  visual: visualNames.has(project.visual) ? project.visual : "generic",
  icon: iconNames.has(project.icon) ? project.icon : "BriefcaseBusiness",
  href: safeHref(project.href),
  linkLabel: cleanText(project.linkLabel, 100),
  isPublished: project.isPublished !== false,
  reviews: asArray(project.reviews, 10).map(normalizeReview),
});

const normalizeTextList = (value, maxItems = 20, maxLength = 240) =>
  asArray(value, maxItems).map((item) => cleanText(item, maxLength)).filter(Boolean);

const normalizeFeatureList = (value, maxItems, iconDefault) =>
  asArray(value, maxItems).map((item = {}, index) => ({
    id: makeId(item.id),
    number: cleanText(item.number, 20) || String(index + 1).padStart(2, "0"),
    title: cleanText(item.title, 180),
    description: cleanText(item.description, 1000),
    ...(iconDefault ? { icon: iconNames.has(item.icon) ? item.icon : iconDefault } : {}),
  }));

const normalizeCopySection = (value = {}, fallback = {}) => ({
  eyebrow: cleanText(value.eyebrow ?? fallback.eyebrow, 120),
  title: cleanText(value.title ?? fallback.title, 240),
  emphasis: cleanText(value.emphasis ?? fallback.emphasis, 180),
  description: cleanText(value.description ?? fallback.description, 1200),
});

const normalizePortfolio = (input) => {
  const source = asObject(input);
  const defaults = defaultPortfolioContent;
  const hero = asObject(source.hero);
  const direction = asObject(source.direction);
  const reviewsSection = asObject(source.reviewsSection);
  const capabilitySection = asObject(source.capabilitySection);
  const processSection = asObject(source.processSection);
  const cta = asObject(source.cta);

  const content = {
    hero: {
      eyebrow: cleanText(hero.eyebrow ?? defaults.hero.eyebrow, 120),
      title: cleanText(hero.title ?? defaults.hero.title, 240),
      emphasis: cleanText(hero.emphasis ?? defaults.hero.emphasis, 180),
      description: cleanText(hero.description ?? defaults.hero.description, 1200),
      tags: normalizeTextList(hero.tags ?? defaults.hero.tags, 12, 60),
      workCtaLabel: cleanText(hero.workCtaLabel ?? defaults.hero.workCtaLabel, 120),
      contactCtaLabel: cleanText(hero.contactCtaLabel ?? defaults.hero.contactCtaLabel, 120),
      principles: normalizeTextList(hero.principles ?? defaults.hero.principles, 8, 100),
      slides: asArray(hero.slides ?? defaults.hero.slides, 12).map((slide = {}) => ({
        id: makeId(slide.id),
        first: cleanText(slide.first, 180),
        second: cleanText(slide.second, 180),
        emphasis: cleanText(slide.emphasis, 180),
        caption: cleanText(slide.caption, 400),
      })),
    },
    workSection: {
      ...normalizeCopySection(source.workSection, defaults.workSection),
      previewNote: cleanText(source.workSection?.previewNote ?? defaults.workSection.previewNote, 300),
    },
    projects: asArray(source.projects ?? defaults.projects, 30).map(normalizeProject),
    reviewsSection: {
      eyebrow: cleanText(reviewsSection.eyebrow ?? defaults.reviewsSection.eyebrow, 120),
      title: cleanText(reviewsSection.title ?? defaults.reviewsSection.title, 240),
      description: cleanText(reviewsSection.description ?? defaults.reviewsSection.description, 1200),
      pendingLabel: cleanText(reviewsSection.pendingLabel ?? defaults.reviewsSection.pendingLabel, 140),
    },
    direction: {
      ...normalizeCopySection(direction, defaults.direction),
      principles: normalizeTextList(direction.principles ?? defaults.direction.principles, 20, 300),
    },
    capabilitySection: {
      ...normalizeCopySection(capabilitySection, defaults.capabilitySection),
      linkLabel: cleanText(capabilitySection.linkLabel ?? defaults.capabilitySection.linkLabel, 140),
    },
    capabilities: normalizeFeatureList(source.capabilities ?? defaults.capabilities, 20, "Layers3"),
    processSection: normalizeCopySection(processSection, defaults.processSection),
    process: normalizeFeatureList(source.process ?? defaults.process, 20),
    cta: {
      ...normalizeCopySection(cta, defaults.cta),
      buttonLabel: cleanText(cta.buttonLabel ?? defaults.cta.buttonLabel, 120),
    },
  };

  const errors = [];
  if ((Array.isArray(hero.slides) && hero.slides.length > 12) || (Array.isArray(source.projects) && source.projects.length > 30)) {
    errors.push("The portfolio supports up to 12 hero slides and 30 projects.");
  }
  if ((Array.isArray(source.capabilities) && source.capabilities.length > 20) || (Array.isArray(source.process) && source.process.length > 20)) {
    errors.push("The portfolio supports up to 20 capability cards and 20 delivery steps.");
  }
  if ((Array.isArray(direction.principles) && direction.principles.length > 20) || content.projects.some((project, index) => (source.projects?.[index]?.reviews?.length || 0) > 10)) {
    errors.push("The portfolio supports up to 20 direction principles and 10 reviews per project.");
  }
  if (!content.hero.title || !content.hero.description) errors.push("Hero title and description are required.");
  if (!content.hero.slides.length) errors.push("Add at least one hero carousel slide.");
  if (content.hero.slides.some((slide) => !slide.first || !slide.emphasis)) {
    errors.push("Each hero slide needs a first line and emphasized line.");
  }
  if (content.projects.some((project) => !project.name || !project.description)) {
    errors.push("Each project needs a name and description.");
  }
  if (asArray(source.projects, 30).some((project) => cleanText(project?.href, 500) && !safeHref(project.href))) {
    errors.push("Project links must be site-relative paths or secure https URLs.");
  }
  if (content.projects.some((project) => project.reviews.some((review) => review.isPublished && (!review.quote || !review.attribution)))) {
    errors.push("Published reviews need both approved quote text and an attribution.");
  }
  if (new Set(content.projects.map((project) => project.id)).size !== content.projects.length) {
    errors.push("Project IDs must be unique.");
  }
  if (content.projects.some((project) => new Set(project.reviews.map((review) => review.id)).size !== project.reviews.length)) {
    errors.push("Review IDs must be unique within each project.");
  }
  if (new Set(content.hero.slides.map((slide) => slide.id)).size !== content.hero.slides.length) {
    errors.push("Hero slide IDs must be unique.");
  }

  return { content, errors };
};

const portfolioResponse = (record, { publicView = false } = {}) => {
  const content = record?.content || defaultPortfolioContent;
  const visibleContent = publicView
    ? {
        ...content,
        projects: (content.projects || [])
          .filter((project) => project.isPublished !== false)
          .map((project) => ({
            ...project,
            reviews: (project.reviews || []).filter((review) => review.isPublished === true),
          })),
      }
    : content;

  if (publicView) return { content: visibleContent };

  return {
    content: visibleContent,
    updatedAt: record?.updatedAt || null,
    storage: record ? "mongodb" : "defaults",
  };
};

export const getPublicPortfolio = async (_req, res) => {
  if (!isDatabaseReady()) return res.json(portfolioResponse(null, { publicView: true }));

  try {
    const record = await PortfolioContent.findOne({ key: "public-portfolio" }).lean();
    return res.json(portfolioResponse(record, { publicView: true }));
  } catch {
    return res.json(portfolioResponse(null, { publicView: true }));
  }
};

export const getAdminPortfolio = async (_req, res) => {
  try {
    const record = isDatabaseReady()
      ? await PortfolioContent.findOne({ key: "public-portfolio" }).lean()
      : null;
    return res.json(portfolioResponse(record));
  } catch {
    return res.status(500).json({ message: "Unable to load portfolio content." });
  }
};

export const saveAdminPortfolio = async (req, res) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ message: "Portfolio editing requires the database to be connected." });
  }

  if (!req.body?.content || typeof req.body.content !== "object" || Array.isArray(req.body.content)) {
    return res.status(400).json({ message: "Provide portfolio content as an object." });
  }

  const { content, errors } = normalizePortfolio(req.body.content);
  if (errors.length) return res.status(400).json({ message: errors.join(" ") });

  try {
    const record = await PortfolioContent.findOneAndUpdate(
      { key: "public-portfolio" },
      { $set: { content } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    ).lean();
    return res.json(portfolioResponse(record));
  } catch {
    return res.status(500).json({ message: "Unable to save portfolio content." });
  }
};
