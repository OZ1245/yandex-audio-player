import { Track, PlayerStatus, TrackDownloadInfo, TrackBuffer } from "@/@types";
import { GetterTree, MutationTree, ActionTree } from "vuex";

interface State {
  status: PlayerStatus;
  queue: Track[];
}

export default {
  state: <State>{
    status: "stopped",
    queue: [],
  },
  getters: <GetterTree<State, any>>{},
  mutations: <MutationTree<State>>{
    SET_STATUS(state, status) {
      state.status = status;
    },

    SET_TRACK_DOWNLOAD_INFO(
      state,
      { data, queueIndex }: { data: TrackDownloadInfo[]; queueIndex: number }
    ) {
      state.queue[queueIndex].downloadInfo = data;
    },
    SET_TRACK_BUFFER(
      state,
      { data, queueIndex }: { data: TrackBuffer; queueIndex: number }
    ) {
      state.queue[queueIndex].buffer = data;
    },
    ADD_TRACK_TO_QUEUE(state, data) {
      state.queue = [...state.queue, data];
    },
    REMOVE_TRACK_FROM_QUEUE(state, index) {
      state.queue.splice(index, 1);
    },
  },
  actions: <ActionTree<State, any>>{
    setStatus({ commit }, status: PlayerStatus) {
      commit("SET_STATUS", status);
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

      commit("SET_CURRENT_TRACK_DOWNLOAD_INFO", data);
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

      commit("SET_CURRENT_TRACK_BUFFER", data);
    },
    addTrackToQueue({ commit }, data: Track) {
      commit("ADD_TRACK_TO_QUEUE", data);
    },
    removeTrackFromQueue({ commit }, index: number) {
      commit("REMOVE_TRACK_FROM_QUEUE", index);
    },
  },
};
