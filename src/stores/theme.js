import { defineStore } from "pinia";

const THEME_STORAGE_KEY = "afterglow-theme";
const VALID_THEMES = ["dark", "light"];

function normalizeTheme(value) {
  return VALID_THEMES.includes(value) ? value : "dark";
}

function detectSystemTheme() {
  if (typeof window === "undefined") {
    return "dark";
  }
  return window.matchMedia?.("(prefers-color-scheme: light)")?.matches ? "light" : "dark";
}

function applyTheme(theme) {
  if (typeof document === "undefined") {
    return;
  }
  document.documentElement.setAttribute("data-theme", theme);
}

export function resolveInitialTheme() {
  if (typeof window === "undefined") {
    return "dark";
  }
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (stored) {
    return normalizeTheme(stored);
  }
  return detectSystemTheme();
}

export const useThemeStore = defineStore("theme", {
  state: () => ({
    theme: "dark",
    initialized: false
  }),
  getters: {
    isDark: (state) => state.theme === "dark"
  },
  actions: {
    initializeTheme() {
      const initialTheme = resolveInitialTheme();
      this.theme = initialTheme;
      this.initialized = true;
      applyTheme(initialTheme);
    },

    setTheme(nextTheme) {
      const normalized = normalizeTheme(nextTheme);
      this.theme = normalized;
      applyTheme(normalized);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(THEME_STORAGE_KEY, normalized);
      }
    },

    toggleTheme() {
      this.setTheme(this.theme === "dark" ? "light" : "dark");
    }
  }
});
