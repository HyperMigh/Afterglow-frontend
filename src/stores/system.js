import { defineStore } from "pinia";
import { fetchBackendHealth, fetchHomeGreeting } from "../api/modules/system";

export const useSystemStore = defineStore("system", {
  state: () => ({
    health: null,
    greeting: null,
    loading: false,
    error: null
  }),
  actions: {
    async loadSystemStatus() {
      this.loading = true;
      this.error = null;
      try {
        const [health, greeting] = await Promise.all([
          fetchBackendHealth(),
          fetchHomeGreeting()
        ]);
        this.health = health;
        this.greeting = greeting;
      } catch (error) {
        this.error = error?.message || "请求失败";
      } finally {
        this.loading = false;
      }
    }
  }
});
