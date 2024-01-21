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
            <button
              type="button"
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
import SubView from '@/components/SubView/SubView.vue'
import YmpPlaylist from '@/components/common/YmpPlaylist/YmpPlaylist.vue'
import { YandexMusicTrack, YandexMusicPlaylist } from '@/@types'
import { useYandexMusic } from '@/composables/yandexMusic';
import { computed, inject, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useUtils } from '@/composables/utils';

const dayjs: any = inject('dayjs')

// Composables

const { converDurationToTime } = useUtils()
const { params: routeParams } = useRoute()
const { fetchPlaylistById, getCover } = useYandexMusic()
// const $player: any = inject('$player')
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

// Methods

const onPlayPlaylist = () => {
  $bus.emit('player:startPlayback', playlist.value?.tracks[0].track)
}

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