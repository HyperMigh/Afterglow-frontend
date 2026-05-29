import { onMounted, onUnmounted } from "vue";

const MOBAN_BASE = "/moban7866";

const MOBAN_STYLES = [
  `${MOBAN_BASE}/static/css/bootstrap.min.css`,
  `${MOBAN_BASE}/static/css/plugins.css`,
  `${MOBAN_BASE}/static/css/swiper.css`,
  `${MOBAN_BASE}/static/css/style.css`,
  `${MOBAN_BASE}/static/css/coloring.css`,
  `${MOBAN_BASE}/static/css/scheme-01.css`
];

const MOBAN_SCRIPTS = [
  `${MOBAN_BASE}/static/js/plugins.js`,
  `${MOBAN_BASE}/static/js/designesia.js`,
  `${MOBAN_BASE}/static/js/swiper.js`,
  `${MOBAN_BASE}/static/js/custom-marquee.js`,
  `${MOBAN_BASE}/static/js/custom-swiper-1.js`
];

function loadStylesheet(href) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`link[data-moban-css="${href}"]`);
    if (existing) {
      resolve(existing);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-moban-css", href);
    link.onload = () => resolve(link);
    link.onerror = () => reject(new Error(`Failed to load ${href}`));
    document.head.appendChild(link);
  });
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-moban-js="${src}"]`);
    if (existing) {
      resolve(existing);
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.setAttribute("data-moban-js", src);
    script.onload = () => resolve(script);
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

/**
 * Loads moban7866 CSS/JS once per marketing layout mount.
 * Keeps workspace/auth pages on the default Afterglow design system.
 */
export function useMobanAssets() {
  let mounted = false;

  onMounted(async () => {
    if (mounted) return;
    mounted = true;
    document.body.classList.add("moban-marketing-active");

    try {
      for (const href of MOBAN_STYLES) {
        await loadStylesheet(href);
      }
      for (const src of MOBAN_SCRIPTS) {
        await loadScript(src);
      }
    } catch (error) {
      console.warn("Moban asset load issue", error);
    }
  });

  onUnmounted(() => {
    document.body.classList.remove("moban-marketing-active");
  });
}

export function mobanAsset(path) {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("/")) return path;
  if (path.startsWith("static/")) return `${MOBAN_BASE}/${path}`;
  if (path.startsWith("images/")) return `${MOBAN_BASE}/${path}`;
  return `${MOBAN_BASE}/${path}`;
}