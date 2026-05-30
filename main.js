import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

// Your verified web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBq2uEulFacFnzk86agcRhuQD1UNlZ_UTE",
    authDomain: "the-grand-budapest.firebaseapp.com",
    projectId: "the-grand-budapest",
    storageBucket: "the-grand-budapest.firebasestorage.app",
    messagingSenderId: "656352616063",
    appId: "1:656352616063:web:4f807b5f16b2cb059d694a",
    measurementId: "G-87X1RHHV3F"
};

// Initialize Firebase Core & Services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Target Dashboard Card Elements
const loginBtn = document.getElementById('google-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const dashboard = document.getElementById('user-dashboard');
const userPhoto = document.getElementById('user-photo');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');

// Target Top Nav Bar Profile Elements
const navUserProfile = document.getElementById('nav-user-profile');
const navUserPhoto = document.getElementById('nav-user-photo');
const navUserName = document.getElementById('nav-user-name');

// Sign-In Click Event Listener
loginBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            console.log("Successfully Authenticated:", result.user);
        })
        .catch((error) => {
            console.error("Authentication Error:", error.message);
        });
});

// Sign-Out Click Event Listener
logoutBtn.addEventListener('click', () => {
    signOut(auth)
        .then(() => {
            console.log("Session terminated safely.");
        })
        .catch((error) => {
            console.error("Sign-Out Error:", error.message);
        });
});

// Session Lifecycle Engine: Toggles view logic instantly across header and layout
onAuthStateChanged(auth, (user) => {
    if (user) {
        const fallBackPhoto = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/svgs/solid/user.svg';
        const finalPhoto = user.photoURL || fallBackPhoto;
        
        // 1. Fill Card Data
        userPhoto.src = finalPhoto;
        userName.textContent = user.displayName || "User";
        userEmail.textContent = user.email || "";

        // 2. Fill Navigation Header Data (Shows first name only to keep nav items tight)
        navUserPhoto.src = finalPhoto;
        navUserName.textContent = user.displayName ? user.displayName.split(' ')[0] : "User";

        // 3. UI Adjustments
        loginBtn.style.display = 'none';
        dashboard.style.display = 'block';
        navUserProfile.style.display = 'inline-flex';
    } else {
        // Clear layout state if logged out
        loginBtn.style.display = 'inline-flex';
        dashboard.style.display = 'none';
        navUserProfile.style.display = 'none';
        
        userPhoto.src = "";
        navUserPhoto.src = "";
    }
});
