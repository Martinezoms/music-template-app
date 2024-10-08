<template>
  <main>
    <!-- Music Header -->
    <section class="w-full mb-8 py-14 text-center text-white relative">
      <div
        class="absolute inset-0 w-full h-full box-border bg-contain music-bg"
        style="background-image: url(/assets/img/song-header.png)"
      ></div>
      <div class="container mx-auto flex items-center">
        <!-- Play/Pause Button -->
        <button
          type="button"
          class="z-50 h-24 w-24 text-3xl bg-white text-black rounded-full focus:outline-none"
          @click.prevent="newSong(song)"
        >
          <i
            class="fas"
            :class="{
              'fa-play': !isCurrentSongPlaying(song),
              'fa-pause': isCurrentSongPlaying(song)
            }"
          ></i>
        </button>
        <div class="z-50 text-left ml-8">
          <!-- Song Info -->
          <div class="text-3xl font-bold">{{ song?.modified_name }}</div>
          <div>{{ song?.genre }}</div>
        </div>
      </div>
    </section>
    <!-- Form -->
    <section class="container mx-auto mt-6" id="comments">
      <div class="bg-white rounded border border-gray-200 relative flex flex-col">
        <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
          <!-- Comment Count -->
          <span class="card-title">{{
            $tc('song.comment_count', song.comment_count, { count: song?.comment_count ?? 0 })
          }}</span>
          <i class="fa fa-comments float-right text-green-400 text-2xl"></i>
        </div>
        <div class="p-6">
          <div
            v-if="comment_show_alert"
            class="text-white text-center font-bold p-4 mb-4"
            :class="comment_alert_variant"
          >
            {{ comment_alert_message }}
          </div>
          <vee-form :validation-schema="schema" @submit="addComment" v-if="userLoggedIn">
            <div class="mb-4">
              <vee-field
                as="textarea"
                name="comment"
                class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                placeholder="Your comment here..."
              >
              </vee-field>
              <ErrorMessage class="text-red-600 text-xs" name="comment" />
            </div>

            <button
              type="submit"
              class="py-1.5 px-3 rounded text-white bg-green-600 block"
              :disabled="comment_in_submission"
            >
              Submit
            </button>
          </vee-form>
          <!-- Sort Comments -->
          <select
            v-model="sortMethod"
            class="block mt-4 py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
          >
            <option value="1">Latest</option>
            <option value="2">Oldest</option>
          </select>
        </div>
      </div>
    </section>
    <!-- Comments -->
    <ul class="container mx-auto">
      <li
        v-for="comment in sortedComments"
        :key="comment?.docID"
        class="p-6 bg-gray-50 border border-gray-200"
      >
        <!-- Comment Author -->
        <div class="mb-5">
          <div class="font-bold">{{ comment?.name }}</div>
          <time>{{ comment?.datePosted }}</time>
        </div>

        <p>
          {{ comment?.content }}
        </p>
      </li>
    </ul>
  </main>
</template>

<script>
import { songsCollection, commentsCollection, auth } from '@/includes/firebase'
import { mapState, mapActions } from 'pinia'
import { useUserStore } from '@/stores/user'
import { usePlayerStore } from '@/stores/player'

export default {
  name: 'Song',
  data() {
    return {
      song: null,
      comments: [],
      sortMethod: 1,
      schema: {
        comment: 'required|min:3'
      },
      comment_in_submission: false,
      comment_show_alert: false,
      comment_alert_variant: 'bg-blue-500',
      comment_alert_message: 'Please wait! Your comment is being submitted'
    }
  },

  computed: {
    ...mapState(useUserStore, ['userLoggedIn']),
    sortedComments() {
      return this.comments.slice().sort((a, b) => {
        if (this.sortMethod == 1) {
          return new Date(b.datePosted) - new Date(a.datePosted)
        } else {
          return new Date(a.datePosted) - new Date(b.datePosted)
        }
      })
    }
  },

  async created() {
    try {
      const docSnapshot = await songsCollection.doc(this.$route.params.id).get()

      if (!docSnapshot.exists) {
        this.$router.push({ name: 'home' })
        return
      }

      const { sort } = this.$route.query

      this.sortMethod = sort == '1' || sort == '2' ? sort : 1

      this.song = docSnapshot.data()
      this.getComments()
    } catch (error) {
      console.error(error)
    }
  },

  methods: {
    ...mapActions(usePlayerStore, ['newSong', 'isCurrentSongPlaying']),
    async addComment(values, { resetForm }) {
      try {
        this.comment_show_alert = true
        this.comment_in_submission = true
        this.comment_alert_variant = 'bg-blue-500'
        this.comment_alert_message = 'Please wait! Your comment is being submitted'

        const comment = {
          content: values.comment,
          datePosted: new Date().toString(),
          sid: this.$route.params.id,
          name: auth.currentUser.displayName,
          uid: auth.currentUser.uid
        }

        await commentsCollection.add(comment)
        this.song.comment_count += 1
        await songsCollection.doc(this.$route.params.id).update({
          comment_count: this.song.comment_count
        })

        this.getComments()

        this.comment_alert_variant = 'bg-green-500'
        this.comment_alert_message = 'Comment added!'

        resetForm()
      } catch (error) {
        console.error(error)

        this.comment_alert_variant = 'bg-red-500'
        this.comment_alert_message = 'An error occured why submitting your comment'
      } finally {
        this.comment_in_submission = false
      }
    },

    async getComments() {
      const snapshots = await commentsCollection.where('sid', '==', this.$route.params.id).get()
      this.comments = []

      snapshots.forEach((doc) => {
        this.comments.push({
          docID: doc.id,
          ...doc.data()
        })
      })
    }
  },

  watch: {
    sortMethod(newVal) {
      if (newVal == this.$route.query.sort) return

      this.$router.push({
        query: {
          sort: newVal
        }
      })
    }
  }
}
</script>
