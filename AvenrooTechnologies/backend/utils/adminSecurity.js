import crypto from "node:crypto";
import { promisify } from "node:util";

const pbkdf2 = promisify(crypto.pbkdf2);
const PASSWORD_ITERATIONS = 600_000;
const PASSWORD_KEY_LENGTH = 32;
const PASSWORD_DIGEST = "sha256";

export const hashPassword = async (password) => {
  const salt = crypto.randomBytes(16);
  const derived = await pbkdf2(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, PASSWORD_DIGEST);
  return `pbkdf2$${PASSWORD_ITERATIONS}$${salt.toString("base64url")}$${derived.toString("base64url")}`;
};

export const verifyPassword = async (password, encoded) => {
  const [algorithm, iterationsValue, saltValue, hashValue] = String(encoded || "").split("$");
  const iterations = Number(iterationsValue);
  const salt = Buffer.from(saltValue || "", "base64url");
  const expected = Buffer.from(hashValue || "", "base64url");
  if (algorithm !== "pbkdf2" || !Number.isInteger(iterations) || iterations < 100_000 || iterations > 2_000_000 || salt.length < 16 || expected.length !== PASSWORD_KEY_LENGTH) {
    return false;
  }
  const actual = await pbkdf2(password, salt, iterations, expected.length, PASSWORD_DIGEST);
  return crypto.timingSafeEqual(actual, expected);
};

export const createOpaqueToken = () => crypto.randomBytes(32).toString("base64url");
export const hashOpaqueToken = (token) => crypto.createHash("sha256").update(String(token)).digest("hex");
export const ADMIN_SESSION_COOKIE = "avenroo_admin_session";
export const ADMIN_SESSION_DURATION_MS = 12 * 60 * 60 * 1000;

export const readAdminSessionCookie = (req) => {
  const cookieHeader = req.headers.cookie || "";
  const item = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  return item ? decodeURIComponent(item.slice(ADMIN_SESSION_COOKIE.length + 1)) : "";
};

export const setAdminSessionCookie = (res, token) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${ADMIN_SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ADMIN_SESSION_DURATION_MS / 1000}${secure}`,
  );
};

export const clearAdminSessionCookie = (res) => {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  res.setHeader("Set-Cookie", `${ADMIN_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`);
};
