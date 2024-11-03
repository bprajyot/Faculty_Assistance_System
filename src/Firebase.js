import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";  // Import for database
import { getStorage } from "firebase/storage";  // Import for storage

const firebaseConfig = {
  apiKey: "AIzaSyBg0U4f8uWQ64_UUEwmUu1sNuMh-NhabLQ",
  authDomain: "ty-edi-i.firebaseapp.com",
  projectId: "ty-edi-i",
  storageBucket: "ty-edi-i.appspot.com",
  messagingSenderId: "556901163389",
  appId: "1:556901163389:web:fd2349c7d0cc724fd92c14",
  measurementId: "G-1R8MM49EGE",
  databaseURL: "https://ty-edi-i-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getDatabase(app);  // Export the database instance
export const storage = getStorage(app);  // Export the storage instance
