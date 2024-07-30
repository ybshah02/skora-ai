// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC97r_y4ujy7WiArdSG4O4NSLYsNBdocFg",
  authDomain: "skoratech2024.firebaseapp.com",
  projectId: "skoratech2024",
  storageBucket: "skoratech2024.appspot.com",
  messagingSenderId: "19580607219",
  appId: "1:19580607219:web:f58576892211686ddd7586",
  measurementId: "G-DL6KKWS0QR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
