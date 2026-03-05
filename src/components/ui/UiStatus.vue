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
  padding: 10px 11px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-size: 13px;
}

.ui-status--muted {
  color: var(--ag-text-muted);
  border-color: var(--ag-border-soft);
  background: var(--ag-status-muted-bg);
}

.ui-status--info {
  color: var(--ag-text);
  border-color: var(--ag-info-border);
  background: var(--ag-info-bg);
}

.ui-status--success {
  color: var(--ag-text);
  border-color: var(--ag-success-border);
  background: var(--ag-success-bg);
}

.ui-status--error {
  color: var(--ag-danger-text);
  border-color: var(--ag-danger-border);
  background: var(--ag-danger-bg);
}
</style>
