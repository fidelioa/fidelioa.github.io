import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// IMPORTANT: Insert your specific config block parameters from your Firebase Project Dashboard here:
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase App & Identity Instances
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Target Core DOM Nodes
const loginBtn = document.getElementById('google-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const dashboard = document.getElementById('user-dashboard');
const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');

const navUserProfile = document.getElementById('nav-user-profile');
const navUserPhoto = document.getElementById('nav-user-photo');
const navUserName = document.getElementById('nav-user-name');

// Sign-In Click Event
loginBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Successfully Authenticated via Google Account:", result.user);
        })
        .catch((error) => {
            console.error("Authentication Handler Encountered an Issue:", error.message);
        });
});

// Sign-Out Click Event
logoutBtn.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            console.log("Session terminated safely.");
        })
        .catch((error) => {
            console.error("Sign-Out Handler Error:", error.message);
        });
});

// Mainline State Lifecycle Engine: Keeps users logged in automatically
onAuthStateChanged(auth, (user) => {
    if (user) {
        const fallBackPhoto = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/svgs/solid/user.svg';
        const finalPhoto = user.photoURL || fallBackPhoto;
        
        // Feed text and attributes into matching interface bindings
        userPhoto.src = finalPhoto;
        userName.textContent = user.displayName || "Anonymous User";
        userEmail.textContent = user.email || "";

        navUserPhoto.src = finalPhoto;
        navUserName.textContent = user.displayName ? user.displayName.split(' ')[0] : "User";

        // Flip layout toggles to view state alterations
        loginBtn.style.display = 'none';
        dashboard.style.display = 'block';
        navUserProfile.style.display = 'inline-flex';
    } else {
        // Fallback cleanup if session keys expire or user triggers an exit
        loginBtn.style.display = 'inline-flex';
        dashboard.style.display = 'none';
        navUserProfile.style.display = 'none';
        
        userPhoto.src = "";
        navUserPhoto.src = "";
    }
});
