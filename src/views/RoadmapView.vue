<script setup>
import UiCard from "../components/ui/UiCard.vue";

const roadmapMilestones = [
  {
    id: "M1",
    name: "认证与基础骨架",
    status: "已完成",
    goals: ["邮箱验证码登录", "统一响应与异常处理", "基础用户信息接口"]
  },
  {
    id: "M2",
    name: "社区时间线",
    status: "进行中",
    goals: ["发帖/评论/点赞", "举报链路", "游标分页与交互打磨"]
  },
  {
    id: "M3",
    name: "私聊能力",
    status: "待启动",
    goals: ["会话列表", "WebSocket 通道", "已读游标与基础同步"]
  },
  {
    id: "M4",
    name: "情绪模块",
    status: "待启动",
    goals: ["文本情绪识别", "颜色映射策略", "情绪概览卡片"]
  },
  {
    id: "M5",
    name: "AI 安抚助手",
    status: "待启动",
    goals: ["静一下建议生成", "敏感场景安全边界", "降级与可观测性"]
  }
];
</script>

<template>
  <UiCard variant="hero" class="roadmap-hero">
    <p class="eyebrow">Roadmap Snapshot</p>
    <h1>开发路线正在从「可运行」走向「可持续迭代」。</h1>
    <p class="subtitle">
      路线图围绕五个阶段推进：先保证基础业务闭环，再逐步扩展实时能力、情绪能力与 AI 能力。
    </p>
  </UiCard>

  <section class="grid single">
    <UiCard as="article" variant="panel" class="roadmap-panel">
      <h2>里程碑拆分</h2>
      <div class="milestone-list">
        <article v-for="item in roadmapMilestones" :key="item.id" class="milestone-card">
          <header>
            <p class="milestone-id">{{ item.id }}</p>
            <span class="milestone-status">{{ item.status }}</span>
          </header>
          <h3>{{ item.name }}</h3>
          <ul class="todo-list">
            <li v-for="goal in item.goals" :key="goal">{{ goal }}</li>
          </ul>
        </article>
      </div>
    </UiCard>
  </section>
</template>

<style scoped>
.roadmap-hero {
  position: relative;
  overflow: hidden;
}

.roadmap-hero::after {
  content: "";
  position: absolute;
  width: 360px;
  height: 360px;
  right: -160px;
  top: -210px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(230, 0, 8, 0.25), transparent 68%);
}

.roadmap-hero h1 {
  max-width: 16em;
}

.roadmap-panel h2 {
  margin-bottom: 14px;
  font-size: 24px;
  text-transform: uppercase;
}

.milestone-list {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.milestone-card {
  border: 1px solid var(--ag-border-soft);
  border-radius: 16px;
  padding: 13px;
  background: var(--ag-btn-ghost-bg);
  border-left: 2px solid rgba(230, 0, 8, 0.58);
}

.milestone-card header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.milestone-id {
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  min-width: 38px;
  height: 28px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 700;
  color: #ffffff;
  background: linear-gradient(140deg, #ff6d4c, #e60008);
}

.milestone-status {
  font-size: 12px;
  color: var(--ag-text-soft);
  border: 1px solid var(--ag-border-soft);
  border-radius: 999px;
  padding: 3px 8px;
}

.milestone-card h3 {
  margin: 8px 0 10px;
  font-size: 22px;
  text-transform: uppercase;
  font-family: "Barlow Condensed", "Noto Sans SC", sans-serif;
}

@media (max-width: 960px) {
  .milestone-list {
    grid-template-columns: 1fr;
  }
}
</style>
