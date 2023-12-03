<template>
  <div class="sub-view">
    <div class="sub-view__heading">
      <button
        type="button"
        :title="props.buttonTitle"
        class="sub-view__back-button"
        @click="onClickBack()"
      >
        Back
      </button>
      <h1 class="sub-view__title">{{ props.title }}</h1>
    </div>

    <div class="sub-view__body">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import './style.scss'
import { withDefaults, defineProps } from 'vue'
import { RouteParams, useRouter } from 'vue-router';

type SubViewTitle = string
type SubViewButtonTitle = string

const { push: routerPush } = useRouter()

// Props

const props = withDefaults(defineProps<{
  link: RouteParams
  title: SubViewTitle
  buttonTitle: SubViewButtonTitle
}>(), {
  title: '',
  buttonTitle: ''
})

// Methods

const onClickBack = () => {
  routerPush(props.link)
}
</script>