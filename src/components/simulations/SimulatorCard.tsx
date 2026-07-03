"use client";
/**
 * Renders one simulator from the SIMULATORS registry: sliders bound to the
 * pure model, a live numeric result or time-series chart, an explanation, and
 * "ask" + "save" actions. All outputs are labelled Simulated.
 */
import { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Save } from "lucide-react";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Slider } from "@/components/ui/Slider";
import { AskButton } from "@/components/ui/AskButton";
import { useVault } from "@/lib/state/vault";
import { formatNumber } from "@/lib/utils";
import {
  type SimDef,
  orbitalPeriod,
  gravityForce,
  blackbodyPeak,
  transitDepth,
  signalToNoise,
  pidResponse,
  exponentialCooling,
  M_SUN,
  M_EARTH,
  AU,
  G,
} from "@/lib/simulations";

interface Computed {
  primary: { label: string; value: string }[];
  chart?: { data: Record<string, number>[]; lines: { key: string; color: string }[]; xKey: string };
  summary: string;
}

function compute(sim: SimDef, v: Record<string, number>): Computed {
  switch (sim.id) {
    case "orbital": {
      const r = orbitalPeriod(v.massSun * M_SUN, v.distanceAu * AU);
      return {
        primary: [
          { label: "Period", value: `${formatNumber(r.years)} yr` },
          { label: "= days", value: formatNumber(r.days, 1) },
        ],
        summary: `A body at ${v.distanceAu} AU around a ${v.massSun} M☉ star orbits every ${formatNumber(r.years)} years.`,
      };
    }
    case "gravity": {
      const f = gravityForce(v.m1Earth * M_EARTH, v.m2Earth * M_EARTH, v.distanceKm * 1e6) * v.gScale;
      const ref = gravityForce(M_EARTH, 0.0123 * M_EARTH, 384.4e6);
      return {
        primary: [
          { label: "Force", value: `${formatNumber(f)} N` },
          { label: "vs Earth–Moon", value: `${formatNumber(f / ref)}×` },
        ],
        summary: `Gravitational attraction is ${formatNumber(f)} N (G scaled ×${v.gScale}).`,
      };
    }
    case "blackbody": {
      const b = blackbodyPeak(v.tempK);
      return {
        primary: [
          { label: "Peak λ", value: `${formatNumber(b.wavelengthNm, 0)} nm` },
          { label: "Band", value: b.band },
        ],
        summary: `A ${v.tempK} K blackbody peaks at ${formatNumber(b.wavelengthNm, 0)} nm (${b.band}).`,
      };
    }
    case "transit": {
      const d = transitDepth(v.planetRe, v.starRs);
      return {
        primary: [
          { label: "Depth", value: `${formatNumber(d.percent)}%` },
          { label: "= ppm", value: formatNumber(d.ppm, 0) },
        ],
        summary: `A ${v.planetRe} R⊕ planet on a ${v.starRs} R☉ star dims it by ${formatNumber(d.ppm, 0)} ppm.`,
      };
    }
    case "snr": {
      const s = signalToNoise(v.signal, v.background, v.readNoise);
      return {
        primary: [
          { label: "SNR", value: formatNumber(s, 1) },
          { label: "σ (frac)", value: formatNumber(1 / s) },
        ],
        summary: `Signal ${v.signal}, background ${v.background}, read noise ${v.readNoise} e⁻ → SNR ≈ ${formatNumber(s, 1)}.`,
      };
    }
    case "pid": {
      const series = pidResponse({ kp: v.kp, ki: v.ki, kd: v.kd });
      const overshoot = Math.max(0, Math.max(...series.map((p) => p.y)) - 1) * 100;
      return {
        primary: [{ label: "Overshoot", value: `${formatNumber(overshoot, 1)}%` }],
        chart: { data: series as unknown as Record<string, number>[], lines: [{ key: "y", color: "var(--accent)" }, { key: "setpoint", color: "var(--accent2)" }], xKey: "t" },
        summary: `PID(Kp=${v.kp}, Ki=${v.ki}, Kd=${v.kd}) reaches the setpoint with ${formatNumber(overshoot, 1)}% overshoot.`,
      };
    }
    case "cooling": {
      const series = exponentialCooling({ t0: v.t0, tEnv: v.tEnv, tauMinutes: v.tau });
      const t95 = 3 * v.tau;
      return {
        primary: [{ label: "95% settled", value: `${formatNumber(t95, 0)} min` }],
        chart: { data: series as unknown as Record<string, number>[], lines: [{ key: "temp", color: "var(--accent)" }], xKey: "t" },
        summary: `From ${v.t0}°C toward ${v.tEnv}°C with τ=${v.tau} min, ~95% of the change happens in ${formatNumber(t95, 0)} min.`,
      };
    }
    default:
      return { primary: [], summary: "" };
  }
}

export function SimulatorCard({ sim }: { sim: SimDef }) {
  const { add } = useVault();
  const [vals, setVals] = useState<Record<string, number>>(
    Object.fromEntries(sim.fields.map((f) => [f.key, f.default])),
  );
  const result = useMemo(() => compute(sim, vals), [sim, vals]);
  const [saved, setSaved] = useState(false);

  return (
    <Panel>
      <PanelHeader
        title={sim.name}
        subtitle={sim.question}
        right={<Badge mode="simulated" />}
      />

      {result.chart ? (
        <div className="h-52 w-full">
          <ResponsiveContainer>
            <LineChart data={result.chart.data} margin={{ top: 8, right: 10, bottom: 16, left: -10 }}>
              <CartesianGrid strokeOpacity={0.1} />
              <XAxis dataKey={result.chart.xKey} tick={{ fontSize: 10, fill: "var(--muted)" }} />
              <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} width={44} />
              <Tooltip contentStyle={{ background: "#0b0e1c", border: "1px solid var(--edge)", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {result.chart.lines.map((l) => (
                <Line key={l.key} type="monotone" dataKey={l.key} stroke={l.color} dot={false} strokeWidth={1.5} isAnimationActive={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {result.primary.map((p) => (
            <div key={p.label} className="rounded-lg border border-edge bg-white/[0.02] px-3 py-2.5">
              <p className="text-[11px] uppercase tracking-wide text-muted">{p.label}</p>
              <p className="mt-0.5 font-mono text-lg font-semibold text-ink">{p.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {sim.fields.map((f) => (
          <Slider
            key={f.key}
            label={f.label}
            unit={f.unit}
            value={vals[f.key]}
            min={f.min}
            max={f.max}
            step={f.step}
            onChange={(val) => setVals((prev) => ({ ...prev, [f.key]: val }))}
          />
        ))}
      </div>

      <p className="mt-3 text-xs text-muted">{sim.explain}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        <AskButton size="sm" label="Explain this result" prompt={`${result.summary} Explain the physics and what dominates the outcome.`} context={`Simulation Lab · ${sim.name}`} />
        <button
          onClick={() => {
            add({ type: "simulation", title: `${sim.name} — ${result.primary[0]?.value ?? "result"}`, content: `${sim.name}\n\nInputs: ${JSON.stringify(vals)}\n\n${result.summary}` });
            setSaved(true);
            setTimeout(() => setSaved(false), 1500);
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-edge px-2.5 py-1.5 text-xs text-ink transition hover:bg-white/5"
        >
          <Save size={13} /> {saved ? "Saved" : "Save to Vault"}
        </button>
      </div>
    </Panel>
  );
}

/** Small helper so callers can reference constants if needed. */
export const SIM_CONSTANTS = { G, M_SUN, M_EARTH, AU };
