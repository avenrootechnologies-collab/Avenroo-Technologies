import { logRequestStep } from "../utils/logger.js";

export const notFound = (req, res, next) => {
  const error = new Error("Route not found.");
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

  const message = process.env.NODE_ENV === "production"
    ? statusCode === 404
      ? "Not found."
      : statusCode >= 500
        ? "Internal server error."
        : "Request failed."
    : error.message || "Internal server error.";

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV !== "production" ? { stack: error.stack } : {}),
  });
};
