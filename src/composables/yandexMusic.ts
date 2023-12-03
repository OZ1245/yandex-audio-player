import { YandexMusicPlugin, Response } from "@/@types";
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
    if (accountStatus.value) {
      const userId = accountStatus.value.account.uid;

      return await client.value?.playlists
        .getPlayLists(userId)
        .then(({ result }: Response<YandexMusicPlaylist[]>) => {
          return result;
        });
    }
  };

  /**
   * Получить подробный плейлист
   * @param kind
   * @returns
   */
  const fetchPlaylistById = async (
    kind: number
  ): Promise<YandexMusicPlaylist | undefined> => {
    if (accountStatus.value) {
      const userId = accountStatus.value.account.uid;

      return await client.value?.playlists
        .getPlaylistById(userId, kind)
        .then(({ result }: Response<YandexMusicPlaylist>) => {
          return result;
        });
    }
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

  return {
    fetchClient,
    fetchAccountStatus,
    getAccountSettings,
    fetchPlaylists,
    fetchPlaylistById,
    fetchDownloadInfo,
    fetchStream,
    setCurrentTrackData,
    // playTrack,
    accountStatus,
    currentTrack,
  };
}
