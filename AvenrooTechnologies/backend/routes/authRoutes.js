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
import { requireTrustedOrigin } from "../middleware/requireTrustedOrigin.js";

const router = express.Router();
router.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");
  next();
});
router.use(requireTrustedOrigin);

router.get("/status", authLimiter, getAuthStatus);
router.post("/invites/inspect", authLimiter, inspectInvite);
router.post("/register", authLimiter, registerAdmin);
router.post("/verify", authLimiter, verifyAdminEmail);
router.post("/login", authLimiter, loginAdmin);
router.get("/me", adminApiLimiter, requireAdminAccess, getAdminIdentity);
router.post("/logout", adminApiLimiter, requireAdminAccess, logoutAdmin);

export default router;
