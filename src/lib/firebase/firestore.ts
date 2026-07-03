/**
 * Firestore persistence for the Personal Vault.
 * Collection layout: users/{uid}/vault/{itemId}
 * Only used when Firebase is configured AND the user is signed in;
 * otherwise useVault falls back to localStorage (Demo Mode).
 */
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";
import { getFirebaseApp } from "./client";
import type { VaultItem } from "@/lib/types";

function vaultRef(uid: string) {
  const app = getFirebaseApp();
  if (!app) throw new Error("Firebase not configured");
  return collection(getFirestore(app), "users", uid, "vault");
}

export async function saveVaultItem(uid: string, item: VaultItem): Promise<void> {
  await setDoc(doc(vaultRef(uid), item.id), item);
}

export async function deleteVaultItem(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(vaultRef(uid), id));
}

export async function listVaultItems(uid: string): Promise<VaultItem[]> {
  const snap = await getDocs(query(vaultRef(uid), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => d.data() as VaultItem);
}
