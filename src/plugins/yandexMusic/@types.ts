import { YandexMusicClient } from 'yandex-music-client'
import { TokenResponse } from 'yandex-music-client/token'

// Props

export type TToken = TokenResponse
export type TYandexMusicClient = YandexMusicClient

// Methods

export interface IFetchClient { 
  (token: string): Promise<YandexMusicClient>
}

export interface IGetClient {
  (): Promise<YandexMusicClient | null>
}

export interface IAuth {
  (
    username: string,
    password: string
  ): Promise<void>
}

export interface IAuthByToken {
  (token: string): Promise<void>
}

export interface ICheckToken {
  (): boolean
}

// Plugin

export interface IYandexMusicPlugin {
  client: YandexMusicClient | null
  auth: IAuth
  authByToken: IAuthByToken
  getClient: IGetClient
}