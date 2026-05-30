import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

// Initialize Firebase Core & Security Auth on the Blocks layout template
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Target DOM Elements
const logoutBtn = document.getElementById('logout-btn');
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
// GUARD RAILS: Check active user session tokens on file boot
// ========================================================
onAuthStateChanged(auth, (user) => {
    const pageBody = document.getElementById('blocks-body-content');
    
    if (!user) {
        console.warn("Unauthorized entrance detected. Evicting user to root index domain...");
        if (profileDropdown) profileDropdown.classList.remove('show');
        // Use replace instead of href so they can't click the browser "Back" button to return here
        window.location.replace("https://ankitx007x.github.io/");
    } else {
        console.log("Access Verification Cleared: Welcome to secure board array.");
        
        const fallBackPhoto = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/svgs/solid/user.svg';
        const finalPhoto = user.photoURL || fallBackPhoto;
        
        // 1. Populate data inside dropdown card elements
        if (userName) userName.textContent = user.displayName || "User";
        if (userEmail) userEmail.textContent = user.email || "";
        if (navUserPhoto) navUserPhoto.src = finalPhoto;

        // 2. Make profile picture container items inside the navbar flex row visible
        if (navUserProfile) navUserProfile.style.display = 'flex';

        // 3. Unhide verified workspace smoothly
        if (pageBody) {
            pageBody.classList.remove('secure-content-hidden');
        }
    }
});
