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
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}

.ui-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 16px;
  right: 16px;
  height: 1px;
  background: var(--ag-nav-highlight);
  opacity: 0.7;
}

.ui-card--hero {
  border-radius: 28px;
  padding: 30px 28px;
  background: var(--ag-surface-hero);
  box-shadow: var(--ag-shadow-panel);
}

.ui-card--hero.ui-card--compact {
  padding: 23px 24px;
}

.ui-card--panel {
  padding: 18px;
  background: var(--ag-surface-panel);
  box-shadow: var(--ag-shadow-panel);
  backdrop-filter: blur(8px);
}
</style>
