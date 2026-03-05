import { defineStore } from "pinia";

const LOCALE_STORAGE_KEY = "afterglow.locale";
const DEFAULT_LOCALE = "zh";

function normalizeLocale(locale) {
  if (typeof locale !== "string") {
    return DEFAULT_LOCALE;
  }
  const candidate = locale.trim().toLowerCase();
  if (candidate.startsWith("en")) {
    return "en";
  }
  if (candidate.startsWith("zh")) {
    return "zh";
  }
  return DEFAULT_LOCALE;
}

function resolveInitialLocale() {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }
  const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  if (saved) {
    return normalizeLocale(saved);
  }
  return normalizeLocale(window.navigator?.language || "");
}

function persistLocale(locale) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
}

export const useLocaleStore = defineStore("locale", {
  state: () => ({
    locale: resolveInitialLocale()
  }),
  getters: {
    isEnglish: (state) => state.locale === "en"
  },
  actions: {
    setLocale(locale) {
      const normalized = normalizeLocale(locale);
      this.locale = normalized;
      persistLocale(normalized);
    },
    toggleLocale() {
      this.setLocale(this.locale === "zh" ? "en" : "zh");
    }
  }
});
