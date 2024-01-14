<template>
  <div class="auth">
    <!-- <form>
      <input
        type="text"
        placeholder="Username"
        v-model="username"
      >
      <input
        type="password"
        placeholder="Password"
        v-model="password"
      >

      - ИЛИ -

      <input
        type="text"
        placeholder="Token"
        v-model="token"
      >
      <a
        href="https://music-yandex-bot.ru"
        target="blank"
      >Получить токен</a>
      <button
        type="button"
        @click="onLogin()"
      >Log in</button>
    </form> -->
    <form id="ym-auth-button"></form>
  </div>
</template>

<script lang="ts" setup>
// import { IYandexMusicPlugin } from '@/plugins/yandexMusic/@types'
import { inject, ref } from 'vue'
// import { useRouter } from 'vue-router';

// const $router = useRouter()
const $yandexMusic: any = inject('$yandexMusic')

// const username = ref<string>('')
// const password = ref<string>('')
// const token = ref<string>('')

// const onLogin = async () => {
//   if (token.value?.length) {
//     await yandexMusic.authByToken(token.value)
//       .then(() => {
//         $router
//           .push({ name: 'Home' })
//           .then(() => $router.go())
//       })
//   } else {
//     await yandexMusic.auth(username.value, password.value)
//   }
// }

// console.log('client:', yandexMusic.client)
window.YaAuthSuggest.init(
  {
    client_id: process.env.VUE_APP_CLIENT_ID,
    response_type: 'token',
    redirect_uri: process.env.VUE_APP_BASE_URL
  },
  process.env.VUE_APP_BASE_URL,
  {
    view: "button",
    parentId: "ym-auth-button",
    buttonSize: 'm',
    buttonView: 'main',
    buttonTheme: 'dark',
    buttonBorderRadius: "0",
    buttonIcon: 'ya',
  }
)
  .then(({ handler }: any) => handler())
  .then((data: any) => {
    console.log('Сообщение с токеном', data)
    $yandexMusic.initClient(JSON.stringify(data))
  })
  .catch((error: any) => console.log('Обработка ошибки', error))
</script>