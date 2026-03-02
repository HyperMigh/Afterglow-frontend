import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import RoadmapView from "../views/RoadmapView.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: HomeView
  },
  {
    path: "/roadmap",
    name: "roadmap",
    component: RoadmapView
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes
});
