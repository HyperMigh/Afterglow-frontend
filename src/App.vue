<script setup>
import { RouterLink, RouterView, useRoute } from "vue-router";
import { computed, onMounted } from "vue";
import { useAuthStore } from "./stores/auth";
import { useThemeStore } from "./stores/theme";

const authStore = useAuthStore();
const themeStore = useThemeStore();
const route = useRoute();

const isAuthLayout = computed(() => route.meta.layout === "auth");

const marketingLinks = [
  { label: "Product", to: { path: "/", hash: "#product" } },
  { label: "Solutions", to: { path: "/", hash: "#solutions" } },
  { label: "Pricing", to: { path: "/", hash: "#pricing" } },
  { label: "Docs", to: { path: "/", hash: "#docs" } }
];

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
          <small>Product Platform</small>
        </span>
      </RouterLink>

      <nav class="links" aria-label="Main">
        <RouterLink v-for="link in marketingLinks" :key="link.label" :to="link.to" class="nav-link">{{ link.label }}</RouterLink>
      </nav>

      <nav class="nav-right" aria-label="Auth actions">
        <RouterLink v-if="!authStore.isAuthenticated" to="/login" class="link-btn">Login</RouterLink>
        <RouterLink v-if="!authStore.isAuthenticated" to="/register" class="link-btn cta-btn">Get Started</RouterLink>

        <RouterLink v-if="authStore.isAuthenticated" to="/feed" class="link-btn">Workspace</RouterLink>
        <button v-if="authStore.isAuthenticated" class="link-btn" @click="authStore.logout">Logout</button>
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
