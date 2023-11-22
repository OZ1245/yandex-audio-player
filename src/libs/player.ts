import { AxiosResponse } from 'axios'
import { useYandexMusic } from './yandexMusic'
import { inject } from 'vue'
import { Player } from '@/plugins/player/@types'
// import player from '@/plugins/player'

export function usePlayer () {
  const $yandexMusic = useYandexMusic()
  const $player = inject('player') as Player

  const playTrack = (): void => {
    if ($yandexMusic.currentTrack) {
      $yandexMusic
        .fetchStream()
        .then(({ data }: AxiosResponse<ArrayBuffer>) => {
          $player.audioContext.decodeAudioData(data, (buffer: AudioBuffer) => {
            console.log('buffer:', buffer)
            $player.playlist.push(buffer)
            if ($player.playlist.length) {
              scheduleBuffers()
            }
            // const source = $player.audioContext.createBufferSource()
            // source.buffer = buffer
            // source.connect($player.audioContext.destination)
            // source.start(0)
          })
        })
    }
  }

  const scheduleBuffers = () => {
    $player.playlist.map((item) => {
      const buffer = item
      const source = $player.audioContext.createBufferSource()
      source.buffer = buffer
      source.connect($player.audioContext.destination)

      if ($player.nextTime === 0) {
        $player.nextTime = $player.audioContext.currentTime + 0.01
      }

      source.start($player.nextTime)
      $player.nextTime += source.buffer?.duration
    })
  }

  return {
    playTrack
  }
}