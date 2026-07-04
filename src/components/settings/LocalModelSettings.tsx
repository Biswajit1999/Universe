"use client";

import { useCallback, useEffect, useState } from "react";
import { Cloud, Cpu, RefreshCw, Save, ShieldCheck } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import type { OllamaModel } from "@/lib/ai/ollama";
import type { AIProviderPreference, AISettings } from "@/lib/ai/settings";

interface ModelStatus {
  privateRuntime: boolean;
  ollamaOnline: boolean;
  models: OllamaModel[];
  settings: AISettings;
}

const PROVIDERS: Array<{ id: AIProviderPreference; title: string; detail: string }> = [
  { id: "auto", title: "Local first", detail: "Use the selected Ollama model, then Gemini only if local generation is unavailable." },
  { id: "ollama", title: "Local only", detail: "Keep prompts on this PC. A local failure never falls through to Gemini." },
  { id: "gemini", title: "Gemini", detail: "Use the encrypted Gemini credential configured above." },
];

function formatBytes(value: number) {
  return value ? `${(value / 1024 ** 3).toFixed(1)} GB` : "size unknown";
}

export function LocalModelSettings() {
  const [status, setStatus] = useState<ModelStatus | null>(null);
  const [provider, setProvider] = useState<AIProviderPreference>("auto");
  const [model, setModel] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const response = await fetch("/api/models", { cache: "no-store" });
    if (!response.ok) throw new Error("Model runtime unavailable.");
    const next = await response.json() as ModelStatus;
    setStatus(next);
    setProvider(next.settings.provider);
    setModel(next.settings.ollamaModel || next.models[0]?.name || "");
  }, []);

  useEffect(() => { void load().catch(() => setMessage("Could not inspect the local model runtime.")); }, [load]);

  async function save() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, ollamaModel: model }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Model preference rejected.");
      setMessage("Encrypted model preference saved.");
      await load();
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-edge pb-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold"><Cpu size={16} className="text-accent" /> Local intelligence</h3>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">Connect UNIVERSE to Ollama on this PC. Local prompts use loopback only and need no API key.</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] ${status?.ollamaOnline ? "border-emerald-300/25 text-emerald-200" : "border-amber-300/20 text-amber-200/70"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${status?.ollamaOnline ? "bg-emerald-300" : "bg-amber-300"}`} />
          Ollama {status?.ollamaOnline ? "online" : "offline"}
        </span>
      </div>

      <div className="mt-4 grid gap-2 lg:grid-cols-3">
        {PROVIDERS.map((item) => (
          <button key={item.id} type="button" onClick={() => setProvider(item.id)} disabled={!status?.privateRuntime}
            className={`border p-3 text-left transition disabled:opacity-45 ${provider === item.id ? "border-cyan-300/35 bg-cyan-300/[0.07]" : "border-edge bg-black/10 hover:border-cyan-300/20"}`}>
            <span className="flex items-center gap-2 text-xs font-semibold text-ink">{item.id === "gemini" ? <Cloud size={13} /> : <ShieldCheck size={13} />} {item.title}</span>
            <span className="mt-1.5 block text-[10px] leading-relaxed text-muted">{item.detail}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex-1 text-[10px] uppercase tracking-[0.14em] text-muted">
          Installed Ollama model
          <select value={model} onChange={(event) => setModel(event.target.value)} disabled={!status?.ollamaOnline}
            className="mt-1.5 w-full border border-edge bg-[#080c17] px-3 py-2.5 text-xs normal-case tracking-normal text-ink disabled:opacity-45">
            {!status?.models.length && <option value="">No local models detected</option>}
            {status?.models.map((item) => <option key={item.name} value={item.name}>{item.name} · {item.parameterSize || formatBytes(item.size)} · {item.quantization || formatBytes(item.size)}</option>)}
          </select>
        </label>
        <button type="button" onClick={() => void load()} disabled={busy || !status?.privateRuntime} className="inline-flex items-center justify-center gap-2 border border-edge px-3 py-2.5 text-[10px] uppercase tracking-wider text-muted hover:text-ink disabled:opacity-45"><RefreshCw size={12} /> Rescan</button>
        <button type="button" onClick={() => void save()} disabled={busy || !status?.privateRuntime || (provider === "ollama" && !model)} className="inline-flex items-center justify-center gap-2 border border-cyan-300/25 bg-cyan-300/[0.07] px-3 py-2.5 text-[10px] uppercase tracking-wider text-cyan-100 disabled:opacity-45"><Save size={12} /> Save route</button>
      </div>

      {!status?.privateRuntime && <p className="mt-3 text-xs text-amber-200/65">Local model routing unlocks inside the packaged desktop application.</p>}
      {status?.privateRuntime && !status.ollamaOnline && <p className="mt-3 text-xs text-muted">Install and start Ollama, then run <code className="text-cyan-200">ollama pull gemma3:4b</code> in PowerShell and select Rescan.</p>}
      {message && <p role="status" className="mt-3 text-xs text-cyan-100/70">{message}</p>}
    </Panel>
  );
}
