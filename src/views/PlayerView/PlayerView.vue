<template>
  <!-- <player-pane /> -->
  <ymp-player></ymp-player>
</template>

<script lang="ts" setup>
import { YandexMusicTrack } from '@/@types'
import { inject, onMounted } from 'vue';
import { usePlayer } from '@/composables/player';
import YmpPlayer from '@/components/common/YmpPlayer.vue/YmpPlayer.vue';

const $player = usePlayer()
const $bus: any = inject('bus')

onMounted(() => {
  $bus.on('player:startPlayback', (track: YandexMusicTrack) => $player.startPlayback(track))
  $bus.on('player:pausePlayback', () => $player.pausePlayback())
  $bus.on('player:resumePlayback', () => $player.resumePlayback())
})
</script>