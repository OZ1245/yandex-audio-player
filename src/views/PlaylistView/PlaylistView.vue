<template>
  <ymp-playlist
    v-if="currentTrackData && playlist"
    :tracks="playlist.tracks"
  />

  <p v-else>Ничего не проигрывается</p>
</template>

<script lang="ts" setup>
import { useYandexMusic } from '@/composables/yandexMusic'
import { usePlayer } from '@/composables/player'
import YmpPlaylist from '@/components/common/YmpPlaylist/YmpPlaylist.vue'

const { playlist } = useYandexMusic()
const { currentTrackData } = usePlayer()
</script>