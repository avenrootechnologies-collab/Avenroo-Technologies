import express from "express";
import {
  createContact,
  getContacts,
  updateContactStatus,
} from "../controllers/contactController.js";
import { requireAdminApiKey } from "../middleware/adminAuth.js";
import { adminApiLimiter, contactSubmissionLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.post("/", contactSubmissionLimiter, createContact);
router.get("/", adminApiLimiter, requireAdminApiKey, getContacts);
router.patch("/:id/status", adminApiLimiter, requireAdminApiKey, updateContactStatus);

export default router;
