import { apiClient } from "../client";

export async function sendEmailCode(payload) {
  return apiClient.post("/auth/email/code", payload);
}

export async function loginByEmailCode(payload) {
  return apiClient.post("/auth/email/login", payload);
}

export async function fetchMe() {
  return apiClient.get("/auth/me");
}
