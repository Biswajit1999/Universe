"use client";

import { useEffect, useState } from "react";
import { Brain, LockKeyhole, Plus, Trash2 } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Markdown } from "@/components/ui/Markdown";
import type { MemoryRecord } from "@/lib/memory/types";

export function DesktopMemory() {
  const [desktop, setDesktop] = useState(false);
  const [items, setItems] = useState<MemoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", content: "", tags: "" });

  async function load() {
    const response = await fetch("/api/memory", { cache: "no-store" });
    if (!response.ok) throw new Error("Encrypted memory is unavailable.");
    const data = await response.json();
    setItems(data.items);
  }

  useEffect(() => {
    const available = window.universeDesktop?.isDesktop === true;
    setDesktop(available);
    if (!available) {
      setLoading(false);
      return;
    }
    void load().catch(() => setError("Encrypted memory opens only in the packaged desktop runtime.")).finally(() => setLoading(false));
  }, []);

  async function add() {
    if (!draft.title.trim() || !draft.content.trim()) return;
    setError("");
    const response = await fetch("/api/memory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: draft.title, content: draft.content, tags: draft.tags.split(",") }),
    });
    if (!response.ok) {
      setError("Memory could not be encrypted and saved.");
      return;
    }
    setDraft({ title: "", content: "", tags: "" });
    await load();
  }

  async function remove(id: string) {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    const response = await fetch(`/api/memory?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Memory could not be deleted.");
      return;
    }
    setConfirmDelete(null);
    await load();
  }

  return (
    <Panel>
      <div className="flex items-start justify-between gap-4 border-b border-edge pb-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold"><Brain size={16} className="text-accent" /> Encrypted long-term memory</h3>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">Only items you explicitly save become long-term memory. The assistant reads relevant records only when you turn Memory on in the conversation.</p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-[9px] uppercase tracking-[0.17em] text-emerald-300/60"><LockKeyhole size={11} /> AES-256-GCM</span>
      </div>

      {!desktop ? (
        <p className="mt-4 text-xs text-amber-200/65">Open the private desktop application to create or read encrypted memory.</p>
      ) : (
        <>
          <div className="grid gap-2 py-4 md:grid-cols-[0.8fr_1.4fr_0.8fr_auto] md:items-start">
            <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Memory title" aria-label="Memory title" className="rounded-lg border border-edge bg-black/20 px-3 py-2 text-sm text-ink placeholder:text-muted" />
            <textarea value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} rows={2} placeholder="What should Universe remember?" aria-label="Memory content" className="resize-none rounded-lg border border-edge bg-black/20 px-3 py-2 text-sm text-ink placeholder:text-muted" />
            <input value={draft.tags} onChange={(event) => setDraft({ ...draft, tags: event.target.value })} placeholder="tags, comma separated" aria-label="Memory tags" className="rounded-lg border border-edge bg-black/20 px-3 py-2 text-sm text-ink placeholder:text-muted" />
            <button type="button" onClick={() => void add()} disabled={!draft.title.trim() || !draft.content.trim()} className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-cyan-300/25 bg-cyan-300/[0.07] px-3 py-2 text-xs text-cyan-100 transition hover:bg-cyan-300/12 active:scale-[0.98] disabled:opacity-35"><Plus size={13} /> Remember</button>
          </div>

          {loading ? (
            <div className="space-y-2 py-3" aria-label="Loading encrypted memory"><div className="h-8 animate-pulse bg-white/[0.035]" /><div className="h-8 animate-pulse bg-white/[0.025]" /></div>
          ) : items.length === 0 ? (
            <div className="border-l border-cyan-300/20 py-3 pl-3 text-xs text-muted">No long-term memories. Nothing from conversation history is stored automatically.</div>
          ) : (
            <div className="divide-y divide-edge border-t border-edge">
              {items.map((item) => (
                <article key={item.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <button type="button" onClick={() => setExpanded(expanded === item.id ? null : item.id)} className="min-w-0 text-left">
                      <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                      <p className="mt-1 text-[10px] text-muted">{item.tags.join(" · ") || "untagged"} · {new Date(item.updatedAt).toLocaleString()}</p>
                    </button>
                    <button type="button" onClick={() => void remove(item.id)} className={`inline-flex items-center gap-1 border px-2 py-1 text-[9px] uppercase tracking-wider transition ${confirmDelete === item.id ? "border-rose-300/40 bg-rose-300/[0.08] text-rose-200" : "border-edge text-muted hover:text-rose-200"}`}>
                      <Trash2 size={10} /> {confirmDelete === item.id ? "Confirm delete" : "Delete"}
                    </button>
                  </div>
                  {expanded === item.id && <div className="mt-3 border-l border-cyan-300/15 pl-3"><Markdown content={item.content} /></div>}
                </article>
              ))}
            </div>
          )}
        </>
      )}
      {error && <p role="alert" className="mt-3 text-xs text-rose-300/75">{error}</p>}
    </Panel>
  );
}
