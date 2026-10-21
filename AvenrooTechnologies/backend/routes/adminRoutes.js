import express from "express";
import {
  getCampaignHistory,
  getOperationsSheet,
  saveOperationsSheet,
  sendCampaign,
} from "../controllers/adminController.js";
import { requireAdminApiKey } from "../middleware/adminAuth.js";
import { adminApiLimiter } from "../middleware/rateLimiters.js";
import { getContactMailerStatus, getOutboundMailerStatus } from "../utils/contactMailer.js";
import { isDatabaseReady } from "../config/db.js";

const router = express.Router();
router.use(adminApiLimiter, requireAdminApiKey);

router.get("/session", (_req, res) => res.json({
  authorized: true,
  emailNotifications: getContactMailerStatus(),
  campaignEmail: getOutboundMailerStatus(),
  database: isDatabaseReady() ? "connected" : "local-file fallback",
}));
router.get("/sheet", getOperationsSheet);
router.put("/sheet", saveOperationsSheet);
router.get("/campaigns", getCampaignHistory);
router.post("/campaigns", sendCampaign);

export default router;
