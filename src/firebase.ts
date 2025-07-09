import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDKWtGc0mL6eTgraX_3zhsyg-ksDHzLn2o",
  authDomain: "fir-firebase-js-a0051.firebaseapp.com",
  projectId: "fir-firebase-js-a0051",
  storageBucket: "fir-firebase-js-a0051.appspot.com",
  messagingSenderId: "1014912662032",
  appId: "1:1014912662032:web:ee44e8022bfbce0a7fe895"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
