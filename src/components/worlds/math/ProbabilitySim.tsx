"use client";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Slider } from "@/components/ui/Slider";
import { formatNumber } from "@/lib/utils";

/** Law of large numbers: roll N dice, watch the mean approach 3.5. */
export function ProbabilitySim() {
  const [n, setN] = useState(500);
  const [seed, setSeed] = useState(0);

  const counts = [0, 0, 0, 0, 0, 0];
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const roll = 1 + Math.floor(Math.random() * 6);
    counts[roll - 1]++;
    sum += roll;
  }
  const data = counts.map((c, i) => ({ face: i + 1, count: c }));
  const mean = sum / n;

  return (
    <Panel>
      <PanelHeader title="Probability Simulator" subtitle="Law of large numbers — dice" right={<Badge mode="simulated" />} />
      <div className="h-48 w-full">
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 4, left: -18 }}>
            <CartesianGrid strokeOpacity={0.1} />
            <XAxis dataKey="face" tick={{ fontSize: 10, fill: "var(--muted)" }} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} />
            <Tooltip contentStyle={{ background: "#0b0e1c", border: "1px solid var(--edge)", borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" fill="var(--accent)" fillOpacity={0.75} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex items-center justify-between rounded-lg border border-edge bg-white/[0.02] px-3 py-2 text-sm">
        <span className="text-muted">Sample mean (true = 3.5)</span>
        <span className="font-mono font-medium">{formatNumber(mean)}</span>
      </div>
      <div className="mt-3">
        <Slider label="Number of rolls" value={n} min={10} max={5000} step={10} onChange={setN} />
      </div>
      <button
        onClick={() => setSeed((s) => s + 1)}
        className="mt-2 rounded-md border border-edge px-3 py-1 text-xs text-ink hover:bg-white/5"
        data-seed={seed}
      >
        Re-roll
      </button>
      <p className="mt-3 text-xs text-muted">More rolls → the empirical mean converges to 3.5 and the bars flatten toward uniform.</p>
    </Panel>
  );
}
