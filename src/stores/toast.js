import { defineStore } from "pinia";

let nextId = 0;

const TONE_DEFAULT_DURATION = {
  info: 4000,
  success: 3000,
  warning: 5000,
  error: 6000
};

function nextToneDuration(tone) {
  return TONE_DEFAULT_DURATION[tone] || 4000;
}

export const useToastStore = defineStore("toast", {
  state: () => ({
    items: []
  }),
  actions: {
    push(message, { tone = "info", duration } = {}) {
      if (!message) return null;
      const id = ++nextId;
      const ttl = duration ?? nextToneDuration(tone);
      this.items.push({ id, message: String(message), tone });
      if (ttl > 0) {
        window.setTimeout(() => this.dismiss(id), ttl);
      }
      return id;
    },
    info(message, options) {
      return this.push(message, { ...options, tone: "info" });
    },
    success(message, options) {
      return this.push(message, { ...options, tone: "success" });
    },
    warning(message, options) {
      return this.push(message, { ...options, tone: "warning" });
    },
    error(message, options) {
      return this.push(message, { ...options, tone: "error" });
    },
    dismiss(id) {
      this.items = this.items.filter((item) => item.id !== id);
    },
    clear() {
      this.items = [];
    }
  }
});
