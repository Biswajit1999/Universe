"use client";
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { AskButton } from "@/components/ui/AskButton";
import { syntheticTransitLightCurve } from "@/lib/api/mast";
import { transitDepth } from "@/lib/simulations/models";
import { formatNumber } from "@/lib/utils";

/** TESS-style synthetic transit light curve — tune it and see the transits. */
export function LightCurveLab() {
  const [planetRe, setPlanetRe] = useState(11); // ~Jupiter
  const [starRs, setStarRs] = useState(1);
  const [period, setPeriod] = useState(3.5);
  const [noise, setNoise] = useState(1.2); // in ppt (×10^-3)

  const depth = useMemo(() => transitDepth(planetRe, starRs), [planetRe, starRs]);

  const curve = useMemo(
    () =>
      syntheticTransitLightCurve({
        periodDays: period,
        depth: depth.fraction,
        noise: noise / 1000,
        lengthDays: period * 3,
        cadenceMinutes: 12,
      }).map((p) => ({ t: p.time, flux: p.flux })),
    [period, depth.fraction, noise],
  );

  return (
    <Panel>
      <PanelHeader
        title="TESS Light Curve Lab"
        subtitle="Synthetic transit — tune the planet and noise"
        right={<Badge mode="simulated" />}
      />
      <div className="h-56 w-full">
        <ResponsiveContainer>
          <LineChart data={curve} margin={{ top: 8, right: 10, bottom: 18, left: -8 }}>
            <CartesianGrid strokeOpacity={0.1} />
            <XAxis dataKey="t" tick={{ fontSize: 10, fill: "var(--muted)" }} label={{ value: "Time (days)", position: "insideBottom", offset: -6, fontSize: 10, fill: "var(--muted)" }} />
            <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "var(--muted)" }} width={48} />
            <Tooltip contentStyle={{ background: "#0b0e1c", border: "1px solid var(--edge)", borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="flux" stroke="var(--accent)" dot={false} strokeWidth={1.2} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Slider label="Planet radius" unit="R⊕" value={planetRe} min={1} max={25} step={0.5} onChange={setPlanetRe} />
        <Slider label="Star radius" unit="R☉" value={starRs} min={0.2} max={3} step={0.1} onChange={setStarRs} />
        <Slider label="Orbital period" unit="d" value={period} min={1} max={12} step={0.5} onChange={setPeriod} />
        <Slider label="Noise" unit="ppt" value={noise} min={0.1} max={5} step={0.1} onChange={setNoise} />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-edge bg-white/[0.02] px-3 py-2 text-sm">
        <span className="text-muted">Transit depth</span>
        <span className="font-mono font-medium text-ink">
          {formatNumber(depth.percent)}% · {formatNumber(depth.ppm, 0)} ppm
        </span>
      </div>
      <div className="mt-3">
        <AskButton size="sm" label="Explain what I'm seeing" prompt={`I have a transit light curve with depth ${formatNumber(depth.percent)}% and noise ${noise} ppt. Explain how detectability depends on depth vs noise, and what SNR I'd need.`} context="TESS Light Curve Lab" />
      </div>
    </Panel>
  );
}

function Slider({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block text-xs">
      <span className="flex items-center justify-between text-muted">
        <span>{label}</span>
        <span className="font-mono text-ink">
          {value} {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full accent-[var(--accent)]"
      />
    </label>
  );
}
