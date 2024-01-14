<template>
  <ul class="ymp-playlist">
    <li
      v-for="(item, i) in props.tracks"
      :key="`track-item-${i}`"
      class="ymp-playlist__track"
      :class="getTrackClassList(item)"
    >
      <template v-if="item.track">
        <div class="ymp-playlist__track-heading">
          <template v-if="currentTrack && +currentTrack.id === item.id">
            <button
              v-if="playerStatus === 'paused'"
              class="ymp-playlist__main-control"
              @click="onResumeTrack()"
            >
              Play
            </button>
            <button
              v-if="playerStatus === 'playing'"
              class="ymp-playlist__main-control"
              @click="onPauseTrack()"
            >
              Pause
            </button>
          </template>
          <template v-else>
            <button
              class="ymp-playlist__main-control"
              @click="onPlayTrack(item.track)"
            >
              Play
            </button>
          </template>

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
import { YandexMusicTrackItem, YandexMusicTrack, TrackData } from '@/@types'
import { computed, defineProps, inject } from 'vue';
import { useUtils } from '@/composables/utils';
import { usePlayer } from '@/composables/player';

// Composables 

const { converDurationToTime } = useUtils()
const $player = usePlayer()
const $bus: any = inject('bus')

// Props

const props = defineProps<{
  tracks: YandexMusicTrackItem[]
}>()

// Computed

const playerStatus = computed((): string => $player.playerStatus.value)
const currentTrack = computed((): YandexMusicTrack | null => $player.playback.value.data)

// Methods

const getTrackClassList = (item: YandexMusicTrackItem) => {
  return [
    { 'ymp-playlist__track--current': currentTrack.value?.id && +currentTrack.value.id === item.id }
  ]
}

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
 * Начать проигрывание трека. Последующие за ним треки добавляются в очередь
 * @param {YandexMusicTrack} track Объект информации о треке
 */
const onPlayTrack = (track: YandexMusicTrack) => {
  // console.log('$player:', $player);

  // $player.startPlayback(track)
  $bus.emit('player:startPlayback', track)
}

const onPauseTrack = () => {
  // $player.pausePlayback()
  $bus.emit('player:pausePlayback')
}

const onResumeTrack = () => {
  // $player.resumePlayback()
  $bus.emit('player:resumePlayback')
}
</script>