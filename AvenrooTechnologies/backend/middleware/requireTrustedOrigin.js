import { isAllowedClientOrigin } from "../config/clientOrigins.js";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export const requireTrustedOrigin = (req, res, next) => {
  if (safeMethods.has(req.method)) return next();

  const origin = req.get("origin");
  if (!origin || !isAllowedClientOrigin(origin)) {
    return res.status(403).json({ message: "This request origin is not allowed." });
  }

  return next();
};
