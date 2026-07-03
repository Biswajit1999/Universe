"use client";
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Slider } from "@/components/ui/Slider";

const PRESETS = [
  { label: "a·sin(b·x)", fn: (x: number, a: number, b: number) => a * Math.sin(b * x) },
  { label: "a·x² + b·x", fn: (x: number, a: number, b: number) => a * x * x + b * x },
  { label: "a·e^(−b·x²)", fn: (x: number, a: number, b: number) => a * Math.exp(-b * x * x) },
  { label: "a·sin(x)/(b·x)", fn: (x: number, a: number, b: number) => (b * x === 0 ? a : (a * Math.sin(x)) / (b * x)) },
];

/** Plot y = f(x) for a chosen family with two tunable parameters. */
export function EquationVisualiser() {
  const [preset, setPreset] = useState(0);
  const [a, setA] = useState(1);
  const [b, setB] = useState(1);

  const data = useMemo(() => {
    const f = PRESETS[preset].fn;
    const pts: { x: number; y: number }[] = [];
    for (let x = -10; x <= 10; x += 0.1) {
      const y = f(x, a, b);
      pts.push({ x: Number(x.toFixed(2)), y: Number.isFinite(y) ? Number(y.toFixed(3)) : 0 });
    }
    return pts;
  }, [preset, a, b]);

  return (
    <Panel>
      <PanelHeader title="Equation Visualiser" subtitle="Plot y = f(x) and tune it" right={<Badge mode="simulated" />} />
      <div className="mb-3 flex flex-wrap gap-2">
        {PRESETS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => setPreset(i)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              preset === i ? "border-accent/50 bg-accent/15 text-ink" : "border-edge text-muted hover:text-ink"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 10, bottom: 8, left: -12 }}>
            <CartesianGrid strokeOpacity={0.1} />
            <XAxis dataKey="x" tick={{ fontSize: 10, fill: "var(--muted)" }} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} width={40} />
            <ReferenceLine y={0} stroke="var(--edge)" />
            <Tooltip contentStyle={{ background: "#0b0e1c", border: "1px solid var(--edge)", borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="y" stroke="var(--accent)" dot={false} strokeWidth={1.6} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Slider label="a" value={a} min={-5} max={5} step={0.1} onChange={setA} />
        <Slider label="b" value={b} min={-5} max={5} step={0.1} onChange={setB} />
      </div>
    </Panel>
  );
}
