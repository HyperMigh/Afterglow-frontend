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
  padding: 11px 13px;
  border-radius: 10px;
  border: 1px solid transparent;
  border-left-width: 2px;
  font-size: 13px;
  background: var(--ag-bg-soft);
}

.ui-status--muted {
  color: var(--ag-text-muted);
  border-color: var(--ag-border);
  border-left-color: var(--ag-border);
}

.ui-status--info {
  color: var(--ag-info);
  border-color: #bfdbfe;
  border-left-color: var(--ag-info);
  background: var(--ag-info-soft);
}

.ui-status--success {
  color: var(--ag-success);
  border-color: #abefc6;
  border-left-color: var(--ag-success);
  background: var(--ag-success-soft);
}

.ui-status--error {
  color: var(--ag-danger);
  border-color: #fecdca;
  border-left-color: var(--ag-danger);
  background: var(--ag-danger-soft);
}
</style>
