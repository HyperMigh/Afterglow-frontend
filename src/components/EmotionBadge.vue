<script setup>
import { computed, onMounted, watch } from "vue";
import { useEmotionStore } from "@/stores/emotion";

const props = defineProps({
  targetType: {
    type: String,
    required: true
  },
  targetId: {
    type: [String, Number],
    required: true
  }
});

const emotionStore = useEmotionStore();

const targetKey = computed(() => `${props.targetType}-${props.targetId}`);
const palette = computed(() => emotionStore.paletteByTargetKey[targetKey.value] || null);
const loading = computed(() => Boolean(emotionStore.loadingByTargetKey[targetKey.value]));

const accentColor = computed(() => palette.value?.accentColor || palette.value?.color || null);
const label = computed(() => palette.value?.label || palette.value?.emotionLabel || "");

async function load() {
  if (!props.targetId) {
    return;
  }
  try {
    await emotionStore.loadPalette(props.targetType, props.targetId);
  } catch {
    /* optional feature — silent fail */
  }
}

onMounted(() => {
  load();
});

watch(
  () => [props.targetType, props.targetId],
  () => {
    load();
  }
);
</script>

<template>
  <span
    v-if="accentColor || label"
    class="emotion-badge"
    :style="accentColor ? { '--emotion-accent': accentColor } : undefined"
    :title="label"
  >
    <span v-if="accentColor" class="emotion-dot" aria-hidden="true" />
    <span v-if="label" class="emotion-label">{{ label }}</span>
  </span>
  <span v-else-if="loading" class="emotion-badge emotion-badge--loading" aria-hidden="true" />
</template>

<style scoped>
.emotion-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-left: 6px;
  vertical-align: middle;
}

.emotion-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--emotion-accent, var(--ag-text-muted));
  box-shadow: 0 0 0 1px var(--ag-border-soft);
}

.emotion-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--ag-text-muted);
  max-width: 5em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.emotion-badge--loading {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--ag-border);
  animation: emotion-pulse 1s ease-in-out infinite;
}

@keyframes emotion-pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}
</style>