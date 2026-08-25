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
const firebaseConfig = {
  apiKey: (import.meta as any).env?.VITE_FIREBASE_API_KEY || "",
  authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || ""
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
