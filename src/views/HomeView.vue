<template>
  <div class="home-view">
    <PlaylistPane 
      v-if="!isLoading" 
      :playlists="playlists"
    />
  </div>
</template>

<script lang="ts" setup>
import { Playlist } from 'yandex-music-client'
import { ref } from 'vue'
import { useYandexMusic } from '@/libs/yandexMusic'
import PlaylistPane from '@/components/PlaylistPane/PlaylistPane.vue'

const { fetchAccountStatus, fetchPlaylists } = useYandexMusic()

const isLoading = ref<boolean>(true)
const playlists = ref<Playlist[]>([])

fetchAccountStatus()
  .then(() => {
    fetchPlaylists()
      .then((result: Playlist[] | undefined): void => {
        if (result) {
          playlists.value = result
          isLoading.value = false
          
          console.log('playlists:', playlists)
        }
      })
  })
</script>

