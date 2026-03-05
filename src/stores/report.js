import { defineStore } from "pinia";
import { createReport } from "../api/modules/report";

function normalizeErrorMessage(error, fallbackText) {
  if (!error) {
    return fallbackText;
  }
  return error.message || fallbackText;
}

export const useReportStore = defineStore("report", {
  state: () => ({
    submittingTargetKeyMap: {},
    feedbackByTargetKey: {}
  }),
  actions: {
    async submitReport({ targetType, targetId, reason, detail = "" }) {
      const targetKey = `${targetType}-${targetId}`;
      this.submittingTargetKeyMap = {
        ...this.submittingTargetKeyMap,
        [targetKey]: true
      };
      this.feedbackByTargetKey = {
        ...this.feedbackByTargetKey,
        [targetKey]: ""
      };
      try {
        const result = await createReport({
          targetType,
          targetId,
          reason,
          detail
        });
        this.feedbackByTargetKey = {
          ...this.feedbackByTargetKey,
          [targetKey]: `举报已提交（#${result.reportId}）`
        };
        return result;
      } catch (error) {
        const message = normalizeErrorMessage(error, "举报提交失败");
        this.feedbackByTargetKey = {
          ...this.feedbackByTargetKey,
          [targetKey]: message
        };
        throw error;
      } finally {
        this.submittingTargetKeyMap = {
          ...this.submittingTargetKeyMap,
          [targetKey]: false
        };
      }
    },

    clearFeedback(targetType, targetId) {
      const targetKey = `${targetType}-${targetId}`;
      this.feedbackByTargetKey = {
        ...this.feedbackByTargetKey,
        [targetKey]: ""
      };
    }
  }
});
