import { computed } from "vue";
import { useLocaleStore } from "../stores/locale";
import { messages } from "../i18n/messages";

const FALLBACK_LOCALE = "zh";

function getByPath(source, path) {
  return path.split(".").reduce((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return current[key];
    }
    return undefined;
  }, source);
}

function interpolate(template, params = {}) {
  if (!params || typeof params !== "object") {
    return template;
  }
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (key in params) {
      return String(params[key]);
    }
    return "";
  });
}

export function useI18n() {
  const localeStore = useLocaleStore();

  const locale = computed(() => {
    const current = localeStore.locale;
    return messages[current] ? current : FALLBACK_LOCALE;
  });

  const currentMessages = computed(() => messages[locale.value] || messages[FALLBACK_LOCALE]);

  function t(path, params) {
    let value = getByPath(currentMessages.value, path);
    if (value === undefined) {
      value = getByPath(messages[FALLBACK_LOCALE], path);
    }

    if (typeof value === "string") {
      return interpolate(value, params);
    }
    return value;
  }

  return {
    t,
    locale,
    isEnglish: computed(() => locale.value === "en"),
    toggleLocale: () => localeStore.toggleLocale()
  };
}
