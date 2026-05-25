import { createI18n } from "vue-i18n";
import { messages } from "@/i18n/messages";
import { useLocaleStore } from "@/stores/locale";

const FALLBACK_LOCALE = "zh";

function resolveBootLocale() {
  if (typeof window === "undefined") return FALLBACK_LOCALE;
  const saved = window.localStorage.getItem("afterglow.locale");
  if (saved && messages[saved]) return saved;
  const nav = (window.navigator?.language || "").toLowerCase();
  if (nav.startsWith("en")) return "en";
  return FALLBACK_LOCALE;
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: false,
  locale: resolveBootLocale(),
  fallbackLocale: FALLBACK_LOCALE,
  messages,
  missingWarn: false,
  fallbackWarn: false
});

/**
 * Sync vue-i18n locale with the Pinia locale store. Call once after Pinia has been installed.
 */
export function bindLocaleStore() {
  const localeStore = useLocaleStore();
  // Initial sync — Pinia may have a different value than the bootstrap locale.
  if (localeStore.locale && messages[localeStore.locale]) {
    i18n.global.locale.value = localeStore.locale;
  }
  localeStore.$subscribe((_mutation, state) => {
    if (state.locale && messages[state.locale]) {
      i18n.global.locale.value = state.locale;
    }
  });
}
