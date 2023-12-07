import { ref } from "vue";

export default {
  install: (app: any) => {
    const audioContext = ref<AudioContext | null>(null)

    const createAudioContext = () => {
      audioContext.value = new AudioContext();
    };

    const closeAudioContext = () => {
      console.log('---closeAudioContext---');
      
      audioContext.value?.close();
      audioContext.value = null

      console.log('audioContext.value:', audioContext.value);
      
    };

    const suspenAudioContext = () => {
      audioContext.value?.suspend();
    }

    const resumeAudioContext = () => {
      audioContext.value?.resume();
    }

    // This is what you want:
    app.config.globalProperties.$audioContext = {
      context: audioContext,
      createAudioContext,
      closeAudioContext,
      suspenAudioContext,
      resumeAudioContext
    }

    // But this is the recommended approach:
    app.provide('audioContext', {
      context: audioContext,
      createAudioContext,
      closeAudioContext,
      suspenAudioContext,
      resumeAudioContext
    })

    // feel free to use both at once though
  }
}