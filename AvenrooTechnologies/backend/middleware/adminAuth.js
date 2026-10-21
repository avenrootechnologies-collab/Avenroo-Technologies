import AdminSession from "../models/AdminSession.js";
import { isDatabaseReady } from "../config/db.js";
import { clearAdminSessionCookie, hashOpaqueToken, readAdminSessionCookie } from "../utils/adminSecurity.js";

export const requireAdminAccess = async (req, res, next) => {
  if (!isDatabaseReady()) {
    return res.status(503).json({ message: "Admin account storage is unavailable. Please try again shortly." });
  }

  let token = "";
  try {
    token = readAdminSessionCookie(req);
  } catch {
    token = "";
  }
  if (!token) {
    clearAdminSessionCookie(res);
    return res.status(401).json({ message: "Sign in to access the admin panel." });
  }

  try {
    const session = await AdminSession.findOne({ tokenHash: hashOpaqueToken(token), expiresAt: { $gt: new Date() } }).populate("userId");
    const user = session?.userId;
    if (!session || !user || !user.isActive || !user.emailVerifiedAt) {
      clearAdminSessionCookie(res);
      return res.status(401).json({ message: "Your admin session has expired. Sign in again." });
    }
    req.adminSession = session;
    req.adminUser = user;
    return next();
  } catch (error) {
    return next(error);
  }
};
