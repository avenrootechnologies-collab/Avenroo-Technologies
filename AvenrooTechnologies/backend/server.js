import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
import connectDB from "./config/db.js";
import { isDatabaseReady } from "./config/db.js";
import contactRoutes from "./routes/contactRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import { apiLimiter } from "./middleware/rateLimiters.js";
import { ensureDefaultServices } from "./utils/serviceSeed.js";
import { getContactMailerStatus } from "./utils/contactMailer.js";
import { logger, requestLogger } from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env"), quiet: true });

const isProduction = process.env.NODE_ENV === "production";
const appName = "Avenroo Technologies API";
const booleanFromEnv = (value) => ["1", "true", "yes"].includes(String(value).toLowerCase());

const app = express();
const PORT = process.env.PORT || 5000;
const clientUrlSource =
  process.env.CLIENT_URLS ||
  (isProduction
    ? process.env.RENDER_EXTERNAL_URL || ""
    : "http://localhost:5173,http://127.0.0.1:5173");
const allowedOrigins = clientUrlSource
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction && allowedOrigins.length === 0) {
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
            connectSrc: ["'self'", ...allowedOrigins],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
            frameAncestors: ["'none'"],
            imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
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
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});
app.use(requestLogger);
app.use("/api", apiLimiter);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
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
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/api/health", (req, res) => {
  const databaseReady = isDatabaseReady();
  const isHealthy = !isProduction || databaseReady;
  const includeDetails = !isProduction || booleanFromEnv(process.env.HEALTH_INCLUDE_DETAILS);

  if (!includeDetails) {
    return res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? "ok" : "starting",
      timestamp: new Date().toISOString(),
    });
  }

  const mailerStatus = getContactMailerStatus();
  const localContactStorageAllowed =
    !isProduction || booleanFromEnv(process.env.ALLOW_PRODUCTION_LOCAL_CONTACT_STORAGE);

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

app.get("/api", (req, res) => {
  res.json({
    name: appName,
    status: "running",
    endpoints: ["/api/health", "/api/contact", "/api/services"],
  });
});

app.get("/", (req, res) => {
  res.json({
    name: appName,
    status: "running",
    endpoints: ["/api/health", "/api/contact", "/api/services"],
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
      allowedOriginCount: allowedOrigins.length,
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
