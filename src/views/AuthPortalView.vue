<script setup>
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/auth";
import { useI18n } from "../composables/useI18n";
import UiButton from "../components/ui/UiButton.vue";
import UiCard from "../components/ui/UiCard.vue";
import UiInput from "../components/ui/UiInput.vue";
import UiStatus from "../components/ui/UiStatus.vue";

const FEEDBACK_CODE_SENT = "__EMAIL_CODE_SENT__";

const props = defineProps({
  scene: {
    type: String,
    default: "login",
    validator: (value) => ["login", "register"].includes(value)
  }
});

const authStore = useAuthStore();
const { t, isEnglish, toggleLocale } = useI18n();
const { sendingCode, loggingIn, registering } = storeToRefs(authStore);
const router = useRouter();
const route = useRoute();
const authPageRef = ref(null);
const glowDots = ref([]);
const layoutMotionClass = ref("");

const GLOW_COLOR_POOL = ["#ff8f6b", "#66b8ff", "#8adf9f", "#ffd166", "#b68cff", "#68d8cf"];
const GLOW_MAX_DOTS = 120;
const GLOW_EMIT_INTERVAL_MS = 24;
const CANVAS_PALETTE = ["#8adfd7", "#b5cdfd", "#ffd59a", "#d8c7ff", "#8fd9aa", "#ffb7a6"];

let glowDotSeed = 0;
let glowLastEmitTs = 0;
let glowFrameId = null;
let glowLastFrameTs = 0;
let layoutMotionTimer = null;

const form = reactive({
  email: "",
  code: "",
  captchaCode: ""
});

const captcha = reactive({
  captchaId: "",
  imageData: "",
  expireSeconds: 0
});

const feedback = reactive({
  type: "info",
  message: ""
});

const cooldown = ref(0);
const codeExpireRemaining = ref(0);
let cooldownTimer = null;
let codeExpireTimer = null;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_PATTERN = /^\d{6}$/;
const CAPTCHA_PATTERN = /^[A-Za-z0-9]{4,8}$/;

const isLoginMode = computed(() => props.scene === "login");
const isEmailValid = computed(() => EMAIL_PATTERN.test(form.email.trim()));
const isCodeValid = computed(() => CODE_PATTERN.test(form.code.trim()));
const isCaptchaValid = computed(() => CAPTCHA_PATTERN.test(form.captchaCode.trim()));
const submitLoading = computed(() => (isLoginMode.value ? loggingIn.value : registering.value));
const canSendCode = computed(() => cooldown.value <= 0 && !sendingCode.value);
const canSubmit = computed(() => isEmailValid.value && isCodeValid.value && isCaptchaValid.value && !submitLoading.value);
const layoutClassList = computed(() => {
  const classes = [];
  if (!isLoginMode.value) {
    classes.push("auth-layout--reverse");
  }
  if (layoutMotionClass.value) {
    classes.push(layoutMotionClass.value);
  }
  return classes;
});
const localeToggleLabel = computed(() => (isEnglish.value ? "中" : "EN"));
const localeToggleAriaLabel = computed(() =>
  isEnglish.value ? t("app.localeSwitchToChinese") : t("app.localeSwitchToEnglish")
);

const sceneTitle = computed(() =>
  isLoginMode.value ? t("authPortal.sceneTitleLogin") : t("authPortal.sceneTitleSignup")
);
const sceneDescription = computed(() =>
  isLoginMode.value ? t("authPortal.sceneDescLogin") : t("authPortal.sceneDescSignup")
);

const feedbackTone = computed(() => {
  if (feedback.message === FEEDBACK_CODE_SENT) {
    return "success";
  }
  return feedback.message ? feedback.type : "muted";
});

const sendCodeButtonText = computed(() => {
  if (sendingCode.value) {
    return t("authPortal.sendingCode");
  }
  if (cooldown.value > 0) {
    return t("authPortal.retryCode", { seconds: cooldown.value });
  }
  return t("authPortal.sendCode");
});

const submitButtonText = computed(() => {
  if (submitLoading.value) {
    return isLoginMode.value ? t("authPortal.loggingIn") : t("authPortal.creatingAccount");
  }
  return isLoginMode.value ? t("authPortal.submitLogin") : t("authPortal.submitSignup");
});

const defaultFeedbackText = computed(() =>
  isLoginMode.value ? t("authPortal.defaultFeedbackLogin") : t("authPortal.defaultFeedbackSignup")
);

const feedbackDisplayMessage = computed(() => {
  if (feedback.message === FEEDBACK_CODE_SENT) {
    return codeExpireRemaining.value > 0
      ? t("authPortal.codeSentWithRemaining", { seconds: codeExpireRemaining.value })
      : t("authPortal.codeSentFallback");
  }
  return feedback.message || defaultFeedbackText.value;
});

function setFeedback(type, message) {
  feedback.type = type;
  feedback.message = message;
}

function clearCooldownTimer() {
  if (cooldownTimer) {
    window.clearInterval(cooldownTimer);
    cooldownTimer = null;
  }
}

function clearCodeExpireTimer() {
  if (codeExpireTimer) {
    window.clearInterval(codeExpireTimer);
    codeExpireTimer = null;
  }
}

function startCooldown(seconds = 60) {
  cooldown.value = seconds;
  clearCooldownTimer();
  cooldownTimer = window.setInterval(() => {
    if (cooldown.value <= 1) {
      cooldown.value = 0;
      clearCooldownTimer();
      return;
    }
    cooldown.value -= 1;
  }, 1000);
}

function startCodeExpireCountdown(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  codeExpireRemaining.value = safeSeconds;
  clearCodeExpireTimer();

  if (safeSeconds <= 0) {
    return;
  }

  codeExpireTimer = window.setInterval(() => {
    if (codeExpireRemaining.value <= 1) {
      codeExpireRemaining.value = 0;
      clearCodeExpireTimer();
      if (feedback.message === FEEDBACK_CODE_SENT) {
        setFeedback("info", t("authPortal.codeExpired"));
      }
      return;
    }
    codeExpireRemaining.value -= 1;
  }, 1000);
}

function normalizeRedirect() {
  const redirect = route.query.redirect;
  if (typeof redirect === "string" && redirect.startsWith("/")) {
    return redirect;
  }
  return "/feed";
}

async function refreshCaptcha() {
  try {
    const result = await authStore.loadCaptcha();
    captcha.captchaId = result.captchaId;
    captcha.imageData = result.imageData;
    captcha.expireSeconds = Number(result.expireSeconds || 0);
  } catch (error) {
    setFeedback("error", authStore.error || error.message || t("authPortal.loadCaptchaFailed"));
  }
}

async function resetForScene() {
  form.code = "";
  form.captchaCode = "";
  setFeedback("info", isLoginMode.value ? t("authPortal.modeLogin") : t("authPortal.modeSignup"));
  clearCooldownTimer();
  clearCodeExpireTimer();
  cooldown.value = 0;
  codeExpireRemaining.value = 0;
  await refreshCaptcha();
}

async function onSendCode() {
  if (!isEmailValid.value) {
    setFeedback("error", t("authPortal.invalidEmail"));
    return;
  }

  try {
    const result = await authStore.sendCode({
      email: form.email.trim(),
      scene: props.scene
    });

    const expireSeconds = Math.max(1, Number(result.expireSeconds) || 300);
    const cooldownSeconds = Math.min(90, Math.max(30, expireSeconds));
    startCooldown(cooldownSeconds);
    startCodeExpireCountdown(expireSeconds);
    setFeedback("success", FEEDBACK_CODE_SENT);
  } catch (error) {
    setFeedback("error", authStore.error || error.message || t("authPortal.sendCodeFailed"));
  }
}

async function onSubmit() {
  if (!isEmailValid.value) {
    setFeedback("error", t("authPortal.invalidEmail"));
    return;
  }
  if (!isCodeValid.value) {
    setFeedback("error", t("authPortal.invalidCode"));
    return;
  }
  if (!captcha.captchaId || !isCaptchaValid.value) {
    setFeedback("error", t("authPortal.invalidCaptcha"));
    return;
  }

  const payload = {
    email: form.email.trim(),
    code: form.code.trim(),
    captchaId: captcha.captchaId,
    captchaCode: form.captchaCode.trim()
  };

  try {
    if (isLoginMode.value) {
      await authStore.login(payload);
      setFeedback("success", t("authPortal.loginSuccess"));
    } else {
      await authStore.register(payload);
      setFeedback("success", t("authPortal.signupSuccess"));
    }
    await router.replace(normalizeRedirect());
  } catch (error) {
    setFeedback("error", authStore.error || error.message || (isLoginMode.value ? t("authPortal.loginFailed") : t("authPortal.signupFailed")));
    form.captchaCode = "";
    await refreshCaptcha();
  }
}

function onOAuth(provider) {
  setFeedback("info", t("authPortal.oauthUnavailable", { provider }));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function pickGlowColor() {
  return GLOW_COLOR_POOL[Math.floor(Math.random() * GLOW_COLOR_POOL.length)];
}

function emitGlowDots(x, y, count) {
  const dots = glowDots.value.slice();
  for (let i = 0; i < count; i += 1) {
    const angle = randomBetween(0, Math.PI * 2);
    const radius = randomBetween(4, 20);
    dots.push({
      id: `dot-${glowDotSeed++}`,
      x: x + Math.cos(angle) * radius,
      y: y + Math.sin(angle) * radius,
      vx: randomBetween(-0.35, 0.35),
      vy: randomBetween(-0.7, -0.18),
      size: randomBetween(2, 4.5),
      life: 1,
      decay: randomBetween(0.028, 0.042),
      color: pickGlowColor()
    });
  }
  if (dots.length > GLOW_MAX_DOTS) {
    glowDots.value = dots.slice(dots.length - GLOW_MAX_DOTS);
    return;
  }
  glowDots.value = dots;
}

function runGlowFrame(timestamp) {
  if (!glowLastFrameTs) {
    glowLastFrameTs = timestamp;
  }
  const deltaFactor = Math.max(0.6, Math.min(2.4, (timestamp - glowLastFrameTs) / 16.666));
  glowLastFrameTs = timestamp;

  const nextDots = [];
  for (const dot of glowDots.value) {
    const nextLife = dot.life - dot.decay * deltaFactor;
    if (nextLife <= 0.01) {
      continue;
    }
    dot.life = nextLife;
    dot.x += dot.vx * deltaFactor;
    dot.y += dot.vy * deltaFactor;
    nextDots.push(dot);
  }
  glowDots.value = nextDots;

  if (nextDots.length > 0) {
    glowFrameId = window.requestAnimationFrame(runGlowFrame);
    return;
  }
  glowFrameId = null;
  glowLastFrameTs = 0;
}

function ensureGlowFrame() {
  if (glowFrameId !== null) {
    return;
  }
  glowFrameId = window.requestAnimationFrame(runGlowFrame);
}

function resolveRelativePointerPosition(event) {
  const host = authPageRef.value;
  if (!host) {
    return null;
  }
  const rect = host.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

function onPointerMove(event) {
  const now = performance.now();
  if (now - glowLastEmitTs < GLOW_EMIT_INTERVAL_MS) {
    return;
  }
  const point = resolveRelativePointerPosition(event);
  if (!point) {
    return;
  }
  glowLastEmitTs = now;
  emitGlowDots(point.x, point.y, Math.random() > 0.58 ? 3 : 2);
  ensureGlowFrame();
}

function onPointerDown(event) {
  const point = resolveRelativePointerPosition(event);
  if (!point) {
    return;
  }
  emitGlowDots(point.x, point.y, 8);
  ensureGlowFrame();
}

function clearLayoutMotionTimer() {
  if (layoutMotionTimer) {
    window.clearTimeout(layoutMotionTimer);
    layoutMotionTimer = null;
  }
}

function startLayoutMotion(nextScene) {
  const motionClass = nextScene === "register" ? "auth-layout--to-register" : "auth-layout--to-login";
  clearLayoutMotionTimer();
  layoutMotionClass.value = motionClass;
  layoutMotionTimer = window.setTimeout(() => {
    layoutMotionClass.value = "";
    clearLayoutMotionTimer();
  }, 560);
}

watch(
  () => props.scene,
  async (nextScene, prevScene) => {
    if (prevScene && prevScene !== nextScene) {
      startLayoutMotion(nextScene);
    }
    await resetForScene();
  },
  { immediate: true }
);

onMounted(() => {
  glowLastEmitTs = 0;
});

onUnmounted(() => {
  clearCooldownTimer();
  clearCodeExpireTimer();
  clearLayoutMotionTimer();
  if (glowFrameId !== null) {
    window.cancelAnimationFrame(glowFrameId);
    glowFrameId = null;
  }
  glowDots.value = [];
});
</script>

<template>
  <section
    ref="authPageRef"
    class="auth-page"
    @pointermove="onPointerMove"
    @pointerdown="onPointerDown"
  >
    <div class="mouse-glow-layer" aria-hidden="true">
      <span
        v-for="dot in glowDots"
        :key="dot.id"
        class="mouse-glow-dot"
        :style="{
          left: `${dot.x}px`,
          top: `${dot.y}px`,
          width: `${dot.size}px`,
          height: `${dot.size}px`,
          opacity: dot.life,
          background: dot.color,
          boxShadow: `0 0 ${8 + dot.size * 2}px ${dot.color}`,
          transform: `translate(-50%, -50%) scale(${0.6 + dot.life * 0.7})`
        }"
      />
    </div>

    <div class="auth-layout" :class="layoutClassList">
      <aside class="auth-canvas" aria-hidden="true">
        <div class="canvas-aurora canvas-aurora-a" />
        <div class="canvas-aurora canvas-aurora-b" />
        <div class="canvas-aurora canvas-aurora-c" />

        <div class="canvas-copy">
          <p class="canvas-kicker">Afterglow</p>
          <h2>{{ sceneTitle }}</h2>
          <p>{{ sceneDescription }}</p>
        </div>

        <div class="canvas-palette">
          <span
            v-for="(chip, index) in CANVAS_PALETTE"
            :key="chip"
            class="canvas-chip"
            :style="{
              background: chip,
              transform: `translateY(${index % 2 === 0 ? '-4px' : '4px'})`
            }"
          />
        </div>
      </aside>

      <div class="auth-shell">
        <RouterLink to="/" class="back-home-btn">
          <span aria-hidden="true">←</span>
          <span>{{ t("authPortal.backHome") }}</span>
        </RouterLink>

        <RouterLink to="/" class="auth-brand">
          <span class="auth-brand-mark">AG</span>
          <span>
            <strong>Afterglow</strong>
            <small>{{ t("authPortal.brandSubtitle") }}</small>
          </span>
        </RouterLink>

        <UiCard as="article" variant="panel" class="auth-card">
          <header class="auth-head">
            <div class="head-top">
              <div class="mode-tabs" role="tablist" :aria-label="t('authPortal.modeAriaLabel')">
                <RouterLink to="/login" class="mode-tab" :class="{ active: isLoginMode }">{{ t("authPortal.loginTab") }}</RouterLink>
                <RouterLink to="/register" class="mode-tab" :class="{ active: !isLoginMode }">{{ t("authPortal.signupTab") }}</RouterLink>
              </div>
              <button type="button" class="locale-switch-btn" :aria-label="localeToggleAriaLabel" @click="toggleLocale">
                {{ localeToggleLabel }}
              </button>
            </div>
          </header>

          <form class="auth-form" @submit.prevent="onSubmit">
            <label class="input-group">
              <span>{{ t("authPortal.emailLabel") }}</span>
              <UiInput
                :model-value="form.email"
                :invalid="form.email && !isEmailValid"
                type="email"
                :placeholder="t('authPortal.emailPlaceholder')"
                autocomplete="email"
                @update:model-value="(value) => (form.email = value)"
              />
            </label>

            <label class="input-group">
              <span>{{ t("authPortal.codeLabel") }}</span>
              <div class="code-line">
                <UiInput
                  :model-value="form.code"
                  :invalid="form.code && !isCodeValid"
                  type="text"
                  :placeholder="t('authPortal.codePlaceholder')"
                  maxlength="6"
                  @update:model-value="(value) => (form.code = value)"
                  @keyup.enter="onSubmit"
                />
                <UiButton type="button" class="code-btn" :disabled="!canSendCode" @click="onSendCode">
                  {{ sendCodeButtonText }}
                </UiButton>
              </div>
            </label>

            <label class="input-group">
              <span>{{ t("authPortal.captchaLabel") }}</span>
              <div class="captcha-line">
                <UiInput
                  :model-value="form.captchaCode"
                  :invalid="form.captchaCode && !isCaptchaValid"
                  type="text"
                  :placeholder="t('authPortal.captchaPlaceholder')"
                  maxlength="8"
                  @update:model-value="(value) => (form.captchaCode = value)"
                />
                <button type="button" class="captcha-image-btn" @click="refreshCaptcha">
                  <img v-if="captcha.imageData" :src="captcha.imageData" :alt="t('authPortal.captchaAlt')" class="captcha-image" />
                  <span v-else class="captcha-fallback">{{ t("authPortal.captchaFallback") }}</span>
                </button>
              </div>
            </label>

            <UiButton class="submit-btn" type="submit" :disabled="!canSubmit" block>
              {{ submitButtonText }}
            </UiButton>
          </form>

          <div class="divider"><span>{{ t("authPortal.dividerText") }}</span></div>

          <div class="oauth-row">
            <button type="button" class="oauth-btn" @click="onOAuth('Google')">Google</button>
            <button type="button" class="oauth-btn" @click="onOAuth('GitHub')">GitHub</button>
          </div>

          <UiStatus class="feedback-text" :tone="feedbackTone">
            {{ feedbackDisplayMessage }}
          </UiStatus>
        </UiCard>
      </div>
    </div>
  </section>
</template>

<style scoped>
.auth-page {
  position: relative;
  min-height: 100dvh;
  display: grid;
  place-items: center;
  padding: clamp(8px, 1.4vh, 14px) 14px;
  overflow-x: hidden;
  overflow-y: auto;
  background:
    radial-gradient(circle at 18% 12%, rgba(111, 216, 207, 0.16) 0, rgba(111, 216, 207, 0) 36%),
    radial-gradient(circle at 84% 8%, rgba(255, 201, 143, 0.18) 0, rgba(255, 201, 143, 0) 34%),
    linear-gradient(180deg, #ffffff 0%, #fcfdff 52%, #f9fbff 100%);
}

.mouse-glow-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.mouse-glow-dot {
  position: absolute;
  border-radius: 999px;
  will-change: transform, opacity;
  filter: blur(0.4px);
}

.auth-layout {
  position: relative;
  z-index: 1;
  width: min(1140px, 96vw);
  min-height: min(90dvh, 700px);
  height: auto;
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(420px, 0.82fr);
  border-radius: 28px;
  overflow: hidden;
  border: 1px solid rgba(220, 226, 234, 0.88);
  background: rgba(255, 255, 255, 0.74);
  box-shadow: 0 20px 54px rgba(76, 86, 110, 0.14);
  backdrop-filter: blur(6px);
}

.auth-canvas,
.auth-shell {
  transition: opacity 220ms ease;
}

.auth-layout--reverse .auth-canvas {
  order: 2;
  border-right: 0;
  border-left: 1px solid rgba(221, 229, 238, 0.86);
}

.auth-layout--reverse .auth-shell {
  order: 1;
}

.auth-layout--to-register .auth-canvas {
  animation: pane-enter-right 520ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.auth-layout--to-register .auth-shell {
  animation: pane-enter-left 520ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.auth-layout--to-login .auth-canvas {
  animation: pane-enter-left 520ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.auth-layout--to-login .auth-shell {
  animation: pane-enter-right 520ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

@keyframes pane-enter-left {
  from {
    opacity: 0.56;
    transform: translateX(-24px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@keyframes pane-enter-right {
  from {
    opacity: 0.56;
    transform: translateX(24px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.auth-canvas {
  position: relative;
  display: grid;
  grid-template-rows: 1fr auto;
  gap: 14px;
  padding: clamp(18px, 2.8vw, 30px);
  border-right: 1px solid rgba(221, 229, 238, 0.86);
  background:
    linear-gradient(140deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 251, 255, 0.92) 58%, rgba(246, 249, 255, 0.98) 100%);
}

.canvas-aurora {
  position: absolute;
  border-radius: 999px;
  filter: blur(26px);
  opacity: 0.62;
  pointer-events: none;
}

.canvas-aurora-a {
  width: 320px;
  height: 320px;
  left: -92px;
  top: -92px;
  background: radial-gradient(circle, rgba(110, 216, 205, 0.45) 0%, rgba(110, 216, 205, 0) 74%);
}

.canvas-aurora-b {
  width: 360px;
  height: 360px;
  right: -110px;
  top: 18%;
  background: radial-gradient(circle, rgba(255, 207, 136, 0.44) 0%, rgba(255, 207, 136, 0) 76%);
}

.canvas-aurora-c {
  width: 300px;
  height: 300px;
  left: 24%;
  bottom: -130px;
  background: radial-gradient(circle, rgba(168, 186, 255, 0.5) 0%, rgba(168, 186, 255, 0) 74%);
}

.canvas-copy {
  position: relative;
  z-index: 1;
  align-self: end;
  display: grid;
  gap: 12px;
  max-width: 40ch;
}

.canvas-kicker {
  margin: 0;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  font-size: 12px;
  font-weight: 600;
  color: rgba(55, 72, 108, 0.8);
}

.canvas-copy h2 {
  margin: 0;
  font-size: clamp(32px, 4.4vw, 54px);
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: #101828;
}

.canvas-copy p {
  margin: 0;
  font-size: 15px;
  color: rgba(52, 64, 84, 0.8);
}

.canvas-palette {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.canvas-chip {
  width: 34px;
  height: 8px;
  border-radius: 999px;
  box-shadow: 0 3px 16px rgba(104, 122, 156, 0.16);
}

.auth-shell {
  position: relative;
  z-index: 1;
  width: 100%;
  display: grid;
  align-content: start;
  justify-items: stretch;
  gap: 10px;
  padding: 14px clamp(14px, 2.2vw, 28px);
}

.back-home-btn {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--ag-border-soft);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ag-text-soft);
  background: #ffffff;
  transition: border-color 0.18s ease, background-color 0.18s ease, color 0.18s ease;
}

.back-home-btn:hover {
  border-color: #d0d6dc;
  background: var(--ag-bg-soft);
  color: var(--ag-text);
}

.auth-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.auth-brand-mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: var(--ag-accent);
  font-size: 14px;
  font-weight: 600;
}

.auth-brand strong {
  display: block;
  font-size: 18px;
  font-weight: 600;
  color: var(--ag-text);
}

.auth-brand small {
  display: block;
  font-size: 12px;
  color: var(--ag-text-muted);
}

.auth-card {
  width: min(500px, 100%);
  justify-self: center;
  padding: 18px;
  border-radius: 18px;
  border: 1px solid var(--ag-border-soft);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: var(--ag-shadow-card);
}

.auth-head {
  display: grid;
  gap: 0;
}

.head-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.mode-tabs {
  display: inline-flex;
  width: fit-content;
  border-radius: 10px;
  border: 1px solid var(--ag-border-soft);
  background: var(--ag-bg-soft);
  padding: 2px;
}

.mode-tab {
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--ag-text-muted);
  transition: all 0.18s ease;
}

.mode-tab.active {
  background: #ffffff;
  color: var(--ag-text);
  box-shadow: 0 1px 2px rgba(17, 17, 17, 0.08);
}

.locale-switch-btn {
  min-width: 52px;
  border: 1px solid var(--ag-border-soft);
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ag-text-soft);
  background: #ffffff;
  cursor: pointer;
  transition: border-color 0.18s ease, background-color 0.18s ease;
}

.locale-switch-btn:hover {
  border-color: #d0d6dc;
  background: var(--ag-bg-soft);
}

.auth-head h1 {
  margin: 0;
  font-size: clamp(26px, 4vw, 32px);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.auth-head p {
  margin: 0;
  font-size: 14px;
  color: var(--ag-text-muted);
}

.auth-form {
  margin-top: 6px;
  display: grid;
  gap: 10px;
}

.input-group {
  display: grid;
  gap: 8px;
}

.input-group span {
  font-size: 14px;
  color: var(--ag-text);
}

.code-line,
.captcha-line {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

.code-btn {
  min-width: 114px;
}

.captcha-image-btn {
  border: 1px solid var(--ag-border-soft);
  border-radius: 12px;
  background: #ffffff;
  width: 112px;
  height: 44px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.18s ease, background-color 0.18s ease;
}

.captcha-image-btn:hover {
  border-color: #d0d6dc;
  background: #f9fafb;
}

.captcha-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 12px;
  color: var(--ag-text-muted);
}

.divider {
  margin-top: 8px;
  position: relative;
  text-align: center;
}

.divider::before {
  content: "";
  position: absolute;
  inset: 50% 0 auto;
  border-top: 1px solid var(--ag-border-soft);
}

.divider span {
  position: relative;
  padding: 0 8px;
  font-size: 12px;
  color: var(--ag-text-muted);
  background: #ffffff;
}

.oauth-row {
  margin-top: 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.oauth-btn {
  border: 1px solid var(--ag-border-soft);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  background: #ffffff;
  color: var(--ag-text);
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease;
}

.oauth-btn:hover {
  background: var(--ag-bg-soft);
  border-color: #d0d6dc;
}

.feedback-text {
  margin-top: 10px;
}

@media (max-width: 980px) {
  .auth-layout {
    grid-template-columns: minmax(0, 1fr);
    min-height: auto;
  }

  .auth-layout--reverse .auth-canvas {
    order: 1;
    border-left: 0;
    border-bottom: 1px solid rgba(221, 229, 238, 0.86);
  }

  .auth-layout--reverse .auth-shell {
    order: 2;
  }

  .auth-canvas {
    min-height: 220px;
    border-right: 0;
    border-bottom: 1px solid rgba(221, 229, 238, 0.86);
  }

  .canvas-copy h2 {
    font-size: clamp(28px, 8vw, 42px);
  }

  .auth-shell {
    padding-top: 18px;
    padding-bottom: 20px;
  }

  .auth-layout--to-register .auth-canvas,
  .auth-layout--to-register .auth-shell,
  .auth-layout--to-login .auth-canvas,
  .auth-layout--to-login .auth-shell {
    animation: none;
  }
}

@media (max-width: 640px) {
  .auth-layout {
    border-radius: 18px;
  }

  .auth-canvas {
    min-height: 180px;
    padding: 18px;
  }

  .canvas-copy p {
    font-size: 13px;
  }

  .auth-card {
    padding: 18px 16px;
  }

  .back-home-btn {
    width: 100%;
    justify-content: center;
  }

  .head-top,
  .code-line,
  .captcha-line,
  .oauth-row {
    grid-template-columns: 1fr;
  }

  .head-top {
    display: grid;
  }

  .locale-switch-btn,
  .code-btn,
  .captcha-image-btn {
    width: 100%;
    min-height: 44px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .auth-layout--to-register .auth-canvas,
  .auth-layout--to-register .auth-shell,
  .auth-layout--to-login .auth-canvas,
  .auth-layout--to-login .auth-shell {
    animation: none;
  }
}
</style>
