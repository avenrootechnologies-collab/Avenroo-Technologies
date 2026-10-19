import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { BriefcaseBusiness, CheckCircle2, GraduationCap, LoaderCircle, Send, X } from "lucide-react";
import API from "../api/axios";

const initialForm = { name: "", email: "", phone: "", course: "", college: "", portfolio: "", message: "", companyWebsite: "" };
const courseOptions = [
  "Website development",
  "Web apps and dashboards",
  "Automation and workflows",
  "Security fundamentals",
  "Internship opportunities",
  "Introductory session",
  "Not sure yet",
];

export default function StudentConnectForm({ isOpen, onClose, intent = "enquiry" }) {
  const [form, setForm] = useState(initialForm);
  const [applicationType, setApplicationType] = useState(intent);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "idle", message: "" });
  const nameInputRef = useRef(null);
  const isInternship = applicationType === "internship";

  useEffect(() => {
    if (!isOpen) return;
    setApplicationType(intent);
    if (intent === "internship") {
      setForm((current) => ({ ...current, course: "Internship opportunities" }));
    }
  }, [intent, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    const focusFrame = window.requestAnimationFrame(() => nameInputRef.current?.focus());
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", closeOnEscape);
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  const handleChange = ({ target: { name, value } }) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback({ type: "idle", message: "" });

    try {
      await API.post("/contact", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        serviceType: isInternship ? "Student internship application" : `Student program: ${form.course || "General enquiry"}`,
        timeline: "Flexible",
        contactPreference: "Email",
        message: `${isInternship ? "Student internship application" : "Student program enquiry"}\nInterested in: ${form.course || "Not selected"}${isInternship ? `\nCollege or university: ${form.college || "Not provided"}\nPortfolio or LinkedIn: ${form.portfolio || "Not provided"}` : ""}\n\n${form.message}`,
        companyWebsite: form.companyWebsite,
      });
      setForm(initialForm);
      setFeedback({ type: "success", message: isInternship ? "Thanks for applying. Your internship application has been sent." : "Thanks for reaching out. Your student program enquiry has been sent." });
    } catch (error) {
      setFeedback({
        type: "error",
        message: error.response?.data?.message || "We could not send your enquiry right now. Please try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      id="student-connect"
      className="student-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto p-3 sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="student-connect-title" className="student-modal-dialog relative my-auto w-full">
        <button type="button" onClick={onClose} aria-label="Close student enquiry form" className="student-modal-close absolute right-3 top-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition hover:rotate-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint-400 sm:right-4 sm:top-4">
          <X size={20} />
        </button>
        <div className="student-modal-layout grid gap-3 rounded-[28px] p-2 sm:gap-5 sm:rounded-[34px] sm:p-3">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.55 }}
          className="student-modal-aside order-2 flex flex-col justify-between rounded-[22px] p-5 shadow-[var(--shadow-panel)] sm:rounded-[28px] sm:p-8 lg:order-1 lg:p-9"
        >
          <div>
            <p className="eyebrow">Connect with us</p>
            <h2 className="display-font student-modal-aside__heading mt-3 text-2xl leading-tight sm:mt-4 sm:text-4xl">{isInternship ? "Take your next step into industry." : "Your next step can start with a conversation."}</h2>
            <p className="student-modal-aside__copy mt-3 text-sm leading-6 sm:mt-5 sm:text-base sm:leading-7">{isInternship ? "Share a little about your studies, skills, and experience. Our team will review your interest and follow up with next steps." : "Tell us what you want to learn. We’ll help you find the right course, internship pathway, or introductory session to explore."}</p>
          </div>
          <div className="student-modal-note mt-5 rounded-[20px] p-4 sm:mt-8 sm:rounded-[24px] sm:p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-mint-600 dark:text-mint-400">Good to know</p>
            <p className="student-modal-aside__copy mt-2 text-sm leading-6">Share your interests and current experience level. You don’t need a polished resume to get in touch.</p>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          onSubmit={handleSubmit}
          className="student-modal-form order-1 rounded-[22px] p-4 sm:rounded-[28px] sm:p-7 lg:order-2 lg:p-8"
        >
          <div className="mb-6">
            <p className="eyebrow">Student programs</p>
            <h2 id="student-connect-title" className="display-font mt-2 text-2xl text-[var(--text-strong)] sm:text-3xl">{isInternship ? "Apply for an internship." : "Let’s find your learning path."}</h2>
          </div>
          <div className="student-modal-form-type-switch mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-[var(--chip-bg)] p-1.5" aria-label="Choose a form type">
            <button type="button" onClick={() => { setApplicationType("enquiry"); setForm((current) => ({ ...current, course: current.course === "Internship opportunities" ? "" : current.course })); }} aria-pressed={!isInternship} className={`student-form-type-button inline-flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-center text-xs font-semibold leading-tight transition sm:px-3 sm:text-sm ${!isInternship ? "brand-button" : "text-[var(--text-body)] hover:bg-[var(--surface-strong)]"}`}><GraduationCap size={17} className="shrink-0" /> Program enquiry</button>
            <button type="button" onClick={() => { setApplicationType("internship"); setForm((current) => ({ ...current, course: "Internship opportunities" })); }} aria-pressed={isInternship} className={`student-form-type-button inline-flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-center text-xs font-semibold leading-tight transition sm:px-3 sm:text-sm ${isInternship ? "brand-button" : "text-[var(--text-body)] hover:bg-[var(--surface-strong)]"}`}><BriefcaseBusiness size={16} className="shrink-0" /> Internship apply</button>
          </div>
          <input aria-hidden="true" autoComplete="off" className="hidden" name="companyWebsite" tabIndex={-1} type="text" value={form.companyWebsite} onChange={handleChange} />
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text-body)]">
              Your name
              <input ref={nameInputRef} required minLength="2" maxLength="120" autoComplete="name" name="name" value={form.name} onChange={handleChange} placeholder="Your name" className="input-surface rounded-2xl px-4 py-3 text-base" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text-body)]">
              Email address
              <input required type="email" maxLength="160" autoComplete="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="input-surface rounded-2xl px-4 py-3 text-base" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text-body)]">
              Phone or WhatsApp <span className="font-normal opacity-70">(optional)</span>
              <input type="tel" maxLength="40" autoComplete="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 ..." className="input-surface rounded-2xl px-4 py-3 text-base" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text-body)]">
              I’m interested in
              <select name="course" value={form.course} onChange={handleChange} className="input-surface rounded-2xl px-4 py-3 text-base">
                <option value="">Choose an area</option>
                {courseOptions.map((course) => <option key={course} value={course}>{course}</option>)}
              </select>
            </label>
            {isInternship && <>
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text-body)]">
                College or university <span className="font-normal opacity-70">(optional)</span>
                <input maxLength="160" autoComplete="organization" name="college" value={form.college} onChange={handleChange} placeholder="Your institution" className="input-surface rounded-2xl px-4 py-3 text-base" />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-[var(--text-body)]">
                Portfolio or LinkedIn <span className="font-normal opacity-70">(optional)</span>
                <input type="url" maxLength="350" name="portfolio" value={form.portfolio} onChange={handleChange} placeholder="https://" className="input-surface rounded-2xl px-4 py-3 text-base" />
              </label>
            </>}
          </div>
          <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-[var(--text-body)]">
            {isInternship ? "Tell us about your skills, interests, and availability" : "What would you like to learn or ask?"}
            <textarea required minLength="10" maxLength="3000" rows="4" name="message" value={form.message} onChange={handleChange} placeholder={isInternship ? "Share any projects or skills you would like us to know about." : "Tell us about your interests, goals, or questions."} className="input-surface resize-y rounded-[22px] px-4 py-3 text-base leading-6" />
          </label>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button type="submit" disabled={submitting} className="brand-button inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-65">
              {submitting ? <LoaderCircle size={17} className="animate-spin" /> : <Send size={16} />}
              {submitting ? "Sending..." : isInternship ? "Send internship application" : "Send student enquiry"}
            </button>
            <span className="text-xs text-[var(--text-soft)]">We’ll use your details to respond to this enquiry.</span>
          </div>
          {feedback.type !== "idle" && (
            <div role={feedback.type === "error" ? "alert" : "status"} aria-live="polite" className={`student-form-feedback student-form-feedback--${feedback.type} mt-5 flex items-start gap-2 rounded-2xl px-4 py-3 text-sm`}>
              {feedback.type === "success" && <CheckCircle2 size={17} className="mt-0.5 shrink-0" />}{feedback.message}
            </div>
          )}
        </motion.form>
        </div>
      </div>
    </div>,
    document.body,
  );
}

