import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import yandexMusic from './plugins/yandexMusic'
console.log('yandexMusic:', yandexMusic)

createApp(App)
  .use(store)
  .use(router)
  .use(yandexMusic)
  .mount('#app')
