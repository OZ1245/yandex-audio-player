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
          @click="onClickTrack(track, i)"
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
import { IProps, IOnSelectPlaylist } from './@types'
import { useYandexMusic } from '@/libs/yandexMusic'
import { usePlayer } from '@/libs/player'
import { 
  TrackData, 
  YandexMusicPlaylist, 
  TrackDownloadInfo,
  YandexMusicTrackItem,
  Track
} from '@/@types'

const $props = withDefaults(defineProps<IProps>(), {
  playlists: () => []
})

const { 
  fetchPlaylistById, 
  fetchDownloadInfo,
  currentTrack,
  setCurrentTrackData,
} = useYandexMusic()
const { preparationCurrentTrack, addToQueue, playTrack } = usePlayer()

const selectedPlaylistKind = ref<number | null>(null)
const playlist = ref<YandexMusicPlaylist | null>(null)

const onSelectPlaylist = (): void => {
  if (selectedPlaylistKind.value) {
    fetchPlaylistById(selectedPlaylistKind.value)
    .then((result: YandexMusicPlaylist | undefined): void => {
      if (result) {
        playlist.value = result
      }
    })
  }
}

/**
 * Проиграть трек из плейлиста
 * @param track 
 * @param index 
 */
const onClickTrack = (track: TrackData, index: number): void => {
  preparationCurrentTrack({
    data: track
  })
    .then((buffer) => {
      playTrack(buffer)

      if (typeof index !== 'undefined') {
        playlist.value
          ?.tracks
          .map((track: YandexMusicTrackItem, i: number) => {
            if (i > index) {
              addToQueue<Track>({
                data: track.track,
              })
            }
          }) || []
      }
    })
}
</script>