import { YandexMusicPlugin, Response, YandexMusicCover } from "@/@types";
import {
  YandexMusicAccountStatus,
  YandexMusicAccount,
  YandexMusicPlaylist,
  TrackData,
  TrackDownloadInfo,
  Track,
} from "@/@types";
import { computed, inject } from "vue";
import { useStore } from "vuex";
import axios, { AxiosResponse } from "axios";
import CryptoJS from "crypto-js";
// import { YandexMusicClient } from "yandex-music-client";
import yandexMusicClient from "@/plugins/yandexMusic"

export function useYandexMusic() {
  console.log('--- useYandexMusic ---');
  
  const $store = useStore();
  const yandexMusicClient: any = inject("$yandexMusicClient");
  // console.log('yandexMusicClient:', yandexMusicClient);
  

  // const client = computed(() => $store.state.yandexMusic.client || null);
  
  // const client = $yandexMusic.client
  // API-клиент Yandex Music
  // const client = computed((): any => (
  //   $store.state.yandexMusic.client
  // ))
  // Текущий трек
  // const currentTrack = computed(
  //   (): Track => $store.state.yandexMusic.currentTrack || null
  // ).value;
  // Аккаунт пользователя
  const account = computed(
    (): YandexMusicAccountStatus | null =>
      $store.state.yandexMusic.account || null
  );

  /**
   * Получить и сохранить клиент
   */
  // const fetchClient = async (): Promise<boolean> => {
  //   return await $yandexMusic
  //     .getClient()
  //     .then((result) => {
  //       $store.dispatch("yandexMusic/setClient", result);

  //       return true;
  //     });
  // };

  /**
   * Получить настройки пользователя
   * /account/settings
   */
  // const getAccountSettings = async (): Promise<YandexMusicSettings> => {
  //   console.log('---getAccountSettings---');
    
  //   console.log('client:', client);
    
  //   return await client.value.account
  //     .getAccountSettings()
  //     .then(({ result }: Response<YandexMusicSettings>) => {
  //       $store.dispatch('yandexMusic/account', result)

  //       return result;
  //     });
  // };

  /**
   * Получить статус аккаунта
   */
  // const fetchAccountStatus = async (): Promise<YandexMusicAccountStatus> => (
  //   $store.state.yandexMusic.account.status
  // );
  const fetchAccount = async (): Promise<YandexMusicAccount | undefined> => {
    console.log('--- fetchAccount ---');
    console.log('yandexMusicClient:', yandexMusicClient);
    
    if (!yandexMusicClient) return

    return await yandexMusicClient.account
      .getAccountStatus()
      // .then(({ result }: Response<YandexMusicAccount>) => {
      .then(({ result }: any) => {
        console.log('result:', result);
        
        $store.dispatch('yandexMusic/setAccount', result)

        return result
      })
  }

  /**
   * Получить полный список плейлистов пользователя
   */
  const fetchPlaylists = async (): Promise<YandexMusicPlaylist[] | []> => {
    if (!yandexMusicClient) return []
    if (!account.value) return []

    const userId = account.value.account.uid;

    return await yandexMusicClient.playlists
      .getPlayLists(userId)
      // .then(({ result }: Response<YandexMusicPlaylist[]>) => {
      .then(({ result }: any) => {
        return result;
      });
  };

  const playlist = computed(
    (): YandexMusicPlaylist | undefined => (
      $store?.state.yandexMusic.playlist || []
    )
  ).value;

  /**
   * Получить подробный плейлист
   * @param kind
   * @returns
   */
  const fetchPlaylistById = async (
    kind: number
  ): Promise<YandexMusicPlaylist | undefined> => {
    console.log('--- fetchPlaylistById ---');
    
    if (!yandexMusicClient) return
    if (!account.value) return;

    const userId = account.value.account.uid;

    return await yandexMusicClient.playlists
      .getPlaylistById(userId, kind)
      // .then(({ result }: Response<YandexMusicPlaylist>) => {
      .then(({ result }: any) => {
        console.log('result:', result);
        
        $store.dispatch("yandexMusic/setPlaylist", result);

        return result;
      });
  };

  // // TODO: Не использовать
  // const setCurrentTrackData = (trackData: TrackData): void => {
  //   $store.dispatch("player/setCurrentTrackData", trackData);
  // };

  const setCurrentDownloadInfo = (downloadInfo: TrackDownloadInfo[]) => {
    console.log('--- setCurrentDownloadInfo ---');
    console.log('downloadInfo:', downloadInfo);
    
    $store.dispatch("player/setTrackDownloadInfo", {
      data: downloadInfo
    });
  };

  /**
   * Получить инфо о файле трека.
   * Полученный downloadInfo записывает в currentTrack, если необходимо
   * @param {number | string} trackId Id трека
   * @param {boolean} current Флаг, нужно ли записать downloadInfo в currentTrack
   * @returns {TrackDownloadInfo[]} Массив информации для загрузки
   */
  const fetchDownloadInfo = async (
    trackId: string,
    current = false
  ): Promise<TrackDownloadInfo[] | []> => {
    console.log('--- fetchDownloadInfo ---');
    console.log('yandexMusicClient:', yandexMusicClient);
    console.log('current:', current);
    
    if (!yandexMusicClient) return []

    return await yandexMusicClient.tracks
      .getDownloadInfo(trackId)
      .then(
        // ({ result }: Response<TrackDownloadInfo[]>) => {
        ({ result }: any) => {
          console.log('result:', result);
          
          if (current) {
            console.log('cjeck');
            
            setCurrentDownloadInfo(result);
            // $store.dispatch("yandexMusic/setCurrentTrackDownloadInfo", result);
          }

          return result;
        }
      );
  };

  /**
   * Формирование прямой ссылки на файл
   * @param data
   * @returns
   */
  // const buildDownloadUrl = (data: string): string => {
  //   const parser = new DOMParser();
  //   const xmlDoc = parser.parseFromString(data, "text/xml");

  //   const host = xmlDoc.getElementsByTagName("host")[0].childNodes[0].nodeValue;
  //   const path =
  //     xmlDoc.getElementsByTagName("path")[0].childNodes[0].nodeValue || "";
  //   const ts = xmlDoc.getElementsByTagName("ts")[0].childNodes[0].nodeValue;
  //   const s = xmlDoc.getElementsByTagName("s")[0].childNodes[0].nodeValue;
  //   const sign = CryptoJS.MD5(
  //     encodeURIComponent(process.env.VUE_APP_SIGN_SALT + path[0] + s)
  //   ).toString(CryptoJS.enc.Hex);

  //   return `https://${host}/get-mp3/${sign}/${ts}${path}`;
  // };

  /**
   * Получить поток по прямой ссылке
   * @returns
   */
  const fetchStream = async (url: string) => {
    if (!yandexMusicClient) return
    // return await axios
    //   .get(url)
    //   .then(async ({ data }: AxiosResponse<string>) => {
    //     const url = buildDownloadUrl(data);

    //     return await axios.get("/" + url, {
    //       baseURL: process.env.VUE_APP_PROXY_URL,
    //       headers: client.httpRequest.config.HEADERS,
    //       responseType: "arraybuffer",
    //     });
    //   });
    return await yandexMusicClient.custom
      .getArrayBuffer(url)
  };

  const getCover = async (
    coverData: YandexMusicCover | string,
    big?: boolean
  ): Promise<string | undefined> => {
    if (!coverData) return;

    const size = big ? "600x600" : "200x200";

    if (typeof coverData === "string") {
      return await fetchCover(coverData, size)
        .then((result) => {
          if (result) {
            return URL.createObjectURL(result);
          }
      });
    }

    if (coverData.type === "mosaic" && coverData.itemsUri) {
      return await Promise.all(
        coverData.itemsUri.map(async (item) => {
          return await fetchCover(item, size).then((result) => result);
        })
      ).then(async (result): Promise<any> => {
        const urls = result.map((item) => {
          if (item) {
            return URL.createObjectURL(item);
          } 
          
          return ''
        });

        return await buildCover(urls);
      });
    }

    // TODO: type === pic
  };

  const fetchCover = async (url: string, size: string): Promise<Blob | undefined> => {
    if (!yandexMusicClient) return

    const uri = url.replace("%%", size);
    return await yandexMusicClient.custom
      .getResource(uri)
      .then((result: Blob) => result);
  };

  const buildCover = async (src: string[]) => {
    const c = document.createElement("canvas");
    c.width = 200;
    c.height = 200;
    const ctx = c.getContext("2d");

    const loadedImages: any[] = [];

    return await Promise.all(
      src.map(async (item, i) => {
        return await new Promise(function (resolve: any) {
          const img = new Image();
          img.onload = () => {
            loadedImages[i] = img;
            resolve();
          };
          img.src = item;
        });
      })
    ).then(() => {
      loadedImages.map((item, i) => {
        switch (i) {
          case 0:
            ctx?.drawImage(item, 0, 0, 100, 100);
            break;
          case 1:
            ctx?.drawImage(item, 100, 0, 100, 100);
            break;
          case 2:
            ctx?.drawImage(item, 0, 100, 100, 100);
            break;
          case 3:
            ctx?.drawImage(item, 100, 100, 100, 100);
            break;
        }
      });

      const img = c.toDataURL("image/png");

      return img;
    });
  };

  return {
    // fetchClient,
    fetchAccount,
    fetchPlaylists,
    fetchPlaylistById,
    fetchDownloadInfo,
    fetchStream,

    // getAccountSettings,
    // setCurrentTrackData,
    getCover,

    account,
    // currentTrack,
    playlist,
  };
}
