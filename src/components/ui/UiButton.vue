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
  border-radius: 12px;
  border: 1px solid transparent;
  padding: 10px 16px;
  font-weight: 700;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease, border-color 0.2s ease, background 0.2s ease;
}

.ui-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.ui-btn:disabled {
  opacity: 0.72;
  cursor: not-allowed;
}

.ui-btn--solid {
  border-color: rgba(255, 201, 143, 0.24);
  color: var(--ag-btn-solid-text);
  background: linear-gradient(130deg, var(--ag-accent-cool), var(--ag-accent-warm));
}

.ui-btn--solid:hover:not(:disabled) {
  filter: brightness(1.03);
}

.ui-btn--ghost {
  color: var(--ag-btn-ghost-text);
  border-color: var(--ag-border-soft);
  background: var(--ag-btn-ghost-bg);
}

.ui-btn--ghost:hover:not(:disabled) {
  border-color: var(--ag-border-focus);
  background: var(--ag-btn-ghost-bg-hover);
}

.ui-btn--text {
  border-radius: 999px;
  padding: 7px 12px;
  color: var(--ag-text);
  border-color: var(--ag-border-soft);
  background: transparent;
}

.ui-btn--text:hover:not(:disabled) {
  border-color: var(--ag-border-focus);
  color: var(--ag-text-strong);
  background: var(--ag-btn-ghost-bg-hover);
}

.ui-btn--danger {
  border-radius: 999px;
  padding: 7px 12px;
  color: var(--ag-danger-text);
  border-color: var(--ag-danger-border);
  background: var(--ag-danger-bg);
}

.ui-btn--danger:hover:not(:disabled) {
  border-color: var(--ag-danger-border-hover);
  background: var(--ag-danger-bg-hover);
}

.ui-btn--sm {
  padding: 7px 11px;
  font-size: 12px;
}

.ui-btn--md {
  padding: 10px 16px;
  font-size: 14px;
}

.ui-btn--block {
  width: 100%;
}
</style>
