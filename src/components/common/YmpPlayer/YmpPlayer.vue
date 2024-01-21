<template>
  <div class="ymp-player">
    <div class="ymp-player__cover">
      <img
        v-if="coverSrc"
        :src="coverSrc"
        :alt="trackName"
      >
    </div>

    <div class="ymp-player__track">
      <p class="ymp-player__track-name">
        {{ trackName }}
      </p>
    </div>

    <div class="ymp-player__progress">
      <div class="ymp-player__empty-track">
        <div class="ymp-player__progress-track"></div>
      </div>
      <div class="ymp-player__slider"></div>
    </div>

    <div class="ymp-player__times">
      <time class="ymp-player__past-tense">{{ '00:00' }}</time>
      <time class="ymp-player__duration">{{ '00:00' }}</time>
    </div>

    <div class="ymp-player__controls">
      <button
        type="button"
        class="ymp-player__control ymp-player__control--backward"
      >Back</button>
      <button
        v-if="playerStatus === 'stopped' || playerStatus === 'paused'"
        type="button"
        class="ymp-player__control ymp-player__control--play"
        @click="onPlayTrack()"
      >Play</button>
      <button
        v-if="playerStatus === 'playing'"
        type="button"
        class="ymp-player__control ymp-player__control--pause"
        @click="onPauseTrack()"
      >Pause</button>
      <button
        type="button"
        class="ymp-player__control ymp-player__control--forward"
      >Forvard</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import './style.scss'
import { YandexMusicTrack } from '@/@types'
import { watch, ref, computed, inject } from 'vue';
import { usePlayer } from '@/composables/player';
import { useYandexMusic } from '@/composables/yandexMusic';

// Composables

const $player = usePlayer()
const { getCover } = useYandexMusic()
const $bus: any = inject('bus')

// Data

const coverSrc = ref<string>('')

// Computed

const playerStatus = computed((): string => $player.playerStatus.value)
const currentTrack = computed((): YandexMusicTrack | null => $player.playback.value.data)
const trackName = computed((): string => {
  if (currentTrack.value) {
    return `
      ${currentTrack.value.artists.map(artist => artist.name).join(', ')}
      -
      ${currentTrack.value.title}`
  }

  return '-'
})

// Methods

const fetchCover = () => {
  if (currentTrack.value?.coverUri) {
    getCover(currentTrack.value?.coverUri, true)
      .then((result) => {
        if (result) {
          coverSrc.value = result
        }
      })
  }
}

const onPlayTrack = () => {
  if (!currentTrack.value) return

  onResumeTrack()
}

const onPauseTrack = () => {
  // $player.pausePlayback()
  $bus.on('player:pausePlayback')
}

const onResumeTrack = () => {
  // $player.resumePlayback()
  $bus.on('player:resumePlayback')
}

// Hooks

fetchCover()

// Watchers

watch(
  () => currentTrack.value,
  (val, oldVal) => {
    if ((val?.id !== oldVal?.id)) {
      fetchCover()
    }
  }
)
</script>