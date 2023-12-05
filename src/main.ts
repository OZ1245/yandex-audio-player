import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import store from "@/store";

import yandexMusic from "@/plugins/yandexMusic";
import dayjs from "@/plugins/dayjs";

import "@/assets/scss/common.scss";

createApp(App)
  .use(store)
  .use(router)
  .use(yandexMusic)
  .use(dayjs)
  .mount("#app");
