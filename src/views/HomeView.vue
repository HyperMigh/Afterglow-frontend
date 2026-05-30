<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "@/composables/useI18n";
import { mobanAsset } from "@/composables/useMobanAssets";

const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);
const { t } = useI18n();

const primaryCtaTo = computed(() => (isAuthenticated.value ? "/feed" : "/register"));
const primaryCtaLabel = computed(() =>
  isAuthenticated.value ? t("home.primaryCtaWorkspace") : t("home.primaryCtaGetStarted")
);

const moduleCards = computed(() => [
  {
    title: t("home.marketing.teamFeed"),
    text: t("home.marketing.teamFeedDesc"),
    to: "/feed",
    imgKey: "team12"
  },
  {
    title: t("home.marketing.teamChat"),
    text: t("home.marketing.teamChatDesc"),
    to: "/chat",
    imgKey: "avatar23"
  },
  {
    title: t("home.marketing.teamMirror"),
    text: t("home.marketing.teamMirrorDesc"),
    to: "/mirror",
    imgKey: "team31"
  }
]);

const sliderBg1 = mobanAsset("images/slider/1.webp");
const flowersCrop = mobanAsset("static/picture/flowers-crop.webp");
const flowersCrop2 = mobanAsset("static/picture/flowers-crop-2.webp");
const leaf = mobanAsset("static/picture/leaf.webp");
const img24 = mobanAsset("static/picture/24.webp");
const img33 = mobanAsset("static/picture/33.webp");
const img10 = mobanAsset("static/picture/10.webp");
const img8 = mobanAsset("static/picture/8.webp");
const jarallax34 = mobanAsset("static/picture/34.webp");
const avatar23 = mobanAsset("static/picture/23.webp");
const team12 = mobanAsset("static/picture/12.webp");
const team31 = mobanAsset("static/picture/31.webp");

const moduleImages = {
  team12,
  avatar23,
  team31
};
</script>

<template>
  <div id="top" />

  <section class="section-dark text-light no-top no-bottom position-relative overflow-hidden z-1000">
    <div class="v-center">
      <div class="swiper">
        <div class="swiper-wrapper">
          <div class="swiper-slide">
            <div class="swiper-inner" :data-bgimage="`url(${sliderBg1})`">
              <div class="sw-caption relative z-1000">
                <div class="container">
                  <div class="row gx-5 align-items-center">
                    <div class="spacer-double" />
                    <div class="col-lg-6 offset-lg-6">
                      <div class="spacer-single" />
                      <div class="sw-text-wrapper">
                        <div class="subtitle s2 mb-2">{{ t("home.heroKicker") }}</div>
                        <h1 class="slider-title mb-3">
                          {{ t("home.marketing.heroLine1") }}
                          <span class="d-block alt-font fw-500 id-color-2 fs-96 fs-xs-60">{{
                            t("home.heroTitle")
                          }}</span>
                        </h1>
                        <div class="col-lg-8">
                          <p class="slider-teaser mb-3">{{ t("home.heroSubtitle") }}</p>
                        </div>
                        <div class="spacer-10" />
                        <RouterLink class="btn-main bg-color-2 mb10 mb-3" :to="primaryCtaTo">{{
                          primaryCtaLabel
                        }}</RouterLink>
                      </div>
                    </div>
                    <div class="spacer-single" />
                  </div>
                </div>
              </div>
              <img :src="flowersCrop" class="w-30 absolute bottom-0 start-0 sw-anim" alt="" />
            </div>
          </div>
        </div>
        <div class="swiper-pagination" />
      </div>
    </div>
  </section>

  <section>
    <div class="container relative">
      <img :src="leaf" class="absolute top-0 end-0 w-10 anim-up-down sm-hide" alt="" />
      <div class="row g-4 gx-5 align-items-center">
        <div class="col-lg-6">
          <div class="relative">
            <div class="row g-4 z-1000">
              <div class="col-6">
                <div class="spacer-single sm-hide" />
                <img :src="img24" class="img-fluid rounded-10px mb-4 w-70 ms-30 wow fadeInLeft" alt="" />
                <img :src="img33" class="img-fluid rounded-10px wow fadeInUp" alt="" />
              </div>
              <div class="col-6">
                <img :src="img10" class="img-fluid rounded-10px mb-4 wow fadeInDown" alt="" />
                <img :src="img8" class="img-fluid rounded-10px w-70 wow fadeInRight" alt="" />
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-6">
          <div class="subtitle wow fadeInUp mb-3">{{ t("home.marketing.welcome") }}</div>
          <h2 class="wow fadeInUp">
            {{ t("home.modulesTitle") }}
            <span class="d-block mt-2 alt-font fw-500 fs-72 id-color-2">{{
              t("home.marketing.welcomeHighlight")
            }}</span>
          </h2>
          <p class="wow fadeInUp">{{ t("home.modulesSubtitle") }}</p>
          <div class="spacer-10" />
          <RouterLink class="btn-main wow fadeInUp" :to="primaryCtaTo">{{ primaryCtaLabel }}</RouterLink>
        </div>
      </div>
    </div>
  </section>

  <section class="text-light section-dark jarallax">
    <img :src="jarallax34" class="jarallax-img" alt="" />
    <div class="container">
      <div class="row g-4 gx-5 relative z-index-1000">
        <div class="col-lg-2 offset-lg-1 col-sm-4 text-center">
          <img :src="avatar23" class="img-fluid circle wow scaleIn" alt="" />
          <h5 class="mt-3 mb-0">{{ t("home.marketing.testimonialAuthor") }}</h5>
          <p class="small mb-2">{{ t("home.marketing.testimonialRole") }}</p>
        </div>
        <div class="col-lg-8 col-sm-8">
          <p class="mb20 wow fadeInUp fs-32 fw-600 lh-1-3">{{ t("home.marketing.testimonialQuote") }}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-color-2 section-dark text-light text-center pt60 pb50 jarallax">
    <div class="container">
      <div class="row g-4">
        <div class="col-md-3 col-sm-6 mb-sm-30">
          <div class="de_count fs-15 wow fadeInRight">
            <h3 class="fs-40"><span class="timer fs-40" data-to="1200" data-speed="3000">0</span>+</h3>
            {{ t("home.marketing.statUsers") }}
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-sm-30">
          <div class="de_count fs-15 wow fadeInRight" data-wow-delay=".2s">
            <h3 class="fs-40"><span class="timer fs-40" data-to="480" data-speed="3000">0</span>+</h3>
            {{ t("home.marketing.statPosts") }}
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-sm-30">
          <div class="de_count fs-15 wow fadeInRight" data-wow-delay=".4s">
            <h3 class="fs-40"><span class="timer fs-40" data-to="2" data-speed="3000">0</span>+</h3>
            {{ t("home.marketing.statYears") }}
          </div>
        </div>
        <div class="col-md-3 col-sm-6 mb-sm-30">
          <div class="de_count fs-15 wow fadeInRight" data-wow-delay=".6s">
            <h3 class="fs-40"><span class="timer fs-40" data-to="3" data-speed="3000">0</span>+</h3>
            {{ t("home.marketing.statModules") }}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="modules" class="relative overflow-hidden">
    <img :src="flowersCrop2" class="w-30 absolute top-0 end-0 sw-anim" alt="" />
    <div class="container">
      <div class="row">
        <div class="col-lg-6 offset-lg-3 text-center">
          <div class="subtitle wow fadeInUp mb-3">{{ t("home.marketing.teamAccent") }}</div>
          <h2 class="wow fadeInUp">
            Afterglow
            <span class="alt-font fw-500 fs-64 id-color-2">{{ t("home.modulesTitle") }}</span>
          </h2>
          <p class="lead">{{ t("home.modulesSubtitle") }}</p>
          <div class="spacer-single" />
        </div>
      </div>
      <div class="row g-4 justify-content-center">
        <div v-for="card in moduleCards" :key="card.to" class="col-lg-4 col-md-6">
          <RouterLink :to="card.to" class="d-block text-decoration-none text-dark">
            <img :src="moduleImages[card.imgKey]" class="img-fluid rounded-10px" alt="" />
            <div class="p-3 text-center bg-color-3 rounded-10px mx-3 mt-30 relative z-1000">
              <h4 class="mb-0">{{ card.title }}</h4>
              <p class="mb-2">{{ card.text }}</p>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </section>

  <section class="bg-color text-light pt40 pb40">
    <div class="container">
      <div class="row g-4 align-items-center">
        <div class="col-lg-9">
          <h3 class="mb-0">{{ t("home.ctaTitle") }}</h3>
          <p class="mb-0 opacity-75">{{ t("home.ctaSubtitle") }}</p>
        </div>
        <div class="col-lg-3 text-lg-end">
          <RouterLink class="btn-main bg-color-2" :to="primaryCtaTo">{{ primaryCtaLabel }}</RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>
