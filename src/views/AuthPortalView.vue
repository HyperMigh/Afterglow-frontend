<script setup>
import { computed, onUnmounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/auth";
import UiButton from "../components/ui/UiButton.vue";
import UiCard from "../components/ui/UiCard.vue";
import UiInput from "../components/ui/UiInput.vue";
import UiStatus from "../components/ui/UiStatus.vue";

const props = defineProps({
  scene: {
    type: String,
    default: "login",
    validator: (value) => ["login", "register"].includes(value)
  }
});

const authStore = useAuthStore();
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
let cooldownTimer = null;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_PATTERN = /^\d{4,8}$/;
const CAPTCHA_PATTERN = /^[A-Za-z0-9]{4,8}$/;

const isLoginMode = computed(() => props.scene === "login");
const isEmailValid = computed(() => EMAIL_PATTERN.test(form.email.trim()));
const isCodeValid = computed(() => CODE_PATTERN.test(form.code.trim()));
const isCaptchaValid = computed(() => CAPTCHA_PATTERN.test(form.captchaCode.trim()));
const submitLoading = computed(() => (isLoginMode.value ? loggingIn.value : registering.value));
const canSendCode = computed(() => cooldown.value <= 0 && !sendingCode.value);
const canSubmit = computed(() => isEmailValid.value && isCodeValid.value && isCaptchaValid.value && !submitLoading.value);
const feedbackTone = computed(() => (feedback.message ? feedback.type : "muted"));
const sendCodeButtonText = computed(() => {
  if (sendingCode.value) {
    return "发送中...";
  }
  if (cooldown.value > 0) {
    return `重新发送 (${cooldown.value}s)`;
  }
  return "获取邮箱验证码";
});
const submitButtonText = computed(() => {
  if (submitLoading.value) {
    return isLoginMode.value ? "登录中..." : "注册中...";
  }
  return isLoginMode.value ? "登录" : "注册";
});
const headTitle = computed(() => (isLoginMode.value ? "登录账号" : "创建账号"));
const headDesc = computed(() =>
  isLoginMode.value
    ? "输入邮箱验证码与图形验证码后登录。"
    : "先获取邮箱验证码，再输入图形验证码完成注册。"
);
const defaultFeedbackText = computed(() =>
  isLoginMode.value ? "请先获取邮箱验证码，再输入图形验证码完成登录。" : "请先获取邮箱验证码，再输入图形验证码完成注册。"
);

function setFeedback(type, message) {
  feedback.type = type;
  feedback.message = message;
}

function startCooldown(seconds = 60) {
  cooldown.value = seconds;
  if (cooldownTimer) {
    window.clearInterval(cooldownTimer);
  }
  cooldownTimer = window.setInterval(() => {
    if (cooldown.value <= 1) {
      cooldown.value = 0;
      window.clearInterval(cooldownTimer);
      cooldownTimer = null;
      return;
    }
    cooldown.value -= 1;
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
    setFeedback("error", authStore.error || error.message || "获取图形验证码失败");
  }
}

async function resetForScene() {
  form.code = "";
  form.captchaCode = "";
  setFeedback("info", isLoginMode.value ? "当前为登录模式" : "当前为注册模式");
  if (cooldownTimer) {
    window.clearInterval(cooldownTimer);
    cooldownTimer = null;
  }
  cooldown.value = 0;
  await refreshCaptcha();
}

async function onSendCode() {
  if (!isEmailValid.value) {
    setFeedback("error", "请输入正确的邮箱地址");
    return;
  }

  try {
    const result = await authStore.sendCode({
      email: form.email.trim(),
      scene: props.scene
    });
    const cooldownSeconds = Math.min(90, Math.max(30, Number(result.expireSeconds) || 60));
    startCooldown(cooldownSeconds);
    setFeedback("success", `邮箱验证码已发送，有效期 ${result.expireSeconds} 秒`);
  } catch (error) {
    setFeedback("error", authStore.error || error.message || "发送验证码失败");
  }
}

async function onSubmit() {
  if (!isEmailValid.value) {
    setFeedback("error", "请输入正确的邮箱地址");
    return;
  }
  if (!isCodeValid.value) {
    setFeedback("error", "邮箱验证码必须是 4~8 位数字");
    return;
  }
  if (!captcha.captchaId || !isCaptchaValid.value) {
    setFeedback("error", "请输入图形验证码");
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
      setFeedback("success", "登录成功，正在跳转...");
    } else {
      await authStore.register(payload);
      setFeedback("success", "注册成功，正在跳转...");
    }
    await router.replace(normalizeRedirect());
  } catch (error) {
    setFeedback("error", authStore.error || error.message || (isLoginMode.value ? "登录失败" : "注册失败"));
    form.captchaCode = "";
    await refreshCaptcha();
  }
}

watch(
  () => props.scene,
  async () => {
    await resetForScene();
  },
  { immediate: true }
);

onUnmounted(() => {
  if (cooldownTimer) {
    window.clearInterval(cooldownTimer);
    cooldownTimer = null;
  }
});
</script>

<template>
  <section class="auth-page">
    <UiCard as="article" variant="panel" class="auth-modal">
      <header class="auth-head">
        <div class="mode-tabs" role="tablist" aria-label="认证模式">
          <RouterLink to="/login" class="mode-tab" :class="{ active: isLoginMode }">登录</RouterLink>
          <RouterLink to="/register" class="mode-tab" :class="{ active: !isLoginMode }">注册</RouterLink>
        </div>
        <h1>{{ headTitle }}</h1>
        <p>{{ headDesc }}</p>
      </header>

      <form class="auth-form" @submit.prevent="onSubmit">
        <label class="input-group">
          <span>邮箱</span>
          <UiInput
            :model-value="form.email"
            :invalid="form.email && !isEmailValid"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            @update:model-value="(value) => (form.email = value)"
          />
        </label>

        <label class="input-group">
          <span>邮箱验证码</span>
          <div class="code-line">
            <UiInput
              :model-value="form.code"
              :invalid="form.code && !isCodeValid"
              type="text"
              placeholder="4~8 位数字"
              maxlength="8"
              @update:model-value="(value) => (form.code = value)"
              @keyup.enter="onSubmit"
            />
            <UiButton type="button" class="code-btn" :disabled="!canSendCode" @click="onSendCode">
              {{ sendCodeButtonText }}
            </UiButton>
          </div>
        </label>

        <label class="input-group">
          <span>图形验证码</span>
          <div class="captcha-line">
            <UiInput
              :model-value="form.captchaCode"
              :invalid="form.captchaCode && !isCaptchaValid"
              type="text"
              placeholder="输入图形验证码"
              maxlength="8"
              @update:model-value="(value) => (form.captchaCode = value)"
            />
            <button type="button" class="captcha-image-btn" @click="refreshCaptcha">
              <img v-if="captcha.imageData" :src="captcha.imageData" alt="图形验证码" class="captcha-image" />
              <span v-else class="captcha-fallback">点击获取</span>
            </button>
          </div>
        </label>

        <UiButton class="submit-btn" type="submit" :disabled="!canSubmit">
          {{ submitButtonText }}
        </UiButton>
      </form>

      <UiStatus class="feedback-text" :tone="feedbackTone">
        {{ feedback.message || defaultFeedbackText }}
      </UiStatus>
    </UiCard>
  </section>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px 14px;
}

.auth-modal {
  width: min(520px, 94vw);
  border-radius: 28px;
  border: 1px solid var(--ag-border-strong);
  box-shadow: var(--ag-shadow-panel);
  background: var(--ag-login-auth-bg, var(--ag-surface-panel));
  padding: 24px;
}

.auth-head {
  display: grid;
  gap: 10px;
}

.auth-head h1 {
  margin: 0;
  font-size: 40px;
  line-height: 1;
  text-transform: uppercase;
  font-family: "Barlow Condensed", "Noto Sans SC", sans-serif;
}

.auth-head p {
  margin: 0;
  color: var(--ag-text-soft);
  font-size: 14px;
}

.mode-tabs {
  display: inline-flex;
  border-radius: 999px;
  border: 1px solid var(--ag-border-soft);
  overflow: hidden;
  width: fit-content;
}

.mode-tab {
  border: none;
  padding: 6px 14px;
  color: var(--ag-text-soft);
  font-size: 15px;
  text-transform: uppercase;
  font-family: "Barlow Condensed", "Noto Sans SC", sans-serif;
}

.mode-tab.active {
  color: #ffffff;
  background: linear-gradient(140deg, #ff6d4c, #e60008);
}

.auth-form {
  margin-top: 16px;
  display: grid;
  gap: 13px;
}

.input-group {
  display: grid;
  gap: 6px;
}

.input-group span {
  font-size: 13px;
  color: var(--ag-text-soft);
}

.code-line,
.captcha-line {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

.code-btn {
  min-width: 126px;
  border-radius: 999px;
}

.captcha-image-btn {
  border: 1px solid var(--ag-border-soft);
  border-radius: 12px;
  padding: 0;
  width: 122px;
  height: 42px;
  background: var(--ag-btn-ghost-bg);
  cursor: pointer;
  overflow: hidden;
}

.captcha-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-fallback {
  display: inline-flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: var(--ag-text-muted);
  font-size: 12px;
}

.submit-btn {
  padding: 12px 16px;
  font-size: 15px;
}

.feedback-text {
  margin-top: 12px;
}

@media (max-width: 640px) {
  .auth-modal {
    padding: 20px 16px;
    border-radius: 20px;
  }

  .code-line,
  .captcha-line {
    grid-template-columns: 1fr;
  }

  .code-btn,
  .submit-btn,
  .captcha-image-btn {
    width: 100%;
    min-height: 42px;
  }
}
</style>
