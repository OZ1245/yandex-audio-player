import { 
  Track, 
  PlayerStatus, 
  TrackDownloadInfo, 
  TrackBuffer,
  TrackData,
  Queue,
  YandexMusicPlaylist
} from "@/@types";
import { GetterTree, MutationTree, ActionTree } from "vuex";

interface State {
  status: PlayerStatus;
  queue: Queue;
  playback: Track;
}

export default {
  state: <State>{
    playback: {
      data: null,
      downloadInfo: [],
      buffer: null,
    },
    status: "stopped",
    queue: {
      data: null,
      list: []
    },
  },
  getters: <GetterTree<State, any>>{},
  mutations: <MutationTree<State>>{
    SET_STATUS(state, status) {
      state.status = status;
    },

    SET_PLAYBACK_DATA(state, data) {
      state.playback.data = data;
    },
    SET_PLAYBACK_DOWNLOAD_INFO(state, data) {
      state.playback.downloadInfo = data;
    },
    SET_PLAYBACK_BUFFER(state, data) {
      state.playback.buffer = data;
    },
    REMOVE_PLAYBACK(state) {
      state.playback = {
        data: null,
        downloadInfo: [],
        buffer: null
      }
    },

    SET_TRACK_DOWNLOAD_INFO(
      state,
      { data, queueIndex }: { data: TrackDownloadInfo[]; queueIndex: number }
    ) {
      state.queue.list[queueIndex].downloadInfo = data;
    },
    SET_TRACK_BUFFER(
      state,
      { data, queueIndex }: { data: TrackBuffer; queueIndex: number }
    ) {
      state.queue.list[queueIndex].buffer = data;
    },
    ADD_TRACK_TO_QUEUE(state, data) {
      state.queue.list = [...state.queue.list, data];
    },
    REMOVE_TRACK_FROM_QUEUE(state, index) {
      state.queue.list.splice(index, 1);
    },
    REMOVE_TRACKS_FROM_QUEUE(state) {
      state.queue.list = []
    },

    SET_QUEUE_DATA(state, data) {
      state.queue.data = data
    },
    REMOVE_QUEUE_DATA(state) {
      state.queue.data = null
    }
  },
  actions: <ActionTree<State, any>>{
    setStatus({ commit }, status: PlayerStatus) {
      commit("SET_STATUS", status);
    },

    setPlaybackData({ commit }, data: TrackData) {
      commit("SET_PLAYBACK_DATA", data);
    },
    removePlayback({commit}) {
      commit('REMOVE_PLAYBACK')
    },

    setTrackDownloadInfo(
      { commit },
      { data, queueIndex }: { data: TrackDownloadInfo[]; queueIndex?: number }
    ) {
      if (typeof queueIndex !== "undefined") {
        commit("SET_TRACK_DOWNLOAD_INFO", {
          data,
          queueIndex,
        });

        return;
      }

      commit("SET_PLAYBACK_DOWNLOAD_INFO", data);
    },
    setTrackBuffer(
      { commit },
      { data, queueIndex }: { data: TrackBuffer; queueIndex?: number }
    ) {
      if (typeof queueIndex !== "undefined") {
        commit("SET_TRACK_BUFFER", {
          data,
          queueIndex,
        });

        return;
      }

      commit("SET_PLAYBACK_BUFFER", data);
    },
    addTrackToQueue({ commit }, data: Track) {
      commit("ADD_TRACK_TO_QUEUE", data);
      commit('REMOVE_QUEUE_DATA')
    },
    removeTrackFromQueue({ commit }, index: number) {
      commit("REMOVE_TRACK_FROM_QUEUE", index);
      commit('REMOVE_QUEUE_DATA')
    },
    removeAllTracksFromQueue({commit}) {
      commit('REMOVE_TRACKS_FROM_QUEUE')
      commit('REMOVE_QUEUE_DATA')
    },

    /**
     * Устанавливает информацию о проигрываемом плейлисте 
     * (если играет плейлист конечно)
     * Если произошла модификация очереди, то она уже не будет являться 
     * плейлистом Ямы
     * 
     * @param store 
     * @param {YandexMusicPlaylist} data Информация о плейлисте
     */
    setQueueData({ commit }, data: YandexMusicPlaylist) {
      commit('SET_QUEUE_DATA', data)
    }
  },
};
