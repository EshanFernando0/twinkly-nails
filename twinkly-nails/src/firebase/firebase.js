import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD4qan0PVI8nu94Ta29SqqAU9OQGJgIZkA",
  authDomain: "twinkly-nails.firebaseapp.com",
  projectId: "twinkly-nails",
  storageBucket: "twinkly-nails.firebasestorage.app",
  messagingSenderId: "809210799494",
  appId: "1:809210799494:web:66d5aa7d07086cba85f807"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services so you can use them in your React components
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);