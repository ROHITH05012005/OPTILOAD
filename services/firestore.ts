// services/firestore.ts
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

// ---------- USER PROFILE (example) ----------
export const createUserProfile = async (uid: string, email: string) => {
  if (!db) throw new Error("Firestore not initialized");
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, { email, createdAt: serverTimestamp() }, { merge: true });
};

// ---------- ORDER CRUD (example) ----------
export type Order = {
  owner: string; // Firebase UID
  description: string;
  createdAt?: any; // Firestore timestamp
};

export const createOrder = async (order: Order) => {
  if (!db) throw new Error("Firestore not initialized");
  const ordersCol = collection(db, "orders");
  const docRef = await addDoc(ordersCol, { ...order, createdAt: serverTimestamp() });
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
