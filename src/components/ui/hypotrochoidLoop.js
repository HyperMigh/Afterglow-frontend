/** Hypotrochoid Loop — shared curve math for UiHypotrochoidLoader */

export const hypotrochoidConfig = {
  particleCount: 82,
  trailSpan: 0.46,
  durationMs: 7600,
  rotationDurationMs: 42000,
  pulseDurationMs: 6200,
  strokeWidth: 4.6,
  spiroR: 8.2,
  spiror: 2.7,
  spirorBoost: 0.45,
  spirod: 4.8,
  spirodBoost: 1.2,
  spiroScale: 3.05,
  rotate: false,
  pathSteps: 480
};

export function normalizeProgress(progress) {
  return ((progress % 1) + 1) % 1;
}

export function getDetailScale(time, config = hypotrochoidConfig) {
  const pulseProgress = (time % config.pulseDurationMs) / config.pulseDurationMs;
  const pulseAngle = pulseProgress * Math.PI * 2;
  return 0.52 + ((Math.sin(pulseAngle + 0.55) + 1) / 2) * 0.48;
}

export function getRotation(time, config = hypotrochoidConfig) {
  if (!config.rotate) {
    return 0;
  }
  return -((time % config.rotationDurationMs) / config.rotationDurationMs) * 360;
}

export function hypotrochoidPoint(progress, detailScale, config = hypotrochoidConfig) {
  const t = progress * Math.PI * 2;
  const r = config.spiror + detailScale * config.spirorBoost;
  const d = config.spirod + detailScale * config.spirodBoost;
  const x = (config.spiroR - r) * Math.cos(t) + d * Math.cos(((config.spiroR - r) / r) * t);
  const y = (config.spiroR - r) * Math.sin(t) - d * Math.sin(((config.spiroR - r) / r) * t);
  return {
    x: 50 + x * config.spiroScale,
    y: 50 + y * config.spiroScale
  };
}

export function buildHypotrochoidPath(detailScale, config = hypotrochoidConfig) {
  const steps = config.pathSteps;
  return Array.from({ length: steps + 1 }, (_, index) => {
    const point = hypotrochoidPoint(index / steps, detailScale, config);
    return `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  }).join(" ");
}

export function getHypotrochoidParticle(index, progress, detailScale, config = hypotrochoidConfig) {
  const tailOffset = index / (config.particleCount - 1);
  const point = hypotrochoidPoint(
    normalizeProgress(progress - tailOffset * config.trailSpan),
    detailScale,
    config
  );
  const fade = Math.pow(1 - tailOffset, 0.56);
  return {
    x: point.x,
    y: point.y,
    radius: 0.9 + fade * 2.7,
    opacity: 0.04 + fade * 0.96
  };
}