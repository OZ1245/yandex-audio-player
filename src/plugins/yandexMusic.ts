import { AuthToken, UserName, UserPassword } from "@/@types";
import { ref } from "vue";
import { getToken } from "yandex-music-client/token";
import { YandexMusicClient } from "yandex-music-client/YandexMusicClient";
import axios, { AxiosResponse } from "axios";
import CryptoJS from "crypto-js";

declare global {
  interface Window {
    YaAuthSuggest: any
  }
}

const token = localStorage.getItem('ymToken')
// const clientHeaders = ref<Record<PropertyKey, string>>()

const initClient = (token: any) => {
  console.log('---initClient---');
  
  const clientHeaders = {
    Authorization: `OAuth ${token}`,
    "Accept-Language": "ru",
  }

  const client: any = new YandexMusicClient({
    BASE:
      process.env.VUE_APP_PROXY_URL +
      "/" +
      process.env.VUE_APP_YANDEX_MUSIC_ENDPOINT,
    HEADERS: clientHeaders,
  })

  const custom: Record<PropertyKey, any> = {}

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
 * Получить ArrayBuffer файла
 * @param {string} url 
 * @returns {ArrayBuffer}
 */
  custom.getArrayBuffer = async (url: string): Promise<ArrayBuffer> => {
    return await axios
      .get(url)
      .then(async ({ data }: AxiosResponse<string>) => {
        const url = buildDownloadUrl(data);

        return await axios.get("/" + url, {
          baseURL: process.env.VUE_APP_PROXY_URL,
          headers: clientHeaders,
          responseType: "arraybuffer",
        });
      });
  }

  /**
   * Получить любой ресурс в виде Blob
   * @param {string} url 
   * @returns {Blob}
   */
  custom.getResource = async (url: string): Promise<Blob> => {
    return await axios
      .get("/https://" + url, {
        baseURL: process.env.VUE_APP_PROXY_URL,
        headers: clientHeaders,
        responseType: "blob",
      })
      .then(({ data }: AxiosResponse<Blob>) => data);
  }

  return {
    client: {
      ...client,
      ...{ 
        custom
      }
    },
    
  }
};

export default {
  install(app: any) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const client = initClient(token)
    console.log('client:', client);

    Object.defineProperty(
      app.config.globalProperties,
      '$yandexMusicClient',
      client
    )

    app.provide('$yandexMusicClient', client.client)
  }
}