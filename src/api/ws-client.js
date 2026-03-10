import { getStoredAccessToken } from "./client";

function createRequestId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function resolveApiBase() {
  const configuredBase = import.meta.env.VITE_API_BASE_URL;
  if (typeof configuredBase === "string" && configuredBase.trim()) {
    return configuredBase.trim();
  }
  return "/api";
}

function buildWsUrl(token) {
  const apiBase = resolveApiBase();
  const absoluteApiBase = /^https?:\/\//i.test(apiBase) ? apiBase : new URL(apiBase, window.location.origin).toString();
  const base = absoluteApiBase.replace(/\/api\/?$/, "");
  const wsBase = base.startsWith("https://") ? base.replace("https://", "wss://") : base.replace("http://", "ws://");
  const normalizedWsBase = wsBase.endsWith("/") ? wsBase.slice(0, -1) : wsBase;
  const url = new URL(`${normalizedWsBase}/ws`);
  if (token) {
    url.searchParams.set("token", token);
  }
  return url.toString();
}

class WsClient {
  constructor() {
    this.socket = null;
    this.token = null;
    this.shouldReconnect = false;
    this.reconnectAttempt = 0;
    this.reconnectTimer = null;
    this.handlers = new Map();
  }

  connect(token = getStoredAccessToken()) {
    this.token = token;
    if (!this.token) {
      return;
    }
    this.shouldReconnect = true;
    this.openSocket();
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  send(event, data = {}, requestId = createRequestId()) {
    if (!this.isConnected()) {
      return false;
    }
    this.socket.send(
      JSON.stringify({
        event,
        requestId,
        timestamp: Date.now(),
        data
      })
    );
    return requestId;
  }

  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event).add(handler);
  }

  off(event, handler) {
    const set = this.handlers.get(event);
    if (!set) {
      return;
    }
    set.delete(handler);
    if (!set.size) {
      this.handlers.delete(event);
    }
  }

  emit(event, payload) {
    const set = this.handlers.get(event);
    if (set) {
      set.forEach((handler) => handler(payload));
    }
    const all = this.handlers.get("*");
    if (all) {
      all.forEach((handler) => handler({ event, payload }));
    }
  }

  openSocket() {
    if (!this.token) {
      return;
    }
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.socket = new WebSocket(buildWsUrl(this.token));

    this.socket.onopen = () => {
      this.reconnectAttempt = 0;
      this.emit("__status__", { type: "open" });
    };

    this.socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const name = payload?.event || "unknown";
        this.emit(name, payload);
      } catch (error) {
        this.emit("__status__", { type: "parse_error", error });
      }
    };

    this.socket.onerror = () => {
      this.emit("__status__", { type: "error" });
    };

    this.socket.onclose = () => {
      this.emit("__status__", { type: "close" });
      this.socket = null;
      if (!this.shouldReconnect) {
        return;
      }
      const delay = Math.min(30000, 1000 * 2 ** this.reconnectAttempt);
      this.reconnectAttempt += 1;
      this.reconnectTimer = window.setTimeout(() => {
        this.openSocket();
      }, delay);
    };
  }
}

export const wsClient = new WsClient();
