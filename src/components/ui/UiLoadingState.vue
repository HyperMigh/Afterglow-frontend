<script setup>
import UiHypotrochoidLoader from "@/components/ui/UiHypotrochoidLoader.vue";

defineProps({
  label: {
    type: String,
    default: ""
  },
  size: {
    type: [Number, String],
    default: 120
  },
  /** compact: inline row; panel: padded block for list areas */
  variant: {
    type: String,
    default: "panel"
  }
});
</script>

<template>
  <div class="ui-loading-state" :class="`ui-loading-state--${variant}`" role="status" aria-live="polite">
    <UiHypotrochoidLoader :size="size">
      {{ label }}
    </UiHypotrochoidLoader>
    <p v-if="label" class="ui-loading-state__label">{{ label }}</p>
  </div>
</template>

<style scoped>
.ui-loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--ag-text-muted);
}

.ui-loading-state--panel {
  padding: 28px 16px;
  border-radius: 12px;
  border: 1px dashed var(--ag-border-soft);
  background: var(--ag-bg-soft);
}

.ui-loading-state--inline {
  flex-direction: row;
  padding: 8px 0;
  gap: 14px;
}

.ui-loading-state--inline .ui-loading-state__label {
  margin: 0;
  font-size: 13px;
}

.ui-loading-state__label {
  margin: 0;
  font-size: 14px;
  text-align: center;
  color: var(--ag-text-soft);
}
</style>