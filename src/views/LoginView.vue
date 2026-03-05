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
const { isAuthenticated, me, sendingCode, loggingIn } = storeToRefs(authStore);
const router = useRouter();
const route = useRoute();

const form = reactive({
  email: "",
  code: ""
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
    title: "首屏叙事感",
    description: "借鉴 Awwwards、CSS Design Awards 的思路，让登录页先建立情绪，再进入操作。"
  },
  {
    id: "02",
    title: "操作路径极短",
    description: "参考 Mobbin、Collect UI 的高转化结构，把邮箱+验证码压缩到一屏闭环。"
  },
  {
    id: "03",
    title: "可见反馈",
    description: "吸收 Dribbble、Behance 常见微交互，按钮状态和消息提示都即时可见。"
  }
];

const inspirationTags = [
  "Awwwards",
  "CSS Design Awards",
  "Behance",
  "Dribbble",
  "Mobbin",
  "Collect UI"
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_PATTERN = /^\d{4,8}$/;

const isEmailValid = computed(() => EMAIL_PATTERN.test(form.email.trim()));
const isCodeValid = computed(() => CODE_PATTERN.test(form.code.trim()));
const canSendCode = computed(() => isEmailValid.value && cooldown.value <= 0 && !sendingCode.value);
const canLogin = computed(() => isEmailValid.value && isCodeValid.value && !loggingIn.value);
const feedbackTone = computed(() => (feedback.message ? feedback.type : "muted"));
const sendCodeButtonText = computed(() => {
  if (sendingCode.value) {
    return "发送中...";
  }
  if (cooldown.value > 0) {
    return `重新发送 (${cooldown.value}s)`;
  }
  return "获取验证码";
});

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

async function onSendCode() {
  if (!isEmailValid.value) {
    setFeedback("error", "请输入正确的邮箱地址");
    return;
  }
  try {
    const result = await authStore.sendCode(form.email.trim());
    const cooldownSeconds = Math.min(90, Math.max(30, Number(result.expireSeconds) || 60));
    startCooldown(cooldownSeconds);
    setFeedback("success", `验证码已发送，有效期 ${result.expireSeconds} 秒`);
  } catch (error) {
    setFeedback("error", authStore.error || error.message || "发送验证码失败");
  }
}

async function onLogin() {
  if (!isEmailValid.value) {
    setFeedback("error", "请输入正确的邮箱地址");
    return;
  }
  if (!isCodeValid.value) {
    setFeedback("error", "验证码必须是 4~8 位数字");
    return;
  }
  try {
    await authStore.login(form.email.trim(), form.code.trim());
    setFeedback("success", "登录成功，正在跳转...");
    await router.replace(normalizeRedirect());
  } catch (error) {
    setFeedback("error", authStore.error || error.message || "登录失败");
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

onMounted(() => {
  ensureMe();
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
      <h1>让「登录」从表单动作，变成有记忆点的开场。</h1>
      <p class="story-subtitle">
        这个版本基于你给的灵感站点文章做了提炼：先建立品牌情绪，再缩短操作路径，最后用即时反馈保证可用性。
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
        <p class="head-badge">Email Code Login</p>
        <h2>欢迎回来</h2>
        <p>输入邮箱并验证，即可继续访问社区动态与互动模块。</p>
      </header>

      <form class="auth-form" @submit.prevent="onLogin">
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
            {{ form.email && !isEmailValid ? "邮箱格式不正确" : "用于发送一次性登录验证码" }}
          </small>
        </label>

        <label class="input-group">
          <span>验证码</span>
          <div class="code-line">
            <UiInput
              :model-value="form.code"
              :invalid="form.code && !isCodeValid"
              type="text"
              placeholder="4~8 位数字"
              maxlength="8"
              @update:model-value="(value) => (form.code = value)"
              @keyup.enter="onLogin"
            />
            <UiButton type="button" class="code-btn" :disabled="!canSendCode" @click="onSendCode">
              {{ sendCodeButtonText }}
            </UiButton>
          </div>
          <small class="input-tip" :class="{ error: form.code && !isCodeValid }">
            {{ form.code && !isCodeValid ? "验证码必须是 4~8 位数字" : "本地开发时验证码会出现在后端日志" }}
          </small>
        </label>

        <UiButton class="submit-btn" type="submit" :disabled="!canLogin">
          {{ loggingIn ? "登录中..." : "进入 Afterglow" }}
        </UiButton>
      </form>

      <UiStatus class="feedback-text" :tone="feedbackTone">
        {{ feedback.message || "首次登录会自动创建账号，后续可在用户模块完善资料。" }}
      </UiStatus>

      <div v-if="isAuthenticated" class="user-card">
        <p class="user-title">当前登录状态</p>
        <p><strong>ID</strong><span>{{ me?.id || "-" }}</span></p>
        <p><strong>邮箱</strong><span>{{ me?.email || "-" }}</span></p>
        <p><strong>昵称</strong><span>{{ me?.nickname || "-" }}</span></p>
        <div class="action-row">
          <UiButton type="button" variant="ghost" size="sm" class="secondary-btn" @click="router.push('/feed')">
            进入 Feed
          </UiButton>
          <UiButton type="button" variant="ghost" size="sm" class="secondary-btn" @click="onLogout">
            退出登录
          </UiButton>
        </div>
      </div>
      <div v-else class="action-row">
        <UiButton type="button" variant="ghost" size="sm" class="secondary-btn" @click="router.push('/')">
          返回首页
        </UiButton>
        <UiButton type="button" variant="ghost" size="sm" class="secondary-btn" @click="router.push('/roadmap')">
          查看路线图
        </UiButton>
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

.head-badge {
  margin: 0;
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

.code-line {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

.code-btn {
  padding: 0 14px;
  min-width: 126px;
  border-radius: 999px;
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

  .code-line {
    grid-template-columns: 1fr;
  }

  .code-btn,
  .submit-btn {
    width: 100%;
    min-height: 42px;
  }
}
</style>
