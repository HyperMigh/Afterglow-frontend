<script setup>
import { computed, onUnmounted, reactive, ref, watch } from "vue";
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

watch(
  () => props.scene,
  async () => {
    await resetForScene();
  },
  { immediate: true }
);

onUnmounted(() => {
  clearCooldownTimer();
  clearCodeExpireTimer();
});
</script>

<template>
  <section class="auth-page">
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
          <h1>{{ sceneTitle }}</h1>
          <p>{{ sceneDescription }}</p>
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
  </section>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 40px);
  display: grid;
  place-items: center;
  padding: 30px 14px;
}

.auth-shell {
  width: min(460px, 100%);
  display: grid;
  gap: 14px;
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
  margin: 0 auto;
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
  padding: 24px;
  border-radius: 18px;
  border: 1px solid var(--ag-border-soft);
  background: #ffffff;
  box-shadow: var(--ag-shadow-card);
}

.auth-head {
  display: grid;
  gap: 10px;
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
  font-size: clamp(30px, 5vw, 36px);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.auth-head p {
  margin: 0;
  font-size: 14px;
  color: var(--ag-text-muted);
}

.auth-form {
  margin-top: 14px;
  display: grid;
  gap: 14px;
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
  margin-top: 14px;
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
  margin-top: 12px;
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
  margin-top: 14px;
}

@media (max-width: 640px) {
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
</style>
