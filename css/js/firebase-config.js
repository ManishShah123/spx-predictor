// Firebase Configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAF5ujlfdn0wyoTIeG2QSDpjl9B6oQGTAE",
  authDomain: "spx-predictor-ca4cc.firebaseapp.com",
  projectId: "spx-predictor-ca4cc",
  storageBucket: "spx-predictor-ca4cc.firebasestorage.app",
  messagingSenderId: "125907834321",
  appId: "1:125907834321:web:57fa3abb32952b8a27fcf0",
  measurementId: "G-JC5XX1CXNV"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Export for use in other files
window.auth = auth;
window.db = db;
window.googleProvider = googleProvider;
