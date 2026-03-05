import { defineStore } from "pinia";
import {
  createComment,
  createPost,
  deletePost,
  fetchComments,
  fetchTimeline,
  reactPost
} from "../api/modules/feed";

function normalizeErrorMessage(error, fallbackText) {
  if (!error) {
    return fallbackText;
  }
  return error.message || fallbackText;
}

export const useFeedStore = defineStore("feed", {
  state: () => ({
    posts: [],
    nextCursor: null,
    hasMore: false,
    loading: false,
    loadingMore: false,
    publishing: false,
    error: null,
    commentDrafts: {},
    commentsByPost: {},
    commentNextCursorByPost: {},
    commentHasMoreByPost: {},
    commentLoadingByPost: {},
    commentSubmittingByPost: {}
  }),
  actions: {
    async loadFirstPage() {
      this.loading = true;
      this.error = null;
      try {
        const result = await fetchTimeline({ limit: 20 });
        this.posts = result.list || [];
        this.nextCursor = result.nextCursor || null;
        this.hasMore = Boolean(result.hasMore);
      } catch (error) {
        this.error = normalizeErrorMessage(error, "加载时间线失败");
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async loadMore() {
      if (!this.hasMore || !this.nextCursor || this.loadingMore) {
        return;
      }
      this.loadingMore = true;
      this.error = null;
      try {
        const result = await fetchTimeline({ cursor: this.nextCursor, limit: 20 });
        this.posts = this.posts.concat(result.list || []);
        this.nextCursor = result.nextCursor || null;
        this.hasMore = Boolean(result.hasMore);
      } catch (error) {
        this.error = normalizeErrorMessage(error, "加载更多失败");
        throw error;
      } finally {
        this.loadingMore = false;
      }
    },

    async publishPost({ content, mediaUrls = [], isAnonymous = false }) {
      this.publishing = true;
      this.error = null;
      try {
        await createPost({ content, mediaUrls, isAnonymous });
        await this.loadFirstPage();
      } catch (error) {
        this.error = normalizeErrorMessage(error, "发布帖子失败");
        throw error;
      } finally {
        this.publishing = false;
      }
    },

    async likePost(postId) {
      try {
        const result = await reactPost(postId, { reactionType: "like" });
        this.posts = this.posts.map((post) => {
          if (post.postId !== postId) {
            return post;
          }
          return {
            ...post,
            likeCount: result.reactionCount
          };
        });
      } catch (error) {
        this.error = normalizeErrorMessage(error, "点赞失败");
        throw error;
      }
    },

    async removePost(postId) {
      try {
        await deletePost(postId);
        this.posts = this.posts.filter((post) => post.postId !== postId);
        delete this.commentsByPost[postId];
        delete this.commentNextCursorByPost[postId];
        delete this.commentHasMoreByPost[postId];
        delete this.commentDrafts[postId];
      } catch (error) {
        this.error = normalizeErrorMessage(error, "删除帖子失败");
        throw error;
      }
    },

    setCommentDraft(postId, content) {
      this.commentDrafts = {
        ...this.commentDrafts,
        [postId]: content
      };
    },

    async loadComments(postId, { reset = true } = {}) {
      if (this.commentLoadingByPost[postId]) {
        return;
      }
      this.commentLoadingByPost = {
        ...this.commentLoadingByPost,
        [postId]: true
      };
      this.error = null;
      try {
        const cursor = reset ? null : this.commentNextCursorByPost[postId] || null;
        const result = await fetchComments(postId, { cursor, limit: 20 });
        const oldRows = reset ? [] : this.commentsByPost[postId] || [];
        this.commentsByPost = {
          ...this.commentsByPost,
          [postId]: oldRows.concat(result.list || [])
        };
        this.commentNextCursorByPost = {
          ...this.commentNextCursorByPost,
          [postId]: result.nextCursor || null
        };
        this.commentHasMoreByPost = {
          ...this.commentHasMoreByPost,
          [postId]: Boolean(result.hasMore)
        };
      } catch (error) {
        this.error = normalizeErrorMessage(error, "加载评论失败");
        throw error;
      } finally {
        this.commentLoadingByPost = {
          ...this.commentLoadingByPost,
          [postId]: false
        };
      }
    },

    async submitComment(postId) {
      const content = (this.commentDrafts[postId] || "").trim();
      if (!content) {
        return;
      }
      this.commentSubmittingByPost = {
        ...this.commentSubmittingByPost,
        [postId]: true
      };
      this.error = null;
      try {
        await createComment(postId, { content });
        this.commentDrafts = {
          ...this.commentDrafts,
          [postId]: ""
        };
        await this.loadComments(postId, { reset: true });
        this.posts = this.posts.map((post) => {
          if (post.postId !== postId) {
            return post;
          }
          return {
            ...post,
            commentCount: (post.commentCount || 0) + 1
          };
        });
      } catch (error) {
        this.error = normalizeErrorMessage(error, "发表评论失败");
        throw error;
      } finally {
        this.commentSubmittingByPost = {
          ...this.commentSubmittingByPost,
          [postId]: false
        };
      }
    }
  }
});
