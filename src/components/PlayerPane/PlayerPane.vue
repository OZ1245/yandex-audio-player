<template>
  <div class="player-pane">
    <button
      v-if="playerStatus === 'stopped' || playerStatus === 'paused'"
      type="button"
      title="play"
    >
      Play
    </button>
    <button
      v-if="playerStatus === 'playing'"
      type="button"
      title="pause"
    >
      Pause
    </button>
  </div>
</template>

<script lang="ts" setup>
import { inject } from 'vue';

const { playerStatus }: any = inject('player')
</script>