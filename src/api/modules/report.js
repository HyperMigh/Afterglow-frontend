import { apiClient } from "../client";

export async function createReport(payload) {
  return apiClient.post("/reports", payload);
}
