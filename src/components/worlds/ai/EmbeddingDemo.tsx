"use client";
import { useMemo, useState } from "react";
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";

/** 2D "embedding space": words placed so that semantically related words
 *  cluster. Hand-placed coordinates illustrate the idea of vector semantics. */
const WORDS: { word: string; x: number; y: number; group: string }[] = [
  { word: "star", x: 8.2, y: 7.9, group: "astro" },
  { word: "planet", x: 7.6, y: 7.1, group: "astro" },
  { word: "galaxy", x: 8.9, y: 8.4, group: "astro" },
  { word: "telescope", x: 7.1, y: 6.4, group: "astro" },
  { word: "neuron", x: 2.1, y: 7.8, group: "bio" },
  { word: "brain", x: 2.6, y: 8.3, group: "bio" },
  { word: "cell", x: 1.7, y: 7.0, group: "bio" },
  { word: "dna", x: 2.9, y: 6.6, group: "bio" },
  { word: "gradient", x: 5.1, y: 2.4, group: "ml" },
  { word: "tensor", x: 5.8, y: 2.9, group: "ml" },
  { word: "attention", x: 6.3, y: 2.1, group: "ml" },
  { word: "loss", x: 4.7, y: 1.8, group: "ml" },
];
const COLORS: Record<string, string> = { astro: "#7dd3fc", bio: "#86efac", ml: "#fcd34d" };

export function EmbeddingDemo() {
  const [query, setQuery] = useState("star");
  const target = useMemo(() => WORDS.find((w) => w.word === query) ?? WORDS[0], [query]);

  const withDist = WORDS.map((w) => ({
    ...w,
    dist: Math.hypot(w.x - target.x, w.y - target.y),
  }));
  const nearest = [...withDist].filter((w) => w.word !== query).sort((a, b) => a.dist - b.dist).slice(0, 3);

  return (
    <Panel>
      <PanelHeader title="Embedding Space" subtitle="Semantic distance in 2D" right={<Badge mode="simulated" />} />
      <div className="h-56 w-full">
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
            <CartesianGrid strokeOpacity={0.1} />
            <XAxis type="number" dataKey="x" domain={[0, 10]} tick={{ fontSize: 10, fill: "var(--muted)" }} />
            <YAxis type="number" dataKey="y" domain={[0, 10]} tick={{ fontSize: 10, fill: "var(--muted)" }} />
            <Tooltip
              cursor={{ strokeOpacity: 0.2 }}
              contentStyle={{ background: "#0b0e1c", border: "1px solid var(--edge)", borderRadius: 8, fontSize: 12 }}
              formatter={(_v, _n, p) => [(p.payload as { word: string }).word, "word"]}
            />
            <Scatter data={withDist}>
              {withDist.map((w) => (
                <Cell key={w.word} fill={w.word === query ? "#fff" : COLORS[w.group]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">Query:</span>
        <select
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="rounded-md border border-edge bg-white/5 px-2 py-1 text-xs text-ink"
        >
          {WORDS.map((w) => (
            <option key={w.word} value={w.word} className="bg-bg">
              {w.word}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted">
          nearest: {nearest.map((n) => n.word).join(", ")}
        </span>
      </div>
      <p className="mt-3 text-xs text-muted">
        Real embeddings live in hundreds of dimensions, but the idea holds: related concepts sit close together, and &ldquo;distance&rdquo; encodes meaning.
      </p>
    </Panel>
  );
}
