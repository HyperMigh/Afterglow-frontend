import { onUnmounted } from "vue";

/**
 * Returns a fresh AbortSignal for each request, automatically cancelling all
 * in-flight requests when the component unmounts. Pass `signal` as the third
 * argument to apiClient methods (or in the `config` of axios calls).
 *
 * Example:
 *   const { signal } = useAbortController();
 *   await apiClient.get("/x", { signal: signal() });
 */
export function useAbortController() {
  const controllers = new Set();

  function signal() {
    const controller = new AbortController();
    controllers.add(controller);
    controller.signal.addEventListener("abort", () => controllers.delete(controller), { once: true });
    return controller.signal;
  }

  function abortAll(reason = "component-unmounted") {
    controllers.forEach((controller) => {
      try {
        controller.abort(reason);
      } catch {
        /* noop */
      }
    });
    controllers.clear();
  }

  onUnmounted(() => abortAll());

  return { signal, abortAll };
}
