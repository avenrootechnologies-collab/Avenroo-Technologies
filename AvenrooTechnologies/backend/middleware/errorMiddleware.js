import { logRequestStep } from "../utils/logger.js";

export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  logRequestStep(req, "warn", "route.not_found");
  next(error);
};

export const errorHandler = (error, req, res, next) => {
  let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  if (error.name === "CastError" && statusCode === 500) {
    statusCode = 400;
  }

  logRequestStep(req, statusCode >= 500 ? "error" : "warn", "request.error", {
    statusCode,
    error,
  });

  res.status(statusCode).json({
    message: error.message || "Internal server error.",
    ...(process.env.NODE_ENV !== "production" ? { stack: error.stack } : {}),
  });
};
