import express from "express";
import {
  getCampaignHistory,
  getOperationsSheet,
  saveOperationsSheet,
  sendCampaign,
} from "../controllers/adminController.js";
import { getAdminAccountLists, inviteAdmin } from "../controllers/authController.js";
import { requireAdminAccess } from "../middleware/adminAuth.js";
import { adminApiLimiter } from "../middleware/rateLimiters.js";
import { getAdminAuthMailerStatus, getContactMailerStatus, getOutboundMailerStatus } from "../utils/contactMailer.js";
import { isDatabaseReady } from "../config/db.js";
import { documentTemplate } from "../data/documentTemplate.js";

const router = express.Router();
router.use(adminApiLimiter, requireAdminAccess);

router.get("/session", (_req, res) => res.json({
  authorized: true,
  user: { name: _req.adminUser.name, email: _req.adminUser.email, role: _req.adminUser.role },
  emailNotifications: getContactMailerStatus(),
  campaignEmail: getOutboundMailerStatus(),
  accountEmail: getAdminAuthMailerStatus(),
  database: isDatabaseReady() ? "connected" : "local-file fallback",
}));
router.get("/document-template", (_req, res) => res.json(documentTemplate));
router.get("/users", getAdminAccountLists);
router.post("/invites", inviteAdmin);
router.get("/sheet", getOperationsSheet);
router.put("/sheet", saveOperationsSheet);
router.get("/campaigns", getCampaignHistory);
router.post("/campaigns", sendCampaign);

export default router;
