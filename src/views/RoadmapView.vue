<script setup>
import { computed } from "vue";
import UiCard from "../components/ui/UiCard.vue";
import { useI18n } from "../composables/useI18n";

const { t } = useI18n();
const roadmapMilestones = computed(() => t("roadmap.milestones") || []);
</script>

<template>
  <UiCard variant="hero" class="roadmap-hero">
    <p class="eyebrow">{{ t("roadmap.eyebrow") }}</p>
    <h1>{{ t("roadmap.heroTitle") }}</h1>
    <p class="subtitle">{{ t("roadmap.heroSubtitle") }}</p>
  </UiCard>

  <section class="grid single">
    <UiCard as="article" variant="panel" class="roadmap-panel">
      <h2>{{ t("roadmap.panelTitle") }}</h2>
      <div class="milestone-list">
        <article v-for="item in roadmapMilestones" :key="item.id" class="milestone-card">
          <header>
            <p class="milestone-id">{{ item.id }}</p>
            <span class="milestone-status">{{ item.status }}</span>
          </header>
          <h3>{{ item.name }}</h3>
          <ul class="todo-list">
            <li v-for="goal in item.goals" :key="goal">{{ goal }}</li>
          </ul>
        </article>
      </div>
    </UiCard>
  </section>
</template>

<style scoped>
.roadmap-hero {
  position: relative;
  overflow: hidden;
}

.roadmap-hero::after {
  content: "";
  position: absolute;
  width: 360px;
  height: 360px;
  right: -160px;
  top: -210px;
  border-radius: 50%;
  background: rgba(17, 24, 39, 0.04);
}

.roadmap-hero h1 {
  max-width: 16em;
}

.roadmap-panel h2 {
  margin-bottom: 14px;
  font-size: 24px;
}

.milestone-list {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.milestone-card {
  border: 1px solid var(--ag-border-soft);
  border-radius: 16px;
  padding: 13px;
  background: #ffffff;
  border-left: 2px solid var(--ag-border-strong);
}

.milestone-card header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.milestone-id {
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  min-width: 38px;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
  background: var(--ag-accent);
}

.milestone-status {
  font-size: 12px;
  color: var(--ag-text-soft);
  border: 1px solid var(--ag-border-soft);
  border-radius: 999px;
  padding: 3px 8px;
}

.milestone-card h3 {
  margin: 8px 0 10px;
  font-size: 20px;
  font-family: "Inter", "Segoe UI", sans-serif;
}

@media (max-width: 960px) {
  .milestone-list {
    grid-template-columns: 1fr;
  }
}
</style>
