"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Orbit, Radio, X } from "lucide-react";
import { GRAPH_EDGES, GRAPH_NODES, nodeById } from "@/lib/data/graph";
import { KnowledgeGraph3D } from "@/components/graph/KnowledgeGraph3D";
import { AskButton } from "@/components/ui/AskButton";
import { askUniverse } from "@/lib/utils";

const GROUP_COLOR: Record<string, string> = {
  domain: "#52dcff",
  topic: "#9d8cff",
  instrument: "#ffd76a",
  personal: "#63f5e6",
};

export function KnowledgeGraph() {
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const node = selected ? nodeById(selected) : null;
  const connectedCount = useMemo(() => hover ? GRAPH_EDGES.filter((edge) => edge.from === hover || edge.to === hover).length : GRAPH_EDGES.length, [hover]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) { if (event.key === "Escape") setSelected(null); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative">
      <section className="knowledge-constellation relative h-[680px] overflow-hidden border border-cyan-300/15 bg-[#020711] shadow-[0_30px_100px_rgba(0,0,0,0.45)]" aria-label="Interactive 3D knowledge constellation">
        <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_44%,transparent_25%,rgba(1,4,12,0.78)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between border-b border-cyan-300/10 bg-[#030a17]/80 px-4 py-3 backdrop-blur-md">
          <div>
            <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.24em] text-cyan-100/70"><Orbit size={12} className="text-cyan-300" /> Cognitive constellation</p>
            <p className="mt-1 text-[9px] text-slate-500">Drag your attention across nodes · select one to open its intelligence channel</p>
          </div>
          <div className="hidden items-center gap-4 font-mono text-[8px] uppercase tracking-[0.16em] text-cyan-100/45 sm:flex">
            <span className="flex items-center gap-1.5"><Box size={11} /> {GRAPH_NODES.length} nodes</span>
            <span className="flex items-center gap-1.5"><Radio size={11} /> {connectedCount} links</span>
          </div>
        </div>
        <KnowledgeGraph3D hover={hover} onHover={setHover} onSelect={setSelected} />
        <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex flex-wrap gap-2">
          {Object.entries(GROUP_COLOR).map(([group, color]) => <span key={group} className="border border-white/10 bg-black/40 px-2 py-1 text-[8px] uppercase tracking-[0.16em] text-slate-400 backdrop-blur" style={{ boxShadow: `inset 2px 0 ${color}` }}>{group}</span>)}
        </div>
        <div className="pointer-events-none absolute bottom-4 right-4 z-20 font-mono text-[8px] uppercase tracking-[0.18em] text-cyan-100/35">WebGL spatial map · live focus</div>
      </section>
      <p className="mt-2 text-center text-xs text-muted">Move across the constellation to trace relationships · click a node to open it.</p>

      {node && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-label={`${node.label} knowledge node`}>
          <div className="absolute inset-0 bg-[#01030a]/80 backdrop-blur-md" onClick={() => setSelected(null)} />
          <div className="knowledge-node-dialog relative m-0 w-full max-w-lg border border-cyan-300/20 bg-[#050b18]/96 p-6 shadow-[0_0_90px_rgba(34,211,238,0.12)] sm:clip-path-hud">
            <button onClick={() => setSelected(null)} className="absolute right-3 top-3 border border-cyan-300/10 p-1.5 text-muted hover:bg-cyan-300/[0.06]" aria-label="Close"><X size={18} /></button>
            <span className="inline-block border px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ background: `${GROUP_COLOR[node.group]}12`, borderColor: `${GROUP_COLOR[node.group]}44`, color: GROUP_COLOR[node.group] }}>{node.group}</span>
            <h3 className="mt-3 text-2xl font-semibold text-cyan-50">{node.label}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{node.blurb}</p>
            <div className="mt-5 border-t border-cyan-300/10 pt-4">
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-cyan-100/45">Related questions</p>
              <ul className="mt-3 space-y-2">
                {node.questions.map((question) => <li key={question}><button onClick={() => askUniverse(question, `Knowledge Graph · ${node.label}`)} className="text-left text-sm text-cyan-200 hover:text-white">→ {question}</button></li>)}
              </ul>
            </div>
            <div className="mt-5"><AskButton label={`Ask about ${node.label}`} prompt={`Explain ${node.label} and how it connects to the other fields in science.`} context={`Knowledge Graph · ${node.label}`} /></div>
          </div>
        </div>
      )}
    </div>
  );
}
