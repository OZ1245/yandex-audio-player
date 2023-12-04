import { AxiosResponse } from "axios";
import { useYandexMusic } from "./yandexMusic";
import { computed, inject } from "vue";
import {
  PlayerStatus,
  Track,
  TrackData,
  TrackDownloadInfo,
  Player,
} from "@/@types";
import { useStore } from "vuex";

export function usePlayer() {
  const $store = useStore();
  const $yandexMusic = useYandexMusic();
  const $player = inject("player") as Player;
  let currentTimerId = 0;
  let audioBuffer: AudioBuffer | null = null;
  let nextBufferIsLoading = false;
  let audioContext: AudioContext;

  const createAudioContext = () => {
    audioContext = new AudioContext();
  };

  const closeAudioContext = () => {
    audioContext.close();
  };

  const addToQueue = (track: Track): void => {
    $store.dispatch("yandexMusic/addTrackToQueue", track);
  };

  const preparationCurrentTrack = async (
    track: Track
  ): Promise<AudioBuffer | undefined> => {
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
    // if (!audioContext) return

    audioBuffer = buffer;
    const sourceNode = audioContext.createBufferSource();
    sourceNode.buffer = buffer;
    sourceNode.connect(audioContext.destination);
    sourceNode.start(0);
    $store.dispatch("player/setStatus", "playing");

    console.log("audioContext:", audioContext);
    console.log("getOutputTimestamp():", audioContext.getOutputTimestamp());
    console.log("audioBuffer:", audioBuffer);
    console.log("sourceNode:", sourceNode);

    checkCurrentTime();

    sourceNode.onended = () => {
      console.log("---sourceNode.onended---");

      clearTimeout(currentTimerId);
      sourceNode.stop(0);
      closeAudioContext();
      nextBufferIsLoading = false;

      preparationCurrentTrack($store.state.yandexMusic.queue[0]).then(
        (buffer) => {
          if (!buffer) return;

          playTrack(buffer);
          $store.dispatch("yandexMusic/removeTrackFromQueue", 0);
        }
      );
    };
  };

  const checkCurrentTime = () => {
    currentTimerId = setTimeout(() => {
      if (audioBuffer) {
        const difference: number =
          audioBuffer.duration - audioContext.currentTime;
        const nextTrack = $store.state.yandexMusic.queue[0];

        console.log("difference:", difference);

        if (difference <= 30 && nextTrack && !nextBufferIsLoading) {
          nextBufferIsLoading = true;

          $yandexMusic
            .fetchDownloadInfo(nextTrack.data.id)
            .then((downloadInfo: TrackDownloadInfo[]) => {
              $store.dispatch("yandexMusic/setTrackDownloadInfo", {
                data: downloadInfo,
                queueIndex: 0,
              });

              const url = getDownloadInfoUrl(nextTrack);

              getBuffer(url).then((buffer: AudioBuffer) => {
                $store.dispatch("yandexMusic/setTrackBuffer", {
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
