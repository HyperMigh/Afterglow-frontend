import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { router } from "./router";
import { resolveInitialTheme } from "./stores/theme";
import "./styles.css";

const initialTheme = resolveInitialTheme();
document.documentElement.setAttribute("data-theme", initialTheme);

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");
