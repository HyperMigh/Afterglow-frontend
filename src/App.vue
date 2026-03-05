<script setup>
import { RouterLink, RouterView } from "vue-router";
import { onMounted } from "vue";
import { useAuthStore } from "./stores/auth";

const authStore = useAuthStore();

onMounted(async () => {
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
      <div class="brand">Afterglow 余温</div>
      <nav class="links">
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/roadmap">开发路线</RouterLink>
        <RouterLink to="/login">登录</RouterLink>
        <button v-if="authStore.isAuthenticated" class="link-btn" @click="authStore.logout">退出</button>
      </nav>
    </header>

    <main class="page">
      <RouterView />
    </main>
  </div>
</template>
