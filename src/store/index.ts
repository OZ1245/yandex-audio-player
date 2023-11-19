import { createStore, GetterTree, MutationTree, ActionTree } from 'vuex'
import yandexMusic from './yandexMusic'

export default createStore({
  state: <any> {
  },
  getters: <GetterTree<any, any>>{
  },
  mutations: <MutationTree<any>>{
  },
  actions: <ActionTree<any, any>>{
  },
  modules: {
    yandexMusic: {
      namespaced: true,
      ...yandexMusic
    }
  }
})
