"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { GRAPH_NODES, GRAPH_EDGES, nodeById } from "@/lib/data/graph";
import { AskButton } from "@/components/ui/AskButton";
import { askUniverse } from "@/lib/utils";

const GROUP_COLOR: Record<string, string> = {
  domain: "#7dd3fc",
  topic: "#c4b5fd",
  instrument: "#fcd34d",
  personal: "#67e8f9",
};

export function KnowledgeGraph() {
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const node = selected ? nodeById(selected) : null;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setSelected(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const connected = new Set<string>();
  if (hover) {
    GRAPH_EDGES.forEach((e) => {
      if (e.from === hover) connected.add(e.to);
      if (e.to === hover) connected.add(e.from);
    });
  }

  return (
    <div className="relative">
      <div className="glass overflow-hidden p-2">
        <svg viewBox="0 0 1000 640" className="h-auto w-full touch-none" role="img" aria-label="Knowledge graph">
          {/* edges */}
          {GRAPH_EDGES.map((e, i) => {
            const a = nodeById(e.from)!;
            const b = nodeById(e.to)!;
            const active = hover && (e.from === hover || e.to === hover);
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={active ? "var(--accent)" : "var(--edge)"}
                strokeWidth={active ? 1.6 : 1}
                strokeOpacity={active ? 0.8 : 0.4}
              />
            );
          })}
          {/* nodes */}
          {GRAPH_NODES.map((n) => {
            const color = GROUP_COLOR[n.group];
            const dim = hover && hover !== n.id && !connected.has(n.id);
            const r = n.group === "domain" ? 15 : n.id === "universe" ? 22 : 11;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                className="cursor-pointer"
                opacity={dim ? 0.35 : 1}
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                onClick={() => setSelected(n.id)}
              >
                <circle r={r + 6} fill={color} opacity={0.12} />
                <circle r={r} fill={color} fillOpacity={0.85} stroke="#05060f" strokeWidth={1.5} />
                <text
                  y={r + 14}
                  textAnchor="middle"
                  fontSize={n.group === "domain" || n.id === "universe" ? 13 : 11}
                  fontWeight={n.group === "domain" || n.id === "universe" ? 600 : 400}
                  fill="var(--ink)"
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-2 text-center text-xs text-muted">Hover to trace connections · click a node to open it.</p>

      {/* Detail drawer */}
      {node && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <div className="glass-strong relative m-0 w-full max-w-md rounded-t-2xl border border-edge p-5 sm:rounded-2xl">
            <button onClick={() => setSelected(null)} className="absolute right-3 top-3 rounded-md p-1 hover:bg-white/5" aria-label="Close">
              <X size={18} />
            </button>
            <span
              className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ background: `${GROUP_COLOR[node.group]}22`, color: GROUP_COLOR[node.group] }}
            >
              {node.group}
            </span>
            <h3 className="mt-2 text-lg font-semibold">{node.label}</h3>
            <p className="mt-1.5 text-sm text-muted">{node.blurb}</p>
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Related questions</p>
              <ul className="mt-2 space-y-1.5">
                {node.questions.map((q) => (
                  <li key={q}>
                    <button onClick={() => askUniverse(q, `Knowledge Graph · ${node.label}`)} className="text-left text-sm text-accent hover:underline">
                      → {q}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <AskButton label={`Ask about ${node.label}`} prompt={`Explain ${node.label} and how it connects to the other fields in science.`} context={`Knowledge Graph · ${node.label}`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
