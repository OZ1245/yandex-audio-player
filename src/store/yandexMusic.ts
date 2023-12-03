import { 
  Track, 
  YandexMusicClient, 
  YandexMusicAccountStatus,
  TrackData,
  TrackDownloadInfo,
  TrackBuffer,
} from '@/@types'
import { GetterTree, MutationTree, ActionTree } from 'vuex'

interface State {
  client: YandexMusicClient
  accountStatus: YandexMusicAccountStatus
  currentTrack: Track,
  queue: Track[]
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
    queue: []
  },
  getters: <GetterTree<State, any>>{
  },
  mutations: <MutationTree<State>>{
    SET_CLIENT (state, data) {
      state.client = data
    },

    SET_ACCOUNT_STATUS (state, data) {
      state.accountStatus = data
    },

    SET_CURRENT_TRACK_DATA (state, data) {
      state.currentTrack.data = data
    },

    SET_CURRENT_TRACK_DOWNLOAD_INFO (state, data) {
      state.currentTrack.downloadInfo = data
    },

    SET_TRACK_DOWNLOAD_INFO (state, { data, queueIndex }: { data: TrackDownloadInfo[], queueIndex: number }) {
      state.queue[queueIndex].downloadInfo = data
    },

    SET_CURRENT_TRACK_BUFFER (state, data) {
      state.currentTrack.buffer = data
    },

    SET_TRACK_BUFFER (state, { data, queueIndex }: { data: TrackBuffer, queueIndex: number }) {
      state.queue[queueIndex].buffer = data
    },

    ADD_TRACK_TO_QUEUE (state, data) {
      state.queue = [
        ...state.queue,
        data
      ]
    },

    REMOVE_TRACK_FROM_QUEUE (state, index) {
      state.queue.splice(index, 1)
    },
  },
  actions: <ActionTree<State, any>>{
    setClient({ commit }, data: YandexMusicClient) {
      commit('SET_CLIENT', data)
    },

    setAccountStatus({ commit }, data: YandexMusicAccountStatus) {
      commit('SET_ACCOUNT_STATUS', data)
    },

    setCurrentTrackData({ commit }, data: TrackData) {
      commit('SET_CURRENT_TRACK_DATA', data)
    },

    // TODO: Удалить. Использовать setTrackDownloadInfo
    setCurrentTrackDownloadInfo({ commit }, data: TrackDownloadInfo) {
      commit('SET_CURRENT_TRACK_DOWNLOAD_INFO', data)
    },

    setTrackDownloadInfo({ commit }, { data, queueIndex }: { data: TrackDownloadInfo[], queueIndex?: number }) {
      if (typeof queueIndex !== 'undefined') {
        commit('SET_TRACK_DOWNLOAD_INFO', {
          data,
          queueIndex
        })

        return
      }

      commit('SET_CURRENT_TRACK_DOWNLOAD_INFO', data)
    },

    // TODO: Удалить. Использовать setTrackBuffer
    setCurrentTrackBuffer({ commit }, data: TrackBuffer) {
      commit('SET_CURRENT_TRACK_BUFFER', data)
    },

    setTrackBuffer({ commit }, { data, queueIndex }: { data: TrackBuffer, queueIndex?: number }) {
      if (typeof queueIndex !== 'undefined') {
        commit('SET_TRACK_BUFFER', {
          data,
          queueIndex
        })

        return
      }

      commit('SET_CURRENT_TRACK_BUFFER', data)
    },

    addTrackToQueue({ commit }, data: Track) {
      commit('ADD_TRACK_TO_QUEUE', data)
    },

    removeTrackFromQueue({ commit }, index: number) {
      commit('REMOVE_TRACK_FROM_QUEUE', index)
    },
  },
}
