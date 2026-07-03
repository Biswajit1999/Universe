"use client";

import { useEffect, useState } from "react";
import { Blocks, Cloud, Cpu, LockKeyhole } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import type { PluginManifest } from "@/lib/plugins/manifests";

type PluginView = PluginManifest & { enabled: boolean };

export function PluginManager() {
  const [plugins, setPlugins] = useState<PluginView[]>([]);
  const [privateRuntime, setPrivateRuntime] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [desktopBridge, setDesktopBridge] = useState(false);

  async function load() {
    const response = await fetch("/api/plugins", { cache: "no-store" });
    if (!response.ok) throw new Error("Plugin registry unavailable.");
    const data = await response.json();
    setPlugins(data.plugins);
    setPrivateRuntime(Boolean(data.privateRuntime));
  }

  useEffect(() => {
    setDesktopBridge(window.universeDesktop?.isDesktop === true);
    void load().catch(() => setError("Plugin registry could not be loaded."));
  }, []);

  async function toggle(plugin: PluginView) {
    if (!privateRuntime) return;
    setBusy(plugin.id);
    setError("");
    try {
      let enabled = !plugin.enabled;
      if (plugin.id === "desktop" && window.universeDesktop) {
        const operator = await window.universeDesktop.operator.setEnabled(enabled);
        if (!operator.changed) return;
        enabled = operator.enabled;
      }
      const response = await fetch("/api/plugins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: plugin.id, enabled }),
      });
      if (!response.ok) throw new Error("Plugin state rejected.");
      await load();
    } catch {
      setError("Plugin state could not be changed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Panel>
      <div className="flex items-start justify-between gap-4 border-b border-edge pb-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold"><Blocks size={16} className="text-accent" /> Plugin manager</h3>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">Every connector declares its scope, tools and capabilities. New permissions disable a plugin until you review them.</p>
        </div>
        <span className="text-[9px] uppercase tracking-[0.18em] text-cyan-100/40">Signed manifests · v1</span>
      </div>

      <div className="divide-y divide-edge">
        {plugins.map((plugin) => (
          <div key={plugin.id} className="grid gap-3 py-4 lg:grid-cols-[1fr_1.2fr_auto] lg:items-center">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center border border-cyan-300/12 bg-cyan-300/[0.035] text-cyan-200/70">
                {plugin.scope === "cloud" ? <Cloud size={14} /> : plugin.scope === "local" ? <LockKeyhole size={14} /> : <Cpu size={14} />}
              </div>
              <div>
                <p className="text-sm font-medium text-ink">{plugin.name} <span className="ml-1 font-mono text-[9px] text-muted">v{plugin.version}</span></p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted">{plugin.description}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {plugin.capabilities.map((capability) => (
                <span key={capability} className="border border-edge bg-black/15 px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-cyan-100/45">{capability}</span>
              ))}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={plugin.enabled}
              disabled={!privateRuntime || busy !== null || (plugin.id === "desktop" && !desktopBridge)}
              onClick={() => void toggle(plugin)}
              className={`min-w-20 border px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 ${plugin.enabled ? "border-emerald-300/25 bg-emerald-300/[0.07] text-emerald-200" : "border-edge text-muted"}`}
            >
              {plugin.enabled ? "Enabled" : "Disabled"}
            </button>
          </div>
        ))}
      </div>
      {!privateRuntime && <p className="mt-3 text-xs text-amber-200/65">Plugin changes are locked until UNIVERSE runs inside its private desktop runtime.</p>}
      {error && <p role="alert" className="mt-3 text-xs text-rose-300/75">{error}</p>}
    </Panel>
  );
}
