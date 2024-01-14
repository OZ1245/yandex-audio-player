import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import store from "@/store";

import yandexMusicClient from "@/plugins/yandexMusic";
import dayjs from "@/plugins/dayjs";
// import audioContext from "@/plugins/audioContext";
import globalBus from "@/plugins/globalBus";

import "@/assets/scss/common.scss";

createApp(App)
  .use(store)
  .use(router)
  .use(dayjs)
  .use(globalBus)
  .use(yandexMusicClient)
  // .use(audioContext)
  .mount("#app");
