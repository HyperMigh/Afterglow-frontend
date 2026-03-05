<script setup>
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useSystemStore } from "../stores/system";
import { useAuthStore } from "../stores/auth";
import UiButton from "../components/ui/UiButton.vue";
import UiCard from "../components/ui/UiCard.vue";
import UiStatus from "../components/ui/UiStatus.vue";

const systemStore = useSystemStore();
const authStore = useAuthStore();
const router = useRouter();
const { health, greeting, loading, error } = storeToRefs(systemStore);
const { me, isAuthenticated: authed } = storeToRefs(authStore);

const authLabel = computed(() => (authed.value ? "已登录" : "访客模式"));
const backendLabel = computed(() => {
  if (loading.value) {
    return "检测中";
  }
  if (error.value) {
    return "异常";
  }
  return health.value ? "在线" : "未检测";
});
const helloLabel = computed(() => (greeting.value ? "已返回" : "等待请求"));

const healthPreview = computed(() => {
  if (loading.value) {
    return "正在请求 /api/health ...";
  }
  if (error.value) {
    return error.value;
  }
  return health.value ? JSON.stringify(health.value, null, 2) : "尚未请求";
});

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
  <UiCard variant="hero" class="home-hero">
    <p class="eyebrow">Afterglow Console</p>
    <h1>把社区体验做成一个稳定、清晰、可持续迭代的产品。</h1>
    <p class="subtitle">
      当前首页用于整合系统连通性、账号状态和开发进度。你可以从这里快速进入社区模块，或继续验证后端状态。
    </p>

    <div class="hero-actions row-actions">
      <UiButton :disabled="loading" @click="systemStore.loadSystemStatus">
        {{ loading ? "检测中..." : "刷新后端状态" }}
      </UiButton>
      <UiButton v-if="authed" variant="ghost" @click="router.push('/feed')">进入社区</UiButton>
      <UiButton v-else variant="ghost" @click="router.push('/login')">去登录</UiButton>
      <UiButton variant="ghost" @click="router.push('/roadmap')">查看路线图</UiButton>
    </div>

    <div class="status-strip">
      <span class="status-pill">{{ authLabel }}</span>
      <span class="status-pill">后端 {{ backendLabel }}</span>
      <span class="status-pill">欢迎接口 {{ helloLabel }}</span>
    </div>
  </UiCard>

  <section class="grid home-grid">
    <UiCard as="article" variant="panel" class="feature-card">
      <h2>账号状态</h2>
      <UiStatus v-if="!authed" tone="muted">当前未登录。登录后可发帖、评论、点赞和举报。</UiStatus>
      <pre v-else class="json">{{ me ? JSON.stringify(me, null, 2) : "已登录，正在拉取用户信息..." }}</pre>
    </UiCard>

    <UiCard as="article" variant="panel" class="feature-card">
      <h2>后端健康状态</h2>
      <UiStatus v-if="loading" tone="info">{{ healthPreview }}</UiStatus>
      <UiStatus v-else-if="error" tone="error">{{ healthPreview }}</UiStatus>
      <pre v-else class="json">{{ healthPreview }}</pre>
    </UiCard>

    <UiCard as="article" variant="panel" class="feature-card">
      <h2>欢迎信息</h2>
      <pre class="json">{{ greeting ? JSON.stringify(greeting, null, 2) : "尚未请求 /api/home" }}</pre>
    </UiCard>

    <UiCard as="article" variant="panel" class="feature-card">
      <h2>近期执行重点</h2>
      <ul class="todo-list">
        <li>完成社区时间线体验和交互打磨</li>
        <li>接入私聊通道与会话基础能力</li>
        <li>补齐情绪分析与 AI 安全边界能力</li>
      </ul>
    </UiCard>
  </section>
</template>

<style scoped>
.home-hero h1 {
  max-width: 15em;
}

.status-strip {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-pill {
  border: 1px solid var(--ag-border-soft);
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 12px;
  color: var(--ag-text-soft);
  background: var(--ag-btn-ghost-bg);
}

.home-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.feature-card {
  min-height: 178px;
}

@media (max-width: 960px) {
  .home-grid {
    grid-template-columns: 1fr;
  }
}
</style>
