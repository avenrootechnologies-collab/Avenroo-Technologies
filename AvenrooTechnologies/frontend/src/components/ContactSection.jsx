import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  Mail,
  MessageCircle,
  PhoneCall,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import API from "../api/axios";

const defaultContactEmail = "avenrootechnologies@gmail.com";
const defaultWhatsAppMessage =
  "Hi Avenroo Technologies, I want to discuss a project.";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  serviceType: "Website or landing page",
  timeline: "As soon as practical",
  budget: "",
  contactPreference: "Email",
  message: "",
  companyWebsite: "",
};

const serviceOptions = [
  "Website or landing page",
  "Web app or dashboard",
  "Automation",
  "Maintenance or redesign",
  "Not sure yet",
];

const timelineOptions = ["As soon as practical", "This month", "1-3 months", "Flexible"];

const preferenceOptions = [
  { label: "Email", icon: Mail },
  { label: "WhatsApp", icon: MessageCircle },
  { label: "Phone call", icon: PhoneCall },
];

const guidance = [
  {
    title: "Short brief is enough",
    description: "Share the result you want, your timeline, and the main blocker. We can clarify the rest.",
    icon: Sparkles,
  },
  {
    title: "Fast first reply",
    description: "You get a practical next step and scope direction within one business day.",
    icon: Clock3,
  },
  {
    title: "Private by default",
    description: "Your details are used only to understand the project and reply to your enquiry.",
    icon: ShieldCheck,
  },
];

const buildWhatsAppLink = (number, message) => {
  const cleanNumber = String(number || "").replace(/\D/g, "");

  if (!cleanNumber) {
    return "";
  }

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    message || "Hi, I want to discuss a project.",
  )}`;
};

const buildPhoneLink = (phone) => {
  const cleanPhone = String(phone || "").replace(/[^\d+]/g, "");

  return cleanPhone ? `tel:${cleanPhone}` : "";
};

export default function ContactSection() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "idle", message: "" });

  const whatsappHref = buildWhatsAppLink(
    import.meta.env.VITE_WHATSAPP_NUMBER,
    import.meta.env.VITE_WHATSAPP_MESSAGE || defaultWhatsAppMessage,
  );
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || defaultContactEmail;
  const contactPhone = import.meta.env.VITE_CONTACT_PHONE;
  const quickContacts = [
    {
      label: "WhatsApp",
      detail: "Best for quick project questions",
      href: whatsappHref,
      icon: MessageCircle,
    },
    {
      label: "Email",
      detail: contactEmail,
      href: contactEmail ? `mailto:${contactEmail}` : "",
      icon: Mail,
    },
    {
      label: "Call",
      detail: "Talk through the scope directly",
      href: buildPhoneLink(contactPhone),
      icon: PhoneCall,
    },
  ].filter((item) => item.href);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePreferenceChange = (contactPreference) => {
    setForm((current) => ({
      ...current,
      contactPreference,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: "idle", message: "" });

    try {
      const response = await API.post("/contact", form);
      setForm(initialForm);
      setFeedback({
        type: "success",
        message:
          response.data?.confirmationDelivery === "sent"
            ? "Thanks. Your enquiry was sent. We also emailed you a confirmation."
            : "Thanks. Your enquiry was received and we will reply with a practical next step.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error.response?.data?.message ||
          "We could not submit the form right now. Please try again or use a direct contact option.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="project-brief" className="px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="min-w-0 space-y-6" id="contact-process">
          <div className="surface-panel rounded-[28px] p-5 sm:rounded-[32px] sm:p-8">
            <p className="eyebrow">Easy contact</p>
            <h2 className="display-font mt-4 text-4xl text-[var(--text-strong)]">
              Choose the easiest way to start.
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--text-body)]">
              Use the short form for a structured reply, or reach out directly if you already know
              what you need. Only the basics are required.
            </p>

            <a
              href="#contact-form"
              className="brand-button mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
            >
              Go to form
              <ArrowDown size={16} />
            </a>

            {quickContacts.length > 0 && (
              <div className="mt-6 grid gap-3">
                {quickContacts.map((item) => {
                  const Icon = item.icon;

                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.label === "WhatsApp" ? "_blank" : undefined}
                      rel={item.label === "WhatsApp" ? "noreferrer" : undefined}
                      className="group flex min-w-0 items-center gap-3 rounded-[22px] border border-[var(--chip-border)] bg-[var(--chip-bg)] p-4 transition hover:-translate-y-0.5 hover:border-mint-500/30 hover:bg-mint-500/10 sm:gap-4"
                    >
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mint-500/12 text-mint-500">
                        <Icon size={19} />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-semibold text-[var(--text-strong)]">
                          {item.label}
                        </span>
                        <span className="block break-words text-sm leading-6 text-[var(--text-body)] [overflow-wrap:anywhere]">
                          {item.detail}
                        </span>
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {guidance.map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                className="surface-panel rounded-[24px] p-5 sm:rounded-[28px] sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-mint-500/12 p-3 text-mint-500">
                    <Icon size={18} />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-strong)]">{item.title}</h3>
                </div>

                <p className="mt-4 text-sm leading-6 text-[var(--text-body)]">{item.description}</p>
              </motion.div>
            );
          })}
        </div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          onSubmit={handleSubmit}
          id="contact-form"
          className="surface-panel-inverse min-w-0 rounded-[28px] p-5 text-white sm:rounded-[36px] sm:p-10"
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="eyebrow">Contact form</p>
              <h2 className="display-font mt-4 text-4xl leading-tight text-white">
                Send a project enquiry.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
                Required fields are name, email, and project brief. Everything else just helps us
                respond better.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/70">
                <span className="rounded-full border border-white/10 bg-white/8 px-3 py-2">
                  Reply within 1 business day
                </span>
              </div>
            </div>

            <div className="hidden rounded-2xl bg-white/8 p-3 text-mint-400 sm:inline-flex">
              <CheckCircle2 size={22} />
            </div>
          </div>

          <input
            aria-hidden="true"
            autoComplete="off"
            className="hidden"
            name="companyWebsite"
            tabIndex={-1}
            type="text"
            value={form.companyWebsite}
            onChange={handleChange}
          />

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-white/70">
              Name
              <input
                required
                autoComplete="name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                minLength="2"
                maxLength="120"
                placeholder="Your name"
                className="input-surface rounded-2xl px-4 py-3.5 text-base"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-white/70">
              Email
              <input
                required
                autoComplete="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                maxLength="160"
                placeholder="name@company.com"
                className="input-surface rounded-2xl px-4 py-3.5 text-base"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-white/70">
              Phone or WhatsApp
              <input
                autoComplete="tel"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength="40"
                placeholder="+91 ..."
                className="input-surface rounded-2xl px-4 py-3.5 text-base"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-white/70">
              Service
              <select
                name="serviceType"
                value={form.serviceType}
                onChange={handleChange}
                className="input-surface rounded-2xl px-4 py-3.5 text-base"
              >
                {serviceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-white/70">
              Timeline
              <select
                name="timeline"
                value={form.timeline}
                onChange={handleChange}
                className="input-surface rounded-2xl px-4 py-3.5 text-base"
              >
                {timelineOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm font-medium text-white/70">
              Budget range
              <input
                type="text"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                maxLength="80"
                placeholder="Optional"
                className="input-surface rounded-2xl px-4 py-3.5 text-base"
              />
            </label>
          </div>

          <div className="mt-6">
            <p className="text-sm font-medium text-white/70">Preferred reply</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {preferenceOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = form.contactPreference === option.label;

                return (
                  <button
                    key={option.label}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => handlePreferenceChange(option.label)}
                    className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                      isSelected
                        ? "border-mint-400/60 bg-mint-500/18 text-mint-400"
                        : "border-white/10 bg-white/6 text-white/65 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <Icon size={16} />
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6">
            <label className="flex flex-col gap-2 text-sm font-medium text-white/70">
              Project brief
              <textarea
                required
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="7"
                minLength="10"
                maxLength="4000"
                placeholder="Tell us what you want to build, what is blocked, and when you want to launch."
                className="input-surface resize-y rounded-[26px] px-4 py-3.5 text-base leading-7"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={isSubmitting}
              className="brand-button inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
              {isSubmitting ? "Sending..." : "Send enquiry"}
            </button>

            <p className="max-w-sm text-sm leading-6 text-white/55">
              No spam or long sales flow. We reply with the next sensible action.
            </p>
          </div>

          {feedback.type !== "idle" && (
            <div
              role={feedback.type === "error" ? "alert" : "status"}
              aria-live="polite"
              className={`mt-6 rounded-2xl px-4 py-3 text-sm ${
                feedback.type === "success"
                  ? "bg-mint-500/14 text-mint-400"
                  : "bg-coral-500/14 text-coral-500"
              }`}
            >
              {feedback.message}
            </div>
          )}
        </motion.form>
      </div>
    </section>
  );
}

