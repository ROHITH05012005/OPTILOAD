import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Upload a document or Proof of Delivery image to Firebase Cloud Storage
 * @param file File object or Blob
 * @param path Storage bucket folder path (e.g. 'proof_of_delivery/shipment_123.jpg')
 * @returns Public download URL string
 */
export async function uploadFileToStorage(file: File | Blob, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

export {
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
};
