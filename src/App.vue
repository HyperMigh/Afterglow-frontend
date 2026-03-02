<script setup>
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <div class="app-shell">
    <header class="top-nav">
      <div class="brand">Afterglow 余温</div>
      <nav class="links">
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/roadmap">开发路线</RouterLink>
      </nav>
    </header>

    <main class="page">
      <RouterView />
    </main>
  </div>
</template>
