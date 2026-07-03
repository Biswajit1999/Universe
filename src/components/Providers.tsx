"use client";
import type { ReactNode } from "react";
import { SettingsProvider } from "@/lib/state/settings";
import { VaultProvider } from "@/lib/state/vault";
import { Assistant } from "@/components/assistant/Assistant";
import { Starfield } from "@/components/Starfield";
import { Shell } from "@/components/nav/Shell";

/** Client provider tree wrapping the whole app. */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <VaultProvider>
        <Starfield />
        <Shell>{children}</Shell>
        <Assistant />
      </VaultProvider>
    </SettingsProvider>
  );
}
