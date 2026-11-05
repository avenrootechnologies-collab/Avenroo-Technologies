import "./config/loadEnv.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import { isDatabaseReady } from "./config/db.js";
import contactRoutes from "./routes/contactRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import portfolioRoutes from "./routes/portfolioRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { apiLimiter } from "./middleware/rateLimiters.js";
import { ensureDefaultServices } from "./utils/serviceSeed.js";
import { getContactMailerStatus } from "./utils/contactMailer.js";
import { logger, requestLogger } from "./utils/logger.js";
import { getAllowedClientOrigins } from "./config/clientOrigins.js";

const isProduction = process.env.NODE_ENV === "production";
const appName = "Avenroo Technologies API";
const app = express();
const PORT = process.env.PORT || 5000;
const uniqueAllowedOrigins = getAllowedClientOrigins();

if (isProduction && uniqueAllowedOrigins.length === 0) {
  throw new Error("CLIENT_URLS must be configured in production.");
}

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            baseUri: ["'self'"],
            connectSrc: ["'self'", ...uniqueAllowedOrigins],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
            frameAncestors: ["'none'"],
            imgSrc: ["'self'", "data:", "https://images.unsplash.com", "blob:"],
            objectSrc: ["'none'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
          },
        }
      : false,
    crossOriginEmbedderPolicy: false,
  }),
);
app.use((req, res, next) => {
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  next();
});
app.use(requestLogger);
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  next();
});
app.use("/api", apiLimiter);

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || uniqueAllowedOrigins.includes(origin)) {
        logger.debug("cors.origin.allowed", { origin: origin || "same-origin" });
        callback(null, true);
        return;
      }

      logger.warn("cors.origin.blocked", { origin });
      callback(new Error("Origin not allowed by CORS."));
    },
  }),
);
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);

app.get("/api/health", (req, res) => {
  res.set("Cache-Control", "no-store");
  res.set("Pragma", "no-cache");
  const databaseReady = isDatabaseReady();
  const isHealthy = !isProduction || databaseReady;
  const includeDetails = !isProduction;

  if (!includeDetails) {
    return res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? "ok" : "starting",
      timestamp: new Date().toISOString(),
    });
  }

  const mailerStatus = getContactMailerStatus();
  const localContactStorageAllowed = !isProduction;

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "ok" : "starting",
    database: databaseReady ? "connected" : "disconnected",
    contactStorage: databaseReady
      ? "mongodb"
      : localContactStorageAllowed
        ? "local-file"
        : "unavailable",
    emailNotifications: mailerStatus.configured ? "configured" : "not-configured",
    emailNotificationReason: mailerStatus.configured ? undefined : mailerStatus.reason,
    fallbackServices: !isDatabaseReady(),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/contact", contactRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api", (req, res) => {
  res.json({
    name: appName,
    status: "running",
    endpoints: ["/api/health", "/api/contact", "/api/services", "/api/portfolio", "/api/admin"],
  });
});

app.get("/", (req, res) => {
  res.json({
    name: appName,
    status: "running",
    endpoints: ["/api/health", "/api/contact", "/api/services", "/api/portfolio", "/api/admin"],
  });
});

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
  app.listen(PORT, () => {
    logger.info("server.started", {
      port: PORT,
      nodeEnv: process.env.NODE_ENV || "development",
      logLevel: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
      allowedOriginCount: uniqueAllowedOrigins.length,
    });
  });

  logger.info("database.connection.starting");
  const databaseConnected = await connectDB();

  if (databaseConnected) {
    logger.info("services.seed.starting");
    const seedResult = await ensureDefaultServices();

    if (seedResult.seeded) {
      logger.info("services.seed.completed", { seededCount: seedResult.seededCount });
    } else {
      logger.debug("services.seed.skipped", seedResult);
    }
  } else {
    logger.warn("database.connection.unavailable_using_fallback_storage");
  }
};

process.on("unhandledRejection", (reason) => {
  logger.error("process.unhandled_rejection", { reason });
});

process.on("uncaughtException", (error) => {
  logger.error("process.uncaught_exception", { error });
  process.exit(1);
});

startServer();
