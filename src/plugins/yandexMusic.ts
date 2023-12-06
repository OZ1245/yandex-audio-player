import { AuthToken, UserName, UserPassword } from "@/@types";
import { getToken } from "yandex-music-client/token";
import { YandexMusicClient } from "yandex-music-client/YandexMusicClient";

export default {
  async install(app: any) {
    let client = null;

    const fetchClient = async (
      token: AuthToken
    ): Promise<YandexMusicClient> => {
      return new YandexMusicClient({
        BASE:
          process.env.VUE_APP_PROXY_URL +
          "/" +
          process.env.VUE_APP_YANDEX_MUSIC_ENDPOINT,
        HEADERS: {
          Authorization: `OAuth ${token}`,
          "Accept-Language": "ru",
        },
      });
    };

    const auth = async (
      username: UserName,
      password: UserPassword
    ): Promise<void> => {
      return await getToken(username, password)
        .then((result) => {
          if (result) {
            return fetchClient(result as any).then((result) => {
              client = result;

              localStorage.setItem("ymToken", result as any);
            });
          }
        })
        .catch((error) => {
          throw error;
        });
    };

    const authByToken = async (token: AuthToken): Promise<void> => {
      return await fetchClient(token).then((result) => {
        client = result;

        localStorage.setItem("ymToken", token as any);
      });
    };

    const getClient = async (): Promise<YandexMusicClient | null> => {
      const token = localStorage.getItem("ymToken") as AuthToken | null;

      if (token) {
        return await fetchClient(token).then((result) => {
          client = result;

          return result;
        });
      }

      return null;
    };

    const yandexMusic = {
      client,
      auth,
      authByToken,
      getClient,
    };

    app.config.globalProperties.$yandexMusic = yandexMusic;
    app.provide("yandex-music", yandexMusic);
  },
};
