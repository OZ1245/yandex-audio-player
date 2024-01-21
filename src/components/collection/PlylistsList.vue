<template>
  <ul class="playlists">
    <li
      v-for="(playlist, i) in props.playlists"
      :key="`playlist-${i}`"
      class="playlist"
      @click="onClickPlaylist($event, playlist)"
    >
      <div class="playlist__heading">
        <template v-if="currentPlaylist?.kind === playlist.kind">
          <button
            v-if="playerStatus === 'playing'"
            data-ref="controlButton"
            type="button"
            class="playlist__button"
            @click="onPausePlaylist()"
          >Pause</button>
          <button
            v-if="playerStatus === 'paused'"
            data-ref="controlButton"
            type="button"
            class="playlist__button"
            @click="onResumePlaylist()"
          >Play</button>
        </template>

        <button
          v-else
          data-ref="controlButton"
          type="button"
          class="playlist__button"
          @click="onPlayPlaylist(playlist.kind)"
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
import { PlayerStatus, YandexMusicPlaylist } from '@/@types'
import { useUtils } from '@/composables/utils';
import { useYandexMusic } from '@/composables/yandexMusic';
import { withDefaults, defineProps, inject, computed, ref } from 'vue'
import { useRouter } from 'vue-router';
import { usePlayer } from '@/composables/player';

// Composables

const { converDurationToTime } = useUtils()
const { push: routerPush } = useRouter()
const $yandexMusic = useYandexMusic()
const $bus: any = inject('bus')
const $player = usePlayer()

// Props

const props = withDefaults(defineProps<{
  playlists: YandexMusicPlaylist[]
}>(), {
  playlists: () => []
})

// Computed

const currentPlaylist = computed((): YandexMusicPlaylist | undefined => $yandexMusic.playlist)
const playerStatus = computed((): PlayerStatus => $player.playerStatus.value)

// Methods

const onClickPlaylist = (event: any, playlist: YandexMusicPlaylist) => {
  if (event.target.dataset.ref === 'controlButton') return

  routerPush({
    name: 'CollectionPlaylist',
    params: {
      playlistKind: playlist.kind
    }
  })
}

const onPlayPlaylist = (playlistKind: number) => {
  $yandexMusic
    .fetchPlaylistById(playlistKind)
    .then((result: YandexMusicPlaylist | undefined) => {
      if (result) {
        $bus.emit('player:startPlayback', result.tracks[0].track)
      }
    })
}

const onPausePlaylist = () => {
  $bus.emit('player:pausePlayback')
}

const onResumePlaylist = () => {
  $bus.emit('player:resumePlayback')
}

const getPlaylistDuration = (duration: number) => {
  return converDurationToTime(duration)
}
</script>