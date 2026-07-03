import type { DataMode } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<DataMode, string> = {
  live: "bg-emerald-400/15 text-emerald-300 border-emerald-400/30",
  demo: "bg-sky-400/15 text-sky-300 border-sky-400/30",
  estimated: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  simulated: "bg-violet-400/15 text-violet-300 border-violet-400/30",
};

const LABELS: Record<DataMode, string> = {
  live: "Live",
  demo: "Demo",
  estimated: "Estimated",
  simulated: "Simulated",
};

/** Honest provenance badge shown next to every dataset/result. */
export function Badge({ mode, className }: { mode: DataMode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        STYLES[mode],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[mode]}
    </span>
  );
}
