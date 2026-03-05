<script setup>
import { computed } from "vue";

const emit = defineEmits(["click"]);

const props = defineProps({
  type: {
    type: String,
    default: "button"
  },
  variant: {
    type: String,
    default: "solid"
  },
  size: {
    type: String,
    default: "md"
  },
  block: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
});

const classList = computed(() => [
  "ui-btn",
  `ui-btn--${props.variant}`,
  `ui-btn--${props.size}`,
  {
    "ui-btn--block": props.block
  }
]);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="classList"
    @click="(event) => emit('click', event)"
  >
    <slot />
  </button>
</template>

<style scoped>
.ui-btn {
  border-radius: 10px;
  border: 1px solid var(--ag-border);
  padding: 10px 16px;
  font-weight: 600;
  font-size: 14px;
  font-family: "Inter", "Segoe UI", sans-serif;
  letter-spacing: -0.01em;
  line-height: 1;
  color: var(--ag-text-soft);
  background: #ffffff;
  box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease,
    box-shadow 0.18s ease;
}

.ui-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: #d0d6dc;
  background: var(--ag-bg-soft);
}

.ui-btn:disabled {
  opacity: 0.66;
  cursor: not-allowed;
  box-shadow: none;
}

.ui-btn--solid {
  border-color: var(--ag-accent);
  color: #ffffff;
  background: var(--ag-accent);
  box-shadow: 0 2px 8px rgba(63, 75, 138, 0.18);
}

.ui-btn--solid:hover:not(:disabled) {
  border-color: var(--ag-accent-hover);
  background: var(--ag-accent-hover);
}

.ui-btn--ghost {
  color: var(--ag-text-soft);
  border-color: var(--ag-border);
  background: #ffffff;
}

.ui-btn--ghost:hover:not(:disabled) {
  border-color: #d0d6dc;
  background: var(--ag-bg-soft);
}

.ui-btn--text {
  border-radius: 8px;
  padding: 8px 12px;
  color: var(--ag-text);
  border-color: transparent;
  background: transparent;
  box-shadow: none;
}

.ui-btn--text:hover:not(:disabled) {
  border-color: var(--ag-border);
  color: var(--ag-text);
  background: var(--ag-bg-soft);
}

.ui-btn--danger {
  border-radius: 10px;
  padding: 8px 12px;
  color: var(--ag-danger);
  border-color: #fecdca;
  background: #fef3f2;
  box-shadow: none;
}

.ui-btn--danger:hover:not(:disabled) {
  border-color: #fda29b;
  background: #fee4e2;
}

.ui-btn--sm {
  padding: 8px 12px;
  font-size: 13px;
}

.ui-btn--md {
  padding: 10px 16px;
  font-size: 14px;
}

.ui-btn--block {
  width: 100%;
}
</style>
