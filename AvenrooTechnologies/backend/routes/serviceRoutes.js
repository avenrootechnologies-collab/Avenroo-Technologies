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

const router = express.Router();

const restrictInactiveServiceReads = (handler) => (req, res, next) => {
  if (req.query.includeInactive !== "true") return handler(req, res, next);

  return adminApiLimiter(req, res, (error) => {
    if (error) return next(error);
    return requireAdminAccess(req, res, () => handler(req, res, next));
  });
};

router.get("/", restrictInactiveServiceReads(getServices));
router.get("/:identifier", restrictInactiveServiceReads(getServiceByIdentifier));
router.post("/", adminApiLimiter, requireAdminAccess, createService);
router.put("/:id", adminApiLimiter, requireAdminAccess, updateService);
router.delete("/:id", adminApiLimiter, requireAdminAccess, deleteService);

export default router;
