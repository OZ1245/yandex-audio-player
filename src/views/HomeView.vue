<template>
  <div class="home-view">
    TADA!
    <!-- <pre>rotors: {{rotors}}</pre> -->
    <pre>accountStatus: {{accountStatus}}</pre>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex';

const $store = useStore()

const client = computed(() => $store.state.client)
const accountStatus = ref<any>(null)

console.log('client:', client.value)

client.value.account
  .getAccountSettings()
  .then(async (result) => {
    accountStatus.value = await result
  })
</script>

