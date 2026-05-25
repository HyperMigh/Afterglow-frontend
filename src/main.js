import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "@/App.vue";
import { router } from "@/router";
import { resolveInitialTheme } from "@/stores/theme";
import { useAuthStore, bindAuthLostHandler } from "@/stores/auth";
import { i18n, bindLocaleStore } from "@/i18n";
import "@/styles.css";

const initialTheme = resolveInitialTheme();
document.documentElement.setAttribute("data-theme", initialTheme);

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);

// Wire stores after Pinia is installed.
bindAuthLostHandler(useAuthStore());
bindLocaleStore();

app.mount("#app");
