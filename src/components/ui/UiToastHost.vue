<script setup>
import { storeToRefs } from "pinia";
import { useToastStore } from "@/stores/toast";

const toastStore = useToastStore();
const { items } = storeToRefs(toastStore);
</script>

<template>
  <Teleport to="body">
    <div class="ui-toast-host" role="status" aria-live="polite">
      <transition-group name="toast" tag="div" class="ui-toast-stack">
        <div
          v-for="item in items"
          :key="item.id"
          :class="['ui-toast', `ui-toast--${item.tone}`]"
          @click="toastStore.dismiss(item.id)"
        >
          {{ item.message }}
        </div>
      </transition-group>
    </div>
  </Teleport>
</template>

<style scoped>
.ui-toast-host {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.ui-toast-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
}

.ui-toast {
  pointer-events: auto;
  min-width: 240px;
  max-width: 360px;
  border: 1px solid var(--ag-border);
  border-left-width: 3px;
  border-radius: 12px;
  padding: 11px 14px;
  font-size: 14px;
  background: var(--ag-surface);
  box-shadow: 0 4px 18px rgba(16, 24, 40, 0.12);
  cursor: pointer;
}

.ui-toast--info {
  border-left-color: var(--ag-info);
  color: var(--ag-info);
  background: var(--ag-info-soft);
}

.ui-toast--success {
  border-left-color: var(--ag-success);
  color: var(--ag-success);
  background: var(--ag-success-soft);
}

.ui-toast--warning {
  border-left-color: #b54708;
  color: #b54708;
  background: #fffaeb;
}

.ui-toast--error {
  border-left-color: var(--ag-danger);
  color: var(--ag-danger);
  background: var(--ag-danger-soft);
}

.toast-enter-active,
.toast-leave-active {
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}

.toast-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

@media (max-width: 640px) {
  .ui-toast-host {
    top: auto;
    bottom: 20px;
    right: 12px;
    left: 12px;
  }

  .ui-toast {
    width: 100%;
    max-width: none;
  }
}
</style>
