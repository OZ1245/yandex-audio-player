<template>
  <div class="app">
    <div
      class="app__splash"
      v-if="isLoading"
    >
      <p class="app__splash-message">Loading...</p>
    </div>

    <div
      v-if="!isLoading"
      class="app__content"
    >
      <router-view />
    </div>

    <navigation-pane class="app__navigation" />
  </div>
</template>

<script lang="ts" setup>
import { YandexMusicAccount, Response, YandexMusicTrack } from "@/@types";
import { useYandexMusic } from '@/composables/yandexMusic'
import { inject, ref, onMounted } from 'vue'
import NavigationPane from '@/components/NavigationPane/NavigationPane.vue'
import { useStore } from "vuex";
import { usePlayer } from '@/composables/player';

const { fetchAccount } = useYandexMusic()
// const $yandexMusicClient: any = inject('$yandexMusicClient')
// const { dispatch } = useStore()
const $player = usePlayer()
const $bus: any = inject('bus')

const isLoading = ref<boolean>(true)

// fetchAccount()
//   .then(() => {
//     isLoading.value = false
//   })
fetchAccount()
  .then(() => {
    isLoading.value = false
  })

onMounted(() => {
  $bus.on('player:startPlayback', (track: YandexMusicTrack) => $player.startPlayback(track))
  $bus.on('player:pausePlayback', () => $player.pausePlayback())
  $bus.on('player:resumePlayback', () => $player.resumePlayback())
})
</script>
