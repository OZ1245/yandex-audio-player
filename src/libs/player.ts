import { AxiosResponse } from 'axios'
import { useYandexMusic } from './yandexMusic'
import { inject, ref } from 'vue'
import { Player } from '@/plugins/player/@types'
import { Track, TrackData, TrackDownloadInfo } from '@/@types'
import { useStore } from 'vuex'
// import player from '@/plugins/player'

export function usePlayer () {
  const $store = useStore()
  const $yandexMusic = useYandexMusic()
  const $player = inject('player') as Player
  const currentTimer: {
    active: boolean
    id: number
  } = {
    active: false,
    id: 0
  }
  let audioBuffer: AudioBuffer | null = null
  let nextBufferIdLoading = false

  const addToQueue = (track: Track): void => {
    $store.dispatch('yandexMusic/addTrackToQueue', track)
  }

  const preparationCurrentTrack = async (track: Track): Promise<AudioBuffer | undefined> => {
    if (!track.data) return

    $yandexMusic.setCurrentTrackData(track.data)

    if (!track.downloadInfo?.length) {
      return await $yandexMusic
        .fetchDownloadInfo(track.data.id, true)
        .then(async () => {
          const url = getDownloadInfoUrl($yandexMusic.currentTrack)

          return await getBuffer(url)
            .then((buffer: AudioBuffer) => {
              return buffer
            })
        })
    } else {
      if (!track.buffer) return 

      return track.buffer
    }
  }

  const playTrack = (buffer: AudioBuffer): void => {
    audioBuffer = buffer
    const sourceNode = $player.audioContext.createBufferSource()
    sourceNode.buffer = buffer
    sourceNode.connect($player.audioContext.destination)
    sourceNode.start(0)

    currentTimer.active = true
    checkCurrentTime()

    sourceNode.onended = () => {
      // console.log('event:', event)

      currentTimer.active = false
      clearTimeout(currentTimer.id)
      sourceNode.stop(0)
      nextBufferIdLoading = false

      preparationCurrentTrack($store.state.yandexMusic.queue[0])
        .then((buffer) => {
          if (!buffer) return

          playTrack(buffer)
          $store.dispatch('yandexMusic/removeTrackFromQueue', 0)
        })
    }
  }

  const checkCurrentTime = () => {
    if (currentTimer.active) {
      currentTimer.id = setTimeout(() => {

        if (audioBuffer) {
          const difference: number = audioBuffer.duration - $player.audioContext.currentTime
          const nextTrack = $store.state.yandexMusic.queue[0]

          if (difference <= 30 && nextTrack && !nextBufferIdLoading) {
            nextBufferIdLoading = true

            $yandexMusic
              .fetchDownloadInfo(nextTrack.data.id)
              .then((downloadInfo: TrackDownloadInfo[]) => {
                $store.dispatch('yandexMusic/setTrackDownloadInfo', {
                  data: downloadInfo,
                  queueIndex: 0
                })

                const url = getDownloadInfoUrl(nextTrack)
                
                getBuffer(url)
                  .then((buffer: AudioBuffer) => {
                    $store.dispatch('yandexMusic/setTrackBuffer', {
                      data: buffer,
                      queueIndex: 0
                    })
                  })
              })
          }
        }

        checkCurrentTime()
      }, 1000)
    }
  }

  const getDownloadInfoUrl = (track: Track): string => {
    return track.downloadInfo
      ?.find((variant: TrackDownloadInfo): boolean => (
        variant.bitrateInKbps === 320 || variant.bitrateInKbps === 192 || variant.bitrateInKbps === 128
      ))
      ?.downloadInfoUrl || ''
  }

  const getBuffer = async (url: string): Promise<AudioBuffer> => {
    return await $yandexMusic
      .fetchStream(url)
      .then(async ({ data }: AxiosResponse<ArrayBuffer>) => {
        return await $player.audioContext
          .decodeAudioData(data)
          .then((buffer: AudioBuffer) => {
            return buffer
          })
      })
  }

  return {
    preparationCurrentTrack,
    playTrack,
    addToQueue
  }
}