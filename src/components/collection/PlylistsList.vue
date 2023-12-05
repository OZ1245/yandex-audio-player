<template>
  <ul class="playlists">
    <li
      v-for="(playlist, i) in props.playlists"
      :key="`playlist-${i}`"
      class="playlist"
      @click="onClickPlaylist(playlist)"
    >
      <div class="playlist__heading">
        <button
          type="button"
          class="playlist__button"
        >Play</button>
        <h3 class="playlist__title">{{ playlist.title }}</h3>
      </div>

      <ul class="playlist__info">
        <li class="playlist__info-item">
          <span>Треков:</span> {{ playlist.trackCount }}
        </li>
        <li class="playlist__info-item">
          <span>Длительность:</span> {{ getPlaylistDuration(playlist.durationMs) }}
        </li>
      </ul>
    </li>
  </ul>
</template>

<script lang="ts" setup>
import './style.scss'
import { YandexMusicPlaylist } from '@/@types'
import { useUtils } from '@/composables/utils';
import { withDefaults, defineProps } from 'vue'
import { useRouter } from 'vue-router';

const { converDurationToTime } = useUtils()
const { push: routerPush } = useRouter()

const props = withDefaults(defineProps<{
  playlists: YandexMusicPlaylist[]
}>(), {
  playlists: () => []
})

const onClickPlaylist = (playlist: YandexMusicPlaylist) => {
  routerPush({
    name: 'CollectionPlaylist',
    params: {
      playlistKind: playlist.kind
    }
  })
}

const getPlaylistDuration = (duration: number) => {
  return converDurationToTime(duration)
}
</script>