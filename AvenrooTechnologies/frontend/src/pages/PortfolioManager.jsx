import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import API from "../api/axios";
import { defaultPortfolioContent } from "../content/defaultPortfolio";
import "./PortfolioManager.css";

const newId = (prefix) => {
  const suffix = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return `${prefix}-${suffix}`;
};

const clone = (value) => JSON.parse(JSON.stringify(value));

function Field({ label, value, onChange, multiline = false, rows = 3, placeholder = "" }) {
  return (
    <label className="admin-portfolio-field">
      <span>{label}</span>
      {multiline ? (
        <textarea rows={rows} value={value ?? ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      ) : (
        <input value={value ?? ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      )}
    </label>
  );
}

function ItemActions({ index, count, onMove, onRemove, label }) {
  return (
    <div className="admin-portfolio-item-actions">
      <button type="button" className="admin-secondary-button" onClick={() => onMove(index, -1)} disabled={index === 0} aria-label={`Move ${label} up`} title="Move up"><ArrowUp size={15} /></button>
      <button type="button" className="admin-secondary-button" onClick={() => onMove(index, 1)} disabled={index === count - 1} aria-label={`Move ${label} down`} title="Move down"><ArrowDown size={15} /></button>
      <button type="button" className="admin-secondary-button admin-portfolio-remove" onClick={() => onRemove(index)} aria-label={`Remove ${label}`}><Trash2 size={15} /> Remove</button>
    </div>
  );
}

function SectionHeader({ eyebrow, title, description }) {
  return (
    <div className="admin-portfolio-section-heading">
      <div>
        <p className="admin-eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

export default function PortfolioManager({ announce }) {
  const [content, setContent] = useState(() => clone(defaultPortfolioContent));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadWarning, setLoadWarning] = useState("");
  const [saveError, setSaveError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [storage, setStorage] = useState("");

  useEffect(() => {
    let active = true;
    API.get("/admin/portfolio")
      .then((response) => {
        if (!active) return;
        if (response.data?.content) setContent(response.data.content);
        setUpdatedAt(response.data?.updatedAt || null);
        setStorage(response.data?.storage || "");
      })
      .catch((error) => {
        if (!active) return;
        setLoadWarning(error.response?.data?.message || "Saved portfolio content could not be loaded. The default copy is shown.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const updatePath = (path, value) => {
    setContent((current) => {
      const next = clone(current);
      let parent = next;
      for (const key of path.slice(0, -1)) parent = parent[key];
      parent[path[path.length - 1]] = value;
      return next;
    });
  };

  const updateItem = (path, index, key, value) => {
    setContent((current) => {
      const next = clone(current);
      let parent = next;
      for (const pathKey of path.slice(0, -1)) parent = parent[pathKey];
      parent[path[path.length - 1]][index][key] = value;
      return next;
    });
  };

  const updateNestedItem = (path, outerIndex, innerIndex, key, value) => {
    setContent((current) => {
      const next = clone(current);
      next[path[0]][outerIndex][path[1]][innerIndex][key] = value;
      return next;
    });
  };

  const addItem = (path, item) => updatePath(path, [...path.reduce((value, key) => value[key], content), item]);

  const removeItem = (path, index) => {
    const list = path.reduce((value, key) => value[key], content);
    updatePath(path, list.filter((_, itemIndex) => itemIndex !== index));
  };

  const moveItem = (path, index, offset) => {
    const list = [...path.reduce((value, key) => value[key], content)];
    const target = index + offset;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    updatePath(path, list);
  };

  const addReview = (projectIndex) => {
    const project = content.projects[projectIndex];
    updateItem(["projects"], projectIndex, "reviews", [
      ...(project.reviews || []),
      { id: newId("review"), quote: "", attribution: "", role: "", isPublished: false },
    ]);
  };

  const removeReview = (projectIndex, reviewIndex) => {
    const reviews = content.projects[projectIndex].reviews || [];
    updateItem(["projects"], projectIndex, "reviews", reviews.filter((_, index) => index !== reviewIndex));
  };

  const updateReview = (projectIndex, reviewIndex, key, value) => {
    updateNestedItem(["projects", "reviews"], projectIndex, reviewIndex, key, value);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      const response = await API.put("/admin/portfolio", { content });
      setContent(response.data.content);
      setUpdatedAt(response.data.updatedAt || new Date().toISOString());
      setStorage(response.data.storage || "mongodb");
      setLoadWarning("");
      announce("Portfolio content saved and published.");
    } catch (error) {
      setSaveError(error.response?.data?.message || "Portfolio content could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  const changedAt = updatedAt
    ? new Date(updatedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })
    : "Using starter content";

  if (loading) return <section className="admin-panel-card"><div className="admin-session-loader">Loading portfolio content…</div></section>;

  return (
    <form className="admin-portfolio-manager" onSubmit={handleSave}>
      <section className="admin-panel-card admin-portfolio-intro">
        <div>
          <p className="admin-eyebrow">Public site content</p>
          <h2>Manage the portfolio</h2>
          <p className="admin-panel-subtitle">Edit the copy, project listings, review carousel, capabilities, and delivery process. Saving updates the public portfolio.</p>
          <p className="admin-last-saved">{changedAt}{storage ? ` · ${storage}` : ""}</p>
        </div>
        <div className="admin-portfolio-intro-actions">
          <a className="admin-secondary-button" href="/portfolio" target="_blank" rel="noreferrer"><ExternalLink size={15} /> Preview page</a>
          <button className="admin-primary-button" type="submit" disabled={saving}><Save size={16} />{saving ? "Saving…" : "Save portfolio"}</button>
        </div>
      </section>

      {loadWarning && <div className="admin-warning-banner"><span>{loadWarning}</span></div>}
      {saveError && <div className="admin-warning-banner admin-portfolio-error" role="alert"><span>{saveError}</span></div>}

      <section className="admin-panel-card admin-portfolio-section">
        <SectionHeader eyebrow="01 · Hero" title="First impression" description="Main headline, description, capability tags, and the rotating hero carousel." />
        <div className="admin-portfolio-fields">
          <Field label="Eyebrow" value={content.hero.eyebrow} onChange={(value) => updatePath(["hero", "eyebrow"], value)} />
          <Field label="Headline" value={content.hero.title} onChange={(value) => updatePath(["hero", "title"], value)} />
          <Field label="Headline emphasis" value={content.hero.emphasis} onChange={(value) => updatePath(["hero", "emphasis"], value)} />
          <Field label="Capability tags (comma separated)" value={(content.hero.tags || []).join(", ")} onChange={(value) => updatePath(["hero", "tags"], value.split(",").map((tag) => tag.trim()).filter(Boolean))} />
          <Field label="Hero work button label" value={content.hero.workCtaLabel} onChange={(value) => updatePath(["hero", "workCtaLabel"], value)} />
          <Field label="Hero contact link label" value={content.hero.contactCtaLabel} onChange={(value) => updatePath(["hero", "contactCtaLabel"], value)} />
          <Field label="Hero principles (comma separated)" value={(content.hero.principles || []).join(", ")} onChange={(value) => updatePath(["hero", "principles"], value.split(",").map((item) => item.trim()).filter(Boolean))} />
          <Field label="Description" multiline rows={3} value={content.hero.description} onChange={(value) => updatePath(["hero", "description"], value)} />
        </div>
        <div className="admin-portfolio-list-heading"><h4>Carousel slides</h4><button type="button" className="admin-secondary-button" disabled={content.hero.slides.length >= 12} onClick={() => addItem(["hero", "slides"], { id: newId("hero"), first: "", second: "", emphasis: "", caption: "" })}><Plus size={15} /> Add slide</button></div>
        <div className="admin-portfolio-record-list">
          {content.hero.slides.map((slide, index) => (
            <article className="admin-portfolio-record" key={slide.id}>
              <div className="admin-portfolio-record-heading"><strong>Slide {index + 1}</strong><ItemActions index={index} count={content.hero.slides.length} onMove={(i, offset) => moveItem(["hero", "slides"], i, offset)} onRemove={(i) => removeItem(["hero", "slides"], i)} label={`slide ${index + 1}`} /></div>
              <div className="admin-portfolio-fields admin-portfolio-fields--three">
                <Field label="First line" value={slide.first} onChange={(value) => updateItem(["hero", "slides"], index, "first", value)} />
                <Field label="Second line" value={slide.second} onChange={(value) => updateItem(["hero", "slides"], index, "second", value)} />
                <Field label="Emphasized line" value={slide.emphasis} onChange={(value) => updateItem(["hero", "slides"], index, "emphasis", value)} />
                <Field label="Caption" value={slide.caption} onChange={(value) => updateItem(["hero", "slides"], index, "caption", value)} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-panel-card admin-portfolio-section">
        <SectionHeader eyebrow="02 · Selected work" title="Projects and client feedback" description="Project order follows the list. Publish or archive a project, manage its public link, and keep reviews in draft until they are approved." />
        <div className="admin-portfolio-fields admin-portfolio-fields--three">
          <Field label="Section eyebrow" value={content.workSection.eyebrow} onChange={(value) => updatePath(["workSection", "eyebrow"], value)} />
          <Field label="Section headline" value={content.workSection.title} onChange={(value) => updatePath(["workSection", "title"], value)} />
          <Field label="Headline emphasis" value={content.workSection.emphasis} onChange={(value) => updatePath(["workSection", "emphasis"], value)} />
          <Field label="Intro text" multiline value={content.workSection.description} onChange={(value) => updatePath(["workSection", "description"], value)} />
          <Field label="Project preview note" value={content.workSection.previewNote} onChange={(value) => updatePath(["workSection", "previewNote"], value)} />
        </div>
        <div className="admin-portfolio-list-heading"><h4>Project cards</h4><button type="button" className="admin-secondary-button" disabled={content.projects.length >= 30} onClick={() => addItem(["projects"], { id: newId("project"), number: String(content.projects.length + 1).padStart(2, "0"), name: "", category: "", description: "", scope: "", previewKicker: "", previewTitle: "", previewLinkLabel: "", visual: "generic", icon: "BriefcaseBusiness", href: "", linkLabel: "View project", isPublished: false, reviews: [] })}><Plus size={15} /> Add project</button></div>
        <div className="admin-portfolio-record-list">
          {content.projects.map((project, projectIndex) => (
            <article className="admin-portfolio-record" key={project.id}>
              <div className="admin-portfolio-record-heading">
                <strong>{project.name || `Project ${projectIndex + 1}`}</strong>
                <div className="admin-portfolio-record-heading-actions">
                  <label className="admin-portfolio-toggle"><input type="checkbox" checked={project.isPublished !== false} onChange={(event) => updateItem(["projects"], projectIndex, "isPublished", event.target.checked)} /><span>Published</span></label>
                  <ItemActions index={projectIndex} count={content.projects.length} onMove={(i, offset) => moveItem(["projects"], i, offset)} onRemove={(i) => removeItem(["projects"], i)} label={project.name || `project ${projectIndex + 1}`} />
                </div>
              </div>
              <div className="admin-portfolio-fields admin-portfolio-fields--three">
                <Field label="Display number" value={project.number} onChange={(value) => updateItem(["projects"], projectIndex, "number", value)} />
                <Field label="Project name" value={project.name} onChange={(value) => updateItem(["projects"], projectIndex, "name", value)} />
                <Field label="Category" value={project.category} onChange={(value) => updateItem(["projects"], projectIndex, "category", value)} />
                <Field label="Scope line" value={project.scope} onChange={(value) => updateItem(["projects"], projectIndex, "scope", value)} />
                <Field label="Project link" value={project.href} onChange={(value) => updateItem(["projects"], projectIndex, "href", value)} placeholder="/ or https://…" />
                <Field label="Link label" value={project.linkLabel} onChange={(value) => updateItem(["projects"], projectIndex, "linkLabel", value)} />
                <Field label="Description" multiline rows={3} value={project.description} onChange={(value) => updateItem(["projects"], projectIndex, "description", value)} />
                <Field label="Preview eyebrow" value={project.previewKicker} onChange={(value) => updateItem(["projects"], projectIndex, "previewKicker", value)} />
                <Field label="Preview headline" multiline rows={2} value={project.previewTitle} onChange={(value) => updateItem(["projects"], projectIndex, "previewTitle", value)} />
                <Field label="Preview action text" value={project.previewLinkLabel} onChange={(value) => updateItem(["projects"], projectIndex, "previewLinkLabel", value)} />
                <label className="admin-portfolio-field"><span>Preview style</span><select value={project.visual} onChange={(event) => updateItem(["projects"], projectIndex, "visual", event.target.value)}><option value="learning">Learning</option><option value="hiring">Recruitment</option><option value="commerce">Commerce</option><option value="generic">Generic</option></select></label>
                <label className="admin-portfolio-field"><span>Preview icon</span><select value={project.icon} onChange={(event) => updateItem(["projects"], projectIndex, "icon", event.target.value)}><option value="Code2">Code</option><option value="UsersRound">People</option><option value="ShoppingBag">Commerce</option><option value="BriefcaseBusiness">Business</option><option value="Layers3">Layers</option><option value="Workflow">Workflow</option></select></label>
              </div>

              <div className="admin-portfolio-review-editor">
                <div className="admin-portfolio-list-heading"><div><h4>Client reviews</h4><p>Published reviews appear in the public review carousel.</p></div><button type="button" className="admin-secondary-button" disabled={(project.reviews || []).length >= 10} onClick={() => addReview(projectIndex)}><Plus size={15} /> Add review</button></div>
                {(project.reviews || []).length ? project.reviews.map((review, reviewIndex) => (
                  <div className="admin-portfolio-review-record" key={review.id}>
                    <div className="admin-portfolio-record-heading"><strong>Review {reviewIndex + 1}</strong><button type="button" className="admin-portfolio-icon-delete" onClick={() => removeReview(projectIndex, reviewIndex)} aria-label={`Remove review ${reviewIndex + 1} for ${project.name}`}><Trash2 size={15} /></button></div>
                    <div className="admin-portfolio-fields admin-portfolio-fields--three">
                      <Field label="Approved quote" multiline rows={3} value={review.quote} onChange={(value) => updateReview(projectIndex, reviewIndex, "quote", value)} placeholder="Paste the client-approved review" />
                      <Field label="Reviewer name" value={review.attribution} onChange={(value) => updateReview(projectIndex, reviewIndex, "attribution", value)} />
                      <Field label="Role / organization" value={review.role} onChange={(value) => updateReview(projectIndex, reviewIndex, "role", value)} />
                    </div>
                    <label className="admin-portfolio-toggle admin-portfolio-review-publish"><input type="checkbox" checked={review.isPublished === true} onChange={(event) => updateReview(projectIndex, reviewIndex, "isPublished", event.target.checked)} /><span>Approved and publish this review</span></label>
                  </div>
                )) : <p className="admin-portfolio-empty">No review entries yet. Add a client-approved quote when it is available.</p>}
              </div>
            </article>
          ))}
        </div>
        <div className="admin-portfolio-fields admin-portfolio-fields--three admin-portfolio-subsection-fields">
          <Field label="Review section eyebrow" value={content.reviewsSection.eyebrow} onChange={(value) => updatePath(["reviewsSection", "eyebrow"], value)} />
          <Field label="Review section heading" value={content.reviewsSection.title} onChange={(value) => updatePath(["reviewsSection", "title"], value)} />
          <Field label="Pending review label" value={content.reviewsSection.pendingLabel} onChange={(value) => updatePath(["reviewsSection", "pendingLabel"], value)} />
          <Field label="Review section intro" multiline value={content.reviewsSection.description} onChange={(value) => updatePath(["reviewsSection", "description"], value)} />
        </div>
      </section>

      <section className="admin-panel-card admin-portfolio-section">
        <SectionHeader eyebrow="03 · Our direction" title="Vision and principles" description="Keep the company point of view and operating principles current." />
        <div className="admin-portfolio-fields admin-portfolio-fields--three">
          <Field label="Eyebrow" value={content.direction.eyebrow} onChange={(value) => updatePath(["direction", "eyebrow"], value)} />
          <Field label="Heading" value={content.direction.title} onChange={(value) => updatePath(["direction", "title"], value)} />
          <Field label="Heading emphasis" value={content.direction.emphasis} onChange={(value) => updatePath(["direction", "emphasis"], value)} />
          <Field label="Description" multiline value={content.direction.description} onChange={(value) => updatePath(["direction", "description"], value)} />
        </div>
        <div className="admin-portfolio-list-heading"><h4>Principles</h4><button type="button" className="admin-secondary-button" disabled={content.direction.principles.length >= 20} onClick={() => addItem(["direction", "principles"], "New principle")}><Plus size={15} /> Add principle</button></div>
        <div className="admin-portfolio-record-list admin-portfolio-record-list--compact">
          {content.direction.principles.map((principle, index) => (
            <div className="admin-portfolio-inline-row" key={`${index}-${principle}`}>
              <Field label={`Principle ${index + 1}`} value={principle} onChange={(value) => { const next = [...content.direction.principles]; next[index] = value; updatePath(["direction", "principles"], next); }} />
              <ItemActions index={index} count={content.direction.principles.length} onMove={(i, offset) => moveItem(["direction", "principles"], i, offset)} onRemove={(i) => removeItem(["direction", "principles"], i)} label={`principle ${index + 1}`} />
            </div>
          ))}
        </div>
      </section>

      <section className="admin-panel-card admin-portfolio-section">
        <SectionHeader eyebrow="04 · Capabilities" title="Service capabilities" description="Edit the capability cards and the link to the detailed services page." />
        <div className="admin-portfolio-fields admin-portfolio-fields--three">
          <Field label="Eyebrow" value={content.capabilitySection.eyebrow} onChange={(value) => updatePath(["capabilitySection", "eyebrow"], value)} />
          <Field label="Heading" value={content.capabilitySection.title} onChange={(value) => updatePath(["capabilitySection", "title"], value)} />
          <Field label="Heading emphasis" value={content.capabilitySection.emphasis} onChange={(value) => updatePath(["capabilitySection", "emphasis"], value)} />
          <Field label="Description" multiline value={content.capabilitySection.description} onChange={(value) => updatePath(["capabilitySection", "description"], value)} />
          <Field label="Services link label" value={content.capabilitySection.linkLabel} onChange={(value) => updatePath(["capabilitySection", "linkLabel"], value)} />
        </div>
        <div className="admin-portfolio-list-heading"><h4>Capability cards</h4><button type="button" className="admin-secondary-button" disabled={content.capabilities.length >= 20} onClick={() => addItem(["capabilities"], { id: newId("capability"), number: String(content.capabilities.length + 1).padStart(2, "0"), title: "", description: "", icon: "Layers3" })}><Plus size={15} /> Add capability</button></div>
        <div className="admin-portfolio-record-list">
          {content.capabilities.map((item, index) => (
            <article className="admin-portfolio-record" key={item.id}>
              <div className="admin-portfolio-record-heading"><strong>Capability {index + 1}</strong><ItemActions index={index} count={content.capabilities.length} onMove={(i, offset) => moveItem(["capabilities"], i, offset)} onRemove={(i) => removeItem(["capabilities"], i)} label={`capability ${index + 1}`} /></div>
              <div className="admin-portfolio-fields admin-portfolio-fields--three">
                <Field label="Number" value={item.number} onChange={(value) => updateItem(["capabilities"], index, "number", value)} />
                <Field label="Title" value={item.title} onChange={(value) => updateItem(["capabilities"], index, "title", value)} />
                <label className="admin-portfolio-field"><span>Icon</span><select value={item.icon} onChange={(event) => updateItem(["capabilities"], index, "icon", event.target.value)}><option value="Layers3">Layers</option><option value="Code2">Code</option><option value="UsersRound">People</option><option value="ShoppingBag">Commerce</option><option value="Workflow">Workflow</option><option value="BriefcaseBusiness">Business</option></select></label>
                <Field label="Description" multiline value={item.description} onChange={(value) => updateItem(["capabilities"], index, "description", value)} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-panel-card admin-portfolio-section">
        <SectionHeader eyebrow="05 · Delivery" title="How we work" description="Maintain the process heading and ordered delivery steps." />
        <div className="admin-portfolio-fields admin-portfolio-fields--three">
          <Field label="Eyebrow" value={content.processSection.eyebrow} onChange={(value) => updatePath(["processSection", "eyebrow"], value)} />
          <Field label="Heading" value={content.processSection.title} onChange={(value) => updatePath(["processSection", "title"], value)} />
          <Field label="Heading emphasis" value={content.processSection.emphasis} onChange={(value) => updatePath(["processSection", "emphasis"], value)} />
          <Field label="Intro" multiline value={content.processSection.description} onChange={(value) => updatePath(["processSection", "description"], value)} />
        </div>
        <div className="admin-portfolio-list-heading"><h4>Delivery steps</h4><button type="button" className="admin-secondary-button" disabled={content.process.length >= 20} onClick={() => addItem(["process"], { id: newId("step"), number: String(content.process.length + 1).padStart(2, "0"), title: "", description: "" })}><Plus size={15} /> Add step</button></div>
        <div className="admin-portfolio-record-list">
          {content.process.map((item, index) => (
            <article className="admin-portfolio-record" key={item.id}>
              <div className="admin-portfolio-record-heading"><strong>Step {index + 1}</strong><ItemActions index={index} count={content.process.length} onMove={(i, offset) => moveItem(["process"], i, offset)} onRemove={(i) => removeItem(["process"], i)} label={`step ${index + 1}`} /></div>
              <div className="admin-portfolio-fields admin-portfolio-fields--three">
                <Field label="Number" value={item.number} onChange={(value) => updateItem(["process"], index, "number", value)} />
                <Field label="Title" value={item.title} onChange={(value) => updateItem(["process"], index, "title", value)} />
                <Field label="Description" multiline value={item.description} onChange={(value) => updateItem(["process"], index, "description", value)} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-panel-card admin-portfolio-section">
        <SectionHeader eyebrow="06 · Closing call to action" title="Start a conversation" description="The contact button opens the public business enquiry page." />
        <div className="admin-portfolio-fields admin-portfolio-fields--three">
          <Field label="Eyebrow" value={content.cta.eyebrow} onChange={(value) => updatePath(["cta", "eyebrow"], value)} />
          <Field label="Heading" value={content.cta.title} onChange={(value) => updatePath(["cta", "title"], value)} />
          <Field label="Heading emphasis" value={content.cta.emphasis} onChange={(value) => updatePath(["cta", "emphasis"], value)} />
          <Field label="Description" multiline value={content.cta.description} onChange={(value) => updatePath(["cta", "description"], value)} />
          <Field label="Button label" value={content.cta.buttonLabel} onChange={(value) => updatePath(["cta", "buttonLabel"], value)} />
        </div>
      </section>

      <div className="admin-portfolio-savebar">
        <span>{updatedAt ? `Last saved ${changedAt}` : "Save to publish these edits"}</span>
        <button className="admin-primary-button" type="submit" disabled={saving}><Save size={16} />{saving ? "Saving…" : "Save portfolio"}</button>
      </div>
    </form>
  );
}
