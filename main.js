// main.js - Using Firebase Auth
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM Elements
const loginBtn = document.getElementById('google-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const dashboard = document.getElementById('user-dashboard');
const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');

// Trigger Google Sign-In
loginBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider).catch((error) => console.error("Login failed:", error));
});

// Trigger Sign-Out
logoutBtn.addEventListener('click', () => {
    signOut(auth).catch((error) => console.error("Logout failed:", error));
});

// KEEPS THEM LOGGED IN: Listens to real-time auth state changes natively saved by Firebase
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, populate dashboard data
        userPhoto.src = user.photoURL || './assets/default-avatar.png';
        userName.textContent = user.displayName;
        userEmail.textContent = user.email;

        // Toggle UI views
        loginBtn.style.display = 'none';
        dashboard.style.display = 'block';
    } else {
        // User is signed out
        loginBtn.style.display = 'inline-flex';
        dashboard.style.display = 'none';
    }
});
