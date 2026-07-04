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
  homeCity: string;
  setHomeCity: (v: string) => void;
  voiceURI: string;
  setVoiceURI: (v: string) => void;
  voiceRate: number;
  setVoiceRate: (v: number) => void;
  voicePitch: number;
  setVoicePitch: (v: number) => void;
  handsFree: boolean;
  setHandsFree: (v: boolean) => void;
  ready: boolean;
}

const SettingsContext = createContext<SettingsState | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [demoMode, setDemoModeState] = useState(true);
  const [theme, setTheme] = useState<Theme>("dark");
  const [userName, setUserNameState] = useState("Biswajit");
  const [homeCity, setHomeCityState] = useState("");
  const [voiceURI, setVoiceURIState] = useState("auto");
  const [voiceRate, setVoiceRateState] = useState(1.02);
  const [voicePitch, setVoicePitchState] = useState(1);
  const [handsFree, setHandsFreeState] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const dm = localStorage.getItem("universe:demoMode");
      const th = localStorage.getItem("universe:theme") as Theme | null;
      const nm = localStorage.getItem("universe:userName");
      const city = localStorage.getItem("universe:homeCity");
      const storedVoice = localStorage.getItem("universe:voiceURI");
      const storedRate = Number(localStorage.getItem("universe:voiceRate"));
      const storedPitch = Number(localStorage.getItem("universe:voicePitch"));
      const storedHandsFree = localStorage.getItem("universe:handsFree");
      if (dm !== null) setDemoModeState(dm === "true");
      if (th) setTheme(th);
      if (nm) setUserNameState(nm);
      if (city) setHomeCityState(city);
      if (storedVoice) setVoiceURIState(storedVoice);
      if (storedRate >= 0.7 && storedRate <= 1.35) setVoiceRateState(storedRate);
      if (storedPitch >= 0.7 && storedPitch <= 1.3) setVoicePitchState(storedPitch);
      if (storedHandsFree !== null) setHandsFreeState(storedHandsFree === "true");
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

  const setHomeCity = (v: string) => {
    const city = v.slice(0, 100);
    setHomeCityState(city);
    try { localStorage.setItem("universe:homeCity", city); } catch { /* ignore */ }
  };

  const setVoiceURI = (v: string) => {
    setVoiceURIState(v);
    try { localStorage.setItem("universe:voiceURI", v); } catch { /* ignore */ }
  };

  const setVoiceRate = (v: number) => {
    const value = Math.min(1.35, Math.max(0.7, v));
    setVoiceRateState(value);
    try { localStorage.setItem("universe:voiceRate", String(value)); } catch { /* ignore */ }
  };

  const setVoicePitch = (v: number) => {
    const value = Math.min(1.3, Math.max(0.7, v));
    setVoicePitchState(value);
    try { localStorage.setItem("universe:voicePitch", String(value)); } catch { /* ignore */ }
  };

  const setHandsFree = (v: boolean) => {
    setHandsFreeState(v);
    try { localStorage.setItem("universe:handsFree", String(v)); } catch { /* ignore */ }
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
    <SettingsContext.Provider value={{
      demoMode, setDemoMode, theme, toggleTheme, userName, setUserName, homeCity, setHomeCity,
      voiceURI, setVoiceURI, voiceRate, setVoiceRate, voicePitch, setVoicePitch, handsFree, setHandsFree, ready,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsState {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
