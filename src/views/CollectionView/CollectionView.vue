<template>
  <router-view class="collection-view__children"></router-view>

  <div class="collection-view">
    <div class="collection-view__item">
      <div class="collection-view__heading">
        <h2 class="collection-view__title">Playlists</h2>
        <button
          type="button"
          class="collection-view__toggler"
          @click="showPlaylist = !showPlaylist"
        >
          {{ showPlaylist ? '-' : '+' }}
        </button>
      </div>

      <playlists-list
        v-if="!isLoading"
        v-show="showPlaylist"
        :playlists="playlists"
      />
    </div>

  </div>
</template>

<script lang="ts" setup>
import './style.scss'
import { YandexMusicPlaylist, LoadingState, CollectionState } from '@/@types'
import PlaylistsList from "@/components/collection/PlylistsList.vue";
import { ref } from 'vue'
import { useYandexMusic } from '@/composables/yandexMusic'

// Composables

const { fetchPlaylists } = useYandexMusic()

// Data

const isLoading = ref<LoadingState>(true)
const playlists = ref<YandexMusicPlaylist[]>([])
const showPlaylist = ref<CollectionState>(true)

// Methods

fetchPlaylists()
  .then((result: YandexMusicPlaylist[] | undefined): void => {
    if (result) {
      playlists.value = result
      isLoading.value = false
    }
  })
</script>