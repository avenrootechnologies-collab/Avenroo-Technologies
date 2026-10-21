import express from "express";
import {
  createContact,
  getContacts,
  updateContactStatus,
} from "../controllers/contactController.js";
import { requireAdminAccess } from "../middleware/adminAuth.js";
import { adminApiLimiter, contactSubmissionLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.post("/", contactSubmissionLimiter, createContact);
router.get("/", adminApiLimiter, requireAdminAccess, getContacts);
router.patch("/:id/status", adminApiLimiter, requireAdminAccess, updateContactStatus);

export default router;
