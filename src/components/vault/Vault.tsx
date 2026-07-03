"use client";
import { useState } from "react";
import { LogIn, LogOut, Trash2, Plus, Download, Lock } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Markdown } from "@/components/ui/Markdown";
import { useVault } from "@/lib/state/vault";
import { downloadMarkdown } from "@/lib/utils";
import type { VaultItemType } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DesktopMemory } from "@/components/vault/DesktopMemory";

const TYPES: { id: VaultItemType | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "note", label: "Notes" },
  { id: "idea", label: "Ideas" },
  { id: "report", label: "Reports" },
  { id: "simulation", label: "Simulations" },
  { id: "answer", label: "AI answers" },
  { id: "email", label: "Drafts" },
  { id: "dataset", label: "Datasets" },
  { id: "project", label: "Projects" },
];

export function Vault() {
  const { items, add, remove, user, firebaseEnabled, signIn, signOutUser, loading } = useVault();
  const [filter, setFilter] = useState<VaultItemType | "all">("all");
  const [draft, setDraft] = useState({ title: "", content: "", type: "note" as VaultItemType });
  const [open, setOpen] = useState<string | null>(null);

  const shown = filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <div className="space-y-6">
      <DesktopMemory />

      {/* Auth / mode banner */}
      <Panel>
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-edge bg-accent/10">
              <Lock size={18} className="text-accent" />
            </div>
            <div>
              {firebaseEnabled ? (
                user ? (
                  <>
                    <p className="text-sm font-medium">Signed in as {user.displayName ?? user.email}</p>
                    <p className="text-xs text-muted">Synced to Firestore · <Badge mode="live" /></p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium">Sign in to sync your vault</p>
                    <p className="text-xs text-muted">Firebase is configured — sign in with Google to persist across devices.</p>
                  </>
                )
              ) : (
                <>
                  <p className="text-sm font-medium">Demo Mode — local vault</p>
                  <p className="text-xs text-muted">No Firebase keys detected. Items save to this browser only. <Badge mode="demo" /></p>
                </>
              )}
            </div>
          </div>
          {firebaseEnabled &&
            (user ? (
              <button onClick={signOutUser} className="inline-flex items-center gap-2 rounded-lg border border-edge px-3 py-2 text-sm hover:bg-white/5">
                <LogOut size={15} /> Sign out
              </button>
            ) : (
              <button onClick={signIn} className="inline-flex items-center gap-2 rounded-lg bg-accent/20 px-3 py-2 text-sm font-medium hover:bg-accent/30">
                <LogIn size={15} /> Sign in with Google
              </button>
            ))}
        </div>
      </Panel>

      {/* Quick add */}
      <Panel>
        <h3 className="mb-3 text-sm font-semibold">Add to vault</h3>
        <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
          <select
            value={draft.type}
            onChange={(e) => setDraft({ ...draft, type: e.target.value as VaultItemType })}
            className="rounded-lg border border-edge bg-white/5 px-2 py-2 text-sm text-ink"
          >
            {TYPES.filter((t) => t.id !== "all").map((t) => (
              <option key={t.id} value={t.id} className="bg-bg">
                {t.label}
              </option>
            ))}
          </select>
          <input
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            placeholder="Title"
            className="rounded-lg border border-edge bg-white/5 px-3 py-2 text-sm text-ink placeholder:text-muted"
          />
        </div>
        <textarea
          value={draft.content}
          onChange={(e) => setDraft({ ...draft, content: e.target.value })}
          rows={3}
          placeholder="Content (Markdown supported)…"
          className="mt-2 w-full resize-none rounded-lg border border-edge bg-white/5 px-3 py-2 text-sm text-ink placeholder:text-muted scroll-thin"
        />
        <button
          onClick={() => {
            if (!draft.title.trim()) return;
            add({ type: draft.type, title: draft.title, content: draft.content });
            setDraft({ title: "", content: "", type: draft.type });
          }}
          className="mt-2 inline-flex items-center gap-2 rounded-lg bg-accent/20 px-4 py-2 text-sm font-semibold hover:bg-accent/30"
        >
          <Plus size={15} /> Save item
        </button>
      </Panel>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition",
              filter === t.id ? "border-accent/50 bg-accent/15 text-ink" : "border-edge text-muted hover:text-ink",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Items */}
      {loading ? (
        <p className="text-sm text-muted">Loading vault…</p>
      ) : shown.length === 0 ? (
        <Panel>
          <p className="text-sm text-muted">
            Nothing here yet. Save AI answers, simulations, research plans and drafts from across UNIVERSE, or add an item above.
          </p>
        </Panel>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {shown.map((item) => (
            <Panel key={item.id}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="rounded-full border border-edge px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">{item.type}</span>
                  <h4 className="mt-1.5 truncate text-sm font-semibold">{item.title}</h4>
                  <p className="text-[11px] text-muted">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => downloadMarkdown(item.title.slice(0, 30) || "item", `# ${item.title}\n\n${item.content}`)} className="rounded-md p-1.5 text-muted hover:bg-white/5 hover:text-ink" aria-label="Export">
                    <Download size={14} />
                  </button>
                  <button onClick={() => remove(item.id)} className="rounded-md p-1.5 text-muted hover:bg-white/5 hover:text-red-400" aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {item.content && (
                <button onClick={() => setOpen(open === item.id ? null : item.id)} className="mt-2 text-xs text-accent">
                  {open === item.id ? "Hide" : "View"}
                </button>
              )}
              {open === item.id && (
                <div className="mt-2 max-h-64 overflow-auto rounded-lg border border-edge bg-black/20 p-3 scroll-thin">
                  <Markdown content={item.content} />
                </div>
              )}
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
