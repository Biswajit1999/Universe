"use client";
/**
 * Personal Vault state + auth.
 * - Firebase configured AND signed in → Firestore (users/{uid}/vault).
 * - Otherwise → localStorage (Demo Mode). Save buttons work in both cases.
 */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { VaultItem } from "@/lib/types";
import { uid as makeId } from "@/lib/utils";
import { firebaseEnabled } from "@/lib/firebase/client";
import { watchUser, signInWithGoogle, signOut, type UniverseUser } from "@/lib/firebase/auth";
import { saveVaultItem, deleteVaultItem, listVaultItems } from "@/lib/firebase/firestore";

interface VaultState {
  items: VaultItem[];
  add: (item: Omit<VaultItem, "id" | "createdAt">) => Promise<void>;
  remove: (id: string) => Promise<void>;
  user: UniverseUser | null;
  firebaseEnabled: boolean;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
  loading: boolean;
}

const VaultContext = createContext<VaultState | null>(null);
const LS_KEY = "universe:vault";

function readLocal(): VaultItem[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}
function writeLocal(items: VaultItem[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export function VaultProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [user, setUser] = useState<UniverseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = watchUser(setUser);
    return unsub;
  }, []);

  // Load items when auth state settles.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      if (firebaseEnabled && user) {
        try {
          const remote = await listVaultItems(user.uid);
          if (!cancelled) setItems(remote);
        } catch {
          if (!cancelled) setItems(readLocal());
        }
      } else {
        if (!cancelled) setItems(readLocal());
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const add = useCallback<VaultState["add"]>(
    async (partial) => {
      const item: VaultItem = { ...partial, id: makeId(), createdAt: Date.now() };
      setItems((prev) => [item, ...prev]);
      if (firebaseEnabled && user) {
        try {
          await saveVaultItem(user.uid, item);
          return;
        } catch {
          /* fall through to local */
        }
      }
      const next = [item, ...readLocal()];
      writeLocal(next);
    },
    [user],
  );

  const remove = useCallback<VaultState["remove"]>(
    async (id) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      if (firebaseEnabled && user) {
        try {
          await deleteVaultItem(user.uid, id);
          return;
        } catch {
          /* fall through */
        }
      }
      writeLocal(readLocal().filter((i) => i.id !== id));
    },
    [user],
  );

  const signIn = useCallback(async () => {
    if (!firebaseEnabled) return;
    await signInWithGoogle();
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut();
    setUser(null);
    setItems(readLocal());
  }, []);

  return (
    <VaultContext.Provider
      value={{ items, add, remove, user, firebaseEnabled, signIn, signOutUser, loading }}
    >
      {children}
    </VaultContext.Provider>
  );
}

export function useVault(): VaultState {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}
