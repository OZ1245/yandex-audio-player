<template>
  <router-view v-if="!isLoading" />

  <p v-else>Loading...</p>

  <navigation-pane />
</template>

<script lang="ts" setup>
import { LoadingState } from '@/@types'
import { useYandexMusic } from '@/composables/yandexMusic'
import { ref } from 'vue'
import NavigationPane from '@/components/NavigationPane/NavigationPane.vue'

const { fetchClient } = useYandexMusic()

const isLoading = ref<LoadingState>(true)

fetchClient()
  .then((result) => {
    if (result) {
      isLoading.value = false
    }
  })
</script>
