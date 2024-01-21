import { YandexMusicCover } from "@/@types";
import {
  YandexMusicAccountStatus,
  YandexMusicAccount,
  YandexMusicPlaylist,
  TrackDownloadInfo,
} from "@/@types";
import { computed, inject } from "vue";
import { useStore } from "vuex";

export function useYandexMusic() {
  const $store = useStore();
  const yandexMusicClient: any = inject("$yandexMusicClient");

  // Аккаунт пользователя
  const account = computed(
    (): YandexMusicAccountStatus | null =>
      $store.state.yandexMusic.account || null
  );

  /**
   * Получить статус аккаунта
   */
  const fetchAccount = async (): Promise<YandexMusicAccount | undefined> => {
    if (!yandexMusicClient) return

    return await yandexMusicClient.account
      .getAccountStatus()
      .then(({ result }: any) => {
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
    if (!yandexMusicClient) return
    if (!account.value) return;

    const userId = account.value.account.uid;

    return await yandexMusicClient.playlists
      .getPlaylistById(userId, kind)
      .then(({ result }: any) => {
        $store.dispatch("yandexMusic/setPlaylist", result);

        return result;
      });
  };

  const setCurrentDownloadInfo = (downloadInfo: TrackDownloadInfo[]) => {
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
    if (!yandexMusicClient) return []

    return await yandexMusicClient.tracks
      .getDownloadInfo(trackId)
      .then(
        ({ result }: any) => {
          if (current) {
            setCurrentDownloadInfo(result);
          }

          return result;
        }
      );
  };

  /**
   * Получить поток по прямой ссылке
   * @returns
   */
  const fetchStream = async (url: string) => {
    if (!yandexMusicClient) return
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

    getCover,

    account,
    playlist,
  };
}
