// services/firestore.ts
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

export type UserRole = 'admin' | 'driver' | 'manager' | 'dealer' | 'client';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt?: any;
  lastLoginAt?: any;
}

// ---------- USER PROFILE & ROLE MANAGEMENT ----------
export const syncUserProfile = async (
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string,
  preferredRole?: UserRole
): Promise<UserProfile> => {
  if (!db) {
    // Fallback if Firestore not initialized
    const fallbackProfile: UserProfile = {
      uid,
      email,
      displayName: displayName || 'User',
      photoURL: photoURL || '',
      role: preferredRole || 'admin'
    };
    return fallbackProfile;
  }

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const existingData = userSnap.data() as UserProfile;
    // Update last login
    await setDoc(
      userRef,
      {
        lastLoginAt: serverTimestamp(),
        displayName: displayName || existingData.displayName,
        photoURL: photoURL || existingData.photoURL || ''
      },
      { merge: true }
    );
    return {
      ...existingData,
      displayName: displayName || existingData.displayName,
      uid
    };
  } else {
    // First time login - assign default role or selected role
    // Admin whitelist for developer email or fallback
    const role: UserRole = preferredRole || 'admin';
    const newProfile: UserProfile = {
      uid,
      email,
      displayName: displayName || email.split('@')[0],
      photoURL: photoURL || '',
      role,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp()
    };
    await setDoc(userRef, newProfile);
    return newProfile;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!db) return null;
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as UserProfile;
  }
  return null;
};

// ---------- ORDER CRUD ----------
export type Order = {
  id?: string;
  owner: string; // Firebase UID
  description: string;
  cargoType?: string;
  weightKg?: number;
  volumeM3?: number;
  origin?: string;
  destination?: string;
  status?: 'pending' | 'assigned' | 'in_transit' | 'delivered';
  createdAt?: any;
};

export const createOrder = async (order: Order) => {
  if (!db) throw new Error("Firestore not initialized");
  const ordersCol = collection(db, "orders");
  const docRef = await addDoc(ordersCol, {
    ...order,
    status: order.status || 'pending',
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

export const getUserOrders = async (uid: string) => {
  if (!db) throw new Error("Firestore not initialized");
  const ordersCol = collection(db, "orders");
  const q = query(ordersCol, where("owner", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];
};

export const deleteOrder = async (orderId: string) => {
  if (!db) throw new Error("Firestore not initialized");
  await deleteDoc(doc(db, "orders", orderId));
};
