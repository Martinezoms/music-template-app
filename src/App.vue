<template>
  <Header />
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component"></component>
    </transition>
  </router-view>
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

<style>
.fade-enter-from {
  opacity: 0;
}

.fade-enter-active {
  transition: all 0.5s linear;
}

.fade-leave-to {
  transition: all 0s lienar;
  opacity: 0;
}
</style>
