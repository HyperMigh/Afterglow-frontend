import { apiClient } from "../client";

export async function createOrGetDm(payload) {
  return apiClient.post("/chat/conversations/dm", payload);
}

export async function fetchConversations({ cursor = null, limit = 20 } = {}) {
  const params = { limit };
  if (cursor) {
    params.cursor = cursor;
  }
  return apiClient.get("/chat/conversations", { params });
}

export async function fetchMessages(conversationId, { beforeId = null, limit = 30 } = {}) {
  const params = { limit };
  if (beforeId) {
    params.beforeId = beforeId;
  }
  return apiClient.get(`/chat/conversations/${conversationId}/messages`, { params });
}

export async function markConversationRead(conversationId, payload) {
  return apiClient.post(`/chat/conversations/${conversationId}/read`, payload);
}

export async function sendMessageByHttp(payload) {
  return apiClient.post("/chat/messages", payload);
}
