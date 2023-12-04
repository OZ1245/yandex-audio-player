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

      <ymp-playlist
        v-if="playlist?.tracks?.length"
        :tracks="playlist.tracks"
      />
    </div>
  </sub-view>
</template>

<script lang="ts" setup>
import './style.scss'
import SubView from '@/components/SubView/SubView.vue'
import YmpPlaylist from '@/components/common/YmpPlaylist/YmpPlaylist.vue'
import { YandexMusicPlaylist } from '@/@types'
import { useYandexMusic } from '@/composables/yandexMusic';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useUtils } from '@/composables/utils';
import { usePlayer } from '@/composables/player';

// Composables

const { params: routeParams } = useRoute()
const { fetchPlaylistById, getCover } = useYandexMusic()
const { millisecondsToDisplay } = useUtils()

// Variables

const playlistKind = ref<number>(+routeParams.playlistKind)
const playlist = ref<YandexMusicPlaylist | null>(null)
const playlistTitle = ref<string>('Playlist:Title')
const playlistCover = ref<string>('')

// Computed

const title = computed((): string => `Playlist "${playlistTitle.value}"`)

// Methods

// TODO:

// Hooks

fetchPlaylistById(playlistKind.value)
  .then((result: YandexMusicPlaylist | undefined) => {
    if (result) {
      playlist.value = result
      playlistTitle.value = result.title

      if (result.cover) {
        getCover(result.cover).then(result => {
          if (!result) return

          playlistCover.value = result
        })
      }
    }
  })
</script>