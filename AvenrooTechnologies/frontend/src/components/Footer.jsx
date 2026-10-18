import {
  ArrowUpRight,
  AtSign,
  BriefcaseBusiness,
  Camera,
  Layers3,
  Mail,
  MessageCircle,
  PhoneCall,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import BrandLogo from "./BrandLogo";

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || "";
const whatsappMessage =
  import.meta.env.VITE_WHATSAPP_MESSAGE ||
  "Hi Avenroo Technologies, I want to discuss a website, app, automation, or security project.";
const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || "shaurixinfotechsolution@gmail.com";
const contactPhone = import.meta.env.VITE_CONTACT_PHONE || "";

const buildWhatsAppHref = () => {
  const encodedMessage = encodeURIComponent(whatsappMessage);
  const cleanNumber = whatsappNumber.replace(/\D/g, "");

  return cleanNumber ? `https://wa.me/${cleanNumber}?text=${encodedMessage}` : "";
};

const buildPhoneHref = () => {
  const cleanPhone = contactPhone.replace(/[^\d+]/g, "");

  return cleanPhone ? `tel:${cleanPhone}` : "";
};

const footerLinks = [
  { label: "Home", to: "/clients" },
  { label: "Services", to: "/services" },
  { label: "Contact", to: "/contact" },
];

const footerServices = [
  { label: "Websites and positioning", icon: Layers3 },
  { label: "Apps and dashboards", icon: Layers3 },
  { label: "Automation and integrations", icon: Workflow },
  { label: "Cybersecurity checks", icon: ShieldCheck },
];

const directLinks = [
  {
    label: "WhatsApp",
    href: buildWhatsAppHref(),
    icon: MessageCircle,
  },
  {
    label: "Email",
    href: contactEmail ? `mailto:${contactEmail}` : "",
    icon: Mail,
  },
  {
    label: "Call",
    href: buildPhoneHref(),
    icon: PhoneCall,
  },
].filter((link) => link.href);

const socialLinks = [
  {
    label: "LinkedIn",
    href: import.meta.env.VITE_LINKEDIN_URL || "",
    icon: BriefcaseBusiness,
  },
  {
    label: "Instagram",
    href: import.meta.env.VITE_INSTAGRAM_URL || "",
    icon: Camera,
  },
  {
    label: "Facebook",
    href: import.meta.env.VITE_FACEBOOK_URL || "",
    icon: AtSign,
  },
].filter((link) => link.href);

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { pathname } = useLocation();
  const isStudentView = pathname === "/" || pathname === "/students";
  const links = footerLinks.map((link) => link.label === "Home" ? { ...link, to: isStudentView ? "/" : "/clients" } : link);

  return (
    <footer className="px-4 pb-8 pt-4 sm:px-6">
      <div className="surface-panel-inverse mx-auto max-w-7xl rounded-[28px] p-6 text-white sm:p-8">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr_0.85fr]">
          <div>
            <BrandLogo />
            <h2 className="display-font mt-4 max-w-2xl text-2xl leading-tight sm:text-3xl">
              Digital delivery that looks credible, works cleanly, and stays easier to maintain.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/68">
              Websites, applications, automation, security checks, and support for teams that want
              one accountable build partner.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {links.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="inline-flex items-center rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/48">
              Service lanes
            </h3>
            <div className="mt-5 space-y-4">
              {footerServices.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="flex items-center gap-3 text-sm text-white/72">
                    <div className="rounded-2xl bg-white/10 p-2 text-mint-400">
                      <Icon size={16} />
                    </div>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white/48">
              Contact
            </h3>
            <div className="mt-5 flex flex-wrap gap-3">
              {directLinks.map((link) => {
                const Icon = link.icon;

                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="brand-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
                    aria-label={`Open ${link.label}`}
                  >
                    <Icon size={15} />
                    {link.label}
                  </a>
                );
              })}
            </div>

            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/48">
                Social
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {socialLinks.length ? (
                  socialLinks.map((link) => {
                    const Icon = link.icon;

                    return (
                      <a
                        key={link.label}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                        aria-label={`Open ${link.label}`}
                      >
                        <Icon size={15} />
                        {link.label}
                      </a>
                    );
                  })
                ) : (
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Contact us
                    <ArrowUpRight size={15} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-white/52 sm:flex-row sm:items-center sm:justify-between">
          <p className="break-words">
            {currentYear} Avenroo Technologies. Websites, applications, automation, security,
            and support.
          </p>
          <p>Response target within 1 business day for qualified briefs.</p>
        </div>
      </div>
    </footer>
  );
}
