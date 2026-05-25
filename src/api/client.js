import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";
const useRefreshCookie = String(import.meta.env.VITE_USE_REFRESH_COOKIE || "false").toLowerCase() === "true";
const ACCESS_TOKEN_KEY = "afterglow_access_token";
const REFRESH_TOKEN_KEY = "afterglow_refresh_token";

export const apiClient = axios.create({
  baseURL,
  timeout: 8000,
  withCredentials: useRefreshCookie
});

function createRequestId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export function getStoredAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setStoredAccessToken(token) {
  if (token) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export function clearStoredAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getStoredRefreshToken() {
  // In cookie mode the refresh token lives in an HttpOnly cookie and is invisible to JS.
  if (useRefreshCookie) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredRefreshToken(token) {
  if (useRefreshCookie) return;
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearStoredTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function isAbortError(error) {
  return Boolean(error && (error.aborted || error.name === "CanceledError" || error.code === "ERR_CANCELED"));
}

export function isRefreshCookieMode() {
  return useRefreshCookie;
}

// --- Refresh token plumbing ---
let refreshPromise = null;
let onAuthLost = null;

export function setAuthLostHandler(handler) {
  onAuthLost = typeof handler === "function" ? handler : null;
}

async function performRefresh() {
  const refreshToken = getStoredRefreshToken();
  // In cookie mode we don't have a JS-visible refresh token; the cookie travels with the request.
  if (!useRefreshCookie && !refreshToken) {
    return null;
  }
  try {
    const response = await axios.post(
      `${baseURL.replace(/\/+$/, "")}/auth/refresh`,
      useRefreshCookie ? {} : { refreshToken },
      {
        timeout: 8000,
        withCredentials: useRefreshCookie,
        headers: { "X-Request-Id": createRequestId() }
      }
    );
    const payload = response.data;
    if (!payload || payload.code !== 0 || !payload.data?.accessToken) {
      return null;
    }
    setStoredAccessToken(payload.data.accessToken);
    if (!useRefreshCookie && payload.data.refreshToken) {
      setStoredRefreshToken(payload.data.refreshToken);
    }
    return payload.data.accessToken;
  } catch {
    return null;
  }
}

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
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
  async (error) => {
    if (axios.isCancel(error) || error?.code === "ERR_CANCELED") {
      const cancelled = new Error(error?.message || "Request cancelled");
      cancelled.aborted = true;
      throw cancelled;
    }

    const original = error?.config;
    const httpStatus = error?.response?.status;
    const isAuthEndpoint = typeof original?.url === "string" && original.url.includes("/auth/");
    const canRefresh = useRefreshCookie || !!getStoredRefreshToken();

    if (httpStatus === 401 && original && !original._retried && !isAuthEndpoint && canRefresh) {
      original._retried = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers = { ...(original.headers || {}), Authorization: `Bearer ${newToken}` };
        return apiClient.request(original);
      }
      clearStoredTokens();
      if (onAuthLost) {
        onAuthLost();
      }
    }

    throw normalizeHttpError(error);
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
  } else if (!backendMessage && httpStatus === 429) {
    message = "Too many requests. Please slow down and retry shortly.";
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
