import {
  YandexMusicClient,
  YandexMusicAccountStatus,
  YandexMusicPlaylist,
  YandexMusicAccount,
} from "@/@types";
import { GetterTree, MutationTree, ActionTree } from "vuex";

interface State {
  account: YandexMusicAccount
  playlist: YandexMusicPlaylist | [];
}

export default {
  state: <State>{
    account: null,
    playlist: [],
  },
  getters: <GetterTree<State, any>>{},
  mutations: <MutationTree<State>>{
    SET_ACCOUNT(state, data) {
      state.account = data
    },

    SET_PLAYLIST(state, data) {
      state.playlist = data;
    },
  },
  actions: <ActionTree<State, any>>{
    setClient({ commit }, data: YandexMusicClient) {
      commit("SET_CLIENT", data);
    },
    setAccount({ commit }, data: YandexMusicAccount) {
      commit('SET_ACCOUNT', data)
    },
    setAccountStatus({ commit }, data: YandexMusicAccountStatus) {
      commit("SET_ACCOUNT_STATUS", data);
    },
    setPlaylist({ commit }, data: YandexMusicPlaylist) {
      commit("SET_PLAYLIST", data);
    },

  },
};
