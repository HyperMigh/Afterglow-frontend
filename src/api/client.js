import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const apiClient = axios.create({
  baseURL,
  timeout: 8000
});

export async function fetchBackendHealth() {
  const res = await apiClient.get("/health");
  return res.data;
}

export async function fetchHomeGreeting() {
  const res = await apiClient.get("/home");
  return res.data;
}
