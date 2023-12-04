import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import yandexMusic from "./plugins/yandexMusic";

import "@/assets/scss/common.scss";

createApp(App).use(store).use(router).use(yandexMusic).mount("#app");
