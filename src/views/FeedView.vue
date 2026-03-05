<script setup>
import { computed, onMounted, reactive } from "vue";
import { storeToRefs } from "pinia";
import { useFeedStore } from "../stores/feed";
import { useReportStore } from "../stores/report";

const feedStore = useFeedStore();
const reportStore = useReportStore();
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

function formatDateTime(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  return date.toLocaleString("zh-CN", { hour12: false });
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

function onChangeCommentDraft(postId, event) {
  feedStore.setCommentDraft(postId, event.target.value);
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
  <section class="hero-card compact">
    <p class="eyebrow">M2 Feed</p>
    <h1>社区时间线（初版）</h1>
    <p class="subtitle">
      已接入发帖、评论、点赞、删除和游标分页。当前为内存实现，重启后数据会重置。
    </p>
  </section>

  <section class="grid single">
    <article class="panel">
      <h2>发布帖子</h2>
      <div class="form-grid">
        <label class="field">
          <span>内容（最多 2000 字）</span>
          <textarea
            class="textarea"
            :value="composer.content"
            placeholder="分享你此刻的想法..."
            @input="(event) => (composer.content = event.target.value)"
          />
          <small class="hint">{{ contentLength }}/2000</small>
        </label>
        <label class="field">
          <span>图片 URL（可选，每行一个）</span>
          <textarea
            class="textarea small"
            :value="composer.mediaRaw"
            placeholder="https://example.com/a.png"
            @input="(event) => (composer.mediaRaw = event.target.value)"
          />
        </label>
        <label class="checkbox-line">
          <input type="checkbox" :checked="composer.isAnonymous" @change="(event) => (composer.isAnonymous = event.target.checked)" />
          <span>匿名发布</span>
        </label>
      </div>
      <div class="hero-actions row-actions">
        <button class="btn-primary" :disabled="!canPublish" @click="onPublishPost">
          {{ publishing ? "发布中..." : "发布帖子" }}
        </button>
        <button class="btn-primary ghost" :disabled="loading" @click="feedStore.loadFirstPage">
          刷新时间线
        </button>
      </div>
    </article>
  </section>

  <section class="grid single">
    <article class="panel">
      <h2>帖子列表</h2>
      <p v-if="loading" class="muted">正在加载时间线...</p>
      <p v-else-if="error" class="error">{{ error }}</p>
      <p v-else-if="!posts.length" class="muted">还没有帖子，发布第一条内容吧。</p>

      <div v-for="post in posts" :key="post.postId" class="feed-card">
        <header class="feed-card-head">
          <div>
            <div class="feed-author">
              <strong>{{ post.authorName || "匿名用户" }}</strong>
              <span v-if="post.anonymous" class="tag">匿名</span>
              <span v-if="post.mine" class="tag mine">我的</span>
            </div>
            <small class="muted">{{ formatDateTime(post.createdAt) }}</small>
          </div>
          <button v-if="post.mine" class="text-btn danger" @click="onDeletePost(post.postId)">删除</button>
        </header>

        <p class="feed-content">{{ post.content }}</p>
        <ul v-if="post.mediaUrls && post.mediaUrls.length" class="media-list">
          <li v-for="url in post.mediaUrls" :key="url">
            <a :href="url" target="_blank" rel="noreferrer">{{ url }}</a>
          </li>
        </ul>

        <div class="feed-actions">
          <button class="text-btn" @click="onLikePost(post.postId)">点赞 {{ post.likeCount || 0 }}</button>
          <button class="text-btn" @click="onToggleComments(post.postId)">
            {{ isCommentPanelOpen(post.postId) ? "收起评论" : "评论" }} {{ post.commentCount || 0 }}
          </button>
          <button class="text-btn" @click="onToggleReport('post', post.postId)">
            {{ isReportPanelOpen("post", post.postId) ? "收起举报" : "举报" }}
          </button>
        </div>

        <div v-if="isReportPanelOpen('post', post.postId)" class="report-panel">
          <div class="form-grid">
            <label class="field">
              <span>举报原因</span>
              <select class="input" :value="ensureReportForm('post', post.postId).reason" @change="(event) => (ensureReportForm('post', post.postId).reason = event.target.value)">
                <option value="spam">垃圾信息</option>
                <option value="abuse">辱骂攻击</option>
                <option value="violent">暴力内容</option>
                <option value="other">其他</option>
              </select>
            </label>
            <label class="field">
              <span>补充说明（可选）</span>
              <textarea
                class="textarea small"
                :value="ensureReportForm('post', post.postId).detail"
                placeholder="补充更多上下文，帮助快速处理"
                @input="(event) => (ensureReportForm('post', post.postId).detail = event.target.value)"
              />
            </label>
          </div>
          <div class="row-actions">
            <button class="btn-primary ghost" :disabled="isReportSubmitting('post', post.postId)" @click="onSubmitReport('post', post.postId)">
              {{ isReportSubmitting("post", post.postId) ? "提交中..." : "提交举报" }}
            </button>
          </div>
          <p v-if="getReportFeedback('post', post.postId)" class="muted">{{ getReportFeedback("post", post.postId) }}</p>
        </div>

        <div v-if="isCommentPanelOpen(post.postId)" class="comment-panel">
          <div class="comment-editor">
            <input
              class="input"
              type="text"
              :value="feedStore.commentDrafts[post.postId] || ''"
              placeholder="写下你的评论..."
              @input="(event) => onChangeCommentDraft(post.postId, event)"
              @keyup.enter="onSubmitComment(post.postId)"
            />
            <button class="btn-primary ghost" :disabled="feedStore.commentSubmittingByPost[post.postId]" @click="onSubmitComment(post.postId)">
              {{ feedStore.commentSubmittingByPost[post.postId] ? "发送中..." : "发送" }}
            </button>
          </div>

          <p v-if="feedStore.commentLoadingByPost[post.postId]" class="muted">正在加载评论...</p>
          <p v-else-if="!(feedStore.commentsByPost[post.postId] || []).length" class="muted">暂无评论</p>

          <ul class="comment-list">
            <li v-for="comment in feedStore.commentsByPost[post.postId] || []" :key="comment.commentId">
              <div class="comment-head">
                <strong>{{ comment.authorName }}</strong>
                <small class="muted">{{ formatDateTime(comment.createdAt) }}</small>
              </div>
              <p>{{ comment.content }}</p>
            </li>
          </ul>

          <button
            v-if="feedStore.commentHasMoreByPost[post.postId]"
            class="text-btn"
            :disabled="feedStore.commentLoadingByPost[post.postId]"
            @click="onLoadMoreComments(post.postId)"
          >
            加载更多评论
          </button>
        </div>
      </div>

      <div class="hero-actions">
        <button v-if="hasMore" class="btn-primary ghost" :disabled="loadingMore" @click="feedStore.loadMore">
          {{ loadingMore ? "加载中..." : "加载更多" }}
        </button>
      </div>
    </article>
  </section>
</template>
