import { AxiosResponse } from "axios";
import { useYandexMusic } from "./yandexMusic";
import { computed, inject, ref } from "vue";
import { 
  PlayerStatus, 
  Track, 
  YandexMusicTrack, 
  TrackDownloadInfo, 
  YandexMusicTrackItem,
  Response,
} from "@/@types";
// import { useStore } from "vuex";
import store from '@/store'

export function usePlayer() {
  // const $store = useStore();
  const $store = store;
  const $yandexMusic = useYandexMusic();
  
  // const $yandexMusicClient: any = inject('$yandexMusicClient')
  // const $audioContext: any = inject('audioContext');
  const audioContext = ref<AudioContext | null>(null)

  // Идентификатор таймера
  let playbackTimerId = 0;
  // Буффер трека
  let audioBuffer: AudioBuffer | null = null;
  // Флаг, что сейчас загружается буффер следующего трека
  let nextBufferIsLoading = false;

  // Текущий статус плеера
  const playerStatus = computed((): PlayerStatus => $store.state.player.status);
  // Текущий трек
  const playback = computed(
    (): Track => $store.state.player.playback
  );

  // ---
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
  // ---

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
    preparationPlayback({ data: track })
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
  const preparationPlayback = async (
    track: Track
  ): Promise<AudioBuffer | undefined> => {
    console.log('--- preparationPlayback ---');
    console.log('$yandexMusic:', $yandexMusic);
    

    if (!track.data) return

    // Создаем новый контекст
    createAudioContext();
    // Устанавливаем данные о текущем треке
    $store.dispatch("player/setPlaybackData", track.data);

    // const currentTrack = $yandexMusic.currentTrack

    // Если у трека уже есть буффер, то просто его возвращаем
    if (track.buffer) {
      return track.buffer;
    }

    // Если нет буффера, то полностью загружаем и данные инфо, 
    // и буффер по этим данным
    return await $yandexMusic
      .fetchDownloadInfo(track.data.id, true)
      .then(async (result: any) => {
        console.log('playback.value:', playback.value);
        console.log('result:', result);
        
        if (!result) return

        // Получаем ссылку на загрузку
        const url = getDownloadInfoUrl(playback.value);
        console.log('getDownloadInfoUrl url:', url);
        

        // Получаем буффер по ссылке
        return await getBuffer(url)
          .then((buffer: AudioBuffer | null) => {
            if (buffer) return buffer;
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
    if (!audioContext.value) return
    
    // Сохраняем буффер в объект для дальнейшего использования
    audioBuffer = buffer

    // Создаем источник контекста
    const sourceNode = audioContext.value.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(audioContext.value.destination);

    // Начинаем воспроизведние
    sourceNode.start(0);
    $store.dispatch("player/setStatus", "playing");

    // Запускаем отслеживания метки времени
    currentTrackTimer()

    // Устанавливаем обработчик окончания воспроизведения
    sourceNode.onended = () => {
      endPlaybackHandler()
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
    clearTimeout(playbackTimerId)
    if (audioBuffer) {
      // Вычисляем, сколько осталось до конца трека
      const currentTime = audioContext.value?.currentTime || 0
      const difference: number =
        audioBuffer.duration - currentTime;
      console.log("difference:", difference);
      
      // Если до конца трека осталось меньше 30 сек., то предзагружаем буффер 
      // для следующего трека, если он есть
      if (difference <= 30 && $store.state.player.queue[0] && !nextBufferIsLoading) {
        nextBufferIsLoading = true;

        // Подготовка следующего трека
        fetchNextTrack()
      }

      // Повторяем через секунду
      playbackTimerId = setTimeout(currentTrackTimer, 1000);
    }
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
        getBuffer(url).then((buffer: AudioBuffer | null) => {
          if (!buffer) return

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
    console.log('--- getDownloadInfoUrl ---');
    console.log('track:', track);
    
    
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
  const getBuffer = async (url: string): Promise<AudioBuffer | null> => {
    console.log('--- getBuffer ---');
    console.log('url:', url);
    
    
    return await $yandexMusic
      .fetchStream(url)
      // .then(async ({ data }: AxiosResponse<ArrayBuffer>) => {
      .then(async ({ data }: any) => {
        console.log('data:', data);
        
        // Полученный массив медиа-данных декодируем в буффер и отдаем его
        return await audioContext.value
          ?.decodeAudioData(data)
          .then((buffer: AudioBuffer) => {
            return buffer;
          });
      }) || null
  };

  /**
   * Приостановить поспроизведение
   */
  const pausePlayback = () => {
    // Тормозим таймер (сбрасываем)
    clearTimeout(playbackTimerId)
    // Задерживаем контекст
    suspenAudioContext()
    $store.dispatch('player/setStatus', 'paused');
  }

  /**
   * Продолжить воспроизведение
   */
  const resumePlayback = () => {
    // Запускаем таймер
    currentTrackTimer()
    // Продолжаем воспроизведение контекста
    resumeAudioContext()
    $store.dispatch('player/setStatus', 'playing');
  }

  /**
   * Остановить воспроизведение
   */
  const stopPlayback = () => {
    console.log('---stopPlayback---');

    // Закрываем контекст
    closeAudioContext()

    // Сбрасываем буффер
    audioBuffer = null
    
    // Тормозим таймер
    clearTimeout(playbackTimerId)

    // TODO: Не понимаю пока, нужно ли отчищать очередь
    $store.dispatch('player/removeAllTracksFromQueue')
    $store.dispatch('player/setStatus', 'stopped')
  }

  /**
   * Обработчик окончания проигрывания источника контекста
   * @param {any} sourceNode Источник контекста
   */
  const endPlaybackHandler = () => {
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

  // ---------------------------------------------------------------------------
  // const fetchDownloadInfo = async (
  //   trackId: number | string,
  //   current = false
  // ): Promise<TrackDownloadInfo[] | []> => {
  //   console.log('---fetchDownloadInfo---');
    
  //   console.log('$yandexMusicClient:', $yandexMusicClient);
  //   if (!$yandexMusicClient) return []

    
  //   return await $yandexMusicClient.tracks
  //     .getDownloadInfo(trackId)
  //     .then(
  //       ({ result }: Response<TrackDownloadInfo[]>) => {
  //         console.log('result:', result);
          
  //         if (current) {
  //           $store.dispatch("player/setPlaybackInfo", result);
  //         }

  //         return result;
  //       }
  //     );
  // };
  // ---------------------------------------------------------------------------

  return {
    startPlayback,

    preparationPlayback,
    preparationQueue,
    playTrack,
    addToQueue,

    playerStatus,
    playback,

    pausePlayback,
    resumePlayback,
  };
}
