import { AxiosResponse } from "axios";
import { useYandexMusic } from "./yandexMusic";
import { computed, inject } from "vue";
import { PlayerStatus, Track, YandexMusicTrack, TrackDownloadInfo, YandexMusicTrackItem } from "@/@types";
import { useStore } from "vuex";

export function usePlayer() {
  const $store = useStore();
  const $yandexMusic = useYandexMusic();
  const $audioContext: any = inject('audioContext');

  // Идентификатор таймера
  let currentTrackTimerId = 0;
  // Буффер трека
  let audioBuffer: AudioBuffer | null = null;
  // Флаг, что сейчас загружается буффер следующего трека
  let nextBufferIsLoading = false;

  // Текущий статус плеера
  const playerStatus = computed((): PlayerStatus => $store.state.player.status);
  // Текущий трек
  const currentTrackData = computed(
    (): YandexMusicTrack | null => $store.state.yandexMusic.currentTrack.data || null
  );

  /**
   * Начало проигрывания
   * @param {YandexMusicTrack} track Трек, с которого нужно начать проигрывание
   */
  const startPlayback = (track: YandexMusicTrack) => {
    console.log('---startPlayback---');
    console.log('track:', track);
    
    // Подготовка к воспроизведению
    // Останавливаем воспроизведение
    stopPlayback()

    // Получаем массив DownloadInfo и AudioBuffer трека
    preparationCurrentTrack({ data: track })
      .then((buffer) => {
        if (!buffer) return

        // Начинаем вопроизведение
        playTrack(buffer)
      })

    // Добавляем последующие треки, если есть, в очередь вопроизведения
    preparationQueue(+track.id)
  }

  /**
   * Подготовка нового трека и получение его буффера
   * @param {YandexMusicTrack} track Данные о треке 
   * @returns {AudioBuffer} Буффер трека для воспроизведения
   */
  const preparationCurrentTrack = async (
    track: Track
  ): Promise<AudioBuffer | undefined> => {
    if (!track.data) return

    // Создаем новый контекст
    $audioContext.createAudioContext();
    // Устанавливаем данные о текущем треке
    $yandexMusic.setCurrentTrackData(track.data);

    // const currentTrack = $yandexMusic.currentTrack

    // Если у трека уже есть буффер, то просто его возвращаем
    if (track.buffer) {
      return track.buffer;
    }

    // Если нет буффера, то полностью загружаем и данные инфо, 
    // и буффер по этим данным
    return await $yandexMusic
      .fetchDownloadInfo(track.data.id, true)
      .then(async (result) => {
        if (!result) return

        // Получаем ссылку на загрузку
        const url = getDownloadInfoUrl($yandexMusic.currentTrack);

        // Получаем буффер по ссылке
        return await getBuffer(url)
          .then((buffer: AudioBuffer) => {
            return buffer;
          });
      })
  };

  /**
   * Добавление тректов плейлиста в очередь воспроизвдения
   * @param {number} id Id трека, с которого началось вопроизведение
   */
  const preparationQueue = (id: number) => {
    const index = $store.state.yandexMusic
      .playlist
      .tracks
      ?.findIndex((item: YandexMusicTrackItem) => (
        item.id === id
      ))
    
    if (index < 0) return
    
    // Отчищаем старую очередь
    $store.dispatch('player/removeAllTracksFromQueue')

    // Вытаскиваем следующие треки и, если они будут, добавляем их в очередь
    $store.state.yandexMusic.playlist.tracks
      .slice(index+1)
      ?.map((item: YandexMusicTrackItem) => {
        // Добавляем трек в очередь
        addToQueue({
          data: item.track
        } as Track)
      })
  }

  /**
   * Воспроизведение трека из полученного буффера
   * @param {AudioBuffer} buffer 
   */
  const playTrack = (buffer: AudioBuffer): void => {
    console.log('---playTrack---');
    
    // Сохраняем буффер в объект для дальнейшего использования
    audioBuffer = buffer

    // Создаем источник контекста
    const sourceNode = $audioContext.context.value.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect($audioContext.context.value.destination);

    // Начинаем воспроизведние
    sourceNode.start(0);
    $store.dispatch("player/setStatus", "playing");

    // Запускаем отслеживания метки времени
    currentTrackTimer()

    // Устанавливаем обработчик окончания воспроизведения
    sourceNode.onended = () => {
      endPlaybackHandler(sourceNode)
    };
  };

  /**
   * Добавление трека в очередь
   * @param {Track} track Информация о треке
   */
  const addToQueue = (track: Track) => {
    $store.dispatch("player/addTrackToQueue", track);
  };

  /**
   * Таймер трека - отслеживание временной метки контекста
   */
  const currentTrackTimer = () => {
    clearTimeout(currentTrackTimerId)
    // currentTrackTimerId = setTimeout(() => {
      if (audioBuffer) {
        // Вычисляем, сколько осталось до конца трека
        const difference: number =
          audioBuffer.duration - $audioContext.context.value.currentTime;
        console.log("difference:", difference);
        
        // Если до конца трека осталось меньше 30 сек., то предзагружаем буффер 
        // для следующего трека, если он есть
        if (difference <= 30 && $store.state.player.queue[0] && !nextBufferIsLoading) {
          nextBufferIsLoading = true;

          // Подготовка следующего трека
          fetchNextTrack()
        }

        currentTrackTimerId = setTimeout(currentTrackTimer, 1000);
      }
    // }, 1000);
  };

  /**
   * Получение данных и буфера для следующего трека в очереди, если он есть
   */
  const fetchNextTrack = () => {
    // Следующий трек
    const nextTrack = $store.state.player.queue[0];

    if (!nextTrack) return

    // Загружаем массив данных загрузки буфера
    $yandexMusic
      .fetchDownloadInfo(nextTrack.data.id)
      .then((downloadInfo: TrackDownloadInfo[]) => {
        $store.dispatch("player/setTrackDownloadInfo", {
          data: downloadInfo,
          queueIndex: 0,
        });

        // Получаем ссылку на загрузку буффера
        const url = getDownloadInfoUrl(nextTrack);

        // Загружаем буффер трека
        getBuffer(url).then((buffer: AudioBuffer) => {
          $store.dispatch("player/setTrackBuffer", {
            data: buffer,
            queueIndex: 0,
          });
        });
      });
  }

  /**
   * Получение ссылки на получение буффера трека
   * @param {Track} track Трек
   * @returns {string} Ссылка на получение буффера
   */
  const getDownloadInfoUrl = (track: Track): string => {
    // По-убывающей, сначала самый быстрый битрейд
    return (
      track.downloadInfo?.find(
        (variant: TrackDownloadInfo): boolean =>
          variant.bitrateInKbps === 320 ||
          variant.bitrateInKbps === 192 ||
          variant.bitrateInKbps === 128
      )?.downloadInfoUrl || ""
    );
  };

  /**
   * Загрузка буффера трека по ссылке
   * @param {string} url Ссылка на буффер
   * @returns {AudioBuffer} Буффер трека
   */
  const getBuffer = async (url: string): Promise<AudioBuffer> => {
    return await $yandexMusic
      .fetchStream(url)
      .then(async ({ data }: AxiosResponse<ArrayBuffer>) => {
        // Полученный массив медиа-данных декодируем буффер и отдаем его
        return await $audioContext
          .context.value
          .decodeAudioData(data)
          .then((buffer: AudioBuffer) => {
            return buffer;
          });
      });
  };

  /**
   * Приостановить поспроизведение
   */
  const pausePayback = () => {
    // Тормозим таймер (сбрасываем)
    clearTimeout(currentTrackTimerId)
    // Задерживаем контекст
    $audioContext.suspenAudioContext()
    $store.dispatch('player/setStatus', 'paused');
  }

  /**
   * Продолжить воспроизведение
   */
  const resumePayback = () => {
    // Запускаем таймер
    currentTrackTimer()
    // Продолжаем воспроизведение контекста
    $audioContext.resumeAudioContext()
    $store.dispatch('player/setStatus', 'playing');
  }

  /**
   * Остановить воспроизведение
   */
  const stopPlayback = () => {
    console.log('---stopPlayback---');

    // Закрываем контекст
    $audioContext.closeAudioContext()

    // Сбрасываем буффер
    audioBuffer = null
    
    // Тормозим таймер
    clearTimeout(currentTrackTimerId)

    // TODO: Не понимаю пока, нужно ли отчищать очередь
    $store.dispatch('player/removeAllTracksFromQueue')
    $store.dispatch('player/setStatus', 'stopped')
  }

  /**
   * Обработчик окончания проигрывания источника контекста
   * @param {any} sourceNode Источник контекста
   */
  const endPlaybackHandler = (sourceNode: any) => {
    // Получаем следующий трек
    const nextTrack = $store.state.player.queue[0]
    console.log('nextTrack:', nextTrack);
    
    // Останавливаем проигрывание
    stopPlayback()
    console.log('nextTrack:', nextTrack);
    nextBufferIsLoading = false

    // Если следующий трек есть, то подготавливаем его и воспроизводим
    if (nextTrack) {
      startPlayback(nextTrack.data)
    }
  }

  return {
    startPlayback,

    preparationCurrentTrack,
    preparationQueue,
    playTrack,
    addToQueue,

    playerStatus,
    currentTrackData,

    pausePayback,
    resumePayback,
  };
}
