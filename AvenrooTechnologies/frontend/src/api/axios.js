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

API.interceptors.request.use((config) => {
  const adminKey = window.sessionStorage.getItem("avenroo-admin-key");

  if (adminKey) {
    config.headers["x-admin-api-key"] = adminKey;
  } else if (config.headers["x-admin-api-key"]) {
    delete config.headers["x-admin-api-key"];
  }

  return config;
});

export default API;
