import { AxiosResponse } from "axios";
import { useYandexMusic } from "./yandexMusic";
import { computed } from "vue";
import { PlayerStatus, Track, TrackData, TrackDownloadInfo } from "@/@types";
import { useStore } from "vuex";

export function usePlayer() {
  const $store = useStore();
  const $yandexMusic = useYandexMusic();
  let currentTimerId = 0;
  let audioBuffer: AudioBuffer | null = null;
  let nextBufferIsLoading = false;
  let audioContext: AudioContext;

  const createAudioContext = () => {
    audioContext = new AudioContext();
  };

  const closeAudioContext = () => {
    if (!audioContext) return;

    audioContext.close();
  };

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
    closeAudioContext();

    if (!track.data) return;
    createAudioContext();

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

  const playTrack = (buffer: AudioBuffer): void => {
    audioBuffer = buffer;
    const sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = buffer;
    sourceNode.connect(audioContext.destination);
    sourceNode.start(0);
    $store.dispatch("player/setStatus", "playing");

    checkCurrentTime();

    sourceNode.onended = () => {
      clearTimeout(currentTimerId);
      sourceNode.stop(0);
      closeAudioContext();
      nextBufferIsLoading = false;

      preparationCurrentTrack($store.state.player.queue[0]).then((buffer) => {
        if (!buffer) return;

        playTrack(buffer);
        $store.dispatch("player/removeTrackFromQueue", 0);
      });
    };
  };

  const checkCurrentTime = () => {
    currentTimerId = setTimeout(() => {
      if (audioBuffer) {
        const difference: number =
          audioBuffer.duration - audioContext.currentTime;
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
        return await audioContext
          .decodeAudioData(data)
          .then((buffer: AudioBuffer) => {
            return buffer;
          });
      });
  };

  const playerStatus = computed(
    (): PlayerStatus => $store.state.player.status
  ).value;

  const currentTrackData = computed(
    (): TrackData | null => $store.state.yandexMusic.currentTrack.data || null
  );

  return {
    preparationCurrentTrack,
    playTrack,
    addToQueue,

    playerStatus,
    currentTrackData,
  };
}
