// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDNYT6dt3HKnICE0tHECJLUbc-o9xqzwbo",
  authDomain: "fir-zephyr.firebaseapp.com",
  projectId: "firebase-zephyr",
  storageBucket: "firebase-zephyr.firebasestorage.app",
  messagingSenderId: "590621293387",
  appId: "1:590621293387:web:c254e4cd025fc8722006ce"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };