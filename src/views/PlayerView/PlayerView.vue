<template>
  <!-- <player-pane /> -->
  <div class="player-view">
    <div class="player-view__cover">
      <img
        v-if="coverSrc"
        :src="coverSrc"
        :alt="trackName"
      >
    </div>

    <div class="player-view__track">
      <p class="player-view__track-name">
        {{ trackName }}
      </p>
    </div>

    <div class="player-view__progress">
      <div class="player-view__empty-track">
        <div class="player-view__progress-track"></div>
      </div>
      <div class="player-view__slider"></div>
    </div>

    <div class="player-view__times">
      <time class="player-view__past-tense">{{ '00:00' }}</time>
      <time class="player-view__duration">{{ '00:00' }}</time>
    </div>

    <div class="player-view__controls">
      <button
        type="button"
        class="player-view__control player-view__control--backward"
      >Back</button>
      <button
        v-if="playerStatus === 'stopped' || playerStatus === 'paused'"
        type="button"
        class="player-view__control player-view__control--play"
        @click="onPlayTrack()"
      >Play</button>
      <button
        v-if="playerStatus === 'playing'"
        type="button"
        class="player-view__control player-view__control--pause"
        @click="onPauseTrack()"
      >Pause</button>
      <button
        type="button"
        class="player-view__control player-view__control--forward"
      >Forvard</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import './style.scss'
import { YandexMusicTrack } from '@/@types'
import { watch, ref, computed } from 'vue';
import { usePlayer } from '@/composables/player';
import { useYandexMusic } from '@/composables/yandexMusic';

const $player = usePlayer()
const { getCover } = useYandexMusic()

const coverSrc = ref<string>('')

// Computed

const playerStatus = computed((): string => $player.playerStatus.value)
const currentTrack = computed((): YandexMusicTrack | null => $player.currentTrackData.value)
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
  $player.pauseTrack()
}

const onResumeTrack = () => {
  $player.resumeTrack()
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