<script setup>
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import UiButton from "../components/ui/UiButton.vue";
import UiCard from "../components/ui/UiCard.vue";
import UiStatus from "../components/ui/UiStatus.vue";
import { useAiStore } from "../stores/ai";

const aiStore = useAiStore();
const { latestSession, history, loading, loadingMore, hasMore, running, error } = storeToRefs(aiStore);

const latestTone = computed(() => {
  if (!latestSession.value) {
    return "muted";
  }
  if (latestSession.value.flags?.riskSelfHarm || latestSession.value.flags?.needsHumanHelp) {
    return "error";
  }
  return "success";
});

function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

onMounted(async () => {
  await aiStore.loadHistory({ reset: true });
});
</script>

<template>
  <UiCard variant="hero" compact class="mirror-hero">
    <p class="eyebrow">M6 AI Mirror</p>
    <h1>静一下</h1>
    <p class="subtitle">基于最近 24 小时内容，输出 summary / suggestion / question，并给出安全标记。</p>
    <div class="hero-actions row-actions">
      <UiButton :disabled="running" @click="aiStore.runMirror('24h')">
        {{ running ? "生成中..." : "生成最新镜像" }}
      </UiButton>
      <UiButton variant="ghost" :disabled="loading" @click="aiStore.loadHistory({ reset: true })">
        {{ loading ? "刷新中..." : "刷新历史" }}
      </UiButton>
    </div>
  </UiCard>

  <section class="grid single">
    <UiCard as="article" variant="panel">
      <h2>最新镜像结果</h2>
      <UiStatus v-if="error" tone="error">{{ error }}</UiStatus>
      <UiStatus v-else-if="!latestSession" tone="muted">暂无镜像记录，先点击上方按钮生成。</UiStatus>
      <div v-else class="mirror-latest">
        <UiStatus :tone="latestTone">
          风险标记：
          selfHarm={{ latestSession.flags?.riskSelfHarm ? "true" : "false" }} ·
          needsHelp={{ latestSession.flags?.needsHumanHelp ? "true" : "false" }}
        </UiStatus>
        <article class="mirror-block">
          <h3>Summary</h3>
          <p>{{ latestSession.summary }}</p>
        </article>
        <article class="mirror-block">
          <h3>Suggestion</h3>
          <p>{{ latestSession.suggestion }}</p>
        </article>
        <article class="mirror-block">
          <h3>Question</h3>
          <p>{{ latestSession.question }}</p>
        </article>
        <small class="muted">生成时间：{{ formatDateTime(latestSession.createdAt) }}</small>
      </div>
    </UiCard>
  </section>

  <section class="grid single">
    <UiCard as="article" variant="panel">
      <h2>镜像历史</h2>
      <ul class="mirror-history">
        <li v-for="item in history" :key="item.sessionId" class="history-card">
          <header>
            <strong>#{{ item.sessionId }}</strong>
            <small>{{ formatDateTime(item.createdAt) }}</small>
          </header>
          <p><b>Summary:</b> {{ item.summary }}</p>
          <p><b>Suggestion:</b> {{ item.suggestion }}</p>
          <p><b>Question:</b> {{ item.question }}</p>
          <small>
            flags: selfHarm={{ item.flags?.riskSelfHarm ? "true" : "false" }},
            needsHelp={{ item.flags?.needsHumanHelp ? "true" : "false" }}
          </small>
        </li>
      </ul>

      <div class="hero-actions" v-if="hasMore">
        <UiButton variant="ghost" :disabled="loadingMore" @click="aiStore.loadHistory({ reset: false })">
          {{ loadingMore ? "加载中..." : "加载更多历史" }}
        </UiButton>
      </div>
    </UiCard>
  </section>
</template>

<style scoped>
.mirror-hero {
  position: relative;
  overflow: hidden;
}

.mirror-hero::after {
  content: "";
  position: absolute;
  width: 320px;
  height: 320px;
  right: -130px;
  top: -180px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(230, 0, 8, 0.25), transparent 68%);
}

.mirror-latest {
  display: grid;
  gap: 11px;
}

.mirror-block {
  border: 1px solid var(--ag-border-soft);
  border-radius: 14px;
  padding: 11px;
  background: var(--ag-btn-ghost-bg);
  border-left: 2px solid rgba(230, 0, 8, 0.58);
}

.mirror-block h3 {
  margin: 0 0 6px;
  font-size: 18px;
  text-transform: uppercase;
  font-family: "Barlow Condensed", "Noto Sans SC", sans-serif;
}

.mirror-block p {
  margin: 0;
  white-space: pre-wrap;
}

.mirror-history {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 11px;
}

.history-card {
  border: 1px solid var(--ag-border-soft);
  border-radius: 14px;
  padding: 11px;
  background: var(--ag-btn-ghost-bg);
  border-left: 2px solid rgba(230, 0, 8, 0.45);
}

.history-card header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.history-card p {
  margin: 6px 0 0;
  white-space: pre-wrap;
}

.history-card small {
  color: var(--ag-text-muted);
}
</style>
