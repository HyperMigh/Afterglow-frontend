<script setup>
import { computed } from "vue";

const props = defineProps({
  as: {
    type: String,
    default: "section"
  },
  variant: {
    type: String,
    default: "panel"
  },
  compact: {
    type: Boolean,
    default: false
  }
});

const classList = computed(() => [
  "ui-card",
  `ui-card--${props.variant}`,
  {
    "ui-card--compact": props.compact
  }
]);
</script>

<template>
  <component :is="as" :class="classList">
    <slot />
  </component>
</template>

<style scoped>
.ui-card {
  border: 1px solid var(--ag-border-strong);
  border-radius: 18px;
}

.ui-card--hero {
  border-radius: 24px;
  padding: 28px 26px;
  background: var(--ag-surface-hero);
  box-shadow: var(--ag-shadow-panel);
}

.ui-card--hero.ui-card--compact {
  padding: 22px 24px;
}

.ui-card--panel {
  padding: 16px;
  background: var(--ag-surface-panel);
  box-shadow: var(--ag-shadow-panel);
}
</style>
