<script setup>
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "../composables/useI18n";
import UiButton from "../components/ui/UiButton.vue";
import UiCard from "../components/ui/UiCard.vue";
import UiStatus from "../components/ui/UiStatus.vue";
import { useAiStore } from "../stores/ai";

const aiStore = useAiStore();
const { t } = useI18n();
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
  return new Date(value).toLocaleString(t("mirror.dateLocale"), { hour12: false });
}

onMounted(async () => {
  await aiStore.loadHistory({ reset: true });
});
</script>

<template>
  <UiCard variant="hero" compact class="mirror-hero">
    <p class="eyebrow">M6 AI Mirror</p>
    <h1>{{ t("mirror.heroTitle") }}</h1>
    <p class="subtitle">{{ t("mirror.heroSubtitle") }}</p>
    <div class="hero-actions row-actions">
      <UiButton :disabled="running" @click="aiStore.runMirror('24h')">
        {{ running ? t("mirror.running") : t("mirror.runLatest") }}
      </UiButton>
      <UiButton variant="ghost" :disabled="loading" @click="aiStore.loadHistory({ reset: true })">
        {{ loading ? t("mirror.refreshing") : t("mirror.refreshHistory") }}
      </UiButton>
    </div>
  </UiCard>

  <section class="grid single">
    <UiCard as="article" variant="panel">
      <h2>{{ t("mirror.latestTitle") }}</h2>
      <UiStatus v-if="error" tone="error">{{ error }}</UiStatus>
      <UiStatus v-else-if="!latestSession" tone="muted">{{ t("mirror.noLatest") }}</UiStatus>
      <div v-else class="mirror-latest">
        <UiStatus :tone="latestTone">
          {{ t("mirror.riskFlags") }}:
          selfHarm={{ latestSession.flags?.riskSelfHarm ? "true" : "false" }} ·
          needsHelp={{ latestSession.flags?.needsHumanHelp ? "true" : "false" }}
        </UiStatus>
        <article class="mirror-block">
          <h3>{{ t("mirror.summary") }}</h3>
          <p>{{ latestSession.summary }}</p>
        </article>
        <article class="mirror-block">
          <h3>{{ t("mirror.suggestion") }}</h3>
          <p>{{ latestSession.suggestion }}</p>
        </article>
        <article class="mirror-block">
          <h3>{{ t("mirror.question") }}</h3>
          <p>{{ latestSession.question }}</p>
        </article>
        <small class="muted">{{ t("mirror.generatedAt") }}: {{ formatDateTime(latestSession.createdAt) }}</small>
      </div>
    </UiCard>
  </section>

  <section class="grid single">
    <UiCard as="article" variant="panel">
      <h2>{{ t("mirror.historyTitle") }}</h2>
      <ul class="mirror-history">
        <li v-for="item in history" :key="item.sessionId" class="history-card">
          <header>
            <strong>#{{ item.sessionId }}</strong>
            <small>{{ formatDateTime(item.createdAt) }}</small>
          </header>
          <p><b>{{ t("mirror.summary") }}:</b> {{ item.summary }}</p>
          <p><b>{{ t("mirror.suggestion") }}:</b> {{ item.suggestion }}</p>
          <p><b>{{ t("mirror.question") }}:</b> {{ item.question }}</p>
          <small>
            {{ t("mirror.flagsPrefix") }}: selfHarm={{ item.flags?.riskSelfHarm ? "true" : "false" }},
            needsHelp={{ item.flags?.needsHumanHelp ? "true" : "false" }}
          </small>
        </li>
      </ul>

      <div class="hero-actions" v-if="hasMore">
        <UiButton variant="ghost" :disabled="loadingMore" @click="aiStore.loadHistory({ reset: false })">
          {{ loadingMore ? t("mirror.loadingMore") : t("mirror.loadMoreHistory") }}
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
  width: 220px;
  height: 220px;
  right: -90px;
  top: -120px;
  border-radius: 50%;
  background: rgba(17, 24, 39, 0.05);
}

.mirror-latest {
  display: grid;
  gap: 11px;
}

.mirror-block {
  border: 1px solid var(--ag-border);
  border-radius: 14px;
  padding: 11px;
  background: #ffffff;
  border-left: 2px solid var(--ag-border-strong);
}

.mirror-block h3 {
  margin: 0 0 6px;
  font-size: 18px;
  font-family: "Inter", "Segoe UI", sans-serif;
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
  border: 1px solid var(--ag-border);
  border-radius: 14px;
  padding: 11px;
  background: #ffffff;
  border-left: 2px solid var(--ag-border-strong);
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
