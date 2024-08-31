<template>
  <Header />
  <router-view />
  <Player />

  <Auth />
</template>

<script>
import Header from '@/components/Header.vue'
import Auth from '@/components/Auth.vue'
import Player from '@/components/Player.vue'
import { mapWritableState } from 'pinia'
import { useUserStore } from '@/stores/user'
import { auth } from '@/includes/firebase'

export default {
  name: 'App',
  computed: {
    ...mapWritableState(useUserStore, ['userLoggedIn'])
  },
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names
    Header,
    Auth,
    Player
  },
  created() {
    if (auth.currentUser) {
      this.userLoggedIn = true
    } else {
      this.userLoggedIn = false
    }
  }
}
</script>
