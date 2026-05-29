import { defineStore } from "pinia";
import {
  createOrGetDm,
  fetchConversations,
  fetchMessages,
  markConversationRead,
  sendMessageByHttp
} from "@/api/modules/chat";
import { fetchDiscoverUsers } from "@/api/modules/user";
import { wsClient } from "@/api/ws-client";
import { useAuthStore } from "./auth";
import { normalizeErrorMessage } from "@/utils/error";
import { i18n } from "@/i18n";

function toMillis(value) {
  if (!value) {
    return 0;
  }
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

export const useChatStore = defineStore("chat", {
  state: () => ({
    conversations: [],
    discoverUsers: [],
    currentConversationId: null,
    nextCursor: null,
    hasMore: false,
    loading: false,
    loadingMore: false,
    loadingDiscoverUsers: false,
    loadingMessagesByConversation: {},
    messageHasMoreByConversation: {},
    messagesByConversation: {},
    wsBound: false,
    connected: false,
    error: null
  }),
  actions: {
    async bootstrap() {
      await Promise.all([this.loadConversations({ reset: true }), this.loadDiscoverUsers()]);
      this.bindWsEvents();
      wsClient.connect();
    },

    bindWsEvents() {
      if (this.wsBound) {
        return;
      }
      const store = this;
      this._wsHandlers = {
        status: (payload) => store.onWsStatus(payload),
        dmNew: (payload) => store.onWsDmNew(payload),
        convUnread: (payload) => store.onWsConvUnread(payload),
        convReadSync: (payload) => store.onWsConvReadSync(payload),
        error: (payload) => store.onWsError(payload)
      };
      wsClient.on("__status__", this._wsHandlers.status);
      wsClient.on("dm.new", this._wsHandlers.dmNew);
      wsClient.on("conv.unread", this._wsHandlers.convUnread);
      wsClient.on("conv.read.sync", this._wsHandlers.convReadSync);
      wsClient.on("error", this._wsHandlers.error);
      this.wsBound = true;
    },

    unbindWsEvents() {
      if (!this.wsBound || !this._wsHandlers) {
        return;
      }
      wsClient.off("__status__", this._wsHandlers.status);
      wsClient.off("dm.new", this._wsHandlers.dmNew);
      wsClient.off("conv.unread", this._wsHandlers.convUnread);
      wsClient.off("conv.read.sync", this._wsHandlers.convReadSync);
      wsClient.off("error", this._wsHandlers.error);
      this._wsHandlers = null;
      this.wsBound = false;
    },

    teardown() {
      this.unbindWsEvents();
      wsClient.disconnect();
      this.connected = false;
    },

    onWsStatus: function onWsStatus(payload) {
      if (!payload?.type) {
        return;
      }
      if (payload.type === "open") {
        this.connected = true;
        this.error = null;
        return;
      }
      if (payload.type === "close" || payload.type === "error") {
        this.connected = false;
        return;
      }
      if (payload.type === "reconnect_exhausted") {
        this.connected = false;
        this.error = i18n.global.t("chat.reconnectExhausted");
      }
    },

    onWsError: function onWsError(payload) {
      const message = payload?.data?.message;
      if (message) {
        this.error = message;
      }
    },

    onWsDmNew: function onWsDmNew(payload) {
      const message = payload?.data?.message;
      if (!message?.conversationId) {
        return;
      }
      this.upsertMessage(message.conversationId, message);
      this.bumpConversation(message.conversationId, {
        lastMessage: message.content,
        updatedAt: message.createdAt
      });

      if (!message.mine && this.currentConversationId === message.conversationId) {
        this.markConversationAsRead(message.conversationId, message.messageId);
      }
    },

    onWsConvUnread: function onWsConvUnread(payload) {
      const data = payload?.data;
      if (!data?.conversationId) {
        return;
      }
      const target = this.conversations.find((item) => item.conversationId === data.conversationId);
      if (target) {
        target.unread = Number(data.unread || 0);
      }
    },

    onWsConvReadSync: function onWsConvReadSync(payload) {
      const data = payload?.data;
      if (!data?.conversationId) {
        return;
      }
      this.bumpConversation(data.conversationId, {});
    },

    async loadDiscoverUsers() {
      this.loadingDiscoverUsers = true;
      this.error = null;
      try {
        this.discoverUsers = await fetchDiscoverUsers({ limit: 50 });
      } catch (error) {
        this.error = normalizeErrorMessage(error, "加载可聊天用户失败");
      } finally {
        this.loadingDiscoverUsers = false;
      }
    },

    async loadConversations({ reset = true, limit = 20 } = {}) {
      if (reset) {
        this.loading = true;
      } else {
        if (!this.hasMore || !this.nextCursor || this.loadingMore) {
          return;
        }
        this.loadingMore = true;
      }
      this.error = null;
      try {
        const cursor = reset ? null : this.nextCursor;
        const result = await fetchConversations({ cursor, limit });
        if (reset) {
          this.conversations = result.list || [];
        } else {
          const map = new Map(this.conversations.map((item) => [item.conversationId, item]));
          (result.list || []).forEach((item) => map.set(item.conversationId, item));
          this.conversations = Array.from(map.values());
        }
        this.conversations = this.conversations
          .slice()
          .sort((a, b) => toMillis(b.updatedAt) - toMillis(a.updatedAt));
        this.nextCursor = result.nextCursor || null;
        this.hasMore = Boolean(result.hasMore);
        if (!this.currentConversationId && this.conversations.length) {
          this.currentConversationId = this.conversations[0].conversationId;
        }
      } catch (error) {
        this.error = normalizeErrorMessage(error, "加载会话列表失败");
        throw error;
      } finally {
        this.loading = false;
        this.loadingMore = false;
      }
    },

    async createOrOpenConversation(targetUserId) {
      this.error = null;
      try {
        const result = await createOrGetDm({ targetUserId });
        const conversationId = result.conversationId;
        if (!this.conversations.some((item) => item.conversationId === conversationId)) {
          await this.loadConversations({ reset: true });
        }
        await this.openConversation(conversationId);
        return conversationId;
      } catch (error) {
        this.error = normalizeErrorMessage(error, "创建会话失败");
        throw error;
      }
    },

    async openConversation(conversationId) {
      this.currentConversationId = conversationId;
      if (!(this.messagesByConversation[conversationId] || []).length) {
        await this.loadMessages(conversationId, { reset: true });
      }
      const lastMessage = (this.messagesByConversation[conversationId] || []).slice(-1)[0];
      if (lastMessage && !lastMessage.mine) {
        await this.markConversationAsRead(conversationId, lastMessage.messageId);
      }
    },

    async loadMessages(conversationId, { beforeId = null, limit = 30, reset = true } = {}) {
      if (this.loadingMessagesByConversation[conversationId]) {
        return;
      }
      this.loadingMessagesByConversation[conversationId] = true;
      this.error = null;
      try {
        const result = await fetchMessages(conversationId, { beforeId, limit });
        const nextRows = result.list || [];
        const currentRows = this.messagesByConversation[conversationId] || [];
        const merged = reset ? nextRows : nextRows.concat(currentRows);
        const map = new Map();
        merged.forEach((item) => {
          const key = item.messageId || item.clientMsgId;
          map.set(key, item);
        });
        const deduped = Array.from(map.values()).sort(
          (a, b) => toMillis(a.createdAt) - toMillis(b.createdAt)
        );
        this.messagesByConversation[conversationId] = deduped;
        this.messageHasMoreByConversation[conversationId] = Boolean(result.hasMore);
      } catch (error) {
        this.error = normalizeErrorMessage(error, "加载消息失败");
        throw error;
      } finally {
        this.loadingMessagesByConversation[conversationId] = false;
      }
    },

    async loadOlderMessages(conversationId) {
      const rows = this.messagesByConversation[conversationId] || [];
      if (!rows.length) {
        return;
      }
      const first = rows[0];
      if (!first?.messageId) {
        return;
      }
      await this.loadMessages(conversationId, {
        beforeId: first.messageId,
        reset: false
      });
    },

    async sendMessage(content) {
      const text = (content || "").trim();
      if (!text || !this.currentConversationId) {
        return;
      }
      const authStore = useAuthStore();
      const me = authStore.me;
      const clientMsgId = `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
      const tempMessage = {
        messageId: `temp-${clientMsgId}`,
        conversationId: this.currentConversationId,
        senderId: me?.id || 0,
        senderName: me?.nickname || "我",
        senderAvatarUrl: me?.avatarUrl || "",
        clientMsgId,
        content: text,
        contentType: "text",
        createdAt: new Date().toISOString(),
        mine: true
      };
      this.upsertMessage(this.currentConversationId, tempMessage);
      this.bumpConversation(this.currentConversationId, {
        lastMessage: text,
        updatedAt: tempMessage.createdAt
      });

      const sentByWs = wsClient.send("dm.send", {
        conversationId: this.currentConversationId,
        clientMsgId,
        content: text,
        contentType: "text"
      });

      if (sentByWs) {
        return;
      }

      try {
        await sendMessageByHttp({
          conversationId: this.currentConversationId,
          clientMsgId,
          content: text,
          contentType: "text"
        });
        await this.loadMessages(this.currentConversationId, { reset: true });
      } catch (error) {
        this.error = normalizeErrorMessage(error, "发送消息失败");
        throw error;
      }
    },

    async markConversationAsRead(conversationId, lastReadMessageId) {
      if (!conversationId || !lastReadMessageId) {
        return;
      }
      try {
        const result = await markConversationRead(conversationId, { lastReadMessageId });
        const target = this.conversations.find((item) => item.conversationId === conversationId);
        if (target) {
          target.unread = Number(result.unread || 0);
        }
      } catch (error) {
        this.error = normalizeErrorMessage(error, "同步已读状态失败");
      }
    },

    upsertMessage(conversationId, nextMessage) {
      const currentRows = this.messagesByConversation[conversationId] || [];
      const replacedRows = currentRows.map((item) => {
        if (item.messageId === nextMessage.messageId) {
          return nextMessage;
        }
        if (
          String(item.messageId || "").startsWith("temp-") &&
          item.clientMsgId &&
          nextMessage.clientMsgId &&
          item.clientMsgId === nextMessage.clientMsgId
        ) {
          return nextMessage;
        }
        return item;
      });
      const exists = replacedRows.some((item) => item.messageId === nextMessage.messageId);
      const merged = exists ? replacedRows : replacedRows.concat(nextMessage);
      merged.sort((a, b) => toMillis(a.createdAt) - toMillis(b.createdAt));
      this.messagesByConversation[conversationId] = merged;
    },

    bumpConversation(conversationId, payload) {
      const index = this.conversations.findIndex((item) => item.conversationId === conversationId);
      if (index < 0) {
        return;
      }
      const next = {
        ...this.conversations[index],
        ...payload
      };
      const rows = this.conversations.slice();
      rows.splice(index, 1);
      rows.unshift(next);
      this.conversations = rows;
    }
  }
});
