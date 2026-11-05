import express from "express";
import {
  deleteService,
  getServiceByIdentifier,
  getServices,
  createService,
  updateService,
} from "../controllers/serviceController.js";
import { requireAdminAccess } from "../middleware/adminAuth.js";
import { adminApiLimiter } from "../middleware/rateLimiters.js";
import { requireTrustedOrigin } from "../middleware/requireTrustedOrigin.js";

const router = express.Router();

const restrictInactiveServiceReads = (handler) => (req, res, next) => {
  if (req.query.includeInactive !== "true") return handler(req, res, next);

  return adminApiLimiter(req, res, (error) => {
    if (error) return next(error);
    return requireAdminAccess(req, res, (authError) => {
      if (authError) return next(authError);
      return handler(req, res, next);
    });
  });
};

router.get("/", restrictInactiveServiceReads(getServices));
router.get("/:identifier", restrictInactiveServiceReads(getServiceByIdentifier));
router.post("/", requireTrustedOrigin, adminApiLimiter, requireAdminAccess, createService);
router.put("/:id", requireTrustedOrigin, adminApiLimiter, requireAdminAccess, updateService);
router.delete("/:id", requireTrustedOrigin, adminApiLimiter, requireAdminAccess, deleteService);

export default router;
