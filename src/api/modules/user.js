import { apiClient } from "../client";

export async function updateProfile(payload) {
  return apiClient.put("/users/me", payload);
}

export async function blockUser(userId) {
  return apiClient.post("/users/block", { userId });
}

export async function unblockUser(userId) {
  return apiClient.delete(`/users/block/${userId}`);
}

export async function fetchBlockList({ cursor = null, limit = 20 } = {}) {
  const params = {};
  if (cursor) {
    params.cursor = cursor;
  }
  params.limit = limit;
  return apiClient.get("/users/block/list", { params });
}

export async function fetchDiscoverUsers({ limit = 20 } = {}) {
  return apiClient.get("/users/discover", {
    params: { limit }
  });
}
