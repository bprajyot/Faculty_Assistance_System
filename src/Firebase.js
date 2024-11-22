import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";  // Import for database
import { getStorage } from "firebase/storage";  // Import for storage

const firebaseConfig = {
  apiKey: "AIzaSyBTQ057pgOYi_BIiiUK0KDrBkK_EC2feKk",
  authDomain: "ty-edi.firebaseapp.com",
  projectId: "ty-edi",
  storageBucket: "ty-edi.firebasestorage.app",
  messagingSenderId: "288915412402",
  appId: "1:288915412402:web:8f0d76c76272dd8aec80ab", 
  measurementId: "G-1R8MM49EGE",
  databaseURL: "https://ty-edi-default-rtdb.firebaseio.com/"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getDatabase(app);  // Export the database instance
export const storage = getStorage(app);  // Export the storage instance
