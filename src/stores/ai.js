import { defineStore } from "pinia";
import { createMirrorSession, fetchMirrorHistory } from "../api/modules/ai";

function normalizeErrorMessage(error, fallbackText) {
  if (!error) {
    return fallbackText;
  }
  return error.message || fallbackText;
}

export const useAiStore = defineStore("ai", {
  state: () => ({
    latestSession: null,
    history: [],
    nextCursor: null,
    hasMore: false,
    running: false,
    loading: false,
    loadingMore: false,
    error: null
  }),
  actions: {
    async runMirror(range = "24h") {
      this.running = true;
      this.error = null;
      try {
        const session = await createMirrorSession({ range });
        this.latestSession = session;
        this.history = [session, ...this.history.filter((item) => item.sessionId !== session.sessionId)];
        return session;
      } catch (error) {
        this.error = normalizeErrorMessage(error, "生成镜像失败");
        throw error;
      } finally {
        this.running = false;
      }
    },

    async loadHistory({ reset = true, limit = 20 } = {}) {
      if (reset) {
        this.loading = true;
      } else {
        if (!this.hasMore || !this.nextCursor || this.loadingMore) {
          return;
        }
        this.loadingMore = true;
      }
      this.error = null;
      try {
        const cursor = reset ? null : this.nextCursor;
        const result = await fetchMirrorHistory({ cursor, limit });
        if (reset) {
          this.history = result.list || [];
        } else {
          this.history = this.history.concat(result.list || []);
        }
        this.nextCursor = result.nextCursor || null;
        this.hasMore = Boolean(result.hasMore);
        if (!this.latestSession && this.history.length) {
          this.latestSession = this.history[0];
        }
      } catch (error) {
        this.error = normalizeErrorMessage(error, "加载镜像历史失败");
        throw error;
      } finally {
        this.loading = false;
        this.loadingMore = false;
      }
    }
  }
});
