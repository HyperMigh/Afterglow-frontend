import { defineStore } from "pinia";
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken
} from "../api/client";
import { fetchMe, loginByEmailCode, sendEmailCode } from "../api/modules/auth";

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
    error: null
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token)
  },
  actions: {
    async sendCode(email) {
      this.sendingCode = true;
      this.error = null;
      try {
        return await sendEmailCode({ email });
      } catch (error) {
        this.error = normalizeErrorMessage(error, "发送验证码失败");
        throw error;
      } finally {
        this.sendingCode = false;
      }
    },

    async login(email, code) {
      this.loggingIn = true;
      this.error = null;
      try {
        const result = await loginByEmailCode({ email, code });
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
