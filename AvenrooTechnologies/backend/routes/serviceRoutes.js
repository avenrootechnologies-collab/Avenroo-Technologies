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

router.get("/", getServices);
router.get("/:identifier", getServiceByIdentifier);
router.post("/", adminApiLimiter, requireAdminApiKey, createService);
router.put("/:id", adminApiLimiter, requireAdminApiKey, updateService);
router.delete("/:id", adminApiLimiter, requireAdminApiKey, deleteService);

export default router;
