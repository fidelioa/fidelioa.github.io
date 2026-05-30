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

// Navbar Left Profile Elements
const navUserProfile = document.getElementById('nav-user-profile');
const navUserPhoto = document.getElementById('nav-user-photo');
const profileDropdown = document.getElementById('profile-dropdown');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');

// ========================================================
// PROFILE DROPDOWN INTERACTION HACK
// ========================================================
if (navUserPhoto && profileDropdown) {
    navUserPhoto.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevents document click listener from immediately closing it
        profileDropdown.classList.toggle('show');
    });

    // Automatically collapse dropdown when user clicks anywhere else on screen
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
// SESSION LIFECYCLE ENGINE (UI & Access Controller)
// ========================================================
onAuthStateChanged(auth, (user) => {
    const currentPath = window.location.pathname;

    if (user) {
        const fallBackPhoto = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/svgs/solid/user.svg';
        const finalPhoto = user.photoURL || fallBackPhoto;
        
        // 1. Fill Dropdown Profile Card Data (Moved into the corner navbar block)
        if (userName) userName.textContent = user.displayName || "User";
        if (userEmail) userEmail.textContent = user.email || "";
        if (navUserPhoto) navUserPhoto.src = finalPhoto;

        // 2. Hide Google Login Button
        if (loginBtn) loginBtn.classList.add('hidden');

        // 3. Reveal Left-Corner Profile Element
        if (navUserProfile) navUserProfile.style.display = 'inline-flex';

        // 4. Activate the "Follow the White Rabbit" Button (Unhide and light it up)
        if (whiteRabbitBtn) {
            whiteRabbitBtn.classList.remove('disabled-state');
            whiteRabbitBtn.classList.add('active-state');
        }

    } else {
        // Route protection: Guard rails against unauthorized sub-page surfing
        if (currentPath.includes('/blocks') || currentPath.includes('/about')) {
            window.location.replace("https://ankitx007x.github.io/");
        }

        // 1. Return Google Login button back to active display
        if (loginBtn) loginBtn.classList.remove('hidden');

        // 2. Clear out and conceal navbar profile avatar elements
        if (navUserProfile) navUserProfile.style.display = 'none';
        if (navUserPhoto) navUserPhoto.src = "";
        if (profileDropdown) profileDropdown.classList.remove('show'); // Ensure dropdown is shut
        
        // 3. Make White Rabbit button visually and physically unresponsive
        if (whiteRabbitBtn) {
            whiteRabbitBtn.classList.remove('active-state');
            whiteRabbitBtn.classList.add('disabled-state');
        }
    }
});
