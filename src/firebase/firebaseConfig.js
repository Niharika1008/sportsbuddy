// src/firebase/firebaseConfig.js

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics"; // Keep if you use analytics
import { getAuth } from "firebase/auth"; // <--- IMPORT THIS
import { getFirestore } from "firebase/firestore"; // <--- IMPORT THIS

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCadXY4Vx0L9Z2ROUQhmPtpNG8aHtQnhjk",
    authDomain: "sport-buddy-daee1.firebaseapp.com",
    projectId: "sport-buddy-daee1",
    storageBucket: "sport-buddy-daee1.firebasestorage.app",
    messagingSenderId: "724058928795",
    appId: "1:724058928795:web:e7d7bf3b348c471424f83e",
    measurementId: "G-CLEXBVPQ5R" // Keep if you use analytics
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services and export them
const auth = getAuth(app); // <--- INITIALIZE AUTH
const db = getFirestore(app); // <--- INITIALIZE FIRESTORE

// Optional: Initialize Analytics if you plan to use it
const analytics = getAnalytics(app);

// Export all necessary services
export { app, auth, db, analytics }; // <--- EXPORT AUTH AND DB