<script setup>
import { onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useSystemStore } from "../stores/system";
import { useAuthStore } from "../stores/auth";

const systemStore = useSystemStore();
const authStore = useAuthStore();
const { health, greeting, loading, error } = storeToRefs(systemStore);
const { me, isAuthenticated: authed } = storeToRefs(authStore);

onMounted(async () => {
  systemStore.loadSystemStatus();
  if (authStore.isAuthenticated && !authStore.me) {
    try {
      await authStore.loadMe();
    } catch (e) {
      // no-op: auth store already handled invalid token
    }
  }
});
</script>

<template>
  <section class="hero-card">
    <p class="eyebrow">MVP Starter</p>
    <h1>余温 Afterglow</h1>
    <p class="subtitle">
      Vue 前端已启动，可与 Spring Boot 后端联调。当前页面用于验证工程、主题和接口连通性。
    </p>
    <div class="hero-actions">
      <button class="btn-primary" :disabled="loading" @click="systemStore.loadSystemStatus">
        {{ loading ? "检测中..." : "检测后端状态" }}
      </button>
    </div>
  </section>

  <section class="grid">
    <article class="panel">
      <h2>登录状态</h2>
      <p class="muted" v-if="!authed">当前未登录。可前往登录页完成邮箱验证码登录。</p>
      <pre v-else class="json">{{ me ? JSON.stringify(me, null, 2) : "已登录，正在拉取用户信息..." }}</pre>
    </article>

    <article class="panel">
      <h2>后端健康状态</h2>
      <p v-if="loading" class="muted">正在请求 /api/health ...</p>
      <p v-else-if="error" class="error">{{ error }}</p>
      <pre v-else class="json">{{ health ? JSON.stringify(health, null, 2) : "尚未请求" }}</pre>
    </article>

    <article class="panel">
      <h2>欢迎信息</h2>
      <pre class="json">{{ greeting ? JSON.stringify(greeting, null, 2) : "尚未请求 /api/home" }}</pre>
    </article>

    <article class="panel">
      <h2>下一步建议</h2>
      <ul class="todo-list">
        <li>接入登录页（邮箱验证码）</li>
        <li>完成帖子时间线页面和发帖弹层</li>
        <li>接入 WebSocket 单聊基础能力</li>
      </ul>
    </article>
  </section>
</template>
