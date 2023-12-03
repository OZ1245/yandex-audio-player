<template>
  <div class="app">
    <div
      class="app__splash"
      v-if="isLoading"
    >
      <p class="app__splash-message">Loading...</p>
    </div>

    <div
      v-if="!isLoading"
      class="app__content"
    >
      <router-view />
    </div>

    <navigation-pane class="app__navigation" />
  </div>
</template>

<script lang="ts" setup>
import { LoadingState } from '@/@types'
import { useYandexMusic } from '@/composables/yandexMusic'
import { ref } from 'vue'
import NavigationPane from '@/components/NavigationPane/NavigationPane.vue'

const { fetchClient, fetchAccountStatus } = useYandexMusic()

const isLoading = ref<LoadingState>(true)

fetchClient()
  .then((result) => {
    if (result) {
      fetchAccountStatus()
        .then(() => {
          isLoading.value = false
        })
    }
  })
</script>
