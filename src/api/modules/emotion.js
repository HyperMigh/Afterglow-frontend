import { apiClient } from "../client";

export async function fetchPalette({ targetType, targetId }) {
  return apiClient.get("/emotion/palette", {
    params: {
      targetType,
      targetId
    }
  });
}
