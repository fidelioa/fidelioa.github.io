import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

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

// Guard Rails: Instantly listen to the user session tokens on file boot
onAuthStateChanged(auth, (user) => {
    const pageBody = document.getElementById('blocks-body-content');
    
    if (!user) {
        console.warn("Unauthorized entrance detected. Evicting user to root index domain...");
        // Use replace instead of href so they can't click the browser "Back" button to return here
        window.location.replace("https://ankitx007x.github.io/");
    } else {
        console.log("Access Verification Cleared: Welcome to secure board array.");
        // Unhide verified workspace smoothly
        if (pageBody) {
            pageBody.classList.remove('secure-content-hidden');
        }
    }
});