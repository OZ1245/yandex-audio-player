import { TokenResponse } from 'yandex-music-client/token'
import * as yaMusic from 'yandex-music-client'

export type TToken = TokenResponse
export type TYandexMusicClient = yaMusic.YandexMusicClient

// Methods

export interface IFetchClient { 
  (token: string): Promise<yaMusic.YandexMusicClient>
}

export interface IGetClient {
  (): Promise<yaMusic.YandexMusicClient | null>
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
  client: yaMusic.YandexMusicClient | null
  auth: IAuth
  authByToken: IAuthByToken
  getClient: IGetClient
}

// Response

export interface IResponse<T> {
  invocationInfo:	{
    'exec-duration-millis':	number
    hostname:	string
    'req-id':	string
    'app-name':	string
  }
  result: T
}