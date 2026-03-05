<script setup>
import { reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const form = reactive({
  email: "",
  code: ""
});

const tips = reactive({
  message: ""
});

function normalizeRedirect() {
  const redirect = route.query.redirect;
  if (typeof redirect === "string" && redirect.startsWith("/")) {
    return redirect;
  }
  return "/";
}

async function onSendCode() {
  if (!form.email.trim()) {
    tips.message = "请输入邮箱";
    return;
  }
  try {
    const result = await authStore.sendCode(form.email.trim());
    tips.message = `验证码已发送（有效期 ${result.expireSeconds} 秒）`;
  } catch (error) {
    tips.message = authStore.error || error.message || "发送验证码失败";
  }
}

async function onLogin() {
  if (!form.email.trim() || !form.code.trim()) {
    tips.message = "请输入邮箱和验证码";
    return;
  }
  try {
    await authStore.login(form.email.trim(), form.code.trim());
    await router.replace(normalizeRedirect());
  } catch (error) {
    tips.message = authStore.error || error.message || "登录失败";
  }
}
</script>

<template>
  <section class="hero-card compact">
    <p class="eyebrow">M1 Auth</p>
    <h1>邮箱验证码登录</h1>
    <p class="subtitle">
      当前为初步开发版。后端已提供 `/api/auth/email/code` 和 `/api/auth/email/login`，可用于本地联调。
    </p>
  </section>

  <section class="grid single">
    <article class="panel">
      <h2>登录表单</h2>
      <div class="form-grid">
        <label class="field">
          <span>邮箱</span>
          <input v-model="form.email" type="email" placeholder="you@example.com" />
        </label>
        <label class="field">
          <span>验证码</span>
          <input v-model="form.code" type="text" placeholder="6位验证码" />
        </label>
      </div>
      <div class="hero-actions row-actions">
        <button class="btn-primary" :disabled="authStore.sendingCode" @click="onSendCode">
          {{ authStore.sendingCode ? "发送中..." : "发送验证码" }}
        </button>
        <button class="btn-primary ghost" :disabled="authStore.loggingIn" @click="onLogin">
          {{ authStore.loggingIn ? "登录中..." : "登录" }}
        </button>
      </div>
      <p v-if="tips.message" class="muted">{{ tips.message }}</p>
    </article>
  </section>
</template>
