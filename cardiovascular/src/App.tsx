import { useState, useEffect } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { getFirestore, doc, getDoc, deleteDoc } from "firebase/firestore";
import { 
  Heart, 
  Play, 
  HelpCircle, 
  Clock, 
  Award, 
  RefreshCw, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  TrendingUp, 
  ChevronRight,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Trash2,
  Activity
} from "lucide-react";
import { motion } from "motion/react";

// The exact same Firebase credentials for project validation
const firebaseConfig = {
    apiKey: "AIzaSyBq2uEulFacFnzk86agcRhuQD1UNlZ_UTE",
    authDomain: "the-grand-budapest.firebaseapp.com",
    projectId: "the-grand-budapest",
    storageBucket: "the-grand-budapest.firebasestorage.app",
    messagingSenderId: "656352616063",
    appId: "1:656352616063:web:4f807b5f16b2cb059d694a",
    measurementId: "G-87X1RHHV3F"
};

// Initialize app with singleton insurance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

interface SavedQuizProgress {
  currentQuestion: number;
  timeRemaining: number;
  selectedAnswers: Record<string, string>;
  updatedAt?: string;
  correctAnswersCount?: number;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cloudProgress, setCloudProgress] = useState<SavedQuizProgress | null>(null);
  const [localProgress, setLocalProgress] = useState<SavedQuizProgress | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Determine current active view based on client window routing path name
  const [activePath, setActivePath] = useState(window.location.pathname);

  useEffect(() => {
    // Listen for state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync state and route paths
  useEffect(() => {
    const handleLocationChange = () => {
      setActivePath(window.location.pathname);
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  // Fetch Saved Quiz Progress from both Cloud (Firestore) and Local Storage
  const loadSavedStates = async () => {
    // 1. Load Local Progress
    const local = localStorage.getItem("mcqProgress");
    if (local) {
      try {
        setLocalProgress(JSON.parse(local));
      } catch (e) {
        console.error("Failed to parse local storage progress", e);
      }
    } else {
      setLocalProgress(null);
    }

    // 2. Load Firestore Progress
    if (user) {
      try {
        const userProgressDocRef = doc(db, "users_progress", user.uid);
        const docSnap = await getDoc(userProgressDocRef);
        if (docSnap.exists()) {
          setCloudProgress(docSnap.data() as SavedQuizProgress);
        } else {
          setCloudProgress(null);
        }
      } catch (e) {
        console.error("Failed loading cloud progress from Firestore", e);
      }
    } else {
      setCloudProgress(null);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadSavedStates();
    }
  }, [user, authLoading]);

  // Handle Google Sign-In popup flow
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Sign-in error: ", error);
    }
  };

  // Handle Log out process
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCloudProgress(null);
      setShowDropdown(false);
    } catch (error) {
      console.error("Logout error: ", error);
    }
  };

  // Safe reset routine to clear both Local Storage and Firestore progress data completely
  const handleResetSession = async () => {
    if (!confirm("Are you sure you want to reset all current quiz progress? This will clear both local and cloud-saved sessions.")) {
      return;
    }
    
    setIsResetting(true);
    try {
      // 1. Wipe local storage
      localStorage.removeItem("mcqProgress");
      setLocalProgress(null);

      // 2. Wipe Firestore collection record
      if (user) {
        const userProgressDocRef = doc(db, "users_progress", user.uid);
        await deleteDoc(userProgressDocRef);
        setCloudProgress(null);
      }
      alert("Quiz session has been successfully reset. You can now start with a clean slate.");
    } catch (e) {
      console.error(e);
      alert("Failed to reset cloud progress. Please try again.");
    } finally {
      setIsResetting(false);
    }
  };

  // Helper calculation formatting
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  // Active progression status
  const activeQuiz = cloudProgress || localProgress;

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans flex flex-col selection:bg-blue-200">
      
      {/* Premium Header Bar */}
      <header className="bg-[#1a365d] border-b border-[#2c5282] shrink-0 sticky top-0 z-40 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            <div className="bg-red-500/15 p-2 rounded-xl text-red-400 border border-red-500/30">
              <Heart className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight">CardioQBank</h1>
              <p className="text-[10px] text-blue-300 font-mono tracking-wider uppercase">Cardiovascular Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a 
              href="/jvp-and-murmur.html" 
              className="text-sm font-semibold text-slate-200 hover:text-white transition py-1.5 px-3 rounded-lg hover:bg-white/5"
            >
              Take QBank Quiz
            </a>

            <span className="text-slate-600 h-4 w-[1px] bg-slate-500/30"></span>

            {authLoading ? (
              <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
            ) : user ? (
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 focus:outline-none cursor-pointer group"
                >
                  <img 
                    src={user.photoURL || "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/svgs/solid/user.svg"} 
                    alt={user.displayName || "User"} 
                    className="w-9 h-9 rounded-full border-2 border-blue-400 hover:border-white transition-colors duration-200"
                  />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 text-slate-800 rounded-xl shadow-xl py-3 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="font-extrabold text-sm text-slate-900 truncate">{user.displayName || "Clinical Student"}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email || ""}</p>
                    </div>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                Sign In with Google
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner with Greeting & Sync status */}
        <div className="bg-gradient-to-r from-blue-900 to-[#1a365d] border border-blue-950/40 text-white rounded-2xl p-6 sm:p-8 shadow-md mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Heart className="w-64 h-64" />
          </div>
          <div className="relative z-10 max-w-2xl">
            <span className="bg-blue-500/20 text-blue-300 font-mono text-[10px] tracking-widest uppercase font-bold px-3 py-1 rounded-full border border-blue-400/20">
              Board Review Simulator
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-3 mb-2">
              {user ? `Welcome back, Dr. ${user.displayName?.split(" ")[0]}!` : "Welcome to the High-Yield Cardiology QBank!"}
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Synthesizing key physical assessment coordinates including Jugular Venous Pulsations (JVP) waveforms, systolic clicks, dynamic maneuvers, and diagnostic heart sound auscultations.
            </p>
          </div>

          <div className="relative z-10 shrink-0 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-2 min-w-[200px]">
            <p className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">Sync Status</p>
            {user ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Cloud Backup Connected
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Local Storage Only
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  Sign in to back up, sync across devices, and preserve your clinical performance data online.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard grid structure */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT/CENTER MAIN PANELS - QBANK MODULES */}
          <div className="lg:col-span-2 space-y-8">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                Active Cardiology QBank Blocks
              </h3>
              <p className="text-xs text-slate-500 font-medium">1 Block Active</p>
            </div>

            {/* Core QBank Module Card - JVP and Murmurs */}
            <div className="bg-white border border-slate-200 hover:border-blue-300 rounded-2xl shadow-sm hover:shadow transition-all duration-300 overflow-hidden group">
              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <span className="bg-red-50 text-red-600 text-[10px] uppercase font-extrabold tracking-widest px-2.5 py-1 rounded-md border border-red-100">
                      High Yield Board Topic
                    </span>
                    <h4 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition mt-2">
                      Jugular Venous Pressure & Auscultatory Murmurs
                    </h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Comprehensive validation trials on JVP waveforms, decrescendo murmurs, and afterload maneuvers.
                    </p>
                  </div>
                  
                  {/* Active Progression Badge */}
                  {activeQuiz ? (
                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full border border-blue-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      In Progress
                    </span>
                  ) : (
                    <span className="bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200">
                      Not Started
                    </span>
                  )}
                </div>

                {/* Sub-Progress metrics when progress is tracked */}
                {activeQuiz && (
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 my-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">Completed</span>
                      <p className="text-base font-extrabold text-slate-800 mt-0.5">
                        {activeQuiz.currentQuestion + 1} / 40 Questions
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">Time Remaining</span>
                      <p className="text-base font-extrabold text-[#1a365d] mt-0.5 flex items-center gap-1">
                        <Clock className="w-4 h-4 text-slate-500" />
                        {formatTime(activeQuiz.timeRemaining)}
                      </p>
                    </div>

                    <div className="col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-slate-400 font-mono uppercase font-bold tracking-wider block">Last Updated</span>
                      <p className="text-xs font-medium text-slate-600 mt-1 truncate">
                        {activeQuiz.updatedAt ? new Date(activeQuiz.updatedAt).toLocaleTimeString() : "Local Instant"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Visual progression slider */}
                {activeQuiz && (
                  <div className="space-y-1 mb-6">
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>Quiz Progress slider</span>
                      <span>{Math.round(((activeQuiz.currentQuestion + 1) / 40) * 100)}% Complete</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 border border-slate-200">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(2.5, ((activeQuiz.currentQuestion + 1) / 40) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap justify-between items-center gap-4 mt-6 border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-3">
                    <a 
                      href="/jvp-and-murmur.html"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow transition duration-150 flex items-center gap-1.5"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      {activeQuiz ? "Resume Active Quiz" : "Start New Quiz"}
                    </a>

                    {activeQuiz && (
                      <button 
                        onClick={handleResetSession}
                        disabled={isResetting}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/50 hover:border-rose-300 font-bold text-sm px-4 py-2.5 rounded-xl transition duration-150 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Reset Quiz
                      </button>
                    )}
                  </div>

                  {user && cloudProgress && (
                    <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Synced with Cloud Database
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Locked coming soon curriculum list */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold uppercase text-slate-400 font-mono tracking-widest pl-1">
                Upcoming Cardiology Blocks
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="border border-slate-200 bg-white rounded-xl p-5 opacity-70 relative group hover:opacity-100 transition-all">
                  <span className="absolute top-4 right-4 text-[10px] font-mono border border-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded-md bg-slate-50 uppercase">
                    Locked
                  </span>
                  <div className="bg-slate-100 border border-slate-200 w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 mb-4">
                    <Activity className="w-5 h-5 shadow-sm" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm">EKG Clinical Competency</h5>
                  <p className="text-xs text-slate-500 mt-1">Ischemic st-elevations, AV blocks, and flutter analysis.</p>
                </div>

                <div className="border border-slate-200 bg-white rounded-xl p-5 opacity-70 relative group hover:opacity-100 transition-all">
                  <span className="absolute top-4 right-4 text-[10px] font-mono border border-slate-200 text-slate-500 font-bold px-2 py-0.5 rounded-md bg-slate-50 uppercase">
                    Locked
                  </span>
                  <div className="bg-slate-100 border border-slate-200 w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 mb-4">
                    <Sparkles className="w-5 h-5 shadow-sm" />
                  </div>
                  <h5 className="font-bold text-slate-900 text-sm">Congestive Heart Failure</h5>
                  <p className="text-xs text-slate-500 mt-1">Decompensation pathophysiology, BNP spikes, and pharmacotherapy.</p>
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT SIDE PANELS - PERFORMANCE SCORES & CHEATSHEETS */}
          <div className="space-y-8">
            
            {/* Quick Metrics Bento Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-yellow-500" />
                Performance Metrics
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="bg-blue-100 text-blue-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">
                      Q
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Total Solved</h4>
                      <p className="text-[10px] text-slate-400">JVP & Murmurs</p>
                    </div>
                  </div>
                  <p className="text-base font-extrabold text-slate-900 font-mono">
                    {activeQuiz ? Object.keys(activeQuiz.selectedAnswers || {}).length : 0}
                  </p>
                </div>

                <div className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold">
                      A
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Average Velocity</h4>
                      <p className="text-[10px] text-slate-400">Time per item</p>
                    </div>
                  </div>
                  <p className="text-base font-extrabold text-slate-900 font-mono">
                    {activeQuiz ? `${Math.round((5400 - activeQuiz.timeRemaining) / Math.max(1, Object.keys(activeQuiz.selectedAnswers || {}).length))}s` : "0s"}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100/50">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-xs font-extrabold text-slate-700">Theoretical Accuracy</p>
                    <span className="text-xs text-blue-600 font-bold font-mono">
                      {activeQuiz && activeQuiz.correctAnswersCount !== undefined ? `${Math.round((activeQuiz.correctAnswersCount / Math.max(1, Object.keys(activeQuiz.selectedAnswers || {}).length)) * 100)}%` : "N/A"}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">
                    This calculates correct responses divided by your submitted responses. Continue answering the remaining questions!
                  </p>
                </div>
              </div>
            </div>

            {/* Auscultatory Quick Reference Cheatsheet */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-extrabold text-slate-800 border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-500 animate-spin" style={{ animationDuration: '4s' }} />
                High-Yield Clinical Pearls
              </h3>

              <div className="space-y-4 text-xs font-medium text-slate-600">
                <div className="border-l-3 border-blue-500 pl-3">
                  <h4 className="font-extrabold text-slate-900">Aortic Stenosis (AS)</h4>
                  <p className="mt-0.5 text-slate-500">Crescendo-decrescendo. Handgrip raises afterload, reducing gradient and softening murmur.</p>
                </div>

                <div className="border-l-3 border-amber-500 pl-3">
                  <h4 className="font-extrabold text-slate-900">Mitral Valve Prolapse (MVP)</h4>
                  <p className="mt-0.5 text-slate-500">Mid-systolic Click & Late Murmur. Standing drops LVEDV, shifting click closer to S1, lengthening murmur.</p>
                </div>

                <div className="border-l-3 border-teal-500 pl-3">
                  <h4 className="font-extrabold text-slate-900">Kussmaul's Sign</h4>
                  <p className="mt-0.5 text-slate-500">Paradoxical rise in JVP on inspiration. Seen in Constrictive Pericarditis / stiff RV; heart cannot accept the volume surge.</p>
                </div>

                <div className="border-l-3 border-indigo-500 pl-3">
                  <h4 className="font-extrabold text-slate-900">Cannon "a" Waves</h4>
                  <p className="mt-0.5 text-slate-500">Atrium contracting against closed tricuspid valve. Indication of complete AV Dissociation / Heart Block.</p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Humble Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-xs">
          <p>© 2026 CardioQBank Clinical Simulation. Built according to elite medical board review guidelines.</p>
          <p className="mt-1">Designed with desktop precision and secure cloud synchronization hooks.</p>
        </div>
      </footer>

    </div>
  );
}
