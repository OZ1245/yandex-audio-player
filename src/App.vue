<template>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </nav>
  
  <router-view v-if="!isLoading" />

  <p v-else>Loading...</p>
</template>

<script lang="ts" setup>
import { useYandexMusic } from '@/libs/yandexMusic'
import { ref } from 'vue'

const { fetchClient } = useYandexMusic()

const isLoading = ref<boolean>(true)

fetchClient()
  .then((result) => {
    if (result) {
      isLoading.value = false
    }
  })
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
