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
  border: 1px solid var(--ag-border);
  border-radius: 14px;
  position: relative;
  overflow: clip;
  background: #ffffff;
  box-shadow: var(--ag-shadow-card);
}

.ui-card--hero {
  border-radius: 16px;
  padding: 30px 28px;
  background: #ffffff;
}

.ui-card--hero.ui-card--compact {
  padding: 23px 24px;
}

.ui-card--panel {
  padding: 18px;
  background: #ffffff;
}
</style>
