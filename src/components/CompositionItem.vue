<template>
  <div class="border border-gray-200 p-3 mb-4 rounded">
    <div v-show="!showForm">
      <h4 class="inline-block text-2xl font-bold">{{ song.modified_name }}</h4>
      <button
        class="ml-1 py-1 px-2 text-sm rounded text-white bg-red-600 float-right"
        @click.prevent="deleteSong"
      >
        <i class="fa fa-times"></i>
      </button>
      <button
        class="ml-1 py-1 px-2 text-sm rounded text-white bg-blue-600 float-right"
        @click.prevent="showForm = !showForm"
      >
        <i class="fa fa-pencil-alt"></i>
      </button>
    </div>
    <div v-show="showForm">
      <div v-if="showAlert" class="text-white text-center p-4 mb-4" :class="alert_variant">
        {{ alert_message }}
      </div>
      <vee-form :validation-schema="schema" :initial-values="song" @submit="edit">
        <div class="mb-3">
          <label class="inline-block mb-2">Song Title</label>
          <vee-field
            name="modified_name"
            type="text"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
            placeholder="Enter Song Title"
            @input="updateUnsavedFlag(true)"
          />
          <ErrorMessage class="text-red-600 text-xs" name="modified_name" />
        </div>
        <div class="mb-3">
          <label class="inline-block mb-2">Genre</label>
          <vee-field
            name="genre"
            type="text"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
            placeholder="Enter Genre"
            @input="updateUnsavedFlag(true)"
          />
          <ErrorMessage class="text-red-600 text-xs" name="genre" />
        </div>

        <div class="flex items-center gap-3">
          <button
            type="submit"
            class="py-1.5 px-3 rounded text-white bg-green-600"
            :disabled="in_submission"
          >
            Submit
          </button>
          <button
            type="button"
            class="py-1.5 px-3 rounded text-white bg-gray-600"
            @click.prevent="goBack"
            :disabled="in_submission"
          >
            Go Back
          </button>
        </div>
      </vee-form>
    </div>
  </div>
</template>

<script>
import { songsCollection, storage } from '@/includes/firebase'

export default {
  name: 'CompositionItem',
  props: {
    song: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    updateSong: {
      type: Function,
      required: true
    },
    removeSong: {
      type: Function,
      required: true
    },
    updateUnsavedFlag: {
      type: Function,
      required: false,
      default: () => null
    }
  },
  data() {
    return {
      showForm: false,
      schema: {
        modified_name: 'required',
        genre: 'alpha_spaces'
      },
      in_submission: false,
      showAlert: false,
      alert_variant: 'bg-blue-500',
      alert_message: 'Please wait! Updating song info!'
    }
  },
  methods: {
    async edit(values) {
      try {
        this.in_submission = true
        this.showAlert = true
        this.alert_variant = 'bg-blue-500'
        this.alert_message = 'Please wait! Updating song info!'

        await songsCollection.doc(this.song.docID).update(values)

        this.alert_variant = 'bg-green-500'
        this.alert_message = 'Success!'

        this.updateSong(this.index, values)
        this.updateUnsavedFlag(false)
      } catch (error) {
        console.error(error)
        this.alert_variant = 'bg-red-500'
        this.alert_message = 'Something went wrong! Try again later'
        return
      } finally {
        this.in_submission = false
      }
    },

    async deleteSong() {
      const storageRef = storage.ref()
      const songRef = storageRef.child(`songs/${this.song.original_name}`)

      await songRef.delete()
      await songsCollection.doc(this.song.docID).delete()

      this.removeSong(this.index)
    },

    goBack() {
      this.showForm = false
      this.showAlert = false
    }
  }
}
</script>
