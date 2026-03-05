import { apiClient } from "../client";

export async function createMirrorSession(payload = { range: "24h" }) {
  return apiClient.post("/ai/mirror/session", payload);
}

export async function fetchMirrorHistory({ cursor = null, limit = 20 } = {}) {
  const params = { limit };
  if (cursor) {
    params.cursor = cursor;
  }
  return apiClient.get("/ai/mirror/sessions", { params });
}
