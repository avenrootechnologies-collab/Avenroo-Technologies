import Contact from "../models/Contact.js";
import { isDatabaseReady } from "../config/db.js";
import {
  LOCAL_CONTACTS_FILE,
  createLocalId,
  readJsonCollection,
  writeJsonCollection,
} from "../utils/localStore.js";
import { sendContactConfirmation, sendContactNotification } from "../utils/contactMailer.js";
import { logRequestStep } from "../utils/logger.js";

const validStatuses = ["new", "in-progress", "resolved"];

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const cleanText = (value) => (typeof value === "string" ? value.trim() : "");
const nowIso = () => new Date().toISOString();
const getEmailDomain = (value) => cleanText(value).split("@")[1] || "";
const booleanFromEnv = (value) => ["1", "true", "yes"].includes(String(value).toLowerCase());
const canUseLocalContactStorage = () =>
  process.env.NODE_ENV !== "production" ||
  booleanFromEnv(process.env.ALLOW_PRODUCTION_LOCAL_CONTACT_STORAGE);

const rejectContactRequest = (req, res, message, meta = {}) => {
  logRequestStep(req, "warn", "contact.create.validation_failed", { reason: message, ...meta });
  return res.status(400).json({ message });
};

const normalizeLocalContact = (contact) => {
  const now = nowIso();

  return {
    _id: contact._id || createLocalId(),
    name: typeof contact.name === "string" ? contact.name.trim() : "",
    email: typeof contact.email === "string" ? contact.email.trim().toLowerCase() : "",
    phone: typeof contact.phone === "string" ? contact.phone.trim() : "",
    serviceType: typeof contact.serviceType === "string" ? contact.serviceType.trim() : "",
    timeline: typeof contact.timeline === "string" ? contact.timeline.trim() : "",
    budget: typeof contact.budget === "string" ? contact.budget.trim() : "",
    contactPreference:
      typeof contact.contactPreference === "string" ? contact.contactPreference.trim() : "Email",
    message: typeof contact.message === "string" ? contact.message.trim() : "",
    status: validStatuses.includes(contact.status) ? contact.status : "new",
    createdAt: contact.createdAt || now,
    updatedAt: contact.updatedAt || now,
  };
};

const sortContacts = (contacts) =>
  [...contacts].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

const getLocalContacts = async () => {
  const storedContacts = await readJsonCollection(LOCAL_CONTACTS_FILE, []);
  const normalizedContacts = sortContacts(storedContacts.map(normalizeLocalContact));
  const needsRewrite =
    storedContacts.length !== normalizedContacts.length ||
    normalizedContacts.some((contact, index) => {
      const stored = storedContacts[index];
      return !stored || stored._id !== contact._id || stored.updatedAt !== contact.updatedAt;
    });

  if (needsRewrite) {
    await writeJsonCollection(LOCAL_CONTACTS_FILE, normalizedContacts);
  }

  return normalizedContacts;
};

export const createContact = async (req, res) => {
  logRequestStep(req, "info", "contact.create.received");

  const {
    name,
    email,
    phone,
    message,
    serviceType,
    timeline,
    budget,
    contactPreference,
    companyWebsite,
  } = req.body;

  if (cleanText(companyWebsite)) {
    logRequestStep(req, "warn", "contact.create.honeypot_triggered");
    return res.status(201).json({ message: "Project brief received successfully." });
  }

  const cleanName = cleanText(name);
  const cleanEmail = cleanText(email).toLowerCase();
  const cleanPhone = cleanText(phone);
  const cleanServiceType = cleanText(serviceType);
  const cleanTimeline = cleanText(timeline);
  const cleanBudget = cleanText(budget);
  const cleanContactPreference = cleanText(contactPreference) || "Email";
  const cleanMessage = cleanText(message);

  if (!cleanName || !cleanEmail || !cleanMessage) {
    return rejectContactRequest(req, res, "Name, email, and project brief are required.", {
      hasName: Boolean(cleanName),
      hasEmail: Boolean(cleanEmail),
      hasMessage: Boolean(cleanMessage),
    });
  }

  if (cleanName.length < 2 || cleanName.length > 120) {
    return rejectContactRequest(req, res, "Name must be between 2 and 120 characters.", {
      nameLength: cleanName.length,
    });
  }

  if (!isValidEmail(cleanEmail)) {
    return rejectContactRequest(req, res, "Please enter a valid email address.", {
      emailLength: cleanEmail.length,
    });
  }

  if (cleanEmail.length > 160) {
    return rejectContactRequest(req, res, "Email must be 160 characters or fewer.", {
      emailLength: cleanEmail.length,
    });
  }

  if (cleanPhone.length > 40) {
    return rejectContactRequest(req, res, "Phone or WhatsApp must be 40 characters or fewer.", {
      phoneLength: cleanPhone.length,
    });
  }

  const optionalFields = [
    ["Service", cleanServiceType, 80],
    ["Timeline", cleanTimeline, 80],
    ["Budget", cleanBudget, 80],
    ["Contact preference", cleanContactPreference, 40],
  ];

  for (const [label, value, maxLength] of optionalFields) {
    if (value.length > maxLength) {
      return rejectContactRequest(req, res, `${label} must be ${maxLength} characters or fewer.`, {
        label,
        length: value.length,
        maxLength,
      });
    }
  }

  if (cleanMessage.length < 10 || cleanMessage.length > 4000) {
    return rejectContactRequest(req, res, "Project brief must be between 10 and 4000 characters.", {
      messageLength: cleanMessage.length,
    });
  }

  logRequestStep(req, "debug", "contact.create.payload_validated", {
    emailDomain: getEmailDomain(cleanEmail),
    hasPhone: Boolean(cleanPhone),
    serviceType: cleanServiceType || "not-selected",
    timeline: cleanTimeline || "not-selected",
    hasBudget: Boolean(cleanBudget),
    contactPreference: cleanContactPreference,
    messageLength: cleanMessage.length,
  });

  try {
    let savedContact;
    let storage;

    if (!isDatabaseReady()) {
      if (!canUseLocalContactStorage()) {
        logRequestStep(req, "error", "contact.create.storage.unavailable");
        return res.status(503).json({
          message: "Contact storage is not available right now.",
        });
      }

      logRequestStep(req, "info", "contact.create.storage.local_file.starting");
      const contacts = await getLocalContacts();
      const localContact = normalizeLocalContact({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        serviceType: cleanServiceType,
        timeline: cleanTimeline,
        budget: cleanBudget,
        contactPreference: cleanContactPreference,
        message: cleanMessage,
        status: "new",
      });

      await writeJsonCollection(LOCAL_CONTACTS_FILE, [localContact, ...contacts]);

      savedContact = localContact;
      storage = "local-file";
      logRequestStep(req, "info", "contact.create.storage.local_file.completed", {
        contactId: savedContact._id,
      });
    } else {
      logRequestStep(req, "info", "contact.create.storage.mongodb.starting");
      const contact = await Contact.create({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        serviceType: cleanServiceType,
        timeline: cleanTimeline,
        budget: cleanBudget,
        contactPreference: cleanContactPreference,
        message: cleanMessage,
      });

      savedContact = contact.toObject();
      storage = "mongodb";
      logRequestStep(req, "info", "contact.create.storage.mongodb.completed", {
        contactId: savedContact._id,
      });
    }

    let emailDelivery = "not-configured";
    let confirmationDelivery = "not-configured";

    try {
      const emailResult = await sendContactNotification(savedContact);
      emailDelivery = emailResult.sent ? "sent" : "not-configured";
      logRequestStep(req, emailResult.sent ? "info" : "warn", "contact.create.email.completed", {
        contactId: savedContact._id,
        emailDelivery,
        reason: emailResult.reason,
      });
    } catch (error) {
      emailDelivery = "failed";
      logRequestStep(req, "error", "contact.create.email.failed", {
        contactId: savedContact._id,
        error,
      });
    }

    try {
      const confirmationResult = await sendContactConfirmation(savedContact);
      confirmationDelivery = confirmationResult.sent ? "sent" : "not-configured";
      logRequestStep(
        req,
        confirmationResult.sent ? "info" : "warn",
        "contact.create.confirmation_email.completed",
        {
          contactId: savedContact._id,
          confirmationDelivery,
          reason: confirmationResult.reason,
        },
      );
    } catch (error) {
      confirmationDelivery = "failed";
      logRequestStep(req, "error", "contact.create.confirmation_email.failed", {
        contactId: savedContact._id,
        error,
      });
    }

    logRequestStep(req, "info", "contact.create.completed", {
      contactId: savedContact._id,
      storage,
      emailDelivery,
      confirmationDelivery,
    });

    return res.status(201).json({
      message: "Project brief received successfully.",
      id: savedContact._id,
      status: savedContact.status,
      storage,
      emailDelivery,
      confirmationDelivery,
    });
  } catch (error) {
    logRequestStep(req, "error", "contact.create.failed", { error });
    return res.status(400).json({
      message: error.message || "Unable to save the project brief.",
    });
  }
};

export const getContacts = async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status.trim() : "";
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
  const filter = {};

  logRequestStep(req, "info", "contact.list.received", { status: status || "all", page, limit });

  if (status) {
    if (!validStatuses.includes(status)) {
      logRequestStep(req, "warn", "contact.list.invalid_status", { status });
      return res.status(400).json({
        message: `Status must be one of: ${validStatuses.join(", ")}.`,
      });
    }

    filter.status = status;
  }

  try {
    if (!isDatabaseReady()) {
      if (!canUseLocalContactStorage()) {
        logRequestStep(req, "error", "contact.list.storage.unavailable");
        return res.status(503).json({
          message: "Contact storage is not available right now.",
        });
      }

      logRequestStep(req, "info", "contact.list.storage.local_file.starting");
      const contacts = await getLocalContacts();
      const filteredContacts = status
        ? contacts.filter((contact) => contact.status === status)
        : contacts;
      const total = filteredContacts.length;

      logRequestStep(req, "info", "contact.list.storage.local_file.completed", { total });

      return res.json({
        items: filteredContacts.slice((page - 1) * limit, page * limit),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(Math.ceil(total / limit), 1),
        },
        storage: "local-file",
      });
    }

    logRequestStep(req, "info", "contact.list.storage.mongodb.starting");
    const [items, total] = await Promise.all([
      Contact.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Contact.countDocuments(filter),
    ]);

    logRequestStep(req, "info", "contact.list.storage.mongodb.completed", { total });

    return res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
      storage: "mongodb",
    });
  } catch (error) {
    logRequestStep(req, "error", "contact.list.failed", { error });
    return res.status(500).json({
      message: "Unable to load contact requests right now.",
    });
  }
};

export const updateContactStatus = async (req, res) => {
  const nextStatus = typeof req.body.status === "string" ? req.body.status.trim() : "";

  logRequestStep(req, "info", "contact.status_update.received", {
    contactId: req.params.id,
    nextStatus,
  });

  if (!validStatuses.includes(nextStatus)) {
    logRequestStep(req, "warn", "contact.status_update.invalid_status", {
      contactId: req.params.id,
      nextStatus,
    });
    return res.status(400).json({
      message: `Status must be one of: ${validStatuses.join(", ")}.`,
    });
  }

  try {
    if (!isDatabaseReady()) {
      if (!canUseLocalContactStorage()) {
        logRequestStep(req, "error", "contact.status_update.storage.unavailable", {
          contactId: req.params.id,
        });
        return res.status(503).json({
          message: "Contact storage is not available right now.",
        });
      }

      logRequestStep(req, "info", "contact.status_update.storage.local_file.starting", {
        contactId: req.params.id,
      });
      const contacts = await getLocalContacts();
      const contactIndex = contacts.findIndex((contact) => contact._id === req.params.id);

      if (contactIndex === -1) {
        logRequestStep(req, "warn", "contact.status_update.not_found", {
          contactId: req.params.id,
          storage: "local-file",
        });
        return res.status(404).json({ message: "Contact request not found." });
      }

      const updatedContact = {
        ...contacts[contactIndex],
        status: nextStatus,
        updatedAt: nowIso(),
      };

      contacts[contactIndex] = updatedContact;
      await writeJsonCollection(LOCAL_CONTACTS_FILE, contacts);

      logRequestStep(req, "info", "contact.status_update.storage.local_file.completed", {
        contactId: req.params.id,
        nextStatus,
      });

      return res.json({
        message: "Contact status updated successfully.",
        contact: updatedContact,
        storage: "local-file",
      });
    }

    logRequestStep(req, "info", "contact.status_update.storage.mongodb.starting", {
      contactId: req.params.id,
    });
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: nextStatus },
      { new: true, runValidators: true },
    );

    if (!contact) {
      logRequestStep(req, "warn", "contact.status_update.not_found", {
        contactId: req.params.id,
        storage: "mongodb",
      });
      return res.status(404).json({ message: "Contact request not found." });
    }

    logRequestStep(req, "info", "contact.status_update.storage.mongodb.completed", {
      contactId: req.params.id,
      nextStatus,
    });

    return res.json({
      message: "Contact status updated successfully.",
      contact,
      storage: "mongodb",
    });
  } catch (error) {
    const statusCode = error.name === "CastError" ? 400 : 500;

    logRequestStep(req, statusCode === 400 ? "warn" : "error", "contact.status_update.failed", {
      contactId: req.params.id,
      statusCode,
      error,
    });

    return res.status(statusCode).json({
      message:
        statusCode === 400
          ? "Contact request id is invalid."
          : "Unable to update the contact request right now.",
    });
  }
};
