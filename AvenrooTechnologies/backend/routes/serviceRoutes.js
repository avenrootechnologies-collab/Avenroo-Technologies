import express from "express";
import {
  deleteService,
  getServiceByIdentifier,
  getServices,
  createService,
  updateService,
} from "../controllers/serviceController.js";
import { requireAdminApiKey } from "../middleware/adminAuth.js";
import { adminApiLimiter } from "../middleware/rateLimiters.js";

const router = express.Router();

const restrictInactiveServiceReads = (handler) => (req, res, next) => {
  if (req.query.includeInactive !== "true") return handler(req, res, next);

  return adminApiLimiter(req, res, (error) => {
    if (error) return next(error);
    return requireAdminApiKey(req, res, () => handler(req, res, next));
  });
};

router.get("/", restrictInactiveServiceReads(getServices));
router.get("/:identifier", restrictInactiveServiceReads(getServiceByIdentifier));
router.post("/", adminApiLimiter, requireAdminApiKey, createService);
router.put("/:id", adminApiLimiter, requireAdminApiKey, updateService);
router.delete("/:id", adminApiLimiter, requireAdminApiKey, deleteService);

export default router;
