import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const TOKEN_KEY = "afterglow_access_token";

export const apiClient = axios.create({
  baseURL,
  timeout: 8000
});

function createRequestId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export function getStoredAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredAccessToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearStoredAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  const nextHeaders = { ...(config.headers || {}) };
  nextHeaders["X-Request-Id"] = createRequestId();
  if (token) {
    nextHeaders.Authorization = `Bearer ${token}`;
  }
  config.headers = nextHeaders;
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const payload = response.data;
    if (payload && typeof payload.code === "number") {
      if (payload.code === 0) {
        return payload.data;
      }
      const error = new Error(payload.message || "Request failed");
      error.bizCode = payload.code;
      error.httpStatus = response.status;
      error.requestId = response.headers["x-request-id"] || null;
      throw error;
    }
    return payload;
  },
  (error) => {
    const normalized = normalizeHttpError(error);
    throw normalized;
  }
);

function normalizeHttpError(error) {
  if (error?.bizCode) {
    return error;
  }
  const normalized = new Error(error?.response?.data?.message || error?.message || "Network request failed");
  normalized.bizCode = error?.response?.data?.code || null;
  normalized.httpStatus = error?.response?.status || null;
  normalized.requestId = error?.response?.headers?.["x-request-id"] || null;
  return normalized;
}
