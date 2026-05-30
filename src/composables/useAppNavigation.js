import { computed } from "vue";
import { useI18n } from "@/composables/useI18n";
import { useAuthStore } from "@/stores/auth";
import { storeToRefs } from "pinia";

/** 顶栏：不含产品/方案/定价/文档/路线图等营销项 */
export function useAppNavigation() {
  const { t } = useI18n();
  const authStore = useAuthStore();
  const { isAuthenticated } = storeToRefs(authStore);

  const guestNavLinks = computed(() => [{ label: t("app.links.home"), to: { name: "home" } }]);

  const workspaceNavLinks = computed(() => [
    { label: t("app.links.home"), to: { name: "home" } },
    { label: t("app.links.feed"), to: { name: "feed" } },
    { label: t("app.links.chat"), to: { name: "chat" } },
    { label: t("app.links.mirror"), to: { name: "mirror" } }
  ]);

  const primaryNavLinks = computed(() =>
    isAuthenticated.value ? workspaceNavLinks.value : guestNavLinks.value
  );

  return {
    primaryNavLinks,
    workspaceNavLinks,
    guestNavLinks,
    isAuthenticated
  };
}
