import rateLimit from "express-rate-limit";
import { MongoRateLimitStore } from "../utils/mongoRateLimitStore.js";

const isProduction = process.env.NODE_ENV === "production";

const createLimiter = ({ name, windowMs, limit, message }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    ...(isProduction ? { store: new MongoRateLimitStore(name, { failClosed: name !== "api" }) } : {}),
    message: { message },
  });

export const apiLimiter = createLimiter({
  name: "api",
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 300 : 1000,
  message: "Too many requests. Please try again later.",
});

export const contactSubmissionLimiter = createLimiter({
  name: "contact",
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 10 : 50,
  message: "Too many contact requests. Please try again later.",
});

export const adminApiLimiter = createLimiter({
  name: "admin",
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 60 : 240,
  message: "Too many admin requests. Please try again later.",
});

export const authLimiter = createLimiter({
  name: "auth",
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 20 : 100,
  message: "Too many sign-in or registration attempts. Please wait and try again.",
});
