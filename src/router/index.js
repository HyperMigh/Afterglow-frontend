import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import RoadmapView from "../views/RoadmapView.vue";
import LoginView from "../views/LoginView.vue";
import FeedView from "../views/FeedView.vue";
import { getStoredAccessToken } from "../api/client";

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
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/feed",
    name: "feed",
    component: FeedView,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: "/login",
    name: "login",
    component: LoginView
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
      query: {
        redirect: to.fullPath
      }
    };
  }
  if (to.name === "login" && hasToken) {
    return {
      name: "feed"
    };
  }
  return true;
});
