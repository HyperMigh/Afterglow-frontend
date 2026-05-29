<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/auth";
import { useI18n } from "@/composables/useI18n";
import { mobanAsset } from "@/composables/useMobanAssets";

const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);
const { t } = useI18n();

const productFeatures = computed(() => t("home.productFeatures") || []);
const solutions = computed(() => t("home.solutions") || []);
const plans = computed(() => t("home.plans") || []);
const docItems = computed(() => t("home.docItems") || []);

const primaryCtaTo = computed(() => (isAuthenticated.value ? "/feed" : "/register"));
const primaryCtaLabel = computed(() =>
  isAuthenticated.value ? t("home.primaryCtaWorkspace") : t("home.primaryCtaGetStarted")
);

const sliderBg1 = mobanAsset("images/slider/1.webp");
const sliderBg2 = mobanAsset("images/slider/2.webp");
const flowersCrop = mobanAsset("static/picture/flowers-crop.webp");
const flowersCrop2 = mobanAsset("static/picture/flowers-crop-2.webp");
const flowersWhite = mobanAsset("static/picture/flowers-crop-3-white.webp");
const leaf = mobanAsset("static/picture/leaf.webp");
const img24 = mobanAsset("static/picture/24.webp");
const img33 = mobanAsset("static/picture/33.webp");
const img10 = mobanAsset("static/picture/10.webp");
const img8 = mobanAsset("static/picture/8.webp");
const jarallax34 = mobanAsset("static/picture/34.webp");
const avatar23 = mobanAsset("static/picture/23.webp");
const svc1 = mobanAsset("static/picture/1.webp");
const svc22 = mobanAsset("static/picture/22.webp");
const svc3 = mobanAsset("static/picture/3.webp");
const svc4 = mobanAsset("static/picture/4.webp");
const svc5 = mobanAsset("static/picture/5.webp");
const svc6 = mobanAsset("static/picture/6.webp");
const team12 = mobanAsset("static/picture/12.webp");
const team31 = mobanAsset("static/picture/31.webp");
const team41 = mobanAsset("static/picture/41.webp");
const jarallax11 = mobanAsset("static/picture/11.webp");
const trustpilot = mobanAsset("static/picture/trustpilot-invert.webp");

const serviceCards = computed(() => [
  { img: svc1, title: productFeatures.value[0]?.title, text: productFeatures.value[0]?.description },
  { img: svc22, title: solutions.value[0]?.title, text: solutions.value[0]?.text },
  { img: svc3, title: solutions.value[1]?.title, text: solutions.value[1]?.text },
  { img: svc4, title: productFeatures.value[1]?.title, text: productFeatures.value[1]?.description },
  { img: svc5, title: productFeatures.value[2]?.title, text: productFeatures.value[2]?.description },
  { img: svc6, title: solutions.value[2]?.title, text: solutions.value[2]?.text }
].filter((c) => c.title));
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
                          <span class="d-block alt-font fw-500 id-color-2 fs-96 fs-xs-60">{{ t("home.heroTitle") }}</span>
                        </h1>
                        <div class="col-lg-8">
                          <p class="slider-teaser mb-3">{{ t("home.heroSubtitle") }}</p>
                        </div>
                        <div class="spacer-10" />
                        <RouterLink class="btn-main bg-color-2 mb10 mb-3" :to="primaryCtaTo">{{ primaryCtaLabel }}</RouterLink>
                      </div>
                    </div>
                    <div class="spacer-single" />
                  </div>
                </div>
              </div>
              <img :src="flowersCrop" class="w-30 absolute bottom-0 start-0 sw-anim" alt="" />
            </div>
          </div>
          <div class="swiper-slide">
            <div class="swiper-inner" :data-bgimage="`url(${sliderBg2})`">
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
                          <span class="d-block alt-font fw-500 id-color-2 fs-96 fs-xs-60">{{ t("home.ctaTitle") }}</span>
                        </h1>
                        <div class="col-lg-8">
                          <p class="slider-teaser mb-3">{{ t("home.ctaSubtitle") }}</p>
                        </div>
                        <div class="spacer-10" />
                        <RouterLink class="btn-main bg-color-2 mb10 mb-3" to="/#docs">{{ t("home.docsCta") }}</RouterLink>
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
        <div class="swiper-button-prev" />
        <div class="swiper-button-next" />
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
            {{ t("home.productTitle") }}
            <span class="d-block mt-2 alt-font fw-500 fs-72 id-color-2">{{ t("home.marketing.welcomeHighlight") }}</span>
          </h2>
          <p class="wow fadeInUp">{{ t("home.productSubtitle") }}</p>
          <div class="row g-4">
            <div class="col-xl-7">
              <ul class="ul-style-2 text-dark fw-600">
                <li v-for="item in docItems" :key="item">{{ item }}</li>
              </ul>
            </div>
            <div class="col-xl-5">
              <div class="me-4">
                <h4 class="fw-bold mb-1">{{ t("home.marketing.ratingTitle") }}</h4>
                <div class="de-rating-ext fs-15">
                  <span class="d-stars">
                    <i class="fa fa-star" />
                    <i class="fa fa-star" />
                    <i class="fa fa-star" />
                    <i class="fa fa-star" />
                    <i class="fa fa-star" />
                  </span>
                  <div class="fs-14 mb-0">{{ t("home.marketing.ratingBased") }}</div>
                  <img :src="trustpilot" class="w-100px" alt="" />
                </div>
              </div>
            </div>
          </div>
          <div class="spacer-10" />
          <RouterLink class="btn-main wow fadeInUp" to="/roadmap">{{ t("home.marketing.roadmap") }}</RouterLink>
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

  <section id="product" class="relative overflow-hidden pb60">
    <img :src="flowersCrop2" class="w-30 absolute top-0 start-0 sw-anim" alt="" />
    <div class="container">
      <div class="row">
        <div class="col-lg-6 offset-lg-3 text-center">
          <div class="subtitle wow fadeInUp mb-3">{{ t("app.links.product") }}</div>
          <h2 class="wow fadeInUp">
            {{ t("home.productTitle") }}
            <span class="alt-font fw-500 fs-64 id-color-2">{{ t("home.marketing.sectionAccent") }}</span>
          </h2>
          <p class="lead mb-0 wow fadeInUp">{{ t("home.productSubtitle") }}</p>
          <div class="spacer-single" />
        </div>
      </div>
      <div class="row g-4">
        <div v-for="(card, idx) in serviceCards" :key="idx" class="col-lg-4 col-sm-6">
          <div class="relative mb-3">
            <RouterLink :to="primaryCtaTo" class="d-block hover mb-3">
              <div class="relative overflow-hidden rounded-20px shadow-soft">
                <img :src="flowersWhite" class="w-50 end-0 absolute hover-op-0" alt="" />
                <div class="absolute start-0 w-100 abs-middle fs-36 text-white text-center">
                  <span class="btn-main hover-scale-in-2">{{ t("home.marketing.readMore") }}</span>
                </div>
                <img :src="card.img" class="img-fluid hover-scale-1-2" alt="" />
              </div>
            </RouterLink>
            <h4>{{ card.title }}</h4>
            <p class="no-bottom">{{ card.text }}</p>
          </div>
        </div>
      </div>
      <div class="spacer-double" />
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
            <h3 class="fs-40"><span class="timer fs-40" data-to="5" data-speed="3000">0</span>+</h3>
            {{ t("home.marketing.statModules") }}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="solutions" class="relative overflow-hidden">
    <img :src="flowersCrop2" class="w-30 absolute top-0 end-0 sw-anim" alt="" />
    <div class="container">
      <div class="row">
        <div class="col-lg-6 offset-lg-3 text-center">
          <div class="subtitle wow fadeInUp mb-3">{{ t("home.solutionsTitle") }}</div>
          <h2 class="wow fadeInUp">
            Afterglow
            <span class="alt-font fw-500 fs-64 id-color-2">{{ t("home.marketing.teamAccent") }}</span>
          </h2>
          <p class="lead">{{ t("home.solutionsSubtitle") }}</p>
          <div class="spacer-single" />
        </div>
      </div>
      <div class="row g-4">
        <div class="col-lg-3 col-sm-6">
          <img :src="team12" class="img-fluid rounded-10px" alt="" />
          <div class="p-3 text-center bg-color-3 rounded-10px mx-3 mt-30 relative z-1000">
            <h4 class="mb-0">{{ t("home.marketing.teamFeed") }}</h4>
            <p class="mb-2">{{ t("home.marketing.teamFeedDesc") }}</p>
          </div>
        </div>
        <div class="col-lg-3 col-sm-6">
          <img :src="avatar23" class="img-fluid rounded-10px" alt="" />
          <div class="p-3 text-center bg-color-3 rounded-10px mx-3 mt-30 relative z-1000">
            <h4 class="mb-0">{{ t("home.marketing.teamChat") }}</h4>
            <p class="mb-2">{{ t("home.marketing.teamChatDesc") }}</p>
          </div>
        </div>
        <div class="col-lg-3 col-sm-6">
          <img :src="team31" class="img-fluid rounded-10px" alt="" />
          <div class="p-3 text-center bg-color-3 rounded-10px mx-3 mt-30 relative z-1000">
            <h4 class="mb-0">{{ t("home.marketing.teamMirror") }}</h4>
            <p class="mb-2">{{ t("home.marketing.teamMirrorDesc") }}</p>
          </div>
        </div>
        <div class="col-lg-3 col-sm-6">
          <img :src="team41" class="img-fluid rounded-10px" alt="" />
          <div class="p-3 text-center bg-color-3 rounded-10px mx-3 mt-30 relative z-1000">
            <h4 class="mb-0">{{ t("home.marketing.teamRoadmap") }}</h4>
            <p class="mb-2">{{ t("home.marketing.teamRoadmapDesc") }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="pricing" class="section-dark jarallax">
    <img :src="jarallax11" class="jarallax-img" alt="" />
    <div class="container">
      <div class="row text-light">
        <div class="col-lg-6 offset-lg-3 text-center">
          <div class="subtitle s2 wow fadeInUp mb-3">{{ t("home.pricingTitle") }}</div>
          <h2 class="wow fadeInUp">
            {{ t("home.pricingTitle") }}
            <span class="alt-font fw-500 fs-64 id-color-2">{{ t("home.marketing.pricingAccent") }}</span>
          </h2>
          <p class="lead">{{ t("home.pricingSubtitle") }}</p>
          <div class="spacer-single" />
        </div>
      </div>
      <div class="row g-4 align-items-center">
        <div v-for="(plan, idx) in plans" :key="plan.name" class="col-lg-4 col-sm-6">
          <div class="relative bg-white h-100 rounded-10px overflow-hidden wow fadeInUp" :data-wow-delay="`${idx * 0.2}s`">
            <h4 :class="idx === 1 ? 'bg-color-2 text-light p-3' : 'bg-color text-light p-3'">{{ plan.name }}</h4>
            <div class="p-3 px-4 mb-4 relative">
              <div class="fs-14 text-dark fw-500">{{ plan.note }}</div>
              <div class="mb-3">
                <h2 class="d-inline id-color-2">{{ plan.price }}</h2>
              </div>
              <ul class="ul-style-2 fw-600 text-dark mb-3">
                <li v-for="point in plan.items" :key="point">{{ point }}</li>
              </ul>
              <RouterLink class="btn-main btn-light-trans w-100" :to="primaryCtaTo">{{ primaryCtaLabel }}</RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section id="docs" class="pb60">
    <div class="container">
      <div class="row">
        <div class="col-lg-6 offset-lg-3 text-center">
          <div class="subtitle wow fadeInUp mb-3">{{ t("home.docsTitle") }}</div>
          <h2 class="wow fadeInUp">
            {{ t("home.docsTitle") }}
            <span class="alt-font fw-500 fs-64 id-color-2">{{ t("home.marketing.faqAccent") }}</span>
          </h2>
        </div>
      </div>
      <div class="row g-4 align-items-center">
        <div class="col-lg-12">
          <div class="accordion s2 wow fadeInUp">
            <div class="accordion-section">
              <template v-for="(item, i) in docItems" :key="i">
                <div class="accordion-section-title" :data-tab="`#accordion-a${i + 1}`">
                  {{ item }}
                </div>
                <div :id="`accordion-a${i + 1}`" class="accordion-section-content">
                  <p>{{ t("home.docsSubtitle") }}</p>
                </div>
              </template>
            </div>
          </div>
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