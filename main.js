import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBq2uEulFacFnzk86agcRhuQD1UNlZ_UTE",
    authDomain: "the-grand-budapest.firebaseapp.com",
    projectId: "the-grand-budapest",
    storageBucket: "the-grand-budapest.firebasestorage.app",
    messagingSenderId: "656352616063",
    appId: "1:656352616063:web:4f807b5f16b2cb059d694a"
};

// Initialize Services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Global User Track Object
window.currentUser = null;

// UI Elements (Safely checked)
const loginBtn = document.getElementById('google-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const navUserProfile = document.getElementById('nav-user-profile');
const navUserPhoto = document.getElementById('nav-user-photo');
const profileDropdown = document.getElementById('profile-dropdown');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');

// Global Online Cloud Save Pipeline
window.saveProgressOnline = async function(packet) {
    if (!window.currentUser) {
        console.warn("No authenticated user found. Cannot save online.");
        return false;
    }
    try {
        const userProgressRef = doc(db, "users_progress", window.currentUser.uid);
        await setDoc(userProgressRef, {
            currentQuestion: packet.currentQuestion,
            timeRemaining: packet.timeRemaining,
            selectedAnswers: packet.selectedAnswers || {},
            reviewMode: packet.reviewMode || {},
            correctAnswersCount: packet.correctAnswersSum || 0,
            userId: window.currentUser.uid,
            email: window.currentUser.email || "",
            quizType: "jvp_and_murmurs",
            updatedAt: new Date().toISOString()
        });
        console.log("Progress successfully saved to Firestore.");
        return true;
    } catch (error) {
        console.error("Firestore Save Error:", error);
        return false;
    }
};

// Global Online Cloud Fetch Pipeline
window.fetchProgressOnline = async function() {
    if (!window.currentUser) return null;
    try {
        const userProgressRef = doc(db, "users_progress", window.currentUser.uid);
        const docSnap = await getDoc(userProgressRef);
        if (docSnap.exists()) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error("Firestore Fetch Error:", error);
        return null;
    }
};

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.currentUser = user;
        
        // Update Navbar Profile UI Elements
        if (loginBtn) loginBtn.classList.add('hidden');
        if (navUserProfile) navUserProfile.style.display = 'flex';
        if (navUserPhoto) navUserPhoto.src = user.photoURL || "";
        if (userName) userName.innerText = user.displayName || "User";
        if (userEmail) userEmail.innerText = user.email || "";

        // Dispatch custom event to notify jvp-and-murmurs page that auth is verified
        window.dispatchEvent(new CustomEvent('authReady', { detail: user }));
    } else {
        window.currentUser = null;
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (navUserProfile) navUserProfile.style.display = 'none';
    }
});

// Dropdown Navigation System Events
if (navUserPhoto && profileDropdown) {
    navUserPhoto.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        profileDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', () => {
        profileDropdown.classList.add('hidden');
    });
}

// Auth Event Hooks
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        signInWithPopup(auth, provider).catch(err => console.error(err));
    });
}
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => window.location.reload());
    });
}
