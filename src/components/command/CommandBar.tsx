"use client";
/**
 * Universal command bar. Free text → routed intent: recognised keywords jump
 * to a page (worlds, simulations, writing…); anything else is sent to the
 * assistant. Also renders the quick-command chips.
 */
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Command, CornerDownLeft } from "lucide-react";
import { QUICK_COMMANDS } from "@/lib/data/commands";
import { Icon } from "@/components/nav/icons";
import { askUniverse } from "@/lib/utils";

const ROUTES: { match: RegExp; href: string }[] = [
  { match: /simulat|what if|orbit|gravity|blackbody|transit|snr|pid/i, href: "/simulations" },
  { match: /email|write|draft|readme|linkedin|abstract|proposal/i, href: "/writing" },
  { match: /research plan|copilot|methods|datasets needed/i, href: "/research" },
  { match: /graph|connect|knowledge map/i, href: "/graph" },
  { match: /briefing|today in space|morning/i, href: "/briefing" },
  { match: /astronomy|exoplanet|neo|apod|gaia|tess/i, href: "/worlds/astronomy" },
  { match: /physics|wave|fourier|chaos|thermo/i, href: "/worlds/physics" },
  { match: /math|fractal|mandelbrot|matrix|probab/i, href: "/worlds/mathematics" },
  { match: /\bai\b|neural|transformer|embedding|agent/i, href: "/worlds/ai" },
  { match: /data|nasa|arxiv|source|api/i, href: "/data" },
  { match: /vault|save|note/i, href: "/vault" },
];

export function CommandBar() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function run(text: string) {
    const q = text.trim();
    if (!q) return;
    const route = ROUTES.find((r) => r.match.test(q));
    // Explicit "explain / ask" always goes to the assistant.
    if (/^(explain|ask|tell me|what is|why|how)\b/i.test(q) || !route) {
      askUniverse(q, "Command Center");
    } else {
      router.push(route.href);
    }
    setValue("");
  }

  return (
    <div className="animate-fade-up">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(value);
        }}
        className="glass flex items-center gap-3 px-4 py-3"
      >
        <Command size={18} className="shrink-0 text-accent" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask anything, or type a command — e.g. “explain the transit method” or “simulate two moons”"
          className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          aria-label="Universal command bar"
        />
        <button
          type="submit"
          className="hidden items-center gap-1 rounded-md border border-edge px-2 py-1 text-[11px] text-muted sm:flex"
        >
          Enter <CornerDownLeft size={11} />
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_COMMANDS.map((c) => (
          <button
            key={c.id}
            onClick={() =>
              c.action.kind === "nav" ? router.push(c.action.href) : askUniverse(c.action.prompt, "Command Center")
            }
            className="group flex items-center gap-2 rounded-full border border-edge bg-white/[0.02] px-3 py-1.5 text-xs text-ink transition hover:border-accent/50 hover:bg-white/5"
            title={c.hint}
          >
            <Icon name={c.icon} size={13} className="text-accent" />
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
