"use client";

import { useEffect, useState } from "react";
import { Check, KeyRound, MonitorCog, Save, Trash2 } from "lucide-react";
import { Panel } from "@/components/ui/Panel";

type SecretName = UniverseSecretStatus["name"];

const DEFINITIONS: Array<{ name: SecretName; label: string; detail: string }> = [
  { name: "GEMINI_API_KEY", label: "Gemini intelligence", detail: "Voice, research and agent synthesis" },
  { name: "NASA_API_KEY", label: "NASA data", detail: "APOD and near-Earth object feeds" },
  { name: "GITHUB_TOKEN", label: "GitHub", detail: "Repository access and higher API limits" },
];

export function DesktopCredentials() {
  const [desktop, setDesktop] = useState(false);
  const [status, setStatus] = useState<UniverseSecretStatus[]>([]);
  const [values, setValues] = useState<Partial<Record<SecretName, string>>>({});
  const [busy, setBusy] = useState<SecretName | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    if (!window.universeDesktop) return;
    setStatus(await window.universeDesktop.secrets.list());
  }

  useEffect(() => {
    const available = window.universeDesktop?.isDesktop === true;
    setDesktop(available);
    if (available) void refresh().catch(() => setError("Credential status could not be read."));
  }, []);

  async function save(name: SecretName) {
    const value = values[name]?.trim();
    if (!value || !window.universeDesktop) return;
    setBusy(name);
    setError("");
    try {
      await window.universeDesktop.secrets.set(name, value);
      setValues((current) => ({ ...current, [name]: "" }));
      await refresh();
      setNotice("Credential encrypted. Restart UNIVERSE to activate the updated connector.");
    } catch {
      setError("The credential could not be encrypted. Windows protection may be unavailable.");
    } finally {
      setBusy(null);
    }
  }

  async function remove(name: SecretName) {
    if (!window.universeDesktop) return;
    setBusy(name);
    setError("");
    try {
      await window.universeDesktop.secrets.remove(name);
      await refresh();
      setNotice("Credential removed. Restart UNIVERSE to unload the connector.");
    } catch {
      setError("The credential could not be removed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Panel>
      <div className="flex items-start justify-between gap-4 border-b border-edge pb-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <KeyRound size={16} className="text-accent" /> Private credentials
          </h3>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">
            The desktop application encrypts these values using Windows protection. UNIVERSE can check whether a key exists, but the interface can never read it back.
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-cyan-100/45">
          <MonitorCog size={12} /> {desktop ? "Desktop vault" : "Web session"}
        </span>
      </div>

      {!desktop ? (
        <div className="mt-4 border-l-2 border-amber-300/45 bg-amber-300/[0.04] px-3 py-2 text-xs text-amber-100/70">
          Open the desktop application to manage encrypted keys. Browser development continues to use <code>.env.local</code>.
        </div>
      ) : (
        <div className="divide-y divide-edge">
          {DEFINITIONS.map((definition) => {
            const configured = status.some((item) => item.name === definition.name && item.configured);
            return (
              <div key={definition.name} className="grid gap-3 py-4 md:grid-cols-[minmax(170px,0.65fr)_minmax(260px,1.35fr)_auto] md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${configured ? "bg-emerald-300 shadow-[0_0_8px_#6ee7b7]" : "bg-slate-600"}`} />
                    <p className="text-sm font-medium text-ink">{definition.label}</p>
                  </div>
                  <p className="mt-1 text-[11px] text-muted">{definition.detail}</p>
                </div>
                <input
                  type="password"
                  value={values[definition.name] ?? ""}
                  onChange={(event) => setValues((current) => ({ ...current, [definition.name]: event.target.value }))}
                  autoComplete="new-password"
                  spellCheck={false}
                  placeholder={configured ? "Configured · enter a replacement" : `Enter ${definition.name}`}
                  aria-label={`${definition.label} credential`}
                  className="w-full rounded-lg border border-edge bg-black/20 px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-cyan-300/45 focus:outline-none"
                />
                <div className="flex gap-2 md:justify-end">
                  <button
                    type="button"
                    onClick={() => void save(definition.name)}
                    disabled={busy !== null || !(values[definition.name]?.trim())}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/25 bg-cyan-300/[0.07] px-3 py-2 text-xs text-cyan-100 transition hover:bg-cyan-300/12 active:scale-[0.98] disabled:opacity-35"
                  >
                    {configured ? <Check size={13} /> : <Save size={13} />} {configured ? "Replace" : "Save"}
                  </button>
                  {configured && (
                    <button
                      type="button"
                      onClick={() => void remove(definition.name)}
                      disabled={busy !== null}
                      aria-label={`Remove ${definition.label} credential`}
                      className="rounded-lg border border-rose-300/15 px-2.5 py-2 text-rose-200/65 transition hover:bg-rose-300/[0.06] active:scale-[0.98] disabled:opacity-35"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {notice && <p role="status" className="mt-3 text-xs text-emerald-300/75">{notice}</p>}
      {error && <p role="alert" className="mt-3 text-xs text-rose-300/75">{error}</p>}
    </Panel>
  );
}
