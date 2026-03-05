import { defineStore } from "pinia";
import { fetchPalette } from "../api/modules/emotion";

function normalizeErrorMessage(error, fallbackText) {
  if (!error) {
    return fallbackText;
  }
  return error.message || fallbackText;
}

export const useEmotionStore = defineStore("emotion", {
  state: () => ({
    paletteByTargetKey: {},
    loadingByTargetKey: {},
    errorByTargetKey: {}
  }),
  actions: {
    async loadPalette(targetType, targetId, { force = false } = {}) {
      const targetKey = `${targetType}-${targetId}`;
      if (!force && this.paletteByTargetKey[targetKey]) {
        return this.paletteByTargetKey[targetKey];
      }
      if (this.loadingByTargetKey[targetKey]) {
        return this.paletteByTargetKey[targetKey] || null;
      }
      this.loadingByTargetKey = {
        ...this.loadingByTargetKey,
        [targetKey]: true
      };
      this.errorByTargetKey = {
        ...this.errorByTargetKey,
        [targetKey]: ""
      };
      try {
        const result = await fetchPalette({ targetType, targetId });
        this.paletteByTargetKey = {
          ...this.paletteByTargetKey,
          [targetKey]: result
        };
        return result;
      } catch (error) {
        this.errorByTargetKey = {
          ...this.errorByTargetKey,
          [targetKey]: normalizeErrorMessage(error, "加载情绪色板失败")
        };
        throw error;
      } finally {
        this.loadingByTargetKey = {
          ...this.loadingByTargetKey,
          [targetKey]: false
        };
      }
    }
  }
});
