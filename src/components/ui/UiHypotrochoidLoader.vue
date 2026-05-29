<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import {
  buildHypotrochoidPath,
  getDetailScale,
  getHypotrochoidParticle,
  getRotation,
  hypotrochoidConfig
} from "@/components/ui/hypotrochoidLoop";

const props = defineProps({
  size: {
    type: [Number, String],
    default: 120
  },
  /** When false, animation pauses (e.g. hidden loading) */
  active: {
    type: Boolean,
    default: true
  }
});

const pathD = ref("");
const groupTransform = ref("");
const particles = ref([]);

let rafId = 0;
let startedAt = 0;

function tick(now) {
  if (!props.active) {
    rafId = requestAnimationFrame(tick);
    return;
  }
  if (!startedAt) {
    startedAt = now;
  }
  const time = now - startedAt;
  const progress = (time % hypotrochoidConfig.durationMs) / hypotrochoidConfig.durationMs;
  const detailScale = getDetailScale(time);
  groupTransform.value = `rotate(${getRotation(time)} 50 50)`;
  pathD.value = buildHypotrochoidPath(detailScale);
  particles.value = Array.from({ length: hypotrochoidConfig.particleCount }, (_, index) =>
    getHypotrochoidParticle(index, progress, detailScale)
  );
  rafId = requestAnimationFrame(tick);
}

onMounted(() => {
  rafId = requestAnimationFrame(tick);
});

onUnmounted(() => {
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
});

const sizeStyle = computed(() => {
  const n = typeof props.size === "number" ? props.size : parseInt(String(props.size), 10) || 120;
  return { width: `${n}px`, height: `${n}px` };
});
</script>

<template>
  <div class="ui-hypotrochoid" :style="sizeStyle()" aria-hidden="true">
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
      <g :transform="groupTransform">
        <path
          :d="pathD"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          :stroke-width="hypotrochoidConfig.strokeWidth"
          opacity="0.1"
        />
        <circle
          v-for="(p, i) in particles"
          :key="i"
          fill="currentColor"
          :cx="p.x"
          :cy="p.y"
          :r="p.radius"
          :opacity="p.opacity"
        />
      </g>
    </svg>
    <span class="ui-hypotrochoid__sr-only"><slot /></span>
  </div>
</template>

<style scoped>
.ui-hypotrochoid {
  display: grid;
  place-items: center;
  color: var(--ag-accent);
  flex-shrink: 0;
}

.ui-hypotrochoid svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.ui-hypotrochoid__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>