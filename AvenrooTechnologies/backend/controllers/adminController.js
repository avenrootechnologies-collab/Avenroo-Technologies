import crypto from "node:crypto";
import Campaign from "../models/Campaign.js";
import OperationsSheet from "../models/OperationsSheet.js";
import { isDatabaseReady } from "../config/db.js";
import {
  LOCAL_CAMPAIGNS_FILE,
  LOCAL_OPERATIONS_SHEET_FILE,
  createLocalId,
  readJsonCollection,
  writeJsonCollection,
} from "../utils/localStore.js";
import { getOutboundMailerStatus, sendCampaignEmail } from "../utils/contactMailer.js";

export const sheetColumns = ["name", "email", "company", "status", "notes", "marketingConsent"];
const MAX_SHEET_ROWS = 1000;
const MAX_CAMPAIGN_RECIPIENTS = 100;
const cleanText = (value, maxLength = 1000) =>
  (typeof value === "string" || typeof value === "number" ? String(value) : "")
    .trim()
    .slice(0, maxLength);
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isOptedIn = (value) => value === true || ["yes", "true", "1", "opted in", "opt-in"].includes(String(value).trim().toLowerCase());
const nowIso = () => new Date().toISOString();

const normalizeRow = (row = {}) => ({
  id: cleanText(row.id, 80) || createLocalId(),
  name: cleanText(row.name, 160),
  email: cleanText(row.email, 254).toLowerCase(),
  company: cleanText(row.company, 180),
  status: cleanText(row.status, 80),
  notes: cleanText(row.notes, 1000),
  marketingConsent: isOptedIn(row.marketingConsent),
});

const getSheetData = async () => {
  if (isDatabaseReady()) {
    const sheet = await OperationsSheet.findOne({ key: "contacts" }).lean();
    if (sheet) return sheet;
  }

  const [stored] = await readJsonCollection(LOCAL_OPERATIONS_SHEET_FILE, []);
  return stored || { key: "contacts", columns: sheetColumns, rows: [], updatedAt: null };
};

export const getOperationsSheet = async (_req, res) => {
  try {
    const sheet = await getSheetData();
    return res.json({
      columns: sheetColumns,
      rows: (sheet.rows || []).map(normalizeRow),
      updatedAt: sheet.updatedAt || null,
      storage: isDatabaseReady() ? "mongodb" : "local-file",
    });
  } catch {
    return res.status(500).json({ message: "Unable to load the operations sheet." });
  }
};

export const saveOperationsSheet = async (req, res) => {
  if (!Array.isArray(req.body?.rows)) {
    return res.status(400).json({ message: "Provide sheet rows as an array." });
  }
  if (req.body.rows.length > MAX_SHEET_ROWS) {
    return res.status(413).json({ message: `The sheet can contain up to ${MAX_SHEET_ROWS} rows.` });
  }

  const rows = req.body.rows
    .filter((row) => row && typeof row === "object" && ["name", "email", "company", "status", "notes"]
      .some((key) => String(row[key] ?? "").trim()))
    .map(normalizeRow);
  const invalidRow = rows.find((row) => row.email && !isValidEmail(row.email));
  if (invalidRow) {
    return res.status(400).json({ message: `Check the email address for ${invalidRow.name || "a sheet row"}.` });
  }

  const updatedAt = nowIso();
  const payload = { key: "contacts", columns: sheetColumns, rows, updatedAt };
  try {
    if (isDatabaseReady()) {
      await OperationsSheet.findOneAndUpdate(
        { key: "contacts" },
        { $set: payload },
        { upsert: true, new: true, runValidators: true },
      );
    } else {
      await writeJsonCollection(LOCAL_OPERATIONS_SHEET_FILE, [payload]);
    }
    return res.json({ ...payload, storage: isDatabaseReady() ? "mongodb" : "local-file" });
  } catch {
    return res.status(500).json({ message: "Unable to save the operations sheet." });
  }
};

export const getCampaignHistory = async (_req, res) => {
  try {
    const items = isDatabaseReady()
      ? await Campaign.find().sort({ createdAt: -1 }).limit(30).lean()
      : (await readJsonCollection(LOCAL_CAMPAIGNS_FILE, [])).slice(0, 30);
    return res.json({ items, storage: isDatabaseReady() ? "mongodb" : "local-file" });
  } catch {
    return res.status(500).json({ message: "Unable to load campaign history." });
  }
};

export const sendCampaign = async (req, res) => {
  const subject = cleanText(req.body?.subject, 180);
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const confirmed = req.body?.confirmed === true;
  if (!confirmed) return res.status(400).json({ message: "Confirm the send before launching this campaign." });
  if (!subject || !message) return res.status(400).json({ message: "Subject and message are required." });
  if (message.length > 12000) return res.status(400).json({ message: "Message must be 12,000 characters or fewer." });

  const mailerStatus = getOutboundMailerStatus();
  if (!mailerStatus.configured) {
    return res.status(503).json({ message: `Email sending is not configured: ${mailerStatus.reason}` });
  }

  try {
    const sheet = await getSheetData();
    const uniqueRecipients = new Map();
    for (const row of sheet.rows || []) {
      const normalized = normalizeRow(row);
      if (normalized.marketingConsent && isValidEmail(normalized.email)) {
        uniqueRecipients.set(normalized.email, normalized);
      }
    }
    const requestedEmails = req.body?.recipientEmails;
    let recipients = [...uniqueRecipients.values()];
    if (Array.isArray(requestedEmails)) {
      const selectedEmails = [...new Set(requestedEmails.map((email) => cleanText(email, 254).toLowerCase()))];
      if (selectedEmails.some((email) => !uniqueRecipients.has(email))) {
        return res.status(400).json({ message: "Every selected recipient must be a valid, opted-in address in the sheet." });
      }
      recipients = selectedEmails.map((email) => uniqueRecipients.get(email));
    }
    if (!recipients.length) {
      return res.status(400).json({ message: "No valid opted-in contacts are available in the sheet." });
    }
    if (recipients.length > MAX_CAMPAIGN_RECIPIENTS) {
      return res.status(400).json({ message: `This send has ${recipients.length} opted-in contacts. The per-send limit is ${MAX_CAMPAIGN_RECIPIENTS}; reduce the sheet selection and try again.` });
    }

    let sentCount = 0;
    const failures = [];
    for (const recipient of recipients) {
      try {
        const personalizedMessage = message.replace(/\{\{\s*name\s*\}\}/gi, recipient.name || "there");
        await sendCampaignEmail({ to: recipient.email, subject, message: personalizedMessage });
        sentCount += 1;
      } catch {
        failures.push(recipient.email);
      }
    }

    const status = sentCount === recipients.length ? "sent" : sentCount ? "partial" : "failed";
    const historyItem = {
      _id: crypto.randomUUID(),
      subject,
      message,
      recipientCount: recipients.length,
      sentCount,
      failedCount: recipients.length - sentCount,
      status,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    if (isDatabaseReady()) {
      const { _id, ...campaignData } = historyItem;
      await Campaign.create(campaignData);
    } else {
      const campaigns = await readJsonCollection(LOCAL_CAMPAIGNS_FILE, []);
      await writeJsonCollection(LOCAL_CAMPAIGNS_FILE, [historyItem, ...campaigns].slice(0, 100));
    }

    return res.json({
      campaign: { ...historyItem, message: undefined },
      failedRecipients: failures,
      mailer: mailerStatus,
    });
  } catch {
    return res.status(500).json({ message: "Unable to complete the email campaign." });
  }
};
