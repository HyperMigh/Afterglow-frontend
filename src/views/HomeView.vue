<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "../stores/auth";

const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);

const productFeatures = [
  {
    title: "Unified Context",
    description: "Connect product signals, user feedback, and team updates in one clear workspace."
  },
  {
    title: "Reliable Workflows",
    description: "Ship repeatable processes with structured collaboration and predictable execution."
  },
  {
    title: "Actionable Insights",
    description: "Transform raw conversations into measurable priorities and product decisions."
  }
];

const solutions = [
  {
    title: "Product Teams",
    text: "Align discovery, delivery, and roadmap discussions without context loss."
  },
  {
    title: "Customer Operations",
    text: "Maintain continuity across support interactions with cleaner handoffs."
  },
  {
    title: "Community Platforms",
    text: "Moderate and engage with clarity using structured interaction history."
  }
];

const plans = [
  {
    name: "Starter",
    price: "$0",
    note: "For early exploration",
    items: ["Core workspace", "Basic collaboration", "Community support"]
  },
  {
    name: "Growth",
    price: "$29",
    note: "Per user / month",
    items: ["Advanced workflows", "Priority support", "Team analytics"]
  },
  {
    name: "Enterprise",
    price: "Custom",
    note: "For larger organizations",
    items: ["Security controls", "SLA support", "Custom integrations"]
  }
];

const docItems = [
  "Quickstart setup for frontend and backend.",
  "Authentication and API integration guides.",
  "Deployment and runtime configuration notes."
];

const primaryCtaTo = computed(() => (isAuthenticated.value ? "/feed" : "/register"));
const primaryCtaLabel = computed(() => (isAuthenticated.value ? "Open Workspace" : "Get Started"));
</script>

<template>
  <section class="marketing-page">
    <div class="marketing-shell">
      <section class="hero" aria-label="Hero">
        <p class="hero-kicker">Afterglow</p>
        <h1>Build better products with clarity.</h1>
        <p class="hero-subtitle">
          Afterglow helps teams organize feedback, conversations, and decisions into clean and trustworthy execution.
        </p>
        <div class="hero-actions">
          <RouterLink :to="primaryCtaTo" class="hero-btn hero-btn--solid">{{ primaryCtaLabel }}</RouterLink>
          <RouterLink to="/#docs" class="hero-btn hero-btn--ghost">View Docs</RouterLink>
        </div>
        <div class="hero-shape hero-shape-a" />
        <div class="hero-shape hero-shape-b" />
      </section>

      <section id="product" class="section-block">
        <div class="section-head">
          <h2>Product</h2>
          <p>Essential capabilities for modern SaaS teams that value speed and precision.</p>
        </div>
        <div class="grid-12 feature-grid">
          <article v-for="item in productFeatures" :key="item.title" class="saas-card col-4">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </article>
        </div>
      </section>

      <section id="solutions" class="section-block">
        <div class="section-head">
          <h2>Solutions</h2>
          <p>Designed for cross-functional product organizations.</p>
        </div>
        <div class="grid-12 solution-grid">
          <article v-for="item in solutions" :key="item.title" class="saas-card col-4">
            <h3>{{ item.title }}</h3>
            <p>{{ item.text }}</p>
          </article>
        </div>
      </section>

      <section id="pricing" class="section-block">
        <div class="section-head">
          <h2>Pricing</h2>
          <p>Simple plans for teams at every stage.</p>
        </div>
        <div class="grid-12 pricing-grid">
          <article v-for="plan in plans" :key="plan.name" class="saas-card pricing-card col-4">
            <h3>{{ plan.name }}</h3>
            <p class="plan-price">{{ plan.price }}</p>
            <p class="plan-note">{{ plan.note }}</p>
            <ul>
              <li v-for="point in plan.items" :key="point">{{ point }}</li>
            </ul>
          </article>
        </div>
      </section>

      <section id="docs" class="section-block docs-block">
        <div class="section-head">
          <h2>Docs</h2>
          <p>Practical documentation for implementation and operations.</p>
        </div>
        <ul class="docs-list">
          <li v-for="item in docItems" :key="item">{{ item }}</li>
        </ul>
      </section>

      <section class="cta-block">
        <h2>Ready to move faster with confidence?</h2>
        <p>Start with Afterglow and bring more structure and clarity into your product execution.</p>
        <RouterLink :to="primaryCtaTo" class="hero-btn hero-btn--solid">{{ primaryCtaLabel }}</RouterLink>
      </section>

      <footer class="marketing-footer">
        <p>Afterglow</p>
        <span>Clean software for modern product teams.</span>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.marketing-page {
  display: grid;
  justify-items: center;
}

.marketing-shell {
  width: min(1200px, 100%);
  display: grid;
  gap: 56px;
  padding: 18px 8px 40px;
}

.hero {
  position: relative;
  border: 1px solid var(--ag-border-soft);
  border-radius: 24px;
  background: var(--ag-surface);
  padding: 88px 24px;
  text-align: center;
  overflow: hidden;
}

.hero-kicker {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--ag-text-muted);
}

.hero h1 {
  margin: 12px auto 0;
  max-width: 14ch;
  font-size: clamp(38px, 6vw, 48px);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -0.02em;
  color: var(--ag-text);
}

.hero-subtitle {
  margin: 16px auto 0;
  max-width: 62ch;
  font-size: clamp(16px, 2.4vw, 20px);
  font-weight: 500;
  color: var(--ag-text-muted);
}

.hero-actions {
  margin-top: 28px;
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.hero-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 136px;
  border-radius: 12px;
  padding: 12px 18px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid transparent;
  transition: all 0.18s ease;
}

.hero-btn--solid {
  color: #ffffff;
  background: var(--ag-accent);
  border-color: var(--ag-accent);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.hero-btn--solid:hover {
  background: var(--ag-accent-hover);
  border-color: var(--ag-accent-hover);
}

.hero-btn--ghost {
  color: var(--ag-text);
  border-color: var(--ag-border-soft);
  background: #ffffff;
}

.hero-btn--ghost:hover {
  background: var(--ag-bg-soft);
}

.hero-shape {
  position: absolute;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.03);
  pointer-events: none;
}

.hero-shape-a {
  width: 220px;
  height: 220px;
  top: -90px;
  left: -60px;
}

.hero-shape-b {
  width: 180px;
  height: 180px;
  right: -40px;
  bottom: -70px;
}

.section-block {
  display: grid;
  gap: 20px;
}

.section-head {
  display: grid;
  gap: 10px;
}

.section-head h2 {
  margin: 0;
  font-size: clamp(24px, 3.5vw, 28px);
  font-weight: 600;
  letter-spacing: -0.015em;
}

.section-head p {
  margin: 0;
  font-size: 16px;
  color: var(--ag-text-muted);
}

.grid-12 {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
}

.col-4 {
  grid-column: span 4;
}

.saas-card {
  border: 1px solid var(--ag-border-soft);
  border-radius: 16px;
  background: #ffffff;
  padding: 22px;
  box-shadow: var(--ag-shadow-card);
}

.saas-card h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.saas-card p {
  margin: 10px 0 0;
  color: var(--ag-text-muted);
  font-size: 16px;
  line-height: 1.55;
}

.pricing-card .plan-price {
  margin-top: 12px;
  font-size: 32px;
  color: var(--ag-text);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.pricing-card .plan-note {
  margin-top: 4px;
  font-size: 14px;
}

.pricing-card ul,
.docs-list {
  margin: 14px 0 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
  color: var(--ag-text-muted);
  font-size: 14px;
}

.docs-block {
  border: 1px solid var(--ag-border-soft);
  border-radius: 16px;
  background: #ffffff;
  padding: 24px;
  box-shadow: var(--ag-shadow-card);
}

.cta-block {
  border: 1px solid var(--ag-border-soft);
  border-radius: 20px;
  background: #ffffff;
  box-shadow: var(--ag-shadow-card);
  text-align: center;
  padding: 44px 20px;
  display: grid;
  justify-items: center;
  gap: 12px;
}

.cta-block h2 {
  margin: 0;
  font-size: clamp(30px, 4vw, 36px);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.cta-block p {
  margin: 0;
  max-width: 58ch;
  color: var(--ag-text-muted);
  font-size: 16px;
}

.marketing-footer {
  border-top: 1px solid var(--ag-border-soft);
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  color: var(--ag-text-muted);
  font-size: 14px;
}

.marketing-footer p {
  margin: 0;
  color: var(--ag-text);
  font-weight: 600;
}

@media (max-width: 980px) {
  .col-4 {
    grid-column: span 6;
  }
}

@media (max-width: 700px) {
  .marketing-shell {
    gap: 36px;
    padding: 10px 2px 30px;
  }

  .hero {
    padding: 62px 16px;
  }

  .col-4 {
    grid-column: span 12;
  }

  .marketing-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
