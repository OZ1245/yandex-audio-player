import { IState } from '@/plugins/yandexMusic/@types'
import { GetterTree, MutationTree, ActionTree } from 'vuex'

export default {
  state: <IState>{
    client: null,
    accountStatus: null,
    currentTrack: []
  },
  getters: <GetterTree<IState, any>>{
  },
  mutations: <MutationTree<IState>>{
    SET_CLIENT (state, data) {
      state.client = data
    },

    SET_ACCOUNT_STATUS (state, data) {
      state.accountStatus = data
    },

    SET_CURRENT_TRACK (state, data) {
      state.currentTrack = data
    }
  },
  actions: <ActionTree<IState, any>>{
    setClient({ commit }, data) {
      commit('SET_CLIENT', data)
    },

    setAccountStatus({ commit }, data) {
      commit('SET_ACCOUNT_STATUS', data)
    },

    setCurrentTrack({ commit }, data) {
      commit('SET_CURRENT_TRACK', data)
    }
  },
  modules: {
  }
}
