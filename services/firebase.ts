import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Read Firebase config from environment variables
const isBrowser = typeof window !== 'undefined';
const currentHost = isBrowser ? window.location.hostname : '';

// If running on custom domain, use custom domain or default firebaseapp.com
const authDomain = (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "optiload-3d.firebaseapp.com";

const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "",
  authDomain: authDomain,
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "optiload-3d",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "optiload-3d.firebasestorage.app",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "1058072216922",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || "1:1058072216922:web:e7e29c25b50145ba39df63"
};

// Check if valid Firebase configuration exists
export const isFirebaseConfigured = (): boolean => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
};

// Initialize Firebase App instance safely
const app = isFirebaseConfigured()
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApp())
  : null;

// Export initialized Firebase Auth and Firestore services
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = new GoogleAuthProvider();

// Add custom parameters to force account selection and avoid cached domain mismatch
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Firebase Auth Helper Functions
export const signInWithGoogle = async (): Promise<User | null> => {
  if (!auth) {
    console.warn("⚠️ Firebase Auth not configured. Set VITE_FIREBASE_API_KEY in .env");
    return null;
  }
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
};

export const loginWithEmail = async (email: string, pass: string): Promise<User | null> => {
  if (!auth) return null;
  const result = await signInWithEmailAndPassword(auth, email, pass);
  return result.user;
};

export const registerWithEmail = async (email: string, pass: string): Promise<User | null> => {
  if (!auth) return null;
  const result = await createUserWithEmailAndPassword(auth, email, pass);
  return result.user;
};

export const logoutFirebase = async (): Promise<void> => {
  if (auth) {
    await signOut(auth);
  }
};

export default app;
