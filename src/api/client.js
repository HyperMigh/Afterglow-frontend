import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";
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
  const httpStatus = error?.response?.status || null;
  const backendMessage = error?.response?.data?.message;
  const fallbackMessage = error?.message || "Network request failed";
  const requestTarget = resolveRequestTarget(error);
  let message = backendMessage || fallbackMessage;

  if (!backendMessage && httpStatus === 503) {
    message = "Service unavailable (503). Check api-gateway and target backend service.";
  } else if (!backendMessage && httpStatus === 502) {
    message = "Bad gateway (502). Check backend service ports and gateway routes.";
  } else if (!backendMessage && httpStatus === 504) {
    message = "Gateway timeout (504). Please retry later.";
  } else if (!backendMessage && error?.code === "ERR_NETWORK") {
    message = requestTarget
      ? `Cannot reach backend (${requestTarget}). Check api-gateway and Vite proxy target.`
      : "Cannot reach backend. Check whether api-gateway is running.";
  }

  const normalized = new Error(message);
  normalized.bizCode = error?.response?.data?.code || null;
  normalized.httpStatus = httpStatus;
  normalized.requestId = error?.response?.headers?.["x-request-id"] || null;
  return normalized;
}

function resolveRequestTarget(error) {
  const requestUrl = error?.config?.url;
  if (typeof requestUrl !== "string" || !requestUrl) {
    return null;
  }

  const requestBase = error?.config?.baseURL;
  const fallbackOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost";
  try {
    return new URL(requestUrl, requestBase || fallbackOrigin).toString();
  } catch {
    return requestBase ? `${requestBase}${requestUrl}` : requestUrl;
  }
}
