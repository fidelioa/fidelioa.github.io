import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Your verified web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBq2uEulFacFnzk86agcRhuQD1UNlZ_UTE",
    authDomain: "the-grand-budapest.firebaseapp.com",
    projectId: "the-grand-budapest",
    storageBucket: "the-grand-budapest.firebasestorage.app",
    messagingSenderId: "656352616063",
    appId: "1:656352616063:web:4f807b5f16b2cb059d694a"
};

// Initialize Firebase Core & Services
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
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

// Global Online Cloud Persistence Interface (Writing to Firestore)
window.saveProgressOnline = async function(packet) {
    if (!window.currentUser) {
        console.warn("User session missing. Cannot backup online.");
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
        console.log("Progress securely written to Firestore for UID:", window.currentUser.uid);
        return true;
    } catch (error) {
        console.error("Firestore Database Write Error:", error);
        return false;
    }
};

// Global Online Cloud Retrieval Interface
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
        console.error("Firestore Database Fetch Error:", error);
        return null;
    }
};

// Authentication State Observers
onAuthStateChanged(auth, (user) => {
    const currentPath = window.location.pathname;

    if (user) {
        window.currentUser = user;
        window.dispatchEvent(new CustomEvent('authReady', { detail: user }));

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

// Global Auth Controls Integration Hooks
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
