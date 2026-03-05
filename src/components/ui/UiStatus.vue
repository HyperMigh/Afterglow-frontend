<script setup>
import { computed } from "vue";

const props = defineProps({
  as: {
    type: String,
    default: "p"
  },
  tone: {
    type: String,
    default: "info"
  }
});

const classList = computed(() => ["ui-status", `ui-status--${props.tone}`]);
</script>

<template>
  <component :is="as" :class="classList">
    <slot />
  </component>
</template>

<style scoped>
.ui-status {
  margin: 0;
  padding: 11px 12px;
  border-radius: 12px;
  border: 1px solid transparent;
  border-left-width: 3px;
  font-size: 13px;
  background: var(--ag-status-muted-bg);
}

.ui-status--muted {
  color: var(--ag-text-muted);
  border-color: var(--ag-border-soft);
  border-left-color: var(--ag-border-soft);
}

.ui-status--info {
  color: var(--ag-text);
  border-color: var(--ag-info-border);
  border-left-color: var(--ag-accent-warm);
  background: var(--ag-info-bg);
}

.ui-status--success {
  color: var(--ag-text);
  border-color: var(--ag-success-border);
  border-left-color: rgba(86, 182, 120, 0.95);
  background: var(--ag-success-bg);
}

.ui-status--error {
  color: var(--ag-danger-text);
  border-color: var(--ag-danger-border);
  border-left-color: rgba(255, 112, 112, 0.98);
  background: var(--ag-danger-bg);
}
</style>
