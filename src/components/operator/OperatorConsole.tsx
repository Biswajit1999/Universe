"use client";

import { useEffect, useMemo, useState } from "react";
import { AppWindow, FileCheck2, FilePenLine, FolderOpen, History, LockKeyhole, Power, Save } from "lucide-react";
import { Panel } from "@/components/ui/Panel";

type Selection = { token: string; name: string; extension: string; bytes: number; modifiedAt: number };
type AuditEntry = { at: string; event: string; detail: unknown };

export function OperatorConsole() {
  const [desktop, setDesktop] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [content, setContent] = useState("");
  const [original, setOriginal] = useState("");
  const [applications, setApplications] = useState<Array<{ id: string; name: string }>>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const changed = content !== original;
  const byteDelta = useMemo(() => new TextEncoder().encode(content).length - new TextEncoder().encode(original).length, [content, original]);

  async function refreshAudit() {
    if (!window.universeDesktop) return;
    setAudit((await window.universeDesktop.diagnostics.recent()).filter((entry) => entry.event.startsWith("operator.")));
  }

  useEffect(() => {
    const available = window.universeDesktop?.isDesktop === true;
    setDesktop(available);
    if (!available) return;
    void Promise.all([
      window.universeDesktop!.operator.status(),
      window.universeDesktop!.operator.applications(),
      window.universeDesktop!.diagnostics.recent(),
    ]).then(([status, apps, entries]) => {
      setEnabled(status.enabled);
      setApplications(apps);
      setAudit(entries.filter((entry) => entry.event.startsWith("operator.")));
    }).catch(() => setError("Atlas desktop services could not be loaded."));
  }, []);

  async function changeEnabled(next: boolean) {
    if (!window.universeDesktop) return;
    setBusy(true);
    setError("");
    try {
      const result = await window.universeDesktop.operator.setEnabled(next);
      setEnabled(result.enabled);
      if (result.changed) {
        await fetch("/api/plugins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: "desktop", enabled: result.enabled }) });
        setNotice(result.enabled ? "Atlas enabled with approval gates active." : "Atlas desktop tools disabled.");
      }
      await refreshAudit();
    } catch {
      setError("Atlas state could not be changed.");
    } finally {
      setBusy(false);
    }
  }

  async function pickFile() {
    if (!window.universeDesktop) return;
    setBusy(true);
    setError("");
    try {
      const selected = await window.universeDesktop.operator.pickTextFile();
      if (!selected) return;
      const read = await window.universeDesktop.operator.readTextFile(selected.token);
      setSelection(selected);
      setContent(read.content);
      setOriginal(read.content);
      setNotice(`${selected.name} selected. Atlas cannot access any neighbouring file.`);
      await refreshAudit();
    } catch {
      setError("The selected file is unsupported, too large, or no longer available.");
    } finally {
      setBusy(false);
    }
  }

  async function writeFile() {
    if (!window.universeDesktop || !selection || !changed) return;
    setBusy(true);
    setError("");
    try {
      const result = await window.universeDesktop.operator.writeTextFile(selection.token, content);
      if (result.written) {
        setOriginal(content);
        setNotice(`Write complete. Backup created as ${result.backupName}.`);
      } else setNotice("Write cancelled. The file was not changed.");
      await refreshAudit();
    } catch {
      setError("Atlas could not write the selected file.");
    } finally {
      setBusy(false);
    }
  }

  async function launch(id: string) {
    if (!window.universeDesktop) return;
    setBusy(true);
    setError("");
    try {
      const result = await window.universeDesktop.operator.launchApplication(id);
      setNotice(result.launched ? "Approved application launched." : "Launch cancelled.");
      await refreshAudit();
    } catch {
      setError("The application launch was rejected or unavailable.");
    } finally {
      setBusy(false);
    }
  }

  if (!desktop) return (
    <Panel>
      <div className="flex items-start gap-3"><LockKeyhole size={18} className="mt-0.5 text-amber-200" /><div><h3 className="text-sm font-semibold">Atlas is desktop-only</h3><p className="mt-1 text-xs text-muted">Local tools never run in the hosted web application. Open the packaged Windows app to manage explicit permissions.</p></div></div>
    </Panel>
  );

  return (
    <div className="space-y-5">
      <Panel className="overflow-hidden">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold"><Power size={16} className={enabled ? "text-emerald-300" : "text-muted"} /> Atlas permission broker</h3>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">There is no terminal or arbitrary command tool. Native approval is required for every write and application launch.</p>
          </div>
          <button type="button" disabled={busy} onClick={() => void changeEnabled(!enabled)} className={`border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] transition active:scale-[0.98] disabled:opacity-40 ${enabled ? "border-rose-300/20 text-rose-200/75" : "border-emerald-300/30 bg-emerald-300/[0.07] text-emerald-200"}`}>{enabled ? "Disable Atlas" : "Enable Atlas"}</button>
        </div>
      </Panel>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_0.7fr]">
        <Panel>
          <div className="flex items-center justify-between gap-3 border-b border-edge pb-3">
            <div><h3 className="flex items-center gap-2 text-sm font-semibold"><FilePenLine size={15} className="text-accent" /> Scoped file workspace</h3><p className="mt-1 text-[11px] text-muted">Text/source files only · maximum 1 MiB · selection expires after 30 minutes</p></div>
            <button type="button" disabled={!enabled || busy} onClick={() => void pickFile()} className="inline-flex items-center gap-1.5 border border-cyan-300/25 bg-cyan-300/[0.06] px-3 py-2 text-xs text-cyan-100 transition hover:bg-cyan-300/10 active:scale-[0.98] disabled:opacity-35"><FolderOpen size={13} /> Select file</button>
          </div>
          {!selection ? (
            <div className="grid min-h-72 place-items-center text-center"><div><FileCheck2 size={28} className="mx-auto text-cyan-200/25" /><p className="mt-3 text-sm text-muted">No file selected</p><p className="mt-1 text-[11px] text-slate-600">Atlas has zero filesystem visibility.</p></div></div>
          ) : (
            <div className="pt-3">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted"><span className="font-mono text-cyan-100/70">{selection.name}</span><span>{selection.bytes.toLocaleString()} bytes · {selection.extension}</span></div>
              <textarea value={content} onChange={(event) => setContent(event.target.value)} rows={16} spellCheck={false} className="scroll-thin w-full resize-y border border-edge bg-[#02050c] p-3 font-mono text-xs leading-relaxed text-cyan-50/80 focus:border-cyan-300/35 focus:outline-none" aria-label="Selected file content" />
              <div className="mt-3 flex items-center justify-between gap-3"><p className={`text-[10px] ${changed ? "text-amber-200/70" : "text-muted"}`}>{changed ? `${byteDelta >= 0 ? "+" : ""}${byteDelta} byte change · native confirmation required` : "No unsaved changes"}</p><button type="button" disabled={!changed || busy} onClick={() => void writeFile()} className="inline-flex items-center gap-1.5 border border-amber-300/25 bg-amber-300/[0.06] px-3 py-2 text-xs text-amber-100 transition hover:bg-amber-300/10 active:scale-[0.98] disabled:opacity-35"><Save size={13} /> Review and write</button></div>
            </div>
          )}
        </Panel>

        <div className="space-y-5">
          <Panel>
            <h3 className="flex items-center gap-2 text-sm font-semibold"><AppWindow size={15} className="text-accent" /> Application allow-list</h3>
            <div className="mt-3 divide-y divide-edge border-t border-edge">
              {applications.map((application) => <div key={application.id} className="flex items-center justify-between gap-3 py-3"><span className="text-sm text-ink">{application.name}</span><button type="button" disabled={!enabled || busy} onClick={() => void launch(application.id)} className="border border-edge px-2.5 py-1.5 text-[9px] uppercase tracking-wider text-muted transition hover:border-cyan-300/25 hover:text-cyan-100 active:scale-[0.98] disabled:opacity-35">Request launch</button></div>)}
            </div>
          </Panel>
          <Panel>
            <h3 className="flex items-center gap-2 text-sm font-semibold"><History size={15} className="text-accent" /> Audit trail</h3>
            <div className="scroll-thin mt-3 max-h-64 divide-y divide-edge overflow-y-auto border-t border-edge">
              {audit.length === 0 ? <p className="py-4 text-xs text-muted">No Atlas actions recorded.</p> : audit.slice().reverse().map((entry, index) => <div key={`${entry.at}-${index}`} className="py-2"><p className="font-mono text-[9px] text-cyan-100/65">{entry.event}</p><p className="mt-0.5 text-[9px] text-slate-600">{new Date(entry.at).toLocaleString()}</p></div>)}
            </div>
          </Panel>
        </div>
      </div>
      {notice && <p role="status" className="text-xs text-emerald-300/75">{notice}</p>}
      {error && <p role="alert" className="text-xs text-rose-300/75">{error}</p>}
    </div>
  );
}
