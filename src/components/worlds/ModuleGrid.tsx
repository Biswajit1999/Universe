import type { WorldDef } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<string, string> = {
  interactive: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10",
  demo: "text-sky-300 border-sky-400/30 bg-sky-400/10",
  planned: "text-muted border-edge bg-white/[0.02]",
};

export function ModuleGrid({ modules }: { modules: WorldDef["modules"] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {modules.map((m) => (
        <div key={m.name} className="glass flex flex-col gap-1.5 p-4">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold">{m.name}</h4>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                STATUS_STYLE[m.status],
              )}
            >
              {m.status}
            </span>
          </div>
          <p className="text-xs text-muted">{m.desc}</p>
        </div>
      ))}
    </div>
  );
}
