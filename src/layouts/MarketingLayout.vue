<script setup>
import { RouterLink } from "vue-router";
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useThemeStore } from "@/stores/theme";
import { useI18n } from "@/composables/useI18n";
import { useMobanAssets, mobanAsset } from "@/composables/useMobanAssets";

useMobanAssets();

const authStore = useAuthStore();
const themeStore = useThemeStore();
const { isAuthenticated } = storeToRefs(authStore);
const { t, isEnglish, toggleLocale } = useI18n();

const logoMain = mobanAsset("static/picture/logo.webp");
const logoScroll = mobanAsset("static/picture/logo-black.webp");
const logoFooter = mobanAsset("static/picture/logo-black.webp");
const flowersFooter = mobanAsset("static/picture/flowers-crop-3.webp");

const navLinks = computed(() => [
  { label: t("app.links.product"), to: { path: "/", hash: "#product" } },
  { label: t("app.links.solutions"), to: { path: "/", hash: "#solutions" } },
  { label: t("app.links.pricing"), to: { path: "/", hash: "#pricing" } },
  { label: t("app.links.docs"), to: { path: "/", hash: "#docs" } },
  { label: t("app.links.roadmap"), to: { name: "roadmap" } }
]);

const localeToggleLabel = computed(() => (isEnglish.value ? "中" : "EN"));
const localeToggleAriaLabel = computed(() =>
  isEnglish.value ? t("app.localeSwitchToChinese") : t("app.localeSwitchToEnglish")
);

const workspaceCta = computed(() => (isAuthenticated.value ? "/feed" : "/register"));
const workspaceCtaLabel = computed(() =>
  isAuthenticated.value ? t("app.auth.workspace") : t("app.auth.getStarted")
);
</script>

<template>
  <div id="wrapper" class="moban-shell">
    <header class="transparent scroll-light has-topbar">
      <div id="topbar" class="xs-hide">
        <div class="container">
          <div class="row">
            <div class="col-lg-12">
              <div class="d-flex justify-content-between">
                <div class="header-widget d-flex">
                  <div class="topbar-widget">
                    <a href="#"><i class="icofont-location-pin" />{{ t("home.marketing.topbarLocation") }}</a>
                  </div>
                  <div class="topbar-widget">
                    <a href="#"><i class="icofont-clock-time" /><span>{{ t("home.marketing.topbarHours") }}</span></a>
                  </div>
                  <div class="topbar-widget">
                    <a href="#"><i class="icofont-envelope" />{{ t("home.marketing.topbarEmail") }}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="row">
          <div class="col-md-12">
            <div class="de-flex sm-pt10">
              <div class="de-flex-col">
                <div id="logo">
                  <RouterLink to="/">
                    <img class="logo-main" :src="logoMain" alt="Afterglow" />
                    <img class="logo-scroll" :src="logoScroll" alt="Afterglow" />
                    <img class="logo-mobile" :src="logoMain" alt="Afterglow" />
                  </RouterLink>
                </div>
              </div>
              <div class="de-flex-col header-col-mid">
                <ul id="mainmenu">
                  <li v-for="link in navLinks" :key="link.label">
                    <RouterLink class="menu-item" :to="link.to">{{ link.label }}</RouterLink>
                  </li>
                </ul>
              </div>
              <div class="de-flex-col">
                <div class="menu_side_area">
                  <button
                    type="button"
                    class="btn-line me-2 locale-moban-btn"
                    :aria-label="t('app.themeToggleAria')"
                    :title="t('app.themeToggle')"
                    @click="themeStore.toggleTheme()"
                  >
                    {{ themeStore.isDark ? "☀" : "☾" }}
                  </button>
                  <button
                    type="button"
                    class="btn-line me-2 locale-moban-btn"
                    :aria-label="localeToggleAriaLabel"
                    @click="toggleLocale"
                  >
                    {{ localeToggleLabel }}
                  </button>
                  <RouterLink v-if="!isAuthenticated" to="/login" class="btn-line me-2">{{ t("app.auth.login") }}</RouterLink>
                  <RouterLink :to="workspaceCta" class="btn-main d-xl-block d-md-none">{{ workspaceCtaLabel }}</RouterLink>
                  <span id="menu-btn" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div id="content" class="no-bottom no-top">
      <slot />
    </div>

    <footer class="footer-light">
      <div class="container relative z-1000">
        <div class="row gx-5">
          <div class="col-lg-4 col-sm-6">
            <img :src="logoFooter" alt="Afterglow" />
            <div class="spacer-20" />
            <p>{{ t("home.marketing.footerAbout") }}</p>
          </div>
          <div class="col-lg-4 col-sm-12 order-lg-1 order-sm-2">
            <div class="row">
              <div class="col-lg-6 col-sm-6">
                <div class="widget">
                  <h5>{{ t("home.marketing.footerProductTitle") }}</h5>
                  <ul>
                    <li><RouterLink to="/feed">{{ t("app.auth.workspace") }}</RouterLink></li>
                    <li><RouterLink :to="{ path: '/', hash: '#product' }">{{ t("app.links.product") }}</RouterLink></li>
                    <li><RouterLink :to="{ path: '/', hash: '#pricing' }">{{ t("app.links.pricing") }}</RouterLink></li>
                  </ul>
                </div>
              </div>
              <div class="col-lg-6 col-sm-6">
                <div class="widget">
                  <h5>{{ t("home.marketing.footerLinksTitle") }}</h5>
                  <ul>
                    <li><RouterLink to="/login">{{ t("app.auth.login") }}</RouterLink></li>
                    <li><RouterLink to="/register">{{ t("app.auth.getStarted") }}</RouterLink></li>
                    <li><RouterLink to="/roadmap">{{ t("home.marketing.roadmap") }}</RouterLink></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-sm-6 order-lg-2 order-sm-1">
            <div class="widget">
              <div class="fw-bold text-dark">
                <i class="icofont-location-pin me-2 id-color" />{{ t("home.marketing.footerOffice") }}
              </div>
              {{ t("home.marketing.topbarLocation") }}
              <div class="spacer-20" />
              <div class="fw-bold text-dark">
                <i class="icofont-envelope me-2 id-color" />{{ t("home.marketing.footerContact") }}
              </div>
              {{ t("home.marketing.topbarEmail") }}
            </div>
          </div>
        </div>
      </div>
      <div class="subfooter relative z-1000">
        <div class="container">
          <div class="row">
            <div class="col-md-12">
              <div class="de-flex">
                <div class="de-flex-col">© {{ new Date().getFullYear() }} Afterglow · {{ t("home.footerTagline") }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <img :src="flowersFooter" class="w-20 absolute top-0 end-0 sw-anim" alt="" />
    </footer>
  </div>
</template>

<style scoped>
.moban-shell :deep(#logo a) {
  display: inline-block;
}

.locale-moban-btn {
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: transparent;
  border-radius: 999px;
  padding: 8px 14px;
  cursor: pointer;
  font-weight: 600;
}
</style>