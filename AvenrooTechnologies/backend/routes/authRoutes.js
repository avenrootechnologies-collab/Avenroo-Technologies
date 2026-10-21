import express from "express";
import {
  getAdminIdentity,
  getAuthStatus,
  inspectInvite,
  loginAdmin,
  logoutAdmin,
  registerAdmin,
  verifyAdminEmail,
} from "../controllers/authController.js";
import { requireAdminAccess } from "../middleware/adminAuth.js";
import { adminApiLimiter, authLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

router.get("/status", authLimiter, getAuthStatus);
router.get("/invites/:token", authLimiter, inspectInvite);
router.post("/register", authLimiter, registerAdmin);
router.post("/verify", authLimiter, verifyAdminEmail);
router.post("/login", authLimiter, loginAdmin);
router.get("/me", adminApiLimiter, requireAdminAccess, getAdminIdentity);
router.post("/logout", adminApiLimiter, requireAdminAccess, logoutAdmin);

export default router;
