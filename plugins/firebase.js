// Your web app's Firebase configuration
import firebase from 'firebase'
const firebaseConfig = {
  apiKey: 'AIzaSyBCi72fbUVMNlYJU5DN4BC4NmfJx9HGF88',
  authDomain: 'testchat-c64e3.firebaseapp.com',
  projectId: 'testchat-c64e3',
  storageBucket: 'testchat-c64e3.appspot.com',
  messagingSenderId: '318383813245',
  appId: '1:318383813245:web:a81536193b90cd0867f714',
  measurementId: 'G-HZDC0D72KR',
}

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig)
}

export default firebase
