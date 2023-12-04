import { YandexMusicPlugin, Response, YandexMusicCover } from "@/@types";
import {
  YandexMusicSettings,
  YandexMusicAccountStatus,
  YandexMusicPlaylist,
  TrackData,
  TrackDownloadInfo,
  Track,
} from "@/@types";
import { computed, inject } from "vue";
import { useStore } from "vuex";
import axios, { AxiosResponse } from "axios";
import CryptoJS from "crypto-js";

export function useYandexMusic() {
  const $store = useStore();
  const yandexMusic = inject("yandex-music") as YandexMusicPlugin;

  const client = computed(() => $store.state.yandexMusic.client || null);
  const currentTrack = computed(
    (): Track => $store.state.yandexMusic.currentTrack || null
  ).value;

  /**
   * Получить и сохранить клиент
   */
  const fetchClient = async (): Promise<boolean> => {
    return await yandexMusic.getClient().then((result) => {
      $store.dispatch("yandexMusic/setClient", result);

      return true;
    });
  };

  /**
   * Получить настройки пользователя
   * /account/settings
   */
  const getAccountSettings = async (): Promise<YandexMusicSettings> => {
    return await client.value?.account
      .getAccountSettings()
      .then(({ result }: Response<YandexMusicSettings>) => {
        return result;
      });
  };

  /**
   * Получить статус аккаунта
   */
  const fetchAccountStatus = async (): Promise<YandexMusicAccountStatus> => {
    return (
      (await client.value?.account
        .getAccountStatus()
        .then(({ result }: Response<YandexMusicAccountStatus>) => {
          $store.dispatch("yandexMusic/setAccountStatus", result);

          return result;
        })) || null
    );
  };

  /**
   * Статус аккаунта
   */
  const accountStatus = computed(
    (): YandexMusicAccountStatus | null =>
      $store.state.yandexMusic.accountStatus || null
  );

  /**
   * Получить полный список плейлистов пользователя
   */
  const fetchPlaylists = async (): Promise<
    YandexMusicPlaylist[] | undefined
  > => {
    if (!accountStatus.value) return;

    const userId = accountStatus.value.account.uid;

    return await client.value?.playlists
      .getPlayLists(userId)
      .then(({ result }: Response<YandexMusicPlaylist[]>) => {
        return result;
      });
  };

  /**
   * Получить подробный плейлист
   * @param kind
   * @returns
   */
  const fetchPlaylistById = async (
    kind: number
  ): Promise<YandexMusicPlaylist | undefined> => {
    if (!accountStatus.value) return;

    const userId = accountStatus.value.account.uid;

    return await client.value?.playlists
      .getPlaylistById(userId, kind)
      .then(({ result }: Response<YandexMusicPlaylist>) => {
        return result;
      });
  };

  const setCurrentTrackData = (trackData: TrackData): void => {
    $store.dispatch("yandexMusic/setCurrentTrackData", trackData);
  };

  const setCurrentDownloadInfo = (downloadInfo: TrackDownloadInfo[]): void => {
    $store.dispatch("yandexMusic/setCurrentTrackDownloadInfo", downloadInfo);
  };

  /**
   * Получить инфо о файле трека
   * @param trackId
   * @returns
   */
  const fetchDownloadInfo = async (
    trackId: number | string,
    current = false as boolean
  ): Promise<TrackDownloadInfo[]> => {
    return await client.value.tracks
      .getDownloadInfo(trackId, true)
      .then(
        ({ result }: Response<TrackDownloadInfo[]>): TrackDownloadInfo[] => {
          if (current) {
            setCurrentDownloadInfo(result);
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
  const buildDownloadUrl = (data: string): string => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");

    const host = xmlDoc.getElementsByTagName("host")[0].childNodes[0].nodeValue;
    const path =
      xmlDoc.getElementsByTagName("path")[0].childNodes[0].nodeValue || "";
    const ts = xmlDoc.getElementsByTagName("ts")[0].childNodes[0].nodeValue;
    const s = xmlDoc.getElementsByTagName("s")[0].childNodes[0].nodeValue;
    const sign = CryptoJS.MD5(
      encodeURIComponent(process.env.VUE_APP_SIGN_SALT + path[0] + s)
    ).toString(CryptoJS.enc.Hex);

    return `https://${host}/get-mp3/${sign}/${ts}${path}`;
  };

  /**
   * Получить поток по прямой ссылке
   * @returns
   */
  const fetchStream = async (url: string) => {
    return await axios
      .get(url)
      .then(async ({ data }: AxiosResponse<string>) => {
        const url = buildDownloadUrl(data);

        return await axios.get("/" + url, {
          baseURL: process.env.VUE_APP_PROXY_URL,
          headers: client.value?.tracks.httpRequest.config.HEADERS,
          responseType: "arraybuffer",
        });
      });
  };

  const fetchResource = async (url: string): Promise<Blob> => {
    return await axios
      .get("/https://" + url, {
        baseURL: process.env.VUE_APP_PROXY_URL,
        headers: client.value?.tracks.httpRequest.config.HEADERS,
        responseType: "blob",
      })
      .then(({ data }) => data);
  };

  const getCover = async (
    coverData: YandexMusicCover | string,
    big?: boolean
  ): Promise<string | undefined> => {
    if (!coverData) return;

    const size = big ? "600x600" : "200x200";

    if (typeof coverData === "string") {
      return await fetchCover(coverData, size).then((result) => {
        return URL.createObjectURL(result);
      });
    }

    if (coverData.type === "mosaic" && coverData.itemsUri) {
      return await Promise.all(
        coverData.itemsUri.map(async (item) => {
          return await fetchCover(item, size).then((result) => result);
        })
      ).then(async (result): Promise<any> => {
        const urls = result.map((item) => {
          return URL.createObjectURL(item);
        });

        return await buildCover(urls);
      });
    }

    // TODO: type === pic
  };

  const fetchCover = async (url: string, size: string): Promise<Blob> => {
    const uri = url.replace("%%", size);
    return await fetchResource(uri).then((result) => result);
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
    fetchClient,
    fetchAccountStatus,
    fetchPlaylists,
    fetchPlaylistById,
    fetchDownloadInfo,
    fetchStream,

    getAccountSettings,
    setCurrentTrackData,
    getCover,

    accountStatus,
    currentTrack,
  };
}
