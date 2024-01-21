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
            <span>Created:</span> {{ playlistCreated }}
          </li>
          <li class="playlist-info__data-item">
            <span>Duration:</span> {{ playlistDuration }}
          </li>
          <li class="playlist-info__data-item">
            <span>Tracks:</span> {{ playlist?.trackCount }}
          </li>
          <li class="playlist-info__data-item">
            <span>Owner:</span> {{ playlist?.owner.name }}
          </li>
          <li class="playlist-info__data-item">
            <template v-if="currentPlaylist?.kind === playlist?.kind">
              <button
                v-if="playerStatus === 'playing'"
                type="button"
                class="playlist-info__button"
                @click="onPausePlaylist()"
              >Pause</button>
              <button
                v-if="playerStatus === 'paused'"
                type="button"
                class="playlist-info__button"
                @click="onResumePlaylist()"
              >Play</button>
            </template>

            <button
              v-else
              type="button"
              class="playlist-info__button"
              @click="onPlayPlaylist()"
            >Play</button>
          </li>
        </ul>
      </div>

      <ymp-playlist
        v-if="playlist?.tracks?.length"
        :tracks="playlist.tracks"
      />
    </div>
  </sub-view>
</template>

<script lang="ts" setup>
import './style.scss'
import { YandexMusicPlaylist, PlayerStatus } from '@/@types'
import { useYandexMusic } from '@/composables/yandexMusic';
import { computed, inject, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useUtils } from '@/composables/utils';
import { usePlayer } from '@/composables/player';

import SubView from '@/components/SubView/SubView.vue'
import YmpPlaylist from '@/components/common/YmpPlaylist/YmpPlaylist.vue'

const dayjs: any = inject('dayjs')

// Composables

const { converDurationToTime } = useUtils()
const { params: routeParams } = useRoute()
const $yandexMusic = useYandexMusic()
const $player = usePlayer()
const $bus: any = inject('bus')

// Variables

const playlistKind = ref<number>(+routeParams.playlistKind)
const playlist = ref<YandexMusicPlaylist | null>(null)
const playlistTitle = ref<string>('Playlist:Title')
const playlistCover = ref<string>('')

// Computed

const title = computed((): string => `Playlist "${playlistTitle.value}"`)
const playlistCreated = computed((): string => (
  dayjs(playlist.value?.created || 0).format('DD.MM.YYYY HH:mm:ss')
))
const playlistDuration = computed((): string => {
  return converDurationToTime(playlist.value?.durationMs || 0)
})
const currentPlaylist = computed((): YandexMusicPlaylist | null => $player.playlist.value)
const playerStatus = computed((): PlayerStatus => $player.playerStatus.value)

// Methods

const onPlayPlaylist = () => {
  $bus.emit('player:startPlayback', playlist.value?.tracks[0].track)
}

const onPausePlaylist = () => {
  $bus.emit('player:pausePlayback')
}

const onResumePlaylist = () => {
  $bus.emit('player:resumePlayback')
}

// Hooks

$yandexMusic
  .fetchPlaylistById(playlistKind.value)
  .then((result: YandexMusicPlaylist | undefined) => {
    if (result) {
      playlist.value = result
      playlistTitle.value = result.title

      if (result.cover) {
        $yandexMusic
          .getCover(result.cover)
          .then(result => {
            if (!result) return

            playlistCover.value = result
          })
      }
    }
  })
</script>