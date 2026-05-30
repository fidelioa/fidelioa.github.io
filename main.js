import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import { getAuth ,GoogleAuthProvider ,signInWithPopup } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBq2uEulFacFnzk86agcRhuQD1UNlZ_UTE",
  authDomain: "the-grand-budapest.firebaseapp.com",
  projectId: "the-grand-budapest",
  storageBucket: "the-grand-budapest.firebasestorage.app",
  messagingSenderId: "656352616063",
  appId: "1:656352616063:web:4f807b5f16b2cb059d694a",
  measurementId: "G-87X1RHHV3F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.languageCode = 'en'
const provider = new GoogleAuthProvider();
const analytics = getAnalytics(app);

// New Function: Extracts profile details and saves them securely to localStorage
function saveUserProfile(user) {
  if (user) {
    const profileData = {
      name: user.displayName,
      profilePic: user.photoURL,
      email: user.email
    };
    // Store as a stringified object so you can easily pull it on your logged.html page
    localStorage.setItem("userProfile", JSON.stringify(profileData));
    console.log("User profile saved locally:", profileData);
  }
}

const googleLogin = document.getElementById("google-login-btn");
googleLogin.addEventListener("click", function(){

  signInWithPopup(auth, provider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const user = result.user;
      console.log(user);
      
      // Call the new profile fetching and saving function here
      saveUserProfile(user);
      
      // Safe to redirect now that data is stored locally
      window.location.href = "../logged.html";
      
    }).catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Login failed:", errorMessage);
    });
});
