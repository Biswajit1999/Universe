"use client";
import { Radio, Moon, Sun, ShieldAlert, Database, Sparkles, Github } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { useSettings } from "@/lib/state/settings";
import { useVault } from "@/lib/state/vault";

export function Settings() {
  const { demoMode, setDemoMode, theme, toggleTheme } = useSettings();
  const { firebaseEnabled } = useVault();

  return (
    <div className="space-y-6">
      {/* Data mode */}
      <Panel>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Radio size={16} className="text-accent" /> Data mode
            </h3>
            <p className="mt-1 max-w-md text-xs text-muted">
              <strong>Demo Mode</strong> uses bundled datasets and the offline mock AI — no keys, no network calls to
              external providers. <strong>Live Mode</strong> attempts real APIs (NASA, arXiv, Exoplanet Archive, Gemini)
              and gracefully falls back to demo data if a key is missing.
            </p>
          </div>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className="relative h-7 w-12 shrink-0 rounded-full border border-edge transition"
            style={{ background: demoMode ? "rgba(125,211,252,0.2)" : "rgba(52,211,153,0.25)" }}
            aria-label="Toggle data mode"
          >
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-ink transition-all ${demoMode ? "left-0.5" : "left-[22px]"}`} />
          </button>
        </div>
        <div className="mt-3">
          <Badge mode={demoMode ? "demo" : "live"} />
          <span className="ml-2 text-xs text-muted">Currently in {demoMode ? "Demo" : "Live"} Mode</span>
        </div>
      </Panel>

      {/* Theme */}
      <Panel>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              {theme === "dark" ? <Moon size={16} className="text-accent" /> : <Sun size={16} className="text-accent" />} Appearance
            </h3>
            <p className="mt-1 text-xs text-muted">Cinematic dark is the default. Light mode is available for daytime reading.</p>
          </div>
          <button onClick={toggleTheme} className="rounded-lg border border-edge px-3 py-2 text-sm hover:bg-white/5">
            Switch to {theme === "dark" ? "light" : "dark"}
          </button>
        </div>
      </Panel>

      {/* Integrations status */}
      <Panel>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Database size={16} className="text-accent" /> Integrations
        </h3>
        <ul className="space-y-2 text-sm">
          <Row label="Firebase (Auth + Firestore)" ok={firebaseEnabled} okText="Configured" offText="Not set — Vault uses localStorage" />
          <Row label="Gemini AI (assistant)" ok={false} okText="" offText="Set GEMINI_API_KEY for Live AI · using mock" note />
          <Row label="NASA APOD / NEO" ok={false} okText="" offText="Set NASA_API_KEY for live · using demo" note />
          <Row label="arXiv / Exoplanet Archive" ok offText="" okText="No key required — works in Live Mode" />
        </ul>
        <p className="mt-3 text-xs text-muted">
          Integration status is inferred from environment variables. See <code>.env.example</code> and{" "}
          <a href="https://github.com/" className="text-accent underline" target="_blank" rel="noreferrer">the README</a> for setup.
        </p>
      </Panel>

      {/* Science disclaimer */}
      <Panel>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <ShieldAlert size={16} className="text-amber-400" /> Science disclaimer
        </h3>
        <div className="space-y-2 text-xs text-muted">
          <p>
            UNIVERSE is an educational and productivity tool. Every dataset and result is labelled with its provenance:
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge mode="live" /> <Badge mode="demo" /> <Badge mode="estimated" /> <Badge mode="simulated" />
          </div>
          <ul className="mt-1 space-y-1">
            <li>• <strong>Simulated</strong> results use simplified first-order models — good for intuition, not for research-grade or operational decisions.</li>
            <li>• <strong>Demo</strong> data is bundled and static; it never represents current real-world conditions.</li>
            <li>• AI answers can be wrong. Verify numbers and citations against primary sources.</li>
            <li>• UNIVERSE never presents mock output as live data.</li>
          </ul>
        </div>
      </Panel>

      {/* About */}
      <Panel>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Sparkles size={16} className="text-accent" /> About
        </h3>
        <p className="text-xs text-muted">
          UNIVERSE — The Living Scientific Operating System · open-source MVP v0.1 · built by Biswajit Jana.
        </p>
        <a href="https://github.com/" target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 text-xs text-accent">
          <Github size={13} /> View source
        </a>
      </Panel>
    </div>
  );
}

function Row({ label, ok, okText, offText, note }: { label: string; ok: boolean; okText: string; offText: string; note?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-edge pb-2 last:border-0">
      <span className="text-ink">{label}</span>
      <span className={`text-xs ${ok ? "text-emerald-300" : note ? "text-amber-300" : "text-muted"}`}>
        {ok ? okText : offText}
      </span>
    </li>
  );
}
