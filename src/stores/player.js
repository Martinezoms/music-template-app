import { defineStore } from 'pinia'
import { Howl } from 'howler'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    current_song: {},
    sound: {},
    seek: '00:00',
    duration: '00:00'
  }),

  getters: {
    playing(state) {
      if (state.sound.playing) {
        return state.sound.playing()
      }

      return false
    }
  },

  actions: {
    async newSong(song) {
      if (this.current_song?.docID && this.current_song.docID == song.docID) return

      this.current_song = song

      if (this.sound.playing) {
        this.sound.stop()
      }

      this.sound = new Howl({
        src: [song.url],
        html5: true
      })

      this.sound.play()

      this.sound.on('play', () => {
        requestAnimationFrame(this.progress)
      })
    },

    async toggleAudio() {
      if (!this.sound.playing) return

      if (this.sound.playing()) {
        this.sound.pause()
      } else {
        this.sound.play()
      }
    },

    progress() {
      this.seek = this.sound.seek()
      this.duration = this.sound.duration()

      if (this.sound?.playing()) requestAnimationFrame(this.progress)
    }
  }
})
