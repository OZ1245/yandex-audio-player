import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import player from "./plugins/player";
import yandexMusic from "./plugins/yandexMusic";

import "@/assets/scss/common.scss";

createApp(App)
  .use(store)
  .use(router)
  .use(player)
  .use(yandexMusic)
  .mount("#app");
