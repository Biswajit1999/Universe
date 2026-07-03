/**
 * Firebase Auth helpers (Google sign-in). No-ops in Demo Mode.
 */
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { getFirebaseApp, firebaseEnabled } from "./client";

export type UniverseUser = Pick<User, "uid" | "displayName" | "email" | "photoURL">;

export async function signInWithGoogle(): Promise<UniverseUser | null> {
  const app = getFirebaseApp();
  if (!app) return null;
  const auth = getAuth(app);
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  return result.user;
}

export async function signOut(): Promise<void> {
  const app = getFirebaseApp();
  if (!app) return;
  await fbSignOut(getAuth(app));
}

/** Subscribe to auth state; returns an unsubscribe fn. Safe in Demo Mode. */
export function watchUser(cb: (user: UniverseUser | null) => void): () => void {
  if (!firebaseEnabled) {
    cb(null);
    return () => {};
  }
  const app = getFirebaseApp();
  if (!app) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(getAuth(app), cb);
}
