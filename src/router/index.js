import { createRouter, createWebHistory } from "vue-router";
import { getStoredAccessToken } from "@/api/client";

const HomeView = () => import("@/views/HomeView.vue");
const RoadmapView = () => import("@/views/RoadmapView.vue");
const AuthPortalView = () => import("@/views/AuthPortalView.vue");
const FeedView = () => import("@/views/FeedView.vue");
const ChatView = () => import("@/views/ChatView.vue");
const MirrorView = () => import("@/views/MirrorView.vue");

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView
  },
  {
    path: "/roadmap",
    name: "roadmap",
    component: RoadmapView,
    meta: { requiresAuth: true }
  },
  {
    path: "/feed",
    name: "feed",
    component: FeedView,
    meta: { requiresAuth: true }
  },
  {
    path: "/chat",
    name: "chat",
    component: ChatView,
    meta: { requiresAuth: true }
  },
  {
    path: "/mirror",
    name: "mirror",
    component: MirrorView,
    meta: { requiresAuth: true }
  },
  {
    path: "/login",
    name: "login",
    component: AuthPortalView,
    meta: { layout: "auth" },
    props: { scene: "login" }
  },
  {
    path: "/register",
    name: "register",
    component: AuthPortalView,
    meta: { layout: "auth" },
    props: { scene: "register" }
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to) => {
  const hasToken = Boolean(getStoredAccessToken());
  if (to.meta.requiresAuth && !hasToken) {
    return {
      name: "login",
      query: { redirect: to.fullPath }
    };
  }
  if ((to.name === "login" || to.name === "register") && hasToken) {
    return { name: "feed" };
  }
  return true;
});
