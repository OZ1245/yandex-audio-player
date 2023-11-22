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
          v-for="(track, i) in playlist.tracks" 
          :key="`track-${i}`"
          class="playlist-pane__item"
          @click="onClickTrack(track.id)"
        >
          <!-- TODO: -->
          <!-- <pre>{{ track }}</pre> -->
          {{ track.track?.artists.map(artist => artist.name).join(', ') }}
          -
          {{ track.track?.title }}
        </li>
      </ul>
    </div>
  </aside>
</template>

<script lang="ts" setup>
import { withDefaults, defineProps, ref } from 'vue'
import { IProps, IOnSelectPlaylist, IOnClickTrack } from './@types'
import { Playlist } from 'yandex-music-client'
import { useYandexMusic } from '@/libs/yandexMusic'
import { usePlayer } from '@/libs/player'

const $props = withDefaults(defineProps<IProps>(), {
  playlists: () => []
})

const { 
  fetchPlaylistById, 
  fetchDownloadInfo,
} = useYandexMusic()
const { playTrack } = usePlayer()

const selectedPlaylistKind = ref<number | null>(null)
const playlist = ref<Playlist | null>(null)

const onSelectPlaylist: IOnSelectPlaylist = () => {
  if (selectedPlaylistKind.value) {
    fetchPlaylistById(selectedPlaylistKind.value)
    .then((result: Playlist | undefined) => {
      playlist.value = result
    })
  }
}

const onClickTrack: IOnClickTrack = (trackId): void => {
  fetchDownloadInfo(trackId)
    .then(() => playTrack())
}
</script>