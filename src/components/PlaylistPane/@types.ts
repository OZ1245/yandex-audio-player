import { Playlist } from 'yandex-music-client'

export interface IProps {
  playlists: Playlist[]
}

export interface IOnSelectPlaylist {
  (): void
}

export interface IOnClickTrack {
  (trackId: number): void
}