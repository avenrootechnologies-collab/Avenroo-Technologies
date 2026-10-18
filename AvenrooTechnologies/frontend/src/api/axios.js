// frontend/src/api/axios.js
import axios from "axios";

const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const resolveApiBaseUrl = () => {
  const configuredUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL);

  if (configuredUrl) {
    return configuredUrl;
  }

  return "/api";
};

const API = axios.create({
  baseURL: resolveApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
