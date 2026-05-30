import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
// Import the Firebase Realtime Database module
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js";

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
const database = getDatabase(app); // Initialize Database
const provider = new GoogleAuthProvider();

// Target DOM Elements
const loginBtn = document.getElementById('google-login-btn');
const whiteRabbitBtn = document.getElementById('white-rabbit-btn');
const logoutBtn = document.getElementById('logout-btn');
const navBlocksLink = document.getElementById('nav-blocks-link');

// Navbar Profile Elements
const navUserProfile = document.getElementById('nav-user-profile');
const navUserPhoto = document.getElementById('nav-user-photo');
const profileDropdown = document.getElementById('profile-dropdown');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');

// Track user object globally across modular scopes
window.currentUser = null;

// Global Online Cloud Persistence Interface
window.saveProgressOnline = async function(progressData) {
    if (!window.currentUser) {
        console.warn("User session missing. Saving locally instead.");
        return false;
    }
    const userId = window.currentUser.uid;
    try {
        await set(ref(database, 'users/' + userId + '/qbankProgress'), progressData);
        console.log("Progress securely written to the cloud database.");
        return true;
    } catch (error) {
        console.error("Firebase Database Write Error:", error);
        return false;
    }
};

window.fetchProgressOnline = async function() {
    if (!window.currentUser) return null;
    const userId = window.currentUser.uid;
    try {
        const snapshot = await get(ref(database, 'users/' + userId + '/qbankProgress'));
        if (snapshot.exists()) {
            return snapshot.val();
        }
        return null;
    } catch (error) {
        console.error("Firebase Database Read Error:", error);
        return null;
    }
};

// ========================================================
// DROPDOWN TOGGLE ARCHITECTURE (Always active on boot)
// ========================================================
if (navUserPhoto && profileDropdown) {
    navUserPhoto.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation(); // Prevents document click script from immediately firing execution closure
        profileDropdown.classList.toggle('show');
    });

    // Close the dropdown box if clicking anywhere else on screen
    document.addEventListener('click', () => {
        profileDropdown.classList.remove('show');
    });
}

// Sign-In Click Event Listener
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        signInWithPopup(auth, provider)
            .then((result) => {
                console.log("Successfully Authenticated:", result.user);
            })
            .catch((error) => {
                console.error("Authentication Error:", error.message);
            });
    });
}

// Sign-Out Click Event Listener
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
            console.log("Successfully signed out.");
        }).catch((error) => {
            console.error("Sign-out Error:", error);
        });
    });
}

// Global Auth State Observer Pipeline
onAuthStateChanged(auth, (user) => {
    const currentPath = window.location.pathname;

    if (user) {
        window.currentUser = user;
        
        // Dispatch custom global notification event letting other scripts know user is ready
        document.dispatchEvent(new CustomEvent('authReady', { detail: user }));

        if (loginBtn) loginBtn.classList.add('hidden');
        if (navUserProfile) navUserProfile.style.display = 'flex';
        if (navUserPhoto) navUserPhoto.src = user.photoURL || "";
        if (userName) userName.innerText = user.displayName || "User";
        if (userEmail) userEmail.innerText = user.email || "";

        if (whiteRabbitBtn) {
            whiteRabbitBtn.classList.remove('disabled-state');
            whiteRabbitBtn.classList.add('active-state');
        }

        if (navBlocksLink) {
            navBlocksLink.classList.remove('disabled-link');
            navBlocksLink.classList.add('active-link');
        }

    } else {
        window.currentUser = null;
        
        if (currentPath.includes('/blocks') || currentPath.includes('/about')) {
            window.location.replace("https://ankitx007x.github.io/");
        }

        if (loginBtn) loginBtn.classList.remove('hidden');
        if (navUserProfile) navUserProfile.style.display = 'none';
        if (navUserPhoto) navUserPhoto.src = "";
        if (profileDropdown) profileDropdown.classList.remove('show');
        
        if (whiteRabbitBtn) {
            whiteRabbitBtn.classList.remove('active-state');
            whiteRabbitBtn.classList.add('disabled-state');
        }

        if (navBlocksLink) {
            navBlocksLink.classList.remove('active-link');
            navBlocksLink.classList.add('disabled-link');
        }
    }
});
