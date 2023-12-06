import { AxiosResponse } from "axios";
import { useYandexMusic } from "./yandexMusic";
import { computed, inject } from "vue";
import { PlayerStatus, Track, YandexMusicTrack, TrackDownloadInfo, YandexMusicTrackItem } from "@/@types";
import { useStore } from "vuex";

export function usePlayer() {
  const $store = useStore();
  const $yandexMusic = useYandexMusic();

  const $audioContext: any = inject('audioContext');

  let currentTimerId = 0;
  let audioBuffer: AudioBuffer | null = null;
  let nextBufferIsLoading = false;

  // const clearPlayback = () => {

  // }

  const addToQueue = (track: Track): void => {
    $store.dispatch("player/addTrackToQueue", track);
  };

  // const clearQueue = () => {

  // }

  const preparationCurrentTrack = async (
    track: Track
  ): Promise<AudioBuffer | undefined> => {
    $audioContext.closeAudioContext();
    clearTimeout(currentTimerId)

    if (!track.data) return;
    $audioContext.createAudioContext();

    $yandexMusic.setCurrentTrackData(track.data);

    if (!track.downloadInfo?.length) {
      return await $yandexMusic
        .fetchDownloadInfo(track.data.id, true)
        .then(async () => {
          const url = getDownloadInfoUrl($yandexMusic.currentTrack);

          return await getBuffer(url).then((buffer: AudioBuffer) => {
            return buffer;
          });
        });
    } else {
      if (!track.buffer) return;

      return track.buffer;
    }
  };

  const preparationQueue = (index: number) => {
    $store.state.yandexMusic.playlist.tracks
      .slice(index+1)
      ?.map((item: YandexMusicTrackItem) => {
        addToQueue({
          data: item.track
        } as Track)
      })
  }

  const playTrack = (buffer: AudioBuffer): void => {
    audioBuffer = buffer;
    const sourceNode = $audioContext.context.value.createBufferSource();
    sourceNode.buffer = buffer;
    sourceNode.connect($audioContext.context.value.destination);
    sourceNode.start(0);
    $store.dispatch("player/setStatus", "playing");

    checkCurrentTime();

    sourceNode.onended = () => {
      clearTimeout(currentTimerId);
      sourceNode.stop(0);
      nextBufferIsLoading = false;

      preparationCurrentTrack($store.state.player.queue[0]).then((buffer) => {
        if (!buffer) return;

        playTrack(buffer);
        $store.dispatch("player/removeTrackFromQueue", 0);
      });
    };
  };

  const pauseTrack = () => {
    $audioContext.suspenAudioContext()
    clearTimeout(currentTimerId)
    $store.dispatch('player/setStatus', 'paused');
  }

  const resumeTrack = () => {
    $audioContext.resumeAudioContext()
    checkCurrentTime()
    $store.dispatch('player/setStatus', 'playing');
  }

  const checkCurrentTime = () => {
    currentTimerId = setTimeout(() => {
      if (audioBuffer) {
        const difference: number =
          audioBuffer.duration - $audioContext.context.value.currentTime;
        const nextTrack = $store.state.player.queue[0];

        console.log("difference:", difference);

        if (difference <= 30 && nextTrack && !nextBufferIsLoading) {
          nextBufferIsLoading = true;

          $yandexMusic
            .fetchDownloadInfo(nextTrack.data.id)
            .then((downloadInfo: TrackDownloadInfo[]) => {
              $store.dispatch("player/setTrackDownloadInfo", {
                data: downloadInfo,
                queueIndex: 0,
              });

              const url = getDownloadInfoUrl(nextTrack);

              getBuffer(url).then((buffer: AudioBuffer) => {
                $store.dispatch("player/setTrackBuffer", {
                  data: buffer,
                  queueIndex: 0,
                });
              });
            });
        }
      }

      checkCurrentTime();
    }, 1000);
  };

  const getDownloadInfoUrl = (track: Track): string => {
    return (
      track.downloadInfo?.find(
        (variant: TrackDownloadInfo): boolean =>
          variant.bitrateInKbps === 320 ||
          variant.bitrateInKbps === 192 ||
          variant.bitrateInKbps === 128
      )?.downloadInfoUrl || ""
    );
  };

  const getBuffer = async (url: string): Promise<AudioBuffer> => {
    return await $yandexMusic
      .fetchStream(url)
      .then(async ({ data }: AxiosResponse<ArrayBuffer>) => {
        return await $audioContext
          .context.value
          .decodeAudioData(data)
          .then((buffer: AudioBuffer) => {
            return buffer;
          });
      });
  };

  const playerStatus = computed((): PlayerStatus => $store.state.player.status);

  const currentTrackData = computed(
    (): YandexMusicTrack | null => $store.state.yandexMusic.currentTrack.data || null
  );

  return {
    preparationCurrentTrack,
    preparationQueue,
    playTrack,
    addToQueue,

    playerStatus,
    currentTrackData,

    pauseTrack,
    resumeTrack,
  };
}
