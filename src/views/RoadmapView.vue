<template>
  <section class="hero-card compact">
    <p class="eyebrow">Roadmap Snapshot</p>
    <h1>开发路线（初始版）</h1>
    <p class="subtitle">
      当前是工程初始化阶段：先跑通 Vue + Spring Boot 联调，再逐步接入 Auth、Feed、Chat、Emotion、AI。
    </p>
  </section>

  <section class="grid single">
    <article class="panel">
      <h2>里程碑拆分</h2>
      <ul class="todo-list">
        <li>M1: 登录、基础数据模型、统一异常与响应</li>
        <li>M2: 发帖/评论/点赞 + 时间线</li>
        <li>M3: 私聊会话 + WebSocket + 已读游标</li>
        <li>M4: 情绪分析与 palette 映射</li>
        <li>M5: AI「静一下」与安全边界</li>
      </ul>
    </article>
  </section>
</template>
