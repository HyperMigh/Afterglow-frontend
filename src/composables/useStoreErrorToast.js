import { storeToRefs } from "pinia";
import { watch } from "vue";
import { useToastStore } from "@/stores/toast";

/**
 * Watches a Pinia store's `error` field and surfaces non-empty values via toast.
 *
 * @param {object} store the Pinia store instance
 * @param {object} [options]
 * @param {string} [options.tone="error"] toast tone
 * @param {(message: string) => boolean} [options.skip] return true to suppress the toast
 */
export function useStoreErrorToast(store, { tone = "error", skip } = {}) {
  const toast = useToastStore();
  const { error } = storeToRefs(store);
  watch(error, (value) => {
    if (!value) return;
    if (typeof skip === "function" && skip(value)) return;
    toast.push(value, { tone });
    // Reset so the same error can be shown again later.
    store.error = null;
  });
}
