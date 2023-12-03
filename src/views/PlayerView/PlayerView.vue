<template>
  <!-- <player-pane /> -->
  <div class="player-view">
    <div class="player-view__cover">
      <img
        src=""
        alt=""
      >
    </div>

    <div class="player-view__track">
      <p class="player-view__track-name">
        {{ 'Track:Name' }}
      </p>
    </div>

    <div class="player-view__progress">
      <div class="player-view__empty-track">
        <div class="player-view__progress-track"></div>
      </div>
      <div class="player-view__slider"></div>
    </div>

    <div class="player-view__times">
      <time class="player-view__past-tense">{{ '00:00' }}</time>
      <time class="player-view__duration">{{ '00:00' }}</time>
    </div>

    <div class="player-view__controls">
      <button
        type="button"
        class="player-view__control player-view__control--backward"
      >Back</button>
      <button
        v-if="playerStatus === 'stopped' || playerStatus === 'paused'"
        type="button"
        class="player-view__control player-view__control--play"
      >Play</button>
      <button
        v-if="playerStatus === 'playing'"
        type="button"
        class="player-view__control player-view__control--pause"
      >Pause</button>
      <button
        type="button"
        class="player-view__control player-view__control--forward"
      >Forvard</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { usePlayer } from '@/composables/player';
import './style.scss'
// import PlayerPane from '@/components/PlayerPane/PlayerPane.vue'

const { playerStatus } = usePlayer()
</script>