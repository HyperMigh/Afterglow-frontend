<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/auth";

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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_PATTERN = /^\d{4,8}$/;

const isEmailValid = computed(() => EMAIL_PATTERN.test(form.email.trim()));
const isCodeValid = computed(() => CODE_PATTERN.test(form.code.trim()));
const canSendCode = computed(() => isEmailValid.value && cooldown.value <= 0 && !sendingCode.value);
const canLogin = computed(() => isEmailValid.value && isCodeValid.value && !loggingIn.value);
const sendCodeButtonText = computed(() => {
  if (sendingCode.value) {
    return "发送中...";
  }
  if (cooldown.value > 0) {
    return `重新发送(${cooldown.value}s)`;
  }
  return "发送验证码";
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
    setFeedback("success", `验证码已发送（有效期 ${result.expireSeconds} 秒）`);
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
  <section class="hero-card compact">
    <p class="eyebrow">M1 Auth</p>
    <h1>账号登录中心</h1>
    <p class="subtitle">
      输入邮箱获取验证码并登录。登录成功后可直接进入 Feed 页面体验发帖、评论、点赞。
    </p>
  </section>

  <section class="grid single">
    <article class="panel login-layout">
      <div class="login-main">
        <h2>邮箱验证码登录</h2>
        <div class="form-grid">
          <label class="field">
            <span>邮箱</span>
            <input
              v-model="form.email"
              :class="{ invalid: form.email && !isEmailValid }"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
            />
            <small class="hint" :class="{ error: form.email && !isEmailValid }">
              {{ form.email && !isEmailValid ? "邮箱格式不正确" : "用于登录和身份识别" }}
            </small>
          </label>
          <label class="field">
            <span>验证码</span>
            <input
              v-model="form.code"
              :class="{ invalid: form.code && !isCodeValid }"
              type="text"
              placeholder="4~8 位数字验证码"
              maxlength="8"
              @keyup.enter="onLogin"
            />
            <small class="hint" :class="{ error: form.code && !isCodeValid }">
              {{ form.code && !isCodeValid ? "验证码必须是 4~8 位数字" : "本地调试验证码会输出到后端日志" }}
            </small>
          </label>
        </div>
        <div class="hero-actions row-actions">
          <button class="btn-primary" :disabled="!canSendCode" @click="onSendCode">
            {{ sendCodeButtonText }}
          </button>
          <button class="btn-primary ghost" :disabled="!canLogin" @click="onLogin">
            {{ loggingIn ? "登录中..." : "登录" }}
          </button>
        </div>
      </div>

      <aside class="login-side">
        <h3>当前状态</h3>
        <p class="muted" v-if="!isAuthenticated">未登录</p>
        <div v-else class="status-card">
          <p><strong>ID:</strong> {{ me?.id || "-" }}</p>
          <p><strong>邮箱:</strong> {{ me?.email || "-" }}</p>
          <p><strong>昵称:</strong> {{ me?.nickname || "-" }}</p>
          <div class="row-actions">
            <button class="btn-primary ghost" @click="router.push('/feed')">进入 Feed</button>
            <button class="btn-primary ghost" @click="onLogout">退出</button>
          </div>
        </div>
        <p class="muted">首次登录将自动创建账号。后续可在用户模块完善资料。</p>
      </aside>
    </article>
  </section>

  <section class="grid single">
    <article class="panel">
      <h2>交互反馈</h2>
      <p v-if="feedback.message" class="feedback" :class="feedback.type">{{ feedback.message }}</p>
      <p v-else class="muted">等待操作...</p>
      <div class="hero-actions row-actions">
        <button class="btn-primary ghost" @click="router.push('/')">返回首页</button>
        <button class="btn-primary ghost" @click="router.push('/roadmap')">查看路线</button>
      </div>
    </article>
  </section>
</template>
