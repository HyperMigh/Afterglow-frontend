import { apiClient } from "../client";

export async function createPost(payload) {
  return apiClient.post("/posts", payload);
}

export async function fetchTimeline({ cursor = null, limit = 20 } = {}) {
  const params = { limit };
  if (cursor) {
    params.cursor = cursor;
  }
  return apiClient.get("/posts", { params });
}

export async function fetchPostDetail(postId) {
  return apiClient.get(`/posts/${postId}`);
}

export async function createComment(postId, payload) {
  return apiClient.post(`/posts/${postId}/comments`, payload);
}

export async function fetchComments(postId, { cursor = null, limit = 20 } = {}) {
  const params = { limit };
  if (cursor) {
    params.cursor = cursor;
  }
  return apiClient.get(`/posts/${postId}/comments`, { params });
}

export async function reactPost(postId, payload = { reactionType: "like" }) {
  return apiClient.post(`/posts/${postId}/reactions`, payload);
}

export async function deletePost(postId) {
  return apiClient.delete(`/posts/${postId}`);
}
