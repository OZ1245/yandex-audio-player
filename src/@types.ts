import * as YM from "yandex-music-client";
import { TokenResponse } from "yandex-music-client/token";

export type LoadingState = boolean;
export type AuthToken = TokenResponse;
export type UserName = string;
export type UserPassword = string;
export type CollectionState = boolean;

export type TrackData = YM.Track;
export type TrackDownloadInfo = YM.TrackDownloadInfo;
export type TrackBuffer = AudioBuffer;

export type YandexMusicClient = YM.YandexMusicClient | null;
export type YandexMusicAccountStatus = YM.Status | null;
export type YandexMusicPlaylist = YM.Playlist;
export type YandexMusicSettings = YM.Settings;
export type YandexMusicTrackItem = YM.TrackItem;
export type YandexMusicTrack = YM.Track;
export type YandexMusicCover = YM.Cover;

interface GetClient {
  (): Promise<YandexMusicClient | null>;
}
export interface YandexMusicPlugin {
  client: YandexMusicClient;
  getClient: GetClient;
}

export type PlayerStatus = "playing" | "paused" | "stopped";

export interface Track {
  data: TrackData | null;
  downloadInfo?: TrackDownloadInfo[];
  buffer?: AudioBuffer | null;
}

// Response
export interface Response<T> {
  invocationInfo: {
    "exec-duration-millis": number;
    hostname: string;
    "req-id": string;
    "app-name": string;
  };
  result: T;
}

export interface Player {
  audioContext: AudioContext;
  playlist: BufferSource[];
  nextTime: number;
}
