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
        signOut(auth)
            .then(() => {
                console.log("Session terminated safely.");
                window.location.href = "https://ankitx007x.github.io/";
            })
            .catch((error) => {
                console.error("Sign-Out Error:", error.message);
            });
    });
}

// ========================================================
// SESSION LIFECYCLE ENGINE (UI Controller)
// ========================================================
onAuthStateChanged(auth, (user) => {
    const currentPath = window.location.pathname;

    if (user) {
        const fallBackPhoto = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/svgs/solid/user.svg';
        const finalPhoto = user.photoURL || fallBackPhoto;
        
        // 1. Fill profile drop down card details
        if (userName) userName.textContent = user.displayName || "User";
        if (userEmail) userEmail.textContent = user.email || "";
        if (navUserPhoto) navUserPhoto.src = finalPhoto;

        // 2. Hide Google Login Button
        if (loginBtn) loginBtn.classList.add('hidden');

        // 3. Make Profile picture avatar visible inside navigation bar line item
        if (navUserProfile) navUserProfile.style.display = 'flex';

        // 4. Activate center button interactivity states
        if (whiteRabbitBtn) {
            whiteRabbitBtn.classList.remove('disabled-state');
            whiteRabbitBtn.classList.add('active-state');
        }

        // 5. UNLOCK NAVIGATION BLOCKS LINK (Removes blocker pointer filters)
        if (navBlocksLink) {
            navBlocksLink.classList.remove('disabled-link');
            navBlocksLink.classList.add('active-link');
        }

    } else {
        // Route protection: Kicks unauthorized guests home if they try direct routing URLs
        if (currentPath.includes('/blocks') || currentPath.includes('/about')) {
            window.location.replace("https://ankitx007x.github.io/");
        }

        // 1. Return Google login button to layout view array
        if (loginBtn) loginBtn.classList.remove('hidden');

        // 2. Clear layout profile details and pull image view node parameters away
        if (navUserProfile) navUserProfile.style.display = 'none';
        if (navUserPhoto) navUserPhoto.src = "";
        if (profileDropdown) profileDropdown.classList.remove('show');
        
        // 3. Deactivate white rabbit click events via CSS block rules
        if (whiteRabbitBtn) {
            whiteRabbitBtn.classList.remove('active-state');
            whiteRabbitBtn.classList.add('disabled-state');
        }

        // 4. LOCK DOWN BLOCKS NAV LINK (Blocks pointer executions)
        if (navBlocksLink) {
            navBlocksLink.classList.remove('active-link');
            navBlocksLink.classList.add('disabled-link');
        }
    }
});
