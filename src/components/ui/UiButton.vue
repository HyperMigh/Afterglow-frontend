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
  border-radius: 999px;
  border: 1px solid var(--ag-border-soft);
  padding: 10px 17px;
  font-weight: 700;
  font-size: 14px;
  font-family: "Barlow Condensed", "Noto Sans SC", sans-serif;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  line-height: 1;
  color: var(--ag-btn-ghost-text);
  background: var(--ag-btn-ghost-bg);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  transition: transform 0.24s ease, filter 0.24s ease, border-color 0.24s ease, background 0.24s ease;
}

.ui-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: var(--ag-border-focus);
}

.ui-btn:disabled {
  opacity: 0.72;
  cursor: not-allowed;
  box-shadow: none;
}

.ui-btn--solid {
  border-color: rgba(230, 0, 8, 0.75);
  color: var(--ag-btn-solid-text);
  background: linear-gradient(140deg, var(--ag-accent-cool), var(--ag-accent-warm));
  box-shadow: 0 12px 24px rgba(230, 0, 8, 0.28);
}

.ui-btn--solid:hover:not(:disabled) {
  filter: brightness(1.06);
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
  box-shadow: none;
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
  box-shadow: none;
}

.ui-btn--danger:hover:not(:disabled) {
  border-color: var(--ag-danger-border-hover);
  background: var(--ag-danger-bg-hover);
}

.ui-btn--sm {
  padding: 7px 13px;
  font-size: 13px;
}

.ui-btn--md {
  padding: 10px 17px;
  font-size: 14px;
}

.ui-btn--block {
  width: 100%;
}
</style>
