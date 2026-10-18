import crypto from "node:crypto";
import { logRequestStep } from "../utils/logger.js";

const weakAdminKeys = new Set([
  "admin",
  "changeme",
  "password",
  "replace-with-a-long-random-admin-key",
  "secret",
]);

const getProvidedKey = (req) => {
  const headerKey = req.get("x-admin-api-key");

  if (headerKey) {
    return headerKey;
  }

  const authHeader = req.get("authorization") || "";
  const [scheme, token] = authHeader.split(" ");

  return scheme?.toLowerCase() === "bearer" ? token : "";
};

const safeEqual = (left, right) => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

export const requireAdminApiKey = (req, res, next) => {
  const configuredKey = process.env.ADMIN_API_KEY || "";
  const normalizedKey = configuredKey.trim().toLowerCase();
  const isProduction = process.env.NODE_ENV === "production";

  if (!configuredKey) {
    logRequestStep(req, "error", "admin_auth.missing_configured_key");
    return res.status(503).json({ message: "Admin API key is not configured." });
  }

  if (isProduction && (configuredKey.length < 32 || weakAdminKeys.has(normalizedKey))) {
    logRequestStep(req, "error", "admin_auth.weak_configured_key");
    return res.status(503).json({ message: "Admin API key is not securely configured." });
  }

  if (!safeEqual(getProvidedKey(req), configuredKey)) {
    logRequestStep(req, "warn", "admin_auth.invalid_key");
    return res.status(401).json({ message: "Valid admin API key is required." });
  }

  logRequestStep(req, "debug", "admin_auth.authorized");
  return next();
};
