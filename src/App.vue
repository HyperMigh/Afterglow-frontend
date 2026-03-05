<script setup>
import { RouterLink, RouterView, useRoute } from "vue-router";
import { computed, onMounted, watch } from "vue";
import { useAuthStore } from "./stores/auth";
import { useThemeStore } from "./stores/theme";
import { useI18n } from "./composables/useI18n";

const authStore = useAuthStore();
const themeStore = useThemeStore();
const route = useRoute();
const { t, locale, isEnglish, toggleLocale } = useI18n();

const isAuthLayout = computed(() => route.meta.layout === "auth");

const marketingLinks = computed(() => [
  { label: t("app.links.product"), to: { path: "/", hash: "#product" } },
  { label: t("app.links.solutions"), to: { path: "/", hash: "#solutions" } },
  { label: t("app.links.pricing"), to: { path: "/", hash: "#pricing" } },
  { label: t("app.links.docs"), to: { path: "/", hash: "#docs" } }
]);
const localeToggleLabel = computed(() => (isEnglish.value ? "中" : "EN"));
const localeToggleAriaLabel = computed(() =>
  isEnglish.value ? t("app.localeSwitchToChinese") : t("app.localeSwitchToEnglish")
);

watch(
  () => locale.value,
  (value) => {
    document.documentElement.setAttribute("lang", value === "zh" ? "zh-CN" : "en-US");
  },
  { immediate: true }
);

onMounted(async () => {
  themeStore.initializeTheme();
  if (authStore.isAuthenticated && !authStore.me) {
    try {
      await authStore.loadMe();
    } catch (error) {
      // The store already handles auth reset when token is invalid.
      console.warn("Failed to load current user", error);
    }
  }
});
</script>

<template>
  <div v-if="isAuthLayout" class="auth-layout-shell">
    <RouterView />
  </div>

  <div v-else class="app-shell">
    <header class="top-nav">
      <RouterLink to="/" class="brand">
        <span class="brand-mark">AG</span>
        <span class="brand-copy">
          <strong>Afterglow</strong>
          <small>{{ t("app.brandSubtitle") }}</small>
        </span>
      </RouterLink>

      <nav class="links" aria-label="Main">
        <RouterLink v-for="link in marketingLinks" :key="link.label" :to="link.to" class="nav-link">{{ link.label }}</RouterLink>
      </nav>

      <nav class="nav-right" aria-label="Auth actions">
        <RouterLink v-if="!authStore.isAuthenticated" to="/login" class="link-btn">{{ t("app.auth.login") }}</RouterLink>
        <button
          v-if="!authStore.isAuthenticated"
          type="button"
          class="link-btn locale-toggle-btn"
          :aria-label="localeToggleAriaLabel"
          @click="toggleLocale"
        >
          {{ localeToggleLabel }}
        </button>
        <RouterLink v-if="!authStore.isAuthenticated" to="/register" class="link-btn cta-btn">
          {{ t("app.auth.getStarted") }}
        </RouterLink>

        <button
          v-if="authStore.isAuthenticated"
          type="button"
          class="link-btn locale-toggle-btn"
          :aria-label="localeToggleAriaLabel"
          @click="toggleLocale"
        >
          {{ localeToggleLabel }}
        </button>
        <RouterLink v-if="authStore.isAuthenticated" to="/feed" class="link-btn">{{ t("app.auth.workspace") }}</RouterLink>
        <button v-if="authStore.isAuthenticated" class="link-btn" @click="authStore.logout">{{ t("app.auth.logout") }}</button>
      </nav>
    </header>

    <main class="page">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.auth-layout-shell {
  min-height: 100vh;
}
</style>
