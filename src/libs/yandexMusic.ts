import { IYandexMusicPlugin, IResponse } from '@/plugins/yandexMusic/@types'
import { 
  Status, 
  Playlist, 
  Settings, 
  TrackDownloadInfo
} from 'yandex-music-client'
import { computed, inject } from 'vue'
import { useStore } from 'vuex'
import axios, { AxiosResponse } from 'axios'
import CryptoJS from "crypto-js"

export function useYandexMusic () {
  const $store = useStore()
  const yandexMusic = inject('yandex-music') as IYandexMusicPlugin

  const client = computed(() => $store.state.yandexMusic.client || null)
  console.log('client:', client.value)
  
  /**
   * Получить и сохранить клиент
   */
  const fetchClient = async (): Promise<boolean> => {
    return await yandexMusic
      .getClient()
      .then((result) => {
        $store.dispatch('yandexMusic/setClient', result)

        return true
      })
  }

  /**
   * Получить настройки пользователя
   * /account/settings
   */
  const getAccountSettings = async (): Promise<any> => {
    return await client.value?.account
      .getAccountSettings()
      .then(({ result }: IResponse<Settings>) => {
        return result
      })
  }

  /**
   * Получить статус аккаунта
   */
  const fetchAccountStatus = async (): Promise<any> => {
    return await client.value?.account
      .getAccountStatus()
      .then(({ result }: IResponse<Status>) => {
        console.log('result:', result)
        $store.dispatch('yandexMusic/setAccountStatus', result)

        return result
      }) || null
  }

  /**
   * Статус аккаунта
   */
  const accountStatus = computed((): Status | null => (
    $store.state.yandexMusic.accountStatus || null
  ))

  /**
   * Получить полный список плейлистов пользователя
   */
  const fetchPlaylists = async (): Promise<Playlist[] | undefined> => {
    if (accountStatus.value) {
      const userId = accountStatus.value.account.uid
      
      return await client.value?.playlists
        .getPlayLists(userId)
        .then(({ result }: IResponse<Playlist[]>) => {
          return result
        })
    }
  }

  /**
   * Получить полную информацию о треке
   * @param kind 
   * @returns 
   */
  const fetchPlaylistById = async (kind: number): Promise<Playlist | undefined> => {
    if (accountStatus.value) {
      const userId = accountStatus.value.account.uid

      return await client.value?.playlists
        .getPlaylistById(userId, kind)
        .then(({ result }: IResponse<Playlist>) => {
          return result
        })
    }
  }

  /**
   * Получить файл трека
   * @param trackId 
   * @returns 
   */
  const fetchDownloadInfo = async (trackId: number): Promise<TrackDownloadInfo | undefined> => {
    return await client.value?.tracks
      .getDownloadInfo(trackId, true)
      .then(async ({ result }: IResponse<TrackDownloadInfo>) => {
        const downloadInfo = await axios.get(`/tracks/${trackId}/download-info`, {
          baseURL: client.value?.tracks.httpRequest.config.BASE,
          headers: client.value?.tracks.httpRequest.config.HEADERS,
          params: {
            get_direct_links: true
          },
        })
        // $store.dispatch('yandexMusic/setCurrentTrack', result)
        $store.dispatch('yandexMusic/setCurrentTrack', downloadInfo.data.result)

        return result
      })
  }

  const currentTrack = computed((): TrackDownloadInfo[] => (
    $store.state.yandexMusic.currentTrack || []
  ))

  const buildDownloadUrl = (data: string): string => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");

    const host = xmlDoc.getElementsByTagName('host')[0].childNodes[0].nodeValue
    const path = xmlDoc.getElementsByTagName('path')[0].childNodes[0].nodeValue || ''
    const ts = xmlDoc.getElementsByTagName('ts')[0].childNodes[0].nodeValue
    const s = xmlDoc.getElementsByTagName('s')[0].childNodes[0].nodeValue
    const sign = CryptoJS.MD5(encodeURIComponent(process.env.VUE_APP_SIGN_SALT + path[0] + s)).toString(CryptoJS.enc.Hex)

    return `https://${host}/get-mp3/${sign}/${ts}${path}`
  }

  const fetchStream = async () => {
    const trackUrl: string = currentTrack.value
        .find((file: TrackDownloadInfo): boolean => (
          file.bitrateInKbps === 320
        ))
        ?.downloadInfoUrl || ''

    return await axios.get(trackUrl)
      .then(async ({ data }: AxiosResponse<string>) => {
        const url = buildDownloadUrl(data)

        return await axios.get('/' + url, {
          baseURL: process.env.VUE_APP_PROXY_URL,
          headers: client.value?.tracks.httpRequest.config.HEADERS,
          responseType: 'arraybuffer'
        })
      })
  }

  return {
    fetchClient,
    fetchAccountStatus,
    getAccountSettings,
    fetchPlaylists,
    fetchPlaylistById,
    fetchDownloadInfo,
    fetchStream,
    // playTrack,
    accountStatus,
    currentTrack,
  }
}