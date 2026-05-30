import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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
const db = getFirestore(app);

let analytics = null;
try {
    analytics = getAnalytics(app);
} catch (error) {
    console.warn("Analytics initialization skipped.", error);
}

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
                alert("Authentication failed: " + error.message);
            });
    });
}

// Sign-Out Click Event Listener
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        signOut(auth)
            .then(() => {
                console.log("Session terminated safely.");
                // Redirecting locally or back to home
                window.location.href = "/";
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
    if (user) {
        const fallBackPhoto = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/svgs/solid/user.svg';
        const finalPhoto = user.photoURL || fallBackPhoto;
        
        // 1. Fill profile dropdown card details
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

// ========================================================
// ONLINE DATA SAVING & SYNC ADAPTER
// ========================================================

/**
 * Saves quiz state progress directly into the Firestore collection
 * @param {object} progressData 
 * @returns {Promise<boolean>}
 */
window.saveProgressOnline = async function(progressData) {
    const user = auth.currentUser;
    if (!user) {
        console.warn("User is not signed in. Progress is only stored in local storage.");
        return false;
    }

    try {
        const userProgressDocRef = doc(db, "users_progress", user.uid);
        await setDoc(userProgressDocRef, {
            currentQuestion: progressData.currentQuestion,
            timeRemaining: progressData.timeRemaining,
            selectedAnswers: progressData.selectedAnswers || {},
            userId: user.uid,
            email: user.email || "",
            quizType: "jvp_and_murmurs",
            updatedAt: new Date().toISOString()
        });
        console.log("Successfully saved progress online for user: ", user.uid);
        return true;
    } catch (error) {
        console.error("Firestore persistence failed: ", error);
        return false;
    }
};

/**
 * Pulls current saved quiz progress state for the logged-in user
 * @returns {Promise<object|null>}
 */
window.loadProgressOnline = async function() {
    const user = auth.currentUser;
    if (!user) {
        console.warn("Cannot pull save online: User is not authenticated.");
        return null;
    }

    try {
        const userProgressDocRef = doc(db, "users_progress", user.uid);
        const docSnap = await getDoc(userProgressDocRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("Successfully loaded online progress for user: ", user.uid);
            return data;
        }
        return null;
    } catch (error) {
        console.error("Error retrieving Firestore state: ", error);
        return null;
    }
};

// Export active auth instance for coordinate checks
window.authInstance = auth;
