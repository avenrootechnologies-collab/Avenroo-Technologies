const parseOrigin = (value, isProduction) => {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "https:" && (isProduction || !["http:", "https:"].includes(url.protocol))) return "";
    return url.origin;
  } catch {
    return "";
  }
};

export const getAllowedClientOrigins = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const configuredSource =
    process.env.CLIENT_URLS ||
    (isProduction
      ? process.env.RENDER_EXTERNAL_URL || ""
      : "http://localhost:5173,http://127.0.0.1:5173");
  const configuredOrigins = configuredSource.split(",").map((value) => parseOrigin(value, isProduction)).filter(Boolean);

  if (isProduction) configuredOrigins.push("https://avenroo.in", "https://www.avenroo.in");
  return [...new Set(configuredOrigins)];
};

export const isAllowedClientOrigin = (origin) => getAllowedClientOrigins().includes(origin);
