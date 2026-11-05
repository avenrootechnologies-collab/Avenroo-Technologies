import express from "express";
import {
  getCampaignHistory,
  getOperationsSheet,
  saveOperationsSheet,
  sendCampaign,
} from "../controllers/adminController.js";
import { getAdminAccountLists, inviteAdmin } from "../controllers/authController.js";
import { getAdminPortfolio, saveAdminPortfolio } from "../controllers/portfolioController.js";
import { requireAdminAccess } from "../middleware/adminAuth.js";
import { adminApiLimiter } from "../middleware/rateLimiters.js";
import { getAdminAuthMailerStatus, getContactMailerStatus, getOutboundMailerStatus } from "../utils/contactMailer.js";
import { isDatabaseReady } from "../config/db.js";
import { documentTemplate } from "../data/documentTemplate.js";
import { requireTrustedOrigin } from "../middleware/requireTrustedOrigin.js";

const router = express.Router();
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");
  next();
});
router.use(requireTrustedOrigin, adminApiLimiter, requireAdminAccess);

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
router.get("/portfolio", getAdminPortfolio);
router.put("/portfolio", saveAdminPortfolio);

export default router;
