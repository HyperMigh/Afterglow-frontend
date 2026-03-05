<script setup>
import { computed, onMounted, reactive } from "vue";
import { storeToRefs } from "pinia";
import UiButton from "../components/ui/UiButton.vue";
import UiCard from "../components/ui/UiCard.vue";
import UiInput from "../components/ui/UiInput.vue";
import UiStatus from "../components/ui/UiStatus.vue";
import { useChatStore } from "../stores/chat";
import { useEmotionStore } from "../stores/emotion";

const chatStore = useChatStore();
const emotionStore = useEmotionStore();
const {
  conversations,
  discoverUsers,
  currentConversationId,
  loading,
  loadingDiscoverUsers,
  loadingMore,
  hasMore,
  connected,
  messagesByConversation,
  messageHasMoreByConversation,
  loadingMessagesByConversation,
  error
} = storeToRefs(chatStore);

const form = reactive({
  targetUserId: "",
  message: ""
});

const currentConversation = computed(() =>
  conversations.value.find((item) => item.conversationId === currentConversationId.value) || null
);
const currentMessages = computed(() => messagesByConversation.value[currentConversationId.value] || []);
const canSend = computed(() => Boolean(currentConversationId.value && form.message.trim()));
const conversationPalette = computed(
  () => emotionStore.paletteByTargetKey[`conversation-${currentConversationId.value}`]?.palette || null
);

function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString("zh-CN", { hour12: false });
}

function conversationStyle() {
  const palette = conversationPalette.value;
  const stops = palette?.bg?.stops || null;
  const angle = Number(palette?.bg?.angle || 135);
  if (!stops || !Array.isArray(stops) || stops.length < 2) {
    return {};
  }
  return {
    background: `linear-gradient(${angle}deg, ${stops.join(", ")})`
  };
}

async function onOpenConversation(conversationId) {
  await chatStore.openConversation(conversationId);
  await emotionStore.loadPalette("conversation", conversationId).catch(() => {});
}

async function onCreateConversation(targetUserId) {
  const parsed = Number(targetUserId);
  if (!parsed || parsed <= 0) {
    return;
  }
  await chatStore.createOrOpenConversation(parsed);
  await emotionStore.loadPalette("conversation", chatStore.currentConversationId).catch(() => {});
  form.targetUserId = "";
}

async function onSendMessage() {
  const content = form.message.trim();
  if (!content) {
    return;
  }
  await chatStore.sendMessage(content);
  form.message = "";
}

async function onLoadOlder() {
  if (!currentConversationId.value) {
    return;
  }
  await chatStore.loadOlderMessages(currentConversationId.value);
}

onMounted(async () => {
  await chatStore.bootstrap();
  if (chatStore.currentConversationId) {
    await emotionStore.loadPalette("conversation", chatStore.currentConversationId).catch(() => {});
  }
});
</script>

<template>
  <UiCard variant="hero" compact>
    <p class="eyebrow">M4 Chat</p>
    <h1>私聊会话</h1>
    <p class="subtitle">支持会话创建、消息历史、HTTP 兜底发送，以及 WebSocket 实时事件同步。</p>
    <div class="hero-actions row-actions">
      <UiStatus :tone="connected ? 'success' : 'muted'">
        {{ connected ? "WebSocket 已连接" : "WebSocket 未连接（将使用 HTTP 兜底）" }}
      </UiStatus>
    </div>
  </UiCard>

  <section class="chat-layout">
    <UiCard as="article" variant="panel" class="chat-side">
      <div class="side-head">
        <h2>发起会话</h2>
        <UiButton variant="ghost" size="sm" :disabled="loadingDiscoverUsers" @click="chatStore.loadDiscoverUsers()">
          {{ loadingDiscoverUsers ? "刷新中..." : "刷新候选用户" }}
        </UiButton>
      </div>

      <div class="form-grid">
        <label class="field">
          <span>按用户 ID 发起会话</span>
          <div class="quick-line">
            <UiInput
              :model-value="form.targetUserId"
              placeholder="输入目标用户 ID"
              @update:model-value="(value) => (form.targetUserId = value)"
              @keyup.enter="onCreateConversation(form.targetUserId)"
            />
            <UiButton variant="ghost" @click="onCreateConversation(form.targetUserId)">发起</UiButton>
          </div>
        </label>
      </div>

      <ul class="discover-list">
        <li v-for="user in discoverUsers" :key="user.userId">
          <button class="discover-btn" @click="onCreateConversation(user.userId)">
            <strong>{{ user.nickname }}</strong>
            <small>ID {{ user.userId }}</small>
          </button>
        </li>
      </ul>
    </UiCard>

    <UiCard as="article" variant="panel" class="chat-main" :style="conversationStyle()">
      <div class="main-head">
        <h2>会话列表</h2>
        <UiButton variant="ghost" size="sm" :disabled="loading" @click="chatStore.loadConversations({ reset: true })">
          {{ loading ? "加载中..." : "刷新会话" }}
        </UiButton>
      </div>

      <UiStatus v-if="error" tone="error">{{ error }}</UiStatus>
      <div v-if="!conversations.length" class="empty-tip">当前没有会话，先从左侧发起一个。</div>
      <ul class="conversation-list">
        <li v-for="item in conversations" :key="item.conversationId">
          <button
            class="conversation-btn"
            :class="{ active: item.conversationId === currentConversationId }"
            @click="onOpenConversation(item.conversationId)"
          >
            <div>
              <strong>{{ item.peerNickname }}</strong>
              <small>{{ item.lastMessage || "暂无消息" }}</small>
            </div>
            <span class="meta">
              <em v-if="item.unread">{{ item.unread }}</em>
              {{ formatDateTime(item.updatedAt) }}
            </span>
          </button>
        </li>
      </ul>

      <div class="hero-actions" v-if="hasMore">
        <UiButton variant="text" :disabled="loadingMore" @click="chatStore.loadConversations({ reset: false })">
          {{ loadingMore ? "加载中..." : "加载更多会话" }}
        </UiButton>
      </div>

      <hr class="split" />

      <div v-if="currentConversation" class="message-panel">
        <header class="message-head">
          <h3>与 {{ currentConversation.peerNickname }} 的对话</h3>
          <UiButton
            variant="text"
            :disabled="!messageHasMoreByConversation[currentConversationId]"
            @click="onLoadOlder"
          >
            {{ loadingMessagesByConversation[currentConversationId] ? "加载中..." : "加载更早消息" }}
          </UiButton>
        </header>

        <ul class="message-list">
          <li v-for="message in currentMessages" :key="message.messageId" :class="{ mine: message.mine }">
            <p class="bubble">{{ message.content }}</p>
            <small>{{ message.senderName }} · {{ formatDateTime(message.createdAt) }}</small>
          </li>
        </ul>

        <div class="quick-line">
          <UiInput
            :model-value="form.message"
            placeholder="输入消息，Enter 发送"
            @update:model-value="(value) => (form.message = value)"
            @keyup.enter="onSendMessage"
          />
          <UiButton :disabled="!canSend" @click="onSendMessage">发送</UiButton>
        </div>
      </div>
      <UiStatus v-else tone="muted">请选择一个会话开始聊天。</UiStatus>
    </UiCard>
  </section>
</template>

<style scoped>
.chat-layout {
  display: grid;
  grid-template-columns: minmax(260px, 0.34fr) minmax(460px, 0.66fr);
  gap: 14px;
}

.chat-side,
.chat-main {
  min-height: 560px;
}

.side-head,
.main-head,
.message-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.quick-line {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}

.discover-list,
.conversation-list,
.message-list {
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 8px;
}

.discover-btn,
.conversation-btn {
  width: 100%;
  border: 1px solid var(--ag-border-soft);
  border-radius: 12px;
  background: var(--ag-btn-ghost-bg);
  color: var(--ag-text);
  text-align: left;
  padding: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.discover-btn:hover,
.conversation-btn:hover,
.conversation-btn.active {
  border-color: var(--ag-border-focus);
  background: var(--ag-btn-ghost-bg-hover);
}

.discover-btn small,
.conversation-btn small {
  display: block;
  margin-top: 3px;
  color: var(--ag-text-muted);
}

.meta {
  display: inline-grid;
  justify-items: end;
  gap: 4px;
  font-size: 12px;
  color: var(--ag-text-muted);
}

.meta em {
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-style: normal;
  color: var(--ag-btn-solid-text);
  background: linear-gradient(130deg, var(--ag-accent-cool), var(--ag-accent-warm));
}

.split {
  margin: 14px 0;
  border: none;
  border-top: 1px solid var(--ag-border-soft);
}

.message-list {
  max-height: 300px;
  overflow: auto;
  padding-right: 4px;
}

.message-list li {
  max-width: 72%;
}

.message-list li.mine {
  justify-self: end;
}

.bubble {
  margin: 0;
  padding: 9px 11px;
  border-radius: 12px;
  border: 1px solid var(--ag-border-soft);
  background: var(--ag-btn-ghost-bg);
}

.message-list li.mine .bubble {
  border-color: rgba(255, 201, 143, 0.55);
  background: rgba(255, 201, 143, 0.16);
}

.message-list small {
  display: block;
  margin-top: 4px;
  color: var(--ag-text-muted);
  font-size: 12px;
}

.empty-tip {
  margin-top: 10px;
  color: var(--ag-text-muted);
}

@media (max-width: 1040px) {
  .chat-layout {
    grid-template-columns: 1fr;
  }

  .chat-side,
  .chat-main {
    min-height: 0;
  }
}

@media (max-width: 640px) {
  .quick-line {
    grid-template-columns: 1fr;
  }

  .message-list li {
    max-width: 100%;
  }
}
</style>
