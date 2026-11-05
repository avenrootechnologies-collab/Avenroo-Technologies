import { randomUUID } from "node:crypto";

const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const SENSITIVE_KEY_PATTERN =
  /(authorization|cookie|password|pass|secret|token|api[_-]?key|admin[_-]?api[_-]?key|smtp[_-]?user|smtp[_-]?pass|mongo[_-]?uri|database[_-]?url)/i;

const redactSensitiveText = (value) =>
  String(value)
    .replace(/\bmongodb(?:\+srv)?:\/\/[^\s"'<>]+/gi, "[redacted-mongodb-uri]")
    .replace(/\b(Bearer|Basic)\s+[A-Za-z0-9._~+/-]+=*/gi, "$1 [redacted]")
    .replace(
      /\b(authorization|cookie|password|pass|secret|token|api[_-]?key|admin[_-]?api[_-]?key|smtp[_-]?(?:user|pass)|mongo(?:db)?[_-]?uri|database[_-]?url)\s*[:=]\s*("[^"]*"|'[^']*'|[^\s,;]+)/gi,
      "$1=[redacted]",
    );

const resolveLogLevel = () => {
  const configuredLevel = String(process.env.LOG_LEVEL || "").toLowerCase();

  if (Object.prototype.hasOwnProperty.call(LEVELS, configuredLevel)) {
    return configuredLevel;
  }

  return process.env.NODE_ENV === "production" ? "info" : "debug";
};

const shouldLog = (level) => LEVELS[level] <= LEVELS[resolveLogLevel()];

const humanizeMessage = (message) =>
  String(message || "")
    .split(".")
    .map((part) => part.replace(/_/g, " "))
    .join(" > ");

const safeRequestPath = (req) => {
  try {
    const pathname = new URL(req.originalUrl || req.url, "http://localhost").pathname;
    return pathname.replace(/(\/api\/auth\/invites\/)[^/]+/i, "$1[redacted]");
  } catch {
    return "/[invalid-path]";
  }
};

const sanitizeValue = (value, depth = 0) => {
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactSensitiveText(value.message),
      ...(process.env.NODE_ENV !== "production" ? { stack: redactSensitiveText(value.stack || "") } : {}),
    };
  }

  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value !== "object") {
    return value;
  }

  if (depth > 4) {
    return "[max-depth]";
  }

  if (Array.isArray(value)) {
    return value.slice(0, 25).map((item) => sanitizeValue(item, depth + 1));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => [
      key,
      SENSITIVE_KEY_PATTERN.test(key) && typeof entryValue === "string"
        ? "[redacted]"
        : sanitizeValue(entryValue, depth + 1),
    ]),
  );
};

const formatValue = (value) => {
  if (value === null) {
    return "null";
  }

  if (value === undefined) {
    return "undefined";
  }

  if (typeof value === "string") {
    return /[\s"\\]/.test(value) ? JSON.stringify(value) : value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value === "object" && value.name && value.message) {
    return JSON.stringify(`${value.name}: ${value.message}`);
  }

  return JSON.stringify(value);
};

const formatMeta = (meta = {}) => {
  const sanitizedMeta = sanitizeValue(meta);

  return Object.entries(sanitizedMeta)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${formatValue(value)}`)
    .join(" ");
};

const writeLog = (level, message, meta = {}) => {
  if (!shouldLog(level)) {
    return;
  }

  const timestamp = new Date().toISOString();
  const details = formatMeta(meta);
  const line = `[${timestamp}] ${level.toUpperCase()} ${humanizeMessage(message)}${
    details ? ` | ${details}` : ""
  }`;

  if (level === "error") {
    console.error(line);
    return;
  }

  if (level === "warn") {
    console.warn(line);
    return;
  }

  if (level === "debug") {
    console.debug(line);
    return;
  }

  console.info(line);
};

export const logger = {
  error: (message, meta) => writeLog("error", message, meta),
  warn: (message, meta) => writeLog("warn", message, meta),
  info: (message, meta) => writeLog("info", message, meta),
  debug: (message, meta) => writeLog("debug", message, meta),
};

export const requestContext = (req, meta = {}) => ({
  requestId: req.requestId,
  method: req.method,
  path: safeRequestPath(req),
  ...meta,
});

export const logRequestStep = (req, level, message, meta = {}) => {
  logger[level](message, requestContext(req, meta));
};

export const requestLogger = (req, res, next) => {
  const startedAt = Date.now();
  const requestId = randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-ID", requestId);

  logger.debug("http.request.started", {
    requestId,
    method: req.method,
    path: safeRequestPath(req),
    origin: req.get("origin") || null,
    userAgent: req.get("user-agent") || null,
    contentLength: req.get("content-length") || null,
  });

  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    logger[level]("http.request.completed", {
      requestId,
      method: req.method,
      path: safeRequestPath(req),
      statusCode: res.statusCode,
      durationMs,
    });
  });

  res.on("close", () => {
    if (!res.writableEnded) {
      logger.warn("http.request.closed_before_response", {
        requestId,
        method: req.method,
        path: safeRequestPath(req),
        durationMs: Date.now() - startedAt,
      });
    }
  });

  next();
};
