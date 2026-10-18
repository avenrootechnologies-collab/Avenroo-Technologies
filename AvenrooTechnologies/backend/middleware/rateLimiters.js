import rateLimit from "express-rate-limit";

const isProduction = process.env.NODE_ENV === "production";

const createLimiter = ({ windowMs, limit, message }) =>
  rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  });

export const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 300 : 1000,
  message: "Too many requests. Please try again later.",
});

export const contactSubmissionLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 10 : 50,
  message: "Too many contact requests. Please try again later.",
});

export const adminApiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: isProduction ? 60 : 240,
  message: "Too many admin requests. Please try again later.",
});
