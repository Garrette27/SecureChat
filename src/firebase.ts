import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDKWtGc0mL6eTgraX_3zhsyg-ksDHzLn2o",
  authDomain: "fir-firebase-js-a0051.firebaseapp.com",
  projectId: "fir-firebase-js-a0051",
  storageBucket: "fir-firebase-js-a0051.appspot.com", // ✅ FIXED THIS
  messagingSenderId: "1014912662032",
  appId: "1:1014912662032:web:ee44e8022bfbce0a7fe895"
};

export const firebaseApp = initializeApp(firebaseConfig);
