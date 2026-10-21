import AdminInvite from "../models/AdminInvite.js";
import AdminSession from "../models/AdminSession.js";
import AdminUser from "../models/AdminUser.js";
import AdminVerification from "../models/AdminVerification.js";
import { isDatabaseReady } from "../config/db.js";
import {
  ADMIN_SESSION_DURATION_MS,
  clearAdminSessionCookie,
  createOpaqueToken,
  hashOpaqueToken,
  hashPassword,
  setAdminSessionCookie,
  verifyPassword,
} from "../utils/adminSecurity.js";
import { getAdminAuthMailerStatus, sendAdminAuthEmail } from "../utils/contactMailer.js";

const OFFICIAL_ADMIN_EMAIL = "connect@avenroo.in";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OWNER_VERIFICATION_DURATION_MS = 48 * 60 * 60 * 1000;
const INVITE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const normalizeEmail = (value) => String(value || "").trim().toLowerCase();
const adminUrl = (queryName, token) => {
  const defaultUrl = process.env.NODE_ENV === "production" ? "https://avenroo-technologies.vercel.app" : "http://localhost:5173";
  const configuredUrl = (process.env.ADMIN_APP_URL || defaultUrl).trim();
  const url = new URL(configuredUrl);
  if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new Error("ADMIN_APP_URL must use HTTPS in production.");
  }
  url.pathname = "/admin";
  url.search = "";
  url.hash = "";
  url.searchParams.set(queryName, token);
  return url.toString();
};

const databaseRequired = (res) => {
  if (isDatabaseReady()) return false;
  res.status(503).json({ message: "Admin account storage is unavailable. Please try again shortly." });
  return true;
};

const validatePassword = (password) => {
  if (typeof password !== "string" || password.length < 1 || password.length > 128 || Buffer.byteLength(password, "utf8") > 1024) {
    return "Use a password between 1 and 128 characters.";
  }
  return "";
};

export const getAuthStatus = async (_req, res) => {
  if (databaseRequired(res)) return;
  const [owner, mailer] = await Promise.all([
    AdminUser.exists({ role: "owner", emailVerifiedAt: { $ne: null }, isActive: true }),
    Promise.resolve(getAdminAuthMailerStatus()),
  ]);
  res.set("Cache-Control", "no-store");
  res.json({ bootstrapAvailable: !owner, verificationEmail: mailer });
};

export const inspectInvite = async (req, res) => {
  if (databaseRequired(res)) return;
  const tokenHash = hashOpaqueToken(req.params.token || "");
  const invite = await AdminInvite.findOne({ tokenHash, usedAt: null, expiresAt: { $gt: new Date() } }).lean();
  if (!invite || await AdminUser.exists({ email: invite.email })) {
    return res.status(404).json({ message: "This invitation is invalid or has expired." });
  }
  res.set("Cache-Control", "no-store");
  return res.json({ email: invite.email, expiresAt: invite.expiresAt });
};

export const registerAdmin = async (req, res) => {
  if (databaseRequired(res)) return;
  const name = String(req.body?.name || "").trim();
  const email = normalizeEmail(req.body?.email);
  const password = req.body?.password;
  const inviteToken = String(req.body?.inviteToken || "");
  const passwordError = validatePassword(password);

  if (!name || name.length > 100) return res.status(400).json({ message: "Enter your name (up to 100 characters)." });
  if (!EMAIL_PATTERN.test(email) || email.length > 254) return res.status(400).json({ message: "Enter a valid email address." });
  if (passwordError) return res.status(400).json({ message: passwordError });

  const mailerStatus = getAdminAuthMailerStatus();
  if (!mailerStatus.configured) return res.status(503).json({ message: `Email confirmation is not configured: ${mailerStatus.reason}` });

  const existingUser = await AdminUser.findOne({ email });
  if (existingUser?.emailVerifiedAt) return res.status(409).json({ message: "An account already exists for this email. Sign in instead." });

  let role = "admin";
  let claimedInvite = null;
  if (inviteToken) {
    const invite = await AdminInvite.findOne({
      tokenHash: hashOpaqueToken(inviteToken),
      email,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });
    if (!invite) return res.status(400).json({ message: "This invitation is invalid or has expired." });
    claimedInvite = await AdminInvite.findOneAndUpdate(
      { _id: invite._id, usedAt: null, expiresAt: { $gt: new Date() } },
      { $set: { usedAt: new Date() } },
      { new: true },
    );
    if (!claimedInvite) return res.status(400).json({ message: "This invitation has already been used." });
  } else {
    const verifiedOwner = await AdminUser.exists({ role: "owner", emailVerifiedAt: { $ne: null }, isActive: true });
    if (verifiedOwner || email !== OFFICIAL_ADMIN_EMAIL) {
      return res.status(403).json({ message: "New admin accounts require an invitation from an existing administrator." });
    }
    role = "owner";
  }

  if (existingUser) {
    await Promise.all([
      AdminVerification.deleteMany({ userId: existingUser._id }),
      AdminUser.deleteOne({ _id: existingUser._id, emailVerifiedAt: null }),
    ]);
  }

  let user;
  try {
    user = await AdminUser.create({ name, email, passwordHash: await hashPassword(password), role });
  } catch (error) {
    if (claimedInvite) await AdminInvite.updateOne({ _id: claimedInvite._id }, { $set: { usedAt: null } });
    if (error?.code === 11000) return res.status(409).json({ message: "An account is already being created for this email." });
    throw error;
  }

  const verificationToken = createOpaqueToken();
  try {
    await AdminVerification.create({
      userId: user._id,
      tokenHash: hashOpaqueToken(verificationToken),
      expiresAt: new Date(Date.now() + OWNER_VERIFICATION_DURATION_MS),
    });
    const verificationUrl = adminUrl("verify", verificationToken);
    await sendAdminAuthEmail({
      to: email,
      subject: "Confirm your Avenroo admin account",
      text: [
        `Hi ${name},`,
        "",
        "Confirm this email address to activate your Avenroo Technologies admin account:",
        verificationUrl,
        "",
        "This link expires in 48 hours. If you did not request this account, ignore this email.",
        "",
        "Avenroo Technologies",
        OFFICIAL_ADMIN_EMAIL,
      ].join("\n"),
    });
  } catch (error) {
    await Promise.all([
      AdminVerification.deleteMany({ userId: user._id }),
      AdminUser.deleteOne({ _id: user._id, emailVerifiedAt: null }),
    ]);
    if (claimedInvite) await AdminInvite.updateOne({ _id: claimedInvite._id }, { $set: { usedAt: null } });
    return res.status(503).json({ message: "We could not send the confirmation email. Check the SMTP settings and try again." });
  }

  res.set("Cache-Control", "no-store");
  return res.status(202).json({ message: `A confirmation link has been sent to ${email}. It expires in 48 hours.` });
};

export const verifyAdminEmail = async (req, res) => {
  if (databaseRequired(res)) return;
  const token = String(req.body?.token || "");
  if (!token) return res.status(400).json({ message: "The confirmation link is missing its token." });
  const verification = await AdminVerification.findOne({
    tokenHash: hashOpaqueToken(token),
    expiresAt: { $gt: new Date() },
  });
  if (!verification) return res.status(400).json({ message: "This confirmation link is invalid or has expired." });

  const user = await AdminUser.findByIdAndUpdate(
    verification.userId,
    { $set: { emailVerifiedAt: new Date() } },
    { new: true },
  );
  await AdminVerification.deleteMany({ userId: verification.userId });
  if (!user || !user.isActive) return res.status(400).json({ message: "This account is no longer available." });
  res.set("Cache-Control", "no-store");
  return res.json({ message: "Email confirmed. You can now sign in." });
};

export const loginAdmin = async (req, res) => {
  if (databaseRequired(res)) return;
  const email = normalizeEmail(req.body?.email);
  const password = typeof req.body?.password === "string" ? req.body.password : "";
  const user = await AdminUser.findOne({ email }).select("+passwordHash");
  if (!user || !user.isActive || !(await verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ message: "Email or password is incorrect." });
  }
  if (!user.emailVerifiedAt) return res.status(403).json({ message: "Confirm your email using the link we sent before signing in." });

  const token = createOpaqueToken();
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_DURATION_MS);
  await AdminSession.create({ userId: user._id, tokenHash: hashOpaqueToken(token), expiresAt });
  setAdminSessionCookie(res, token);
  res.set("Cache-Control", "no-store");
  return res.json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
    expiresAt,
  });
};

export const getAdminIdentity = (req, res) => {
  res.set("Cache-Control", "no-store");
  res.json({ user: { id: req.adminUser._id, name: req.adminUser.name, email: req.adminUser.email, role: req.adminUser.role } });
};

export const logoutAdmin = async (req, res) => {
  if (req.adminSession?._id) await AdminSession.deleteOne({ _id: req.adminSession._id });
  clearAdminSessionCookie(res);
  res.set("Cache-Control", "no-store");
  res.json({ message: "Signed out." });
};

export const getAdminAccountLists = async (_req, res) => {
  if (databaseRequired(res)) return;
  const [users, invites] = await Promise.all([
    AdminUser.find({ isActive: true }).select("name email role emailVerifiedAt createdAt").sort({ createdAt: 1 }).lean(),
    AdminInvite.find({ usedAt: null, expiresAt: { $gt: new Date() } }).select("email expiresAt createdAt").sort({ createdAt: -1 }).limit(50).lean(),
  ]);
  res.set("Cache-Control", "no-store");
  res.json({
    users: users.map((user) => ({ id: user._id, name: user.name, email: user.email, role: user.role, emailVerifiedAt: user.emailVerifiedAt, createdAt: user.createdAt })),
    invites: invites.map((invite) => ({ id: invite._id, email: invite.email, expiresAt: invite.expiresAt, createdAt: invite.createdAt })),
  });
};

export const inviteAdmin = async (req, res) => {
  if (databaseRequired(res)) return;
  const email = normalizeEmail(req.body?.email);
  if (!EMAIL_PATTERN.test(email) || email.length > 254) return res.status(400).json({ message: "Enter a valid email address." });
  const mailerStatus = getAdminAuthMailerStatus();
  if (!mailerStatus.configured) return res.status(503).json({ message: `Invitation email is not configured: ${mailerStatus.reason}` });
  if (await AdminUser.exists({ email })) return res.status(409).json({ message: "An admin account already exists for this email." });

  const token = createOpaqueToken();
  await AdminInvite.deleteMany({ email, usedAt: null });
  const invite = await AdminInvite.create({
    email,
    tokenHash: hashOpaqueToken(token),
    invitedBy: req.adminUser._id,
    expiresAt: new Date(Date.now() + INVITE_DURATION_MS),
  });

  try {
    await sendAdminAuthEmail({
      to: email,
      subject: "You are invited to Avenroo Operations",
      text: [
        "You have been invited to the Avenroo Technologies operations panel.",
        "",
        `Create your account and confirm your email within 7 days: ${adminUrl("invite", token)}`,
        "",
        "The confirmation email will be sent from connect@avenroo.in.",
        "",
        "Avenroo Technologies",
        OFFICIAL_ADMIN_EMAIL,
      ].join("\n"),
    });
  } catch {
    await AdminInvite.deleteOne({ _id: invite._id });
    return res.status(503).json({ message: "We could not send the invitation. Check the SMTP settings and try again." });
  }
  return res.status(201).json({ message: `Invitation sent to ${email}.`, invite: { id: invite._id, email, expiresAt: invite.expiresAt } });
};
