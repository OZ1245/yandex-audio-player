<template>
  <sub-view
    :title="title"
    :link="{ name: 'Collection' }"
    button-title="Collection"
    class="playlist-info"
  >
    <div class="playlist-info__wrapper">
      <div class="playlist-info__information">
        <div class="playlist-info__cover">
          <img
            v-if="playlistCover"
            :src="playlistCover"
            :alt="playlist?.title"
          >
        </div>

        <ul class="playlist-info__data">
          <li class="playlist-info__data-item">
            <span>Created:</span> {{ playlist?.created }}
          </li>
          <li class="playlist-info__data-item">
            <span>Duration:</span> {{ playlist?.durationMs ? millisecondsToDisplay(playlist?.durationMs) : '00:00:00' }}
          </li>
          <li class="playlist-info__data-item">
            <span>Tracks:</span> {{ playlist?.trackCount }}
          </li>
          <li class="playlist-info__data-item">
            <span>Owner:</span> {{ playlist?.owner.name }}
          </li>
          <li class="playlist-info__data-item">
            <button type="button">Play</button>
          </li>
        </ul>
      </div>

      <ul
        v-if="playlist?.tracks?.length"
        class="playlist-info__list"
      >
        <li
          v-for="(item, i) in playlist.tracks"
          :key="`track-item-${i}`"
          class="playlist-info__track"
          :class="{ 'playlist-info__track--current': currentTrack && +currentTrack.id === item.id }"
        >
          <template v-if="item.track">
            <div class="playlist-info__track-heading">
              <template v-if="currentTrack && +currentTrack.id === item.id">
                <button
                  v-if="playerStatus === 'stopped' || playerStatus === 'paused'"
                  class="playlist-info__main-control"
                  @click="onPlayTrack(item.track, i)"
                >
                  Play
                </button>
                <!-- TODO: -->
                <button
                  v-if="playerStatus === 'playing'"
                  class="playlist-info__main-control"
                >
                  Pause
                </button>
              </template>
              <button
                v-else
                class="playlist-info__main-control"
                @click="onPlayTrack(item.track, i)"
              >
                Play
              </button>

              <p class="playlist-info__track-title">
                {{ item.track.artists.map(artist => artist.name).join(', ') }}
                -
                {{ item.track.title }}
              </p>
            </div>

            <ul class="playlist-info__track-controls">
              <li class="playlist-info__duration">
                {{ item.track.durationMs ? millisecondsToDisplay(item.track.durationMs) : '00:00' }}
              </li>
            </ul>
          </template>

          <p
            v-else
            class="playlist-info__track-error"
          >Track error</p>
        </li>
      </ul>
    </div>
  </sub-view>
</template>

<script lang="ts" setup>
import './style.scss'
import SubView from '@/components/SubView/SubView.vue'
import { YandexMusicPlaylist, TrackData, YandexMusicTrackItem, Track, YandexMusicCover } from '@/@types'
import { useYandexMusic } from '@/composables/yandexMusic';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useUtils } from '@/composables/utils';
import { usePlayer } from '@/composables/player';

// Composables

const { params: routeParams } = useRoute()
const { fetchPlaylistById, getCover } = useYandexMusic()
const { millisecondsToDisplay } = useUtils()
const {
  currentTrackData: currentTrack,
  playerStatus,
  preparationCurrentTrack,
  playTrack,
  addToQueue
} = usePlayer()

// Variables

const playlistKind = ref<number>(+routeParams.playlistKind)
const playlist = ref<YandexMusicPlaylist | null>(null)
const playlistTitle = ref<string>('Playlist:Title')
const playlistCover = ref<string>('')

// Computed

const title = computed((): string => `Playlist "${playlistTitle.value}"`)

// Methods

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
            addToQueue({
              data: item.track,
            } as Track)
          }
        }) || []
    })
}

// Hooks

fetchPlaylistById(playlistKind.value)
  .then((result: YandexMusicPlaylist | undefined) => {
    if (result) {
      playlist.value = result
      playlistTitle.value = result.title

      if (result.cover) {
        getCover(result.cover).then(result => {
          playlistCover.value = result
        })
      }
    }
  })
</script>