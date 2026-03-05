import { defineStore } from "pinia";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken
} from "../api/client";
import {
  fetchCaptcha,
  fetchMe,
  loginByEmailCode,
  registerByEmailCode,
  sendEmailCode
} from "../api/modules/auth";

function normalizeErrorMessage(error, fallbackText) {
  if (!error) {
    return fallbackText;
  }
  return error.message || fallbackText;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: getStoredAccessToken(),
    me: null,
    loading: false,
    sendingCode: false,
    loggingIn: false,
    registering: false,
    captchaLoading: false,
    error: null
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token)
  },
  actions: {
    async loadCaptcha() {
      this.captchaLoading = true;
      this.error = null;
      try {
        return await fetchCaptcha();
      } catch (error) {
        this.error = normalizeErrorMessage(error, "获取图形验证码失败");
        throw error;
      } finally {
        this.captchaLoading = false;
      }
    },

    async sendCode(payload) {
      this.sendingCode = true;
      this.error = null;
      try {
        return await sendEmailCode(payload);
      } catch (error) {
        this.error = normalizeErrorMessage(error, "发送邮箱验证码失败");
        throw error;
      } finally {
        this.sendingCode = false;
      }
    },

    async login(payload) {
      this.loggingIn = true;
      this.error = null;
      try {
        const result = await loginByEmailCode(payload);
        this.token = result.accessToken;
        setStoredAccessToken(result.accessToken);
        this.me = result.user;
        return result;
      } catch (error) {
        this.error = normalizeErrorMessage(error, "登录失败");
        throw error;
      } finally {
        this.loggingIn = false;
      }
    },

    async register(payload) {
      this.registering = true;
      this.error = null;
      try {
        const result = await registerByEmailCode(payload);
        this.token = result.accessToken;
        setStoredAccessToken(result.accessToken);
        this.me = result.user;
        return result;
      } catch (error) {
        this.error = normalizeErrorMessage(error, "注册失败");
        throw error;
      } finally {
        this.registering = false;
      }
    },

    async loadMe() {
      if (!this.token) {
        return null;
      }
      this.loading = true;
      this.error = null;
      try {
        const me = await fetchMe();
        this.me = me;
        return me;
      } catch (error) {
        this.error = normalizeErrorMessage(error, "获取当前用户失败");
        if (error.bizCode === 1002 || error.httpStatus === 401) {
          this.logout();
        }
        throw error;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.token = null;
      this.me = null;
      this.error = null;
      clearStoredAccessToken();
    }
  }
});
