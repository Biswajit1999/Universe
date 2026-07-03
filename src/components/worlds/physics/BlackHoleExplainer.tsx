"use client";
import { useState } from "react";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { Slider } from "@/components/ui/Slider";
import { AskButton } from "@/components/ui/AskButton";
import { formatNumber } from "@/lib/utils";

const G = 6.674e-11;
const C = 2.998e8;
const M_SUN = 1.989e30;

/** Schwarzschild-radius visual: scale event horizon with mass. */
export function BlackHoleExplainer() {
  const [massSun, setMassSun] = useState(10);
  const rs = (2 * G * massSun * M_SUN) / (C * C); // metres
  const rsKm = rs / 1000;
  // visual radius scales with log(mass) for legibility
  const vr = 24 + Math.log10(massSun) * 18;

  return (
    <Panel>
      <PanelHeader title="Black Hole Explainer" subtitle="Schwarzschild radius vs mass" right={<Badge mode="simulated" />} />
      <div className="flex items-center justify-center py-4">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <div className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, rgba(196,181,253,0.25), transparent 70%)" }} />
          <div
            className="rounded-full bg-black transition-all"
            style={{ width: vr * 2, height: vr * 2, boxShadow: "0 0 24px 4px rgba(253,224,71,0.35), inset 0 0 20px rgba(0,0,0,0.9)" }}
          />
          <div
            className="absolute rounded-full border border-amber-300/40 animate-spin-slow"
            style={{ width: vr * 3.2, height: vr * 1.2, transformOrigin: "center" }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-edge bg-white/[0.02] px-3 py-2">
          <p className="text-[11px] uppercase text-muted">Event horizon</p>
          <p className="font-mono text-lg font-semibold">{formatNumber(rsKm)} km</p>
        </div>
        <div className="rounded-lg border border-edge bg-white/[0.02] px-3 py-2">
          <p className="text-[11px] uppercase text-muted">Mass</p>
          <p className="font-mono text-lg font-semibold">{massSun} M☉</p>
        </div>
      </div>
      <div className="mt-4">
        <Slider label="Mass" unit="M☉" value={massSun} min={1} max={1e7} step={1} onChange={setMassSun} />
      </div>
      <p className="mt-3 text-xs text-muted">rₛ = 2GM/c² — the horizon grows linearly with mass: ~3 km per solar mass.</p>
      <div className="mt-3">
        <AskButton size="sm" label="Explain event horizons" prompt="Explain what the Schwarzschild radius means physically and why nothing escapes from inside the event horizon." context="Black Hole Explainer" />
      </div>
    </Panel>
  );
}
