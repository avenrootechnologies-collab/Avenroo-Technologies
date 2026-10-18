import nodemailer from "nodemailer";
import { logger } from "./logger.js";

const booleanFromEnv = (value) => ["1", "true", "yes"].includes(String(value).toLowerCase());

const cleanHeaderValue = (value) => String(value || "").replace(/[\r\n]+/g, " ").trim();
const getBrandName = () =>
  cleanHeaderValue(process.env.CONTACT_BRAND_NAME || "Avenroo Technologies");

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const getRecipients = () =>
  (process.env.CONTACT_TO_EMAIL || process.env.SMTP_TO_EMAIL || process.env.SMTP_USER || "")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

const getEmailDomain = (email) => String(email || "").split("@")[1] || "";

const getTransportConfig = () => {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number.parseInt(process.env.SMTP_PORT || "", 10) || 587;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  if (!host) {
    return null;
  }

  return {
    host,
    port,
    secure: process.env.SMTP_SECURE ? booleanFromEnv(process.env.SMTP_SECURE) : port === 465,
    auth: user && pass ? { user, pass } : undefined,
  };
};

export const getContactMailerStatus = () => {
  const transport = getTransportConfig();
  const recipients = getRecipients();
  const fromEmail = process.env.SMTP_FROM_EMAIL?.trim() || process.env.SMTP_USER?.trim();
  const authRequired = process.env.SMTP_REQUIRE_AUTH
    ? booleanFromEnv(process.env.SMTP_REQUIRE_AUTH)
    : true;

  if (!transport) {
    return { configured: false, reason: "SMTP_HOST is not configured." };
  }

  if (authRequired && !process.env.SMTP_USER?.trim()) {
    return { configured: false, reason: "SMTP_USER is not configured." };
  }

  if (authRequired && !process.env.SMTP_PASS?.trim()) {
    return { configured: false, reason: "SMTP_PASS is not configured." };
  }

  if (!fromEmail) {
    return { configured: false, reason: "SMTP_FROM_EMAIL or SMTP_USER is not configured." };
  }

  if (!recipients.length) {
    return { configured: false, reason: "CONTACT_TO_EMAIL is not configured." };
  }

  return { configured: true };
};

const getSender = () => ({
  email: process.env.SMTP_FROM_EMAIL?.trim() || process.env.SMTP_USER?.trim(),
  name: cleanHeaderValue(
    process.env.SMTP_FROM_NAME || getBrandName(),
  ),
});

const buildPlainTextMessage = (contact) => {
  const submittedAt = contact.createdAt
    ? new Date(contact.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  return [
    "New contact request",
    "",
    `Name: ${contact.name}`,
    `Email: ${contact.email}`,
    `Phone or WhatsApp: ${contact.phone || "Not provided"}`,
    `Preferred contact: ${contact.contactPreference || "Email"}`,
    `Service: ${contact.serviceType || "Not selected"}`,
    `Timeline: ${contact.timeline || "Not selected"}`,
    `Budget: ${contact.budget || "Not shared"}`,
    `Submitted: ${submittedAt} IST`,
    "",
    "Project brief:",
    contact.message,
  ].join("\n");
};

const buildHtmlMessage = (contact) => {
  const submittedAt = contact.createdAt
    ? new Date(contact.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
    : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const rows = [
    ["Name", contact.name],
    ["Email", contact.email],
    ["Phone or WhatsApp", contact.phone || "Not provided"],
    ["Preferred contact", contact.contactPreference || "Email"],
    ["Service", contact.serviceType || "Not selected"],
    ["Timeline", contact.timeline || "Not selected"],
    ["Budget", contact.budget || "Not shared"],
    ["Submitted", `${submittedAt} IST`],
  ];

  return `
    <div style="font-family: Arial, sans-serif; color: #102433; line-height: 1.6;">
      <h2 style="margin: 0 0 16px;">New contact request</h2>
      <table style="border-collapse: collapse; width: 100%; max-width: 680px;">
        <tbody>
          ${rows
            .map(
              ([label, value]) => `
                <tr>
                  <td style="border: 1px solid #e8dfd1; padding: 10px 12px; font-weight: 700; width: 180px;">${escapeHtml(label)}</td>
                  <td style="border: 1px solid #e8dfd1; padding: 10px 12px;">${escapeHtml(value)}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
      <h3 style="margin: 24px 0 8px;">Project brief</h3>
      <p style="max-width: 680px; white-space: pre-wrap;">${escapeHtml(contact.message)}</p>
    </div>
  `;
};

const buildConfirmationPlainTextMessage = (contact) => {
  const brandName = getBrandName();

  return [
    `Hi ${contact.name},`,
    "",
    `Thank you for contacting ${brandName}.`,
    "We have received your query and our team will get in touch with you soon.",
    "",
    "Your submitted project brief:",
    contact.message,
    "",
    "Regards,",
    brandName,
  ].join("\n");
};

const buildConfirmationHtmlMessage = (contact) => {
  const brandName = escapeHtml(getBrandName());

  return `
  <div style="font-family: Arial, sans-serif; color: #102433; line-height: 1.6;">
    <h2 style="margin: 0 0 16px;">We have received your query</h2>
    <p>Hi ${escapeHtml(contact.name)},</p>
    <p>Thank you for contacting ${brandName}. We have received your query and our team will get in touch with you soon.</p>
    <h3 style="margin: 24px 0 8px;">Your submitted project brief</h3>
    <p style="max-width: 680px; white-space: pre-wrap;">${escapeHtml(contact.message)}</p>
    <p style="margin-top: 24px;">Regards,<br>${brandName}</p>
  </div>
`;
};

export const sendContactNotification = async (contact) => {
  const status = getContactMailerStatus();

  if (!status.configured) {
    logger.warn("contact_mailer.not_configured", { reason: status.reason });
    return { sent: false, reason: status.reason };
  }

  const transport = getTransportConfig();
  const transporter = nodemailer.createTransport(transport);
  const { email: fromEmail, name: fromName } = getSender();
  const leadName = cleanHeaderValue(contact.name);
  const recipients = getRecipients();

  logger.info("contact_mailer.send.starting", {
    contactId: contact._id,
    smtpHost: transport.host,
    smtpPort: transport.port,
    smtpSecure: transport.secure,
    authConfigured: Boolean(transport.auth),
    recipientCount: recipients.length,
    fromDomain: getEmailDomain(fromEmail),
    replyToDomain: getEmailDomain(contact.email),
  });

  let info;

  try {
    info = await transporter.sendMail({
      from: { name: fromName, address: fromEmail },
      to: recipients,
      replyTo: { name: leadName, address: contact.email },
      subject: `New project enquiry from ${leadName}`,
      text: buildPlainTextMessage(contact),
      html: buildHtmlMessage(contact),
    });
  } catch (error) {
    logger.error("contact_mailer.send.failed", {
      contactId: contact._id,
      smtpHost: transport.host,
      smtpPort: transport.port,
      error,
    });
    throw error;
  }

  logger.info("contact_mailer.send.completed", {
    contactId: contact._id,
    messageId: info.messageId,
    acceptedCount: info.accepted?.length || 0,
    rejectedCount: info.rejected?.length || 0,
  });

  return { sent: true, messageId: info.messageId };
};

export const sendContactConfirmation = async (contact) => {
  const status = getContactMailerStatus();

  if (!status.configured) {
    logger.warn("contact_mailer.confirmation.not_configured", { reason: status.reason });
    return { sent: false, reason: status.reason };
  }

  const transport = getTransportConfig();
  const transporter = nodemailer.createTransport(transport);
  const { email: fromEmail, name: fromName } = getSender();
  const leadName = cleanHeaderValue(contact.name);
  const recipient = cleanHeaderValue(contact.email);

  logger.info("contact_mailer.confirmation.send.starting", {
    contactId: contact._id,
    smtpHost: transport.host,
    smtpPort: transport.port,
    smtpSecure: transport.secure,
    fromDomain: getEmailDomain(fromEmail),
    recipientDomain: getEmailDomain(recipient),
  });

  let info;

  try {
    info = await transporter.sendMail({
      from: { name: fromName, address: fromEmail },
      to: { name: leadName, address: recipient },
      replyTo: { name: fromName, address: fromEmail },
      subject: "We have received your query",
      text: buildConfirmationPlainTextMessage(contact),
      html: buildConfirmationHtmlMessage(contact),
    });
  } catch (error) {
    logger.error("contact_mailer.confirmation.send.failed", {
      contactId: contact._id,
      smtpHost: transport.host,
      smtpPort: transport.port,
      error,
    });
    throw error;
  }

  logger.info("contact_mailer.confirmation.send.completed", {
    contactId: contact._id,
    messageId: info.messageId,
    acceptedCount: info.accepted?.length || 0,
    rejectedCount: info.rejected?.length || 0,
  });

  return { sent: true, messageId: info.messageId };
};
