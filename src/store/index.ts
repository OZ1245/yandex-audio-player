import { createStore } from 'vuex'

export default createStore({
  state: {
    client: null
  },
  getters: {
  },
  mutations: {
    SET_CLIENT (state, data) {
      state.client = data
    }
  },
  actions: {
    setClient({ commit }, data) {
      commit('SET_CLIENT', data)
    }
  },
  modules: {
  }
})
