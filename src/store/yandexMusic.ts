import {
  Track,
  YandexMusicClient,
  YandexMusicAccountStatus,
  TrackData,
  TrackDownloadInfo,
  TrackBuffer,
  YandexMusicPlaylist,
} from "@/@types";
import { GetterTree, MutationTree, ActionTree } from "vuex";

interface State {
  client: YandexMusicClient;
  accountStatus: YandexMusicAccountStatus;
  currentTrack: Track;
  playlist: YandexMusicPlaylist | [];
}

export default {
  state: <State>{
    client: null,
    accountStatus: null,
    currentTrack: {
      data: null,
      downloadInfo: [],
      buffer: null,
    },
    playlist: [],
  },
  getters: <GetterTree<State, any>>{},
  mutations: <MutationTree<State>>{
    SET_CLIENT(state, data) {
      state.client = data;
    },

    SET_ACCOUNT_STATUS(state, data) {
      state.accountStatus = data;
    },

    SET_CURRENT_TRACK_DATA(state, data) {
      state.currentTrack.data = data;
    },

    SET_CURRENT_TRACK_DOWNLOAD_INFO(state, data) {
      state.currentTrack.downloadInfo = data;
    },

    SET_CURRENT_TRACK_BUFFER(state, data) {
      state.currentTrack.buffer = data;
    },

    SET_PLAYLIST(state, data) {
      state.playlist = data;
    },
  },
  actions: <ActionTree<State, any>>{
    setClient({ commit }, data: YandexMusicClient) {
      commit("SET_CLIENT", data);
    },
    setAccountStatus({ commit }, data: YandexMusicAccountStatus) {
      commit("SET_ACCOUNT_STATUS", data);
    },
    setCurrentTrackData({ commit }, data: TrackData) {
      commit("SET_CURRENT_TRACK_DATA", data);
    },
    // TODO: Удалить. Использовать setTrackDownloadInfo
    setCurrentTrackDownloadInfo({ commit }, data: TrackDownloadInfo) {
      commit("SET_CURRENT_TRACK_DOWNLOAD_INFO", data);
    },
    // TODO: Удалить. Использовать setTrackBuffer
    setCurrentTrackBuffer({ commit }, data: TrackBuffer) {
      commit("SET_CURRENT_TRACK_BUFFER", data);
    },

    setPlaylist({ commit }, data: YandexMusicPlaylist) {
      commit("SET_PLAYLIST", data);
    },
  },
};
