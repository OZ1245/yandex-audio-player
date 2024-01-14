<template>
  <aside class="playlist-pane">
    <select
      v-model="selectedPlaylistKind"
      @change="onSelectPlaylist()"
    >
      <option value="null">Select playlist</option>
      <option
        v-for="(playlist, i) in $props.playlists"
        :key="`playlist-${i}`"
        :value="playlist.kind"
      >{{ playlist.title }}</option>
    </select>

    <div
      v-if="playlist"
      class="playlist-pane__info"
    >
      <ul
        v-if="playlist.tracks.length"
        class="playlist-pane__list"
      >
        <li
          v-for="(item, i) in playlist.tracks"
          :key="`track-${i}`"
          class="track"
        >
          <template v-if="item.track">
            <template v-if="currentTrackData && +currentTrackData.id === item.id">
              <button
                v-if="playerStatus === 'stopped' || playerStatus === 'paused'"
                class="track__main-control"
                @click="onPlayTrack(item.track, i)"
              >
                Play
              </button>
              <!-- TODO: -->
              <button
                v-if="playerStatus === 'playing'"
                class="track__main-control"
              >
                Pause
              </button>
            </template>
            <button
              v-else
              class="track__main-control"
              @click="onPlayTrack(item.track, i)"
            >
              Play
            </button>
            <!-- <pre>{{ track }}</pre> -->
            {{ item.track?.artists.map(artist => artist.name).join(', ') }}
            -
            {{ item.track?.title }}
            ({{ millisecondsToTime(item.track?.durationMs) }})
          </template>

          <p v-else>Track error</p>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import './style.scss'
import { withDefaults, defineProps, ref, inject } from 'vue'
import { useYandexMusic } from '@/composables/yandexMusic'
import { useUtils } from '@/composables/utils'
import {
  TrackData,
  YandexMusicPlaylist,
  YandexMusicTrackItem,
  Track,
} from '@/@types'

type PlaylistKind = number | null
type Playlist = YandexMusicPlaylist | null

const {
  fetchPlaylistById,
} = useYandexMusic()

const {
  preparationCurrentTrack,
  addToQueue,
  playTrack,
  playerStatus,
  currentTrackData
}: any = inject('$player')

const { millisecondsToTime } = useUtils()

const $props = withDefaults(defineProps<{
  playlists: YandexMusicPlaylist[]
}>(), {
  playlists: () => []
})

const selectedPlaylistKind = ref<PlaylistKind>(null)
const playlist = ref<Playlist>(null)

/**
 * Загрузить выбранный плейлист
 */
const onSelectPlaylist = (): void => {
  if (!selectedPlaylistKind.value) return

  fetchPlaylistById(selectedPlaylistKind.value)
    .then((result: YandexMusicPlaylist | undefined): void => {
      if (result) {
        playlist.value = result
      }
    })
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

      playlist.value
        ?.tracks
        .map((item: YandexMusicTrackItem, i: number) => {
          if (i > index) {
            addToQueue<Track>({
              data: item.track,
            })
          }
        }) || []
    })
}
</script>