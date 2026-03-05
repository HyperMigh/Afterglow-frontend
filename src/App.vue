<script setup>
import { RouterLink, RouterView } from "vue-router";
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "./stores/auth";
import { useThemeStore } from "./stores/theme";

const authStore = useAuthStore();
const themeStore = useThemeStore();
const { theme } = storeToRefs(themeStore);

const themeButtonText = computed(() => (theme.value === "dark" ? "切换浅色" : "切换深色"));

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
  <div class="app-shell">
    <header class="top-nav">
      <RouterLink to="/" class="brand">
        <span class="brand-mark">AG</span>
        <span class="brand-copy">
          <strong>Afterglow</strong>
          <small>余温 · Community MVP</small>
        </span>
      </RouterLink>

      <nav class="links" aria-label="主导航">
        <RouterLink to="/" class="nav-link">首页</RouterLink>
        <RouterLink to="/feed" class="nav-link">社区</RouterLink>
        <RouterLink to="/roadmap" class="nav-link">开发路线</RouterLink>
        <RouterLink to="/login" class="nav-link">登录</RouterLink>
      </nav>

      <nav class="nav-right" aria-label="账号操作">
        <button class="link-btn" @click="themeStore.toggleTheme">{{ themeButtonText }}</button>
        <span v-if="authStore.isAuthenticated && authStore.me?.nickname" class="user-pill">
          {{ authStore.me.nickname }}
        </span>
        <span v-else class="user-pill muted-pill">访客模式</span>

        <button v-if="authStore.isAuthenticated" class="link-btn" @click="authStore.logout">退出</button>
        <RouterLink v-else to="/login" class="link-btn cta-btn">立即登录</RouterLink>
      </nav>
    </header>

    <main class="page">
      <RouterView />
    </main>
  </div>
</template>
