import { defineStore } from 'pinia'
import { auth, usersCollection } from '@/includes/firebase'

export const useUserStore = defineStore('user', {
  state: () => ({
    userLoggedIn: false
  }),

  actions: {
    async register(values) {
      if (!values) return

      const userCred = await auth.createUserWithEmailAndPassword(values.email, values.password)

      await usersCollection.doc(userCred.user.uid).set({
        name: values.name,
        email: values.email,
        age: values.age,
        country: values.country
      })

      await userCred.user.updateProfile({ displayName: values.name })

      this.userLoggedIn = true
    },

    async authenticate(values) {
      if (!values) return

      await auth.signInWithEmailAndPassword(values.email, values.password)
      this.userLoggedIn = true
    },

    async signOut() {
      await auth.signOut()

      this.userLoggedIn = false
    }
  }
})
