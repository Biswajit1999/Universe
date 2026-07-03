import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DATA_SOURCES } from "@/lib/data/sources";
import { cn } from "@/lib/utils";

export const metadata = { title: "Data Explorer · UNIVERSE" };

const STATUS: Record<string, { label: string; cls: string }> = {
  wrapped: { label: "Wrapped · live-ready", cls: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10" },
  "no-key-needed": { label: "No key needed", cls: "text-sky-300 border-sky-400/30 bg-sky-400/10" },
  placeholder: { label: "Placeholder · v2", cls: "text-muted border-edge bg-white/[0.02]" },
};

export default function DataExplorer() {
  return (
    <div>
      <PageHeader
        eyebrow="The sources"
        title="Data Explorer"
        description="The archives and APIs UNIVERSE draws from. “Wrapped” sources already have a live API route in this MVP; the rest are typed placeholders on the v2 roadmap. Add keys in .env.local to switch Demo → Live."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DATA_SOURCES.map((s) => {
          const st = STATUS[s.status];
          return (
            <div key={s.id} className="glass flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold">{s.name}</h3>
                <span className={cn("shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", st.cls)}>
                  {st.label}
                </span>
              </div>
              <p className="text-xs text-muted">{s.provides}</p>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted">Example query</p>
                <pre className="mt-1 overflow-x-auto rounded-md border border-edge bg-black/30 p-2 text-[11px] scroll-thin">{s.exampleQuery}</pre>
              </div>
              <div className="mt-auto flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted">{s.needsKey ? "🔑 API key required" : "✓ No key required"}</span>
                <a href={s.docsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-accent">
                  Docs <ExternalLink size={12} />
                </a>
              </div>
              <button
                disabled
                className="cursor-not-allowed rounded-lg border border-edge px-3 py-1.5 text-xs text-muted"
                title="Connection UI arrives in v2 — for now, add keys in .env.local"
              >
                Connect (v2)
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
