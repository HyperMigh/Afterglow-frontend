<script setup>
import { computed, onMounted, reactive } from "vue";
import { storeToRefs } from "pinia";
import { useFeedStore } from "../stores/feed";
import { useReportStore } from "../stores/report";
import { useI18n } from "../composables/useI18n";
import UiButton from "../components/ui/UiButton.vue";
import UiCard from "../components/ui/UiCard.vue";
import UiInput from "../components/ui/UiInput.vue";
import UiStatus from "../components/ui/UiStatus.vue";

const feedStore = useFeedStore();
const reportStore = useReportStore();
const { t } = useI18n();
const { posts, loading, loadingMore, hasMore, publishing, error } = storeToRefs(feedStore);
const { submittingTargetKeyMap, feedbackByTargetKey } = storeToRefs(reportStore);

const composer = reactive({
  content: "",
  mediaRaw: "",
  isAnonymous: false
});

const commentPanelOpenMap = reactive({});
const reportPanelOpenMap = reactive({});
const reportFormMap = reactive({});

const contentLength = computed(() => composer.content.trim().length);
const canPublish = computed(() => contentLength.value > 0 && contentLength.value <= 2000 && !publishing.value);
const postCount = computed(() => posts.value.length);
const totalLikeCount = computed(() => posts.value.reduce((sum, post) => sum + Number(post.likeCount || 0), 0));
const totalCommentCount = computed(() => posts.value.reduce((sum, post) => sum + Number(post.commentCount || 0), 0));
const reportReasonOptions = computed(() => t("feed.reportReasons") || []);

function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  return date.toLocaleString(t("feed.dateLocale"), { hour12: false });
}

function parseMediaUrls(raw) {
  if (!raw || !raw.trim()) {
    return [];
  }
  return raw
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row.length > 0);
}

async function onPublishPost() {
  if (!canPublish.value) {
    return;
  }
  await feedStore.publishPost({
    content: composer.content.trim(),
    mediaUrls: parseMediaUrls(composer.mediaRaw),
    isAnonymous: composer.isAnonymous
  });
  composer.content = "";
  composer.mediaRaw = "";
  composer.isAnonymous = false;
}

async function onLikePost(postId) {
  await feedStore.likePost(postId);
}

async function onDeletePost(postId) {
  await feedStore.removePost(postId);
}

function reportKey(targetType, targetId) {
  return `${targetType}-${targetId}`;
}

function isReportPanelOpen(targetType, targetId) {
  return Boolean(reportPanelOpenMap[reportKey(targetType, targetId)]);
}

function ensureReportForm(targetType, targetId) {
  const key = reportKey(targetType, targetId);
  if (!reportFormMap[key]) {
    reportFormMap[key] = {
      reason: "spam",
      detail: ""
    };
  }
  return reportFormMap[key];
}

function onToggleReport(targetType, targetId) {
  const key = reportKey(targetType, targetId);
  const nextOpen = !reportPanelOpenMap[key];
  reportPanelOpenMap[key] = nextOpen;
  if (nextOpen) {
    ensureReportForm(targetType, targetId);
    reportStore.clearFeedback(targetType, targetId);
  }
}

function getReportFeedback(targetType, targetId) {
  return feedbackByTargetKey.value[reportKey(targetType, targetId)] || "";
}

function isReportSubmitting(targetType, targetId) {
  return Boolean(submittingTargetKeyMap.value[reportKey(targetType, targetId)]);
}

async function onSubmitReport(targetType, targetId) {
  const form = ensureReportForm(targetType, targetId);
  const reason = form.reason?.trim();
  if (!reason) {
    return;
  }
  await reportStore.submitReport({
    targetType,
    targetId,
    reason,
    detail: form.detail || ""
  });
}

function isCommentPanelOpen(postId) {
  return Boolean(commentPanelOpenMap[postId]);
}

async function onToggleComments(postId) {
  const nextOpen = !commentPanelOpenMap[postId];
  commentPanelOpenMap[postId] = nextOpen;
  if (nextOpen && !(feedStore.commentsByPost[postId] || []).length) {
    await feedStore.loadComments(postId, { reset: true });
  }
}

async function onSubmitComment(postId) {
  await feedStore.submitComment(postId);
}

async function onLoadMoreComments(postId) {
  await feedStore.loadComments(postId, { reset: false });
}

onMounted(async () => {
  await feedStore.loadFirstPage();
});
</script>

<template>
  <UiCard variant="hero" compact class="feed-hero">
    <p class="eyebrow">M2 Feed</p>
    <h1>{{ t("feed.heroTitle") }}</h1>
    <p class="subtitle">{{ t("feed.heroSubtitle") }}</p>
    <div class="feed-stats">
      <span class="feed-stat">{{ t("feed.statPosts") }} {{ postCount }}</span>
      <span class="feed-stat">{{ t("feed.statLikes") }} {{ totalLikeCount }}</span>
      <span class="feed-stat">{{ t("feed.statComments") }} {{ totalCommentCount }}</span>
      <span class="feed-stat">{{ hasMore ? t("feed.statHasMore") : t("feed.statNoMore") }}</span>
    </div>
  </UiCard>

  <section class="grid single">
    <UiCard as="article" variant="panel" class="composer-panel">
      <div class="composer-head">
        <h2>{{ t("feed.composerTitle") }}</h2>
        <p class="muted">{{ t("feed.composerSubtitle") }}</p>
      </div>

      <div class="form-grid">
        <label class="field">
          <span>{{ t("feed.contentLabel") }}</span>
          <UiInput
            multiline
            class="textarea"
            :model-value="composer.content"
            :placeholder="t('feed.contentPlaceholder')"
            @update:model-value="(value) => (composer.content = value)"
          />
          <small class="hint" :class="{ error: contentLength > 2000 }">{{ contentLength }}/2000</small>
        </label>
        <label class="field">
          <span>{{ t("feed.mediaLabel") }}</span>
          <UiInput
            multiline
            :rows="4"
            class="textarea small"
            :model-value="composer.mediaRaw"
            :placeholder="t('feed.mediaPlaceholder')"
            @update:model-value="(value) => (composer.mediaRaw = value)"
          />
        </label>
        <label class="checkbox-line">
          <input
            type="checkbox"
            :checked="composer.isAnonymous"
            @change="(event) => (composer.isAnonymous = event.target.checked)"
          />
          <span>{{ t("feed.anonymousPublish") }}</span>
        </label>
      </div>
      <div class="hero-actions row-actions">
        <UiButton :disabled="!canPublish" @click="onPublishPost">
          {{ publishing ? t("feed.publishing") : t("feed.publishPost") }}
        </UiButton>
        <UiButton variant="ghost" :disabled="loading" @click="feedStore.loadFirstPage">
          {{ t("feed.refreshTimeline") }}
        </UiButton>
      </div>
    </UiCard>
  </section>

  <section class="grid single">
    <UiCard as="article" variant="panel" class="timeline-panel">
      <div class="timeline-head">
        <h2>{{ t("feed.postListTitle") }}</h2>
        <UiButton variant="text" :disabled="loading" @click="feedStore.loadFirstPage">{{ t("feed.reload") }}</UiButton>
      </div>

      <UiStatus v-if="loading" tone="info">{{ t("feed.loadingTimeline") }}</UiStatus>
      <UiStatus v-else-if="error" tone="error">{{ error }}</UiStatus>
      <UiStatus v-else-if="!posts.length" tone="muted">{{ t("feed.emptyPosts") }}</UiStatus>

      <div v-for="post in posts" :key="post.postId" class="feed-card timeline-card">
        <header class="feed-card-head">
          <div>
            <div class="feed-author">
              <strong>{{ post.authorName || t("feed.anonymousUser") }}</strong>
              <span v-if="post.anonymous" class="tag">{{ t("feed.tagAnonymous") }}</span>
              <span v-if="post.mine" class="tag mine">{{ t("feed.tagMine") }}</span>
            </div>
            <small class="muted">{{ formatDateTime(post.createdAt) }}</small>
          </div>
          <UiButton v-if="post.mine" variant="danger" size="sm" @click="onDeletePost(post.postId)">{{ t("feed.delete") }}</UiButton>
        </header>

        <p class="feed-content">{{ post.content }}</p>
        <ul v-if="post.mediaUrls && post.mediaUrls.length" class="media-list">
          <li v-for="url in post.mediaUrls" :key="url">
            <a :href="url" target="_blank" rel="noreferrer">{{ url }}</a>
          </li>
        </ul>

        <div class="feed-actions">
          <UiButton variant="text" size="sm" @click="onLikePost(post.postId)">{{ t("feed.like") }} {{ post.likeCount || 0 }}</UiButton>
          <UiButton variant="text" size="sm" @click="onToggleComments(post.postId)">
            {{ isCommentPanelOpen(post.postId) ? t("feed.collapseComments") : t("feed.comments") }} {{ post.commentCount || 0 }}
          </UiButton>
          <UiButton variant="text" size="sm" @click="onToggleReport('post', post.postId)">
            {{ isReportPanelOpen("post", post.postId) ? t("feed.collapseReport") : t("feed.report") }}
          </UiButton>
        </div>

        <div v-if="isReportPanelOpen('post', post.postId)" class="report-panel">
          <div class="form-grid">
            <label class="field">
              <span>{{ t("feed.reportReasonLabel") }}</span>
              <select
                class="input"
                :value="ensureReportForm('post', post.postId).reason"
                @change="(event) => (ensureReportForm('post', post.postId).reason = event.target.value)"
              >
                <option v-for="item in reportReasonOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
              </select>
            </label>
            <label class="field">
              <span>{{ t("feed.reportDetailLabel") }}</span>
              <textarea
                class="textarea small"
                :value="ensureReportForm('post', post.postId).detail"
                :placeholder="t('feed.reportDetailPlaceholder')"
                @input="(event) => (ensureReportForm('post', post.postId).detail = event.target.value)"
              />
            </label>
          </div>
          <div class="row-actions">
            <UiButton
              variant="ghost"
              :disabled="isReportSubmitting('post', post.postId)"
              @click="onSubmitReport('post', post.postId)"
            >
              {{ isReportSubmitting("post", post.postId) ? t("feed.reportSubmitting") : t("feed.submitReport") }}
            </UiButton>
          </div>
          <UiStatus v-if="getReportFeedback('post', post.postId)" tone="muted">
            {{ getReportFeedback("post", post.postId) }}
          </UiStatus>
        </div>

        <div v-if="isCommentPanelOpen(post.postId)" class="comment-panel">
          <div class="comment-editor">
            <UiInput
              class="input"
              :model-value="feedStore.commentDrafts[post.postId] || ''"
              :placeholder="t('feed.commentPlaceholder')"
              @update:model-value="(value) => feedStore.setCommentDraft(post.postId, value)"
              @keyup.enter="onSubmitComment(post.postId)"
            />
            <UiButton
              variant="ghost"
              :disabled="feedStore.commentSubmittingByPost[post.postId]"
              @click="onSubmitComment(post.postId)"
            >
              {{ feedStore.commentSubmittingByPost[post.postId] ? t("feed.sending") : t("feed.send") }}
            </UiButton>
          </div>

          <UiStatus v-if="feedStore.commentLoadingByPost[post.postId]" tone="muted">{{ t("feed.loadingComments") }}</UiStatus>
          <UiStatus v-else-if="!(feedStore.commentsByPost[post.postId] || []).length" tone="muted">{{ t("feed.noComments") }}</UiStatus>

          <ul class="comment-list">
            <li v-for="comment in feedStore.commentsByPost[post.postId] || []" :key="comment.commentId">
              <div class="comment-head">
                <strong>{{ comment.authorName }}</strong>
                <small class="muted">{{ formatDateTime(comment.createdAt) }}</small>
              </div>
              <p>{{ comment.content }}</p>
            </li>
          </ul>

          <UiButton
            v-if="feedStore.commentHasMoreByPost[post.postId]"
            variant="text"
            :disabled="feedStore.commentLoadingByPost[post.postId]"
            @click="onLoadMoreComments(post.postId)"
          >
            {{ t("feed.loadMoreComments") }}
          </UiButton>
        </div>
      </div>

      <div class="hero-actions">
        <UiButton v-if="hasMore" variant="ghost" :disabled="loadingMore" @click="feedStore.loadMore">
          {{ loadingMore ? t("feed.loadingMore") : t("feed.loadMore") }}
        </UiButton>
      </div>
    </UiCard>
  </section>
</template>

<style scoped>
.feed-hero {
  position: relative;
  overflow: hidden;
}

.feed-hero::after {
  content: "";
  position: absolute;
  width: 220px;
  height: 220px;
  right: -90px;
  top: -120px;
  border-radius: 50%;
  background: rgba(17, 24, 39, 0.05);
}

.feed-hero .subtitle {
  max-width: 45em;
}

.feed-stats {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}

.feed-stat {
  border: 1px solid var(--ag-border);
  border-radius: 999px;
  padding: 6px 11px;
  font-size: 12px;
  color: var(--ag-text-soft);
  background: var(--ag-bg-soft);
}

.composer-head {
  margin-bottom: 12px;
}

.composer-head h2 {
  margin: 0 0 6px;
  font-size: 24px;
}

.composer-head p {
  margin: 0;
}

.timeline-panel {
  overflow: hidden;
}

.timeline-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.timeline-head h2 {
  margin: 0;
  font-size: 24px;
}

.timeline-card {
  border-radius: 16px;
  padding: 16px;
  border-left: 2px solid var(--ag-border-strong);
  background: #ffffff;
}

.timeline-card .feed-content {
  margin: 10px 0;
}
</style>
