import { defineStore } from 'pinia'

export const useModalStore = defineStore('modal', {
  state: () => ({
    isAuthModalOpen: false
  }),

  getters: {
    hiddenClass(state) {
      return !state.isAuthModalOpen ? 'hidden' : ''
    }
  }
})
