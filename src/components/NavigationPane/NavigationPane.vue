<template>
  <nav class="navigation-pane">
    <ul class="navigation-pane__list">
      <li
        v-for="(link, i) in navigationLinks"
        :key="`navigation-link-${i}`"
        class="navigation-pane__item"
      >
        <router-link
          :to="{ name: link.routeName }"
          class="navigation-pane__link"
          active-class="navigation-pane__link--active"
          :title=link.titleAttr
        >
          {{ link.title }}
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
import './style.scss'

type RouteName = string
type TitleAttribute = string
type ButtonText = string

interface NavigationLinks {
  routeName: RouteName
  titleAttr: TitleAttribute
  title: ButtonText
}

const navigationLinks: NavigationLinks[] = [
  {
    routeName: 'Collection',
    titleAttr: 'Collection',
    title: 'Collection'
  },
  {
    routeName: 'Player',
    titleAttr: 'Player',
    title: 'Player'
  },
  {
    routeName: 'Playlist',
    titleAttr: 'Playlist',
    title: 'Playlist'
  },
]
</script>