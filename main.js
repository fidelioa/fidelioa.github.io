import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// TODO: Ensure this matches your actual project credentials from the Firebase console
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase App & Services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// DOM Selector Elements - Central Card Dashboard
const loginBtn = document.getElementById('google-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const dashboard = document.getElementById('user-dashboard');
const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');

// DOM Selector Elements - Top Navigation Bar Profile Link
const navUserProfile = document.getElementById('nav-user-profile');
const navUserPhoto = document.getElementById('nav-user-photo');
const navUserName = document.getElementById('nav-user-name');

// Authentication Event Listeners
loginBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider).catch((error) => console.error("Sign-In Failure:", error));
});

logoutBtn.addEventListener('click', () => {
    signOut(auth).catch((error) => console.error("Sign-Out Failure:", error));
});

// Session Engine: Handles continuous state tracking & stays logged in automatically
onAuthStateChanged(auth, (user) => {
    if (user) {
        const photoUrl = user.photoURL || 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/svgs/solid/user.svg';
        
        // 1. Populate Central Dashboard Card data
        userPhoto.src = photoUrl;
        userName.textContent = user.displayName;
        userEmail.textContent = user.email;

        // 2. Populate Top Bar Profile Nav elements
        navUserPhoto.src = photoUrl;
        navUserName.textContent = user.displayName.split(' ')[0]; // Shows first name only on thin menus

        // 3. UI Alterations (Hide login, Show profiles)
        loginBtn.style.display = 'none';
        dashboard.style.display = 'block';
        navUserProfile.style.display = 'inline-flex';
    } else {
        // User is absent/logged out: Revert styles back completely
        loginBtn.style.display = 'inline-flex';
        dashboard.style.display = 'none';
        navUserProfile.style.display = 'none';
        
        // Wipe sources cleanly
        userPhoto.src = "";
        navUserPhoto.src = "";
    }
});
