<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/auth";
import UiButton from "../components/ui/UiButton.vue";
import UiCard from "../components/ui/UiCard.vue";
import UiInput from "../components/ui/UiInput.vue";
import UiStatus from "../components/ui/UiStatus.vue";

const authStore = useAuthStore();
const { isAuthenticated, me, sendingCode, loggingIn, registering, captchaLoading } = storeToRefs(authStore);
const router = useRouter();
const route = useRoute();

const mode = ref("login");

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

const inspirationTracks = [
  {
    id: "01",
    title: "双重验证",
    description: "登录和注册都要通过图形验证码 + 邮箱验证码，防止批量请求和撞库。"
  },
  {
    id: "02",
    title: "注册登录分离",
    description: "注册仅允许新邮箱，登录仅允许已注册邮箱，不再自动建号。"
  },
  {
    id: "03",
    title: "全链路鉴权",
    description: "除认证接口外，其余 API 均要求携带有效登录令牌。"
  }
];

const inspirationTags = ["Captcha", "Email OTP", "Register", "Login", "Token Guard", "Security"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_PATTERN = /^\d{4,8}$/;
const CAPTCHA_PATTERN = /^[A-Za-z0-9]{4,8}$/;

const isLoginMode = computed(() => mode.value === "login");
const isEmailValid = computed(() => EMAIL_PATTERN.test(form.email.trim()));
const isCodeValid = computed(() => CODE_PATTERN.test(form.code.trim()));
const isCaptchaValid = computed(() => CAPTCHA_PATTERN.test(form.captchaCode.trim()));
const submitLoading = computed(() => (isLoginMode.value ? loggingIn.value : registering.value));
const canSendCode = computed(
  () => isEmailValid.value && isCaptchaValid.value && cooldown.value <= 0 && !sendingCode.value && !captchaLoading.value
);
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
  return isLoginMode.value ? "立即登录" : "立即注册";
});

const headTitle = computed(() => (isLoginMode.value ? "欢迎登录" : "创建账号"));
const headDesc = computed(() =>
  isLoginMode.value
    ? "请输入邮箱验证码与图形验证码，验证通过后进入系统。"
    : "使用邮箱验证码完成注册，同时进行图形验证码校验。"
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
  return "/";
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

function switchMode(nextMode) {
  mode.value = nextMode;
  form.code = "";
  setFeedback("info", nextMode === "login" ? "当前为登录模式" : "当前为注册模式");
}

async function onSendCode() {
  if (!isEmailValid.value) {
    setFeedback("error", "请输入正确的邮箱地址");
    return;
  }
  if (!captcha.captchaId || !isCaptchaValid.value) {
    setFeedback("error", "请输入图形验证码");
    return;
  }

  try {
    const result = await authStore.sendCode({
      email: form.email.trim(),
      captchaId: captcha.captchaId,
      captchaCode: form.captchaCode.trim(),
      scene: mode.value
    });
    const cooldownSeconds = Math.min(90, Math.max(30, Number(result.expireSeconds) || 60));
    startCooldown(cooldownSeconds);
    setFeedback("success", `邮箱验证码已发送，有效期 ${result.expireSeconds} 秒`);
    form.captchaCode = "";
    await refreshCaptcha();
  } catch (error) {
    setFeedback("error", authStore.error || error.message || "发送验证码失败");
    form.captchaCode = "";
    await refreshCaptcha();
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

function onLogout() {
  authStore.logout();
  setFeedback("info", "已退出登录");
}

async function ensureMe() {
  if (authStore.isAuthenticated && !authStore.me) {
    try {
      await authStore.loadMe();
    } catch (error) {
      setFeedback("error", authStore.error || error.message || "获取用户信息失败");
    }
  }
}

onMounted(async () => {
  await ensureMe();
  await refreshCaptcha();
});

onUnmounted(() => {
  if (cooldownTimer) {
    window.clearInterval(cooldownTimer);
    cooldownTimer = null;
  }
});
</script>

<template>
  <section class="login-stage">
    <UiCard as="article" variant="panel" class="story-panel reveal reveal-1">
      <p class="story-kicker">Afterglow Access</p>
      <h1>登录与注册统一升级为邮箱 + 图形验证码双重验证</h1>
      <p class="story-subtitle">
        认证模块现在分离登录和注册流程，前后端都加入图形验证码校验，并对全部业务接口启用登录态拦截。
      </p>

      <ul class="story-list">
        <li v-for="track in inspirationTracks" :key="track.id" class="story-item">
          <span class="item-id">{{ track.id }}</span>
          <div>
            <h3>{{ track.title }}</h3>
            <p>{{ track.description }}</p>
          </div>
        </li>
      </ul>

      <div class="tag-row">
        <span v-for="tag in inspirationTags" :key="tag" class="tag-pill">{{ tag }}</span>
      </div>
    </UiCard>

    <UiCard as="article" variant="panel" class="auth-panel reveal reveal-2">
      <header class="auth-head">
        <div class="mode-tabs" role="tablist" aria-label="认证模式">
          <button class="mode-tab" :class="{ active: isLoginMode }" @click="switchMode('login')">登录</button>
          <button class="mode-tab" :class="{ active: !isLoginMode }" @click="switchMode('register')">注册</button>
        </div>
        <p class="head-badge">Email + Captcha</p>
        <h2>{{ headTitle }}</h2>
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
          <small class="input-tip" :class="{ error: form.email && !isEmailValid }">
            {{ form.email && !isEmailValid ? "邮箱格式不正确" : "邮箱用于发送验证码" }}
          </small>
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
          <small class="input-tip" :class="{ error: form.captchaCode && !isCaptchaValid }">
            {{
              form.captchaCode && !isCaptchaValid
                ? "图形验证码应为 4~8 位字母数字"
                : `看不清可点击图片刷新${captcha.expireSeconds ? `（${captcha.expireSeconds}s 过期）` : ""}`
            }}
          </small>
        </label>

        <UiButton class="submit-btn" type="submit" :disabled="!canSubmit">
          {{ submitButtonText }}
        </UiButton>
      </form>

      <UiStatus class="feedback-text" :tone="feedbackTone">
        {{ feedback.message || "请先获取邮箱验证码，再完成登录或注册。" }}
      </UiStatus>

      <div v-if="isAuthenticated" class="user-card">
        <p class="user-title">当前登录状态</p>
        <p><strong>ID</strong><span>{{ me?.id || "-" }}</span></p>
        <p><strong>邮箱</strong><span>{{ me?.email || "-" }}</span></p>
        <p><strong>昵称</strong><span>{{ me?.nickname || "-" }}</span></p>
        <div class="action-row">
          <UiButton type="button" variant="ghost" size="sm" class="secondary-btn" @click="router.push('/')">进入系统</UiButton>
          <UiButton type="button" variant="ghost" size="sm" class="secondary-btn" @click="onLogout">退出登录</UiButton>
        </div>
      </div>
    </UiCard>
  </section>
</template>

<style scoped>
.login-stage {
  display: grid;
  grid-template-columns: minmax(320px, 1.15fr) minmax(320px, 0.85fr);
  gap: 18px;
}

.story-panel,
.auth-panel {
  position: relative;
  overflow: hidden;
  border-radius: 28px;
  border: 1px solid var(--ag-border-strong);
  box-shadow: var(--ag-shadow-panel);
}

.story-panel {
  padding: 28px;
  background: var(--ag-login-story-bg, var(--ag-surface-hero));
}

.story-panel::after {
  content: "";
  position: absolute;
  right: -60px;
  bottom: -90px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  border: 1px dashed var(--ag-border-soft);
}

.story-kicker {
  margin: 0;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 12px;
  color: var(--ag-eyebrow);
}

.story-panel h1 {
  margin: 10px 0 14px;
  font-size: clamp(28px, 4.2vw, 44px);
  line-height: 1.15;
  max-width: 12em;
}

.story-subtitle {
  margin: 0;
  max-width: 32em;
  color: var(--ag-text-soft);
}

.story-list {
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 12px;
}

.story-item {
  display: grid;
  grid-template-columns: 54px 1fr;
  gap: 10px;
  padding: 12px;
  border-radius: 15px;
  border: 1px solid var(--ag-border-soft);
  background: var(--ag-btn-ghost-bg);
  border-left: 2px solid rgba(230, 0, 8, 0.58);
}

.item-id {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border-radius: 999px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(140deg, #ff6d4c, #e60008);
}

.story-item h3 {
  margin: 0;
  font-size: 20px;
  text-transform: uppercase;
  font-family: "Barlow Condensed", "Noto Sans SC", sans-serif;
}

.story-item p {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--ag-text-muted);
}

.tag-row {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-pill {
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 999px;
  border: 1px solid rgba(230, 0, 8, 0.35);
  background: rgba(230, 0, 8, 0.13);
  color: var(--ag-text-strong);
}

.auth-panel {
  padding: 26px 24px;
  background: var(--ag-login-auth-bg, var(--ag-surface-panel));
}

.mode-tabs {
  display: inline-flex;
  border-radius: 999px;
  border: 1px solid var(--ag-border-soft);
  overflow: hidden;
}

.mode-tab {
  border: none;
  background: transparent;
  color: var(--ag-text-soft);
  padding: 6px 14px;
  cursor: pointer;
  font-family: "Barlow Condensed", "Noto Sans SC", sans-serif;
  font-size: 15px;
  text-transform: uppercase;
}

.mode-tab.active {
  background: linear-gradient(140deg, #ff6d4c, #e60008);
  color: #ffffff;
}

.head-badge {
  margin: 10px 0 0;
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ag-eyebrow);
}

.auth-head h2 {
  margin: 8px 0 10px;
  font-size: 40px;
  text-transform: uppercase;
  font-family: "Barlow Condensed", "Noto Sans SC", sans-serif;
}

.auth-head p {
  margin: 0;
  color: var(--ag-text-soft);
}

.auth-form {
  margin-top: 18px;
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

.input-tip {
  margin: 0;
  font-size: 12px;
  color: var(--ag-text-muted);
}

.input-tip.error {
  color: var(--ag-danger-text);
}

.submit-btn {
  margin-top: 2px;
  padding: 12px 16px;
  font-size: 15px;
}

.feedback-text {
  margin: 14px 0 0;
}

.user-card {
  margin-top: 14px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid var(--ag-border-soft);
  background: var(--ag-btn-ghost-bg);
  border-left: 2px solid rgba(230, 0, 8, 0.58);
}

.user-title {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--ag-text-soft);
}

.user-card p {
  margin: 6px 0;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
}

.user-card strong {
  font-weight: 600;
  color: var(--ag-text-soft);
}

.action-row {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.secondary-btn {
  border-radius: 999px;
}

.reveal {
  animation: rise-up 0.55s ease both;
}

.reveal-2 {
  animation-delay: 0.08s;
}

@keyframes rise-up {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 980px) {
  .login-stage {
    grid-template-columns: 1fr;
  }

  .story-panel,
  .auth-panel {
    border-radius: 20px;
  }

  .story-panel h1 {
    max-width: none;
  }
}

@media (max-width: 640px) {
  .story-panel,
  .auth-panel {
    padding: 20px 18px;
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
