<script setup>
import { computed, onMounted, reactive } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "../composables/useI18n";
import UiButton from "../components/ui/UiButton.vue";
import UiCard from "../components/ui/UiCard.vue";
import UiInput from "../components/ui/UiInput.vue";
import UiStatus from "../components/ui/UiStatus.vue";
import { useChatStore } from "../stores/chat";

const chatStore = useChatStore();
const { t } = useI18n();
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

function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString(t("chat.dateLocale"), { hour12: false });
}

async function onOpenConversation(conversationId) {
  await chatStore.openConversation(conversationId);
}

async function onCreateConversation(targetUserId) {
  const parsed = Number(targetUserId);
  if (!parsed || parsed <= 0) {
    return;
  }
  await chatStore.createOrOpenConversation(parsed);
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
});
</script>

<template>
  <UiCard variant="hero" compact class="chat-hero">
    <p class="eyebrow">M4 Chat</p>
    <h1>{{ t("chat.heroTitle") }}</h1>
    <p class="subtitle">{{ t("chat.heroSubtitle") }}</p>
    <div class="hero-actions row-actions">
      <UiStatus :tone="connected ? 'success' : 'muted'">
        {{ connected ? t("chat.wsConnected") : t("chat.wsDisconnected") }}
      </UiStatus>
    </div>
  </UiCard>

  <section class="chat-layout">
    <UiCard as="article" variant="panel" class="chat-side">
      <div class="side-head">
        <h2>{{ t("chat.startConversation") }}</h2>
        <UiButton variant="ghost" size="sm" :disabled="loadingDiscoverUsers" @click="chatStore.loadDiscoverUsers()">
          {{ loadingDiscoverUsers ? t("chat.refreshing") : t("chat.refreshCandidates") }}
        </UiButton>
      </div>

      <div class="form-grid">
        <label class="field">
          <span>{{ t("chat.startByUserId") }}</span>
          <div class="quick-line">
            <UiInput
              :model-value="form.targetUserId"
              :placeholder="t('chat.targetUserPlaceholder')"
              @update:model-value="(value) => (form.targetUserId = value)"
              @keyup.enter="onCreateConversation(form.targetUserId)"
            />
            <UiButton variant="ghost" @click="onCreateConversation(form.targetUserId)">{{ t("chat.start") }}</UiButton>
          </div>
        </label>
      </div>

      <ul class="discover-list">
        <li v-for="user in discoverUsers" :key="user.userId">
          <button class="discover-btn" @click="onCreateConversation(user.userId)">
            <strong>{{ user.nickname }}</strong>
            <small>{{ t("chat.idPrefix") }} {{ user.userId }}</small>
          </button>
        </li>
      </ul>
    </UiCard>

    <UiCard as="article" variant="panel" class="chat-main">
      <div class="main-head">
        <h2>{{ t("chat.conversationList") }}</h2>
        <UiButton variant="ghost" size="sm" :disabled="loading" @click="chatStore.loadConversations({ reset: true })">
          {{ loading ? t("chat.loading") : t("chat.refreshConversation") }}
        </UiButton>
      </div>

      <UiStatus v-if="error" tone="error">{{ error }}</UiStatus>
      <div v-if="!conversations.length" class="empty-tip">{{ t("chat.emptyConversation") }}</div>
      <ul class="conversation-list">
        <li v-for="item in conversations" :key="item.conversationId">
          <button
            class="conversation-btn"
            :class="{ active: item.conversationId === currentConversationId }"
            @click="onOpenConversation(item.conversationId)"
          >
            <div>
              <strong>{{ item.peerNickname }}</strong>
              <small>{{ item.lastMessage || t("chat.noMessage") }}</small>
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
          {{ loadingMore ? t("chat.loading") : t("chat.loadMoreConversations") }}
        </UiButton>
      </div>

      <hr class="split" />

      <div v-if="currentConversation" class="message-panel">
        <header class="message-head">
          <h3>{{ t("chat.conversationWith", { name: currentConversation.peerNickname }) }}</h3>
          <UiButton
            variant="text"
            :disabled="!messageHasMoreByConversation[currentConversationId]"
            @click="onLoadOlder"
          >
            {{ loadingMessagesByConversation[currentConversationId] ? t("chat.loading") : t("chat.loadOlder") }}
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
            :placeholder="t('chat.inputPlaceholder')"
            @update:model-value="(value) => (form.message = value)"
            @keyup.enter="onSendMessage"
          />
          <UiButton :disabled="!canSend" @click="onSendMessage">{{ t("chat.send") }}</UiButton>
        </div>
      </div>
      <UiStatus v-else tone="muted">{{ t("chat.chooseConversation") }}</UiStatus>
    </UiCard>
  </section>
</template>

<style scoped>
.chat-hero {
  position: relative;
  overflow: hidden;
}

.chat-hero::after {
  content: "";
  position: absolute;
  width: 220px;
  height: 220px;
  right: -90px;
  top: -120px;
  border-radius: 50%;
  background: rgba(17, 24, 39, 0.05);
}

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
  margin-bottom: 8px;
}

.side-head h2,
.main-head h2,
.message-head h3 {
  margin: 0;
  font-family: "Inter", "Segoe UI", sans-serif;
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
  border: 1px solid var(--ag-border);
  border-radius: 14px;
  background: #ffffff;
  color: var(--ag-text-soft);
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
  border-color: #d0d6dc;
  background: var(--ag-bg-soft);
  box-shadow: none;
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
  color: #ffffff;
  background: var(--ag-accent);
}

.split {
  margin: 14px 0;
  border: none;
  border-top: 1px solid var(--ag-border);
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
  padding: 9px 12px;
  border-radius: 13px;
  border: 1px solid var(--ag-border);
  background: #ffffff;
}

.message-list li.mine .bubble {
  border-color: #c7cde2;
  background: var(--ag-accent-soft);
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
