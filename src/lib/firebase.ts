import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvJfNABMwM0TmhCu2vYU3diezA3jIyxG0",
  authDomain: "clothes-af9ac.firebaseapp.com",
  databaseURL: "https://clothes-af9ac-default-rtdb.firebaseio.com",
  projectId: "clothes-af9ac",
  storageBucket: "clothes-af9ac.firebasestorage.app",
  messagingSenderId: "658036944443",
  appId: "1:658036944443:web:6b6c39e1b075e031d2f61e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);
export const firestore = getFirestore(app);