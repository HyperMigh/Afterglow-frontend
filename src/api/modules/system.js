import { apiClient } from "../client";

export async function fetchBackendHealth() {
  return apiClient.get("/health");
}

export async function fetchHomeGreeting() {
  return apiClient.get("/home");
}
