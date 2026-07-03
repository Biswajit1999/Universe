"use client";
/**
 * Global settings: Demo/Live data mode + theme.
 * Persisted to localStorage. Demo Mode defaults ON so a fresh clone with no
 * API keys behaves correctly and never attempts to fake live data.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "dark" | "light";

interface SettingsState {
  demoMode: boolean;
  setDemoMode: (v: boolean) => void;
  theme: Theme;
  toggleTheme: () => void;
  userName: string;
  setUserName: (v: string) => void;
  ready: boolean;
}

const SettingsContext = createContext<SettingsState | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [demoMode, setDemoModeState] = useState(true);
  const [theme, setTheme] = useState<Theme>("dark");
  const [userName, setUserNameState] = useState("Biswajit");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const dm = localStorage.getItem("universe:demoMode");
      const th = localStorage.getItem("universe:theme") as Theme | null;
      const nm = localStorage.getItem("universe:userName");
      if (dm !== null) setDemoModeState(dm === "true");
      if (th) setTheme(th);
      if (nm) setUserNameState(nm);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const setUserName = (v: string) => {
    const name = v.trim() || "Explorer";
    setUserNameState(name);
    try {
      localStorage.setItem("universe:userName", name);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setDemoMode = (v: boolean) => {
    setDemoModeState(v);
    try {
      localStorage.setItem("universe:demoMode", String(v));
    } catch {
      /* ignore */
    }
  };

  const toggleTheme = () => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("universe:theme", next);
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  return (
    <SettingsContext.Provider value={{ demoMode, setDemoMode, theme, toggleTheme, userName, setUserName, ready }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsState {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
