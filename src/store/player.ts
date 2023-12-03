import { 
  PlayerStatus
} from '@/@types'
import { GetterTree, MutationTree, ActionTree } from 'vuex'

interface State {
  status: PlayerStatus
}

export default {
  state: <State>{
    status: 'stopped',
  },
  getters: <GetterTree<State, any>>{
  },
  mutations: <MutationTree<State>>{
    SET_STATUS (state, status) {
      state.status = status
    }
  },
  actions: <ActionTree<State, any>>{
    setStatus({ commit }, status: PlayerStatus) {
      commit('SET_STATUS', status)
    }
  },
}
