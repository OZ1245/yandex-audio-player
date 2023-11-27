import * as yaMusic from 'yandex-music-client'

export type TrackData = yaMusic.Track
export type TrackDownloadInfo = yaMusic.TrackDownloadInfo
export type TrackBuffer = AudioBuffer

export type YandexMusicClient = yaMusic.YandexMusicClient | null
export type YandexMusicAccountStatus = yaMusic.Status | null
export type YandexMusicPlaylist = yaMusic.Playlist
export type YandexMusicSettings = yaMusic.Settings
export type YandexMusicTrackItem = yaMusic.TrackItem

export interface Track {
  data: TrackData | null
  downloadInfo?: TrackDownloadInfo[]
  buffer?: AudioBuffer | null
}