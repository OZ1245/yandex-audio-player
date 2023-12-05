<template>
  <ul class="ymp-playlist">
    <li
      v-for="(item, i) in props.tracks"
      :key="`track-item-${i}`"
      class="ymp-playlist__track"
      :class="{ 'ymp-playlist__track--current': currentTrack && +currentTrack.id === item.id }"
    >
      <template v-if="item.track">
        <div class="ymp-playlist__track-heading">
          <template v-if="currentTrack && +currentTrack.id === item.id">
            <button
              v-if="playerStatus === 'stopped' || playerStatus === 'paused'"
              class="ymp-playlist__main-control"
              @click="onPlayTrack(item.track, i)"
            >
              Play
            </button>
            <button
              v-if="playerStatus === 'playing'"
              class="ymp-playlist__main-control"
            >
              Pause
            </button>
          </template>
          <button
            v-else
            class="ymp-playlist__main-control"
            @click="onPlayTrack(item.track, i)"
          >
            Play
          </button>

          <p class="ymp-playlist__track-title">
            {{ getTrackName(item.track) }}
          </p>
        </div>

        <ul class="ymp-playlist__track-controls">
          <li class="ymp-playlist__duration">
            {{ getTrackDuration(item.track) }}
          </li>
        </ul>
      </template>

      <p
        v-else
        class="ymp-playlist__track-error"
      >Track error</p>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import './style.scss'
import { YandexMusicTrackItem, Track, TrackData } from '@/@types'
import { defineProps, inject } from 'vue';
import { useUtils } from '@/composables/utils';
import { usePlayer } from '@/composables/player';

const dayjs: any = inject('dayjs')

const {
  currentTrackData: currentTrack,
  playerStatus,
  preparationCurrentTrack,
  playTrack,
  addToQueue
} = usePlayer()
const { converDurationToTime } = useUtils()

const props = defineProps<{
  tracks: YandexMusicTrackItem[]
}>()

// Methods

const getTrackName = (track: TrackData): string => {
  return `
    ${track.artists.map(artist => artist.name).join(', ')}
    -
    ${track.title}`
}
const getTrackDuration = (track: TrackData): string => {
  return converDurationToTime(track.durationMs)
}

/**
 * Проиграть трек из плейлиста
 * @param {TrackData} track
 * @param {number} index 
 */
const onPlayTrack = (track: TrackData, index: number): void => {
  preparationCurrentTrack({
    data: track
  })
    .then((buffer) => {
      if (!buffer) return

      playTrack(buffer)

      if (typeof index === 'undefined') return

      props.tracks
        .map((item: YandexMusicTrackItem, i: number) => {
          if (i > index) {
            addToQueue({
              data: item.track,
            } as Track)
          }
        }) || []
    })
}
</script>