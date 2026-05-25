import { computed } from "vue";
import { useI18n as useVueI18n } from "vue-i18n";
import { useLocaleStore } from "@/stores/locale";

/**
 * Project-wide translation helper.
 *
 * Wraps vue-i18n's composition API so callers can keep using the existing API:
 *   const { t, locale, isEnglish, toggleLocale } = useI18n();
 *   t("home.heroTitle")
 *   t("authPortal.codeSentWithRemaining", { seconds: 30 })
 *   t("home.productFeatures")  // returns an array of objects (uses tm())
 */
export function useI18n() {
  const { t: vueT, tm, locale, rt } = useVueI18n();
  const localeStore = useLocaleStore();

  function t(path, params) {
    // tm returns the raw message (string, array, object). When it's a primitive
    // string we still want vue-i18n's interpolation, so fall back to vueT.
    const raw = tm(path);
    if (raw === undefined || raw === null) {
      return vueT(path, params || {});
    }
    if (typeof raw === "string") {
      return vueT(path, params || {});
    }
    if (Array.isArray(raw)) {
      // Resolve each entry. Strings can use rt() for interpolation; objects pass through.
      return raw.map((item) => (typeof item === "string" ? rt(item, params || {}) : item));
    }
    return raw;
  }

  return {
    t,
    locale: computed(() => locale.value),
    isEnglish: computed(() => locale.value === "en"),
    toggleLocale: () => localeStore.toggleLocale()
  };
}
