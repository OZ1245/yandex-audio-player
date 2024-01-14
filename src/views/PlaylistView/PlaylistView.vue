<template>
  <ymp-playlist
    v-if="currentTrack && playlist"
    :tracks="playlist.tracks"
  />

  <p v-else>Ничего не проигрывается</p>
</template>

<script lang="ts" setup>
import { YandexMusicTrack } from '@/@types'
import { computed } from "vue";
import { useYandexMusic } from '@/composables/yandexMusic'
import YmpPlaylist from '@/components/common/YmpPlaylist/YmpPlaylist.vue'
import { usePlayer } from "@/composables/player";

const { playlist } = useYandexMusic()
const $player = usePlayer()

const currentTrack = computed((): YandexMusicTrack | null => $player.playback.value.data)
</script>