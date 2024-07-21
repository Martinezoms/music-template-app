import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import 'firebase/compat/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyANia81PGuapQI_-UP8w0bHTBL4qAkBG84',
  authDomain: 'music-41f44.firebaseapp.com',
  projectId: 'music-41f44',
  storageBucket: 'music-41f44.appspot.com',
  appId: '1:162819272022:web:d2a520886d0fc1890f7af7'
}

firebase.initializeApp(firebaseConfig)

const auth = firebase.auth()
const db = firebase.firestore()

const usersCollection = db.collection('users')

export { auth, db, usersCollection }
