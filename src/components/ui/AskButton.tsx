"use client";
import { Sparkles } from "lucide-react";
import { askUniverse } from "@/lib/utils";
import { cn } from "@/lib/utils";

/** "Ask Universe about this" — opens the assistant with an optional prompt + context. */
export function AskButton({
  prompt,
  context,
  label = "Ask Universe about this",
  className,
  size = "md",
}: {
  prompt?: string;
  context?: string;
  label?: string;
  className?: string;
  size?: "sm" | "md";
}) {
  return (
    <button
      onClick={() => askUniverse(prompt, context)}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 font-medium text-ink transition hover:bg-accent/20",
        size === "sm" ? "px-2.5 py-1.5 text-xs" : "px-3.5 py-2 text-sm",
        className,
      )}
    >
      <Sparkles size={size === "sm" ? 13 : 15} className="text-accent" />
      {label}
    </button>
  );
}
