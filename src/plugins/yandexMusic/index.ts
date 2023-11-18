// import { AxiosResponse } from 'axios'
// import { getToken, TokenResponse } from 'yandex-music-client/token'
import { 
  IFetchClient,
  IGetClient,
  IAuth,
  IAuthByToken,
  IYandexMusicPlugin,
} from './@types'
import { getToken } from 'yandex-music-client/token'
import { YandexMusicClient } from 'yandex-music-client/YandexMusicClient'

export default {
  async install(app: any) {
    let client = null

    const fetchClient: IFetchClient = async (token) => {
      return new YandexMusicClient({
        // BASE: 'https//api.music.yandex.net:443',
        BASE: 'https://yandex-music-cors-proxy.onrender.com/https://api.music.yandex.net:443',
        HEADERS: {
          'Authorization': `OAuth ${token}`,
          'Accept-Language': 'ru',
        },
        // WITH_CREDENTIALS: true
      })
    }

    const auth: IAuth = async (username, password) => {
      return await getToken(username, password)
        .then((result) => {
          if (result) {
            const token = result.toString()

            return fetchClient(token)
              .then((result) => {
                client = result

                localStorage.setItem('ymToken', token)
              })

          }
        })
        .catch((error) => {
          throw error
        })
    }

    const authByToken: IAuthByToken = async (token) => {
      return await fetchClient(token)
        .then((result) => {
          client = result

          localStorage.setItem('ymToken', token)
        })
    }

    const getClient: IGetClient = async () => {
      const token = localStorage.getItem('ymToken')

      if (token) {
        return await fetchClient(token)
          .then((result) => {
            client = result

            return result
          })
      }

      return null
    }

    const yandexMusic: IYandexMusicPlugin = {
      client,
      auth,
      authByToken,
      getClient,
    }

    app.config.globalProperties.yandexMusic = yandexMusic
    app.provide('yandex-music', yandexMusic)
  }
}