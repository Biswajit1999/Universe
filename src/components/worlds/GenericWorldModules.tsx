"use client";
/**
 * Renders the interactive modules for the non-deep worlds, so the "interactive"
 * status claims in worlds.ts are actually backed by working UI. Worlds without
 * interactive modules (earth, history, missions) render nothing here and rely
 * on the standard overview — which is honest, since their modules are demo/planned.
 */
import Link from "next/link";
import { NotebookPen, Lightbulb, FileText, ArrowRight } from "lucide-react";
import { SimulatorCard } from "@/components/simulations/SimulatorCard";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { SIMULATORS } from "@/lib/simulations";
import { WORLD_SIMS } from "@/lib/data/worlds";
import { useVault } from "@/lib/state/vault";

function PersonalModules() {
  const { items } = useVault();
  const ideas = items.filter((i) => i.type === "idea" || i.type === "project");
  const plans = items.filter((i) => i.type === "report");
  const notes = items.filter((i) => i.type === "note" || i.type === "answer");

  const cards = [
    { icon: Lightbulb, label: "Saved ideas", n: ideas.length },
    { icon: FileText, label: "Research plans", n: plans.length },
    { icon: NotebookPen, label: "Notes & answers", n: notes.length },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((c) => (
        <Panel key={c.label}>
          <div className="mb-2 flex items-center justify-between">
            <c.icon size={16} className="text-accent" />
            <Badge mode="live" />
          </div>
          <p className="text-2xl font-bold">{c.n}</p>
          <p className="text-xs text-muted">{c.label}</p>
        </Panel>
      ))}
      <Link
        href="/vault"
        className="glass flex items-center justify-between p-4 text-sm transition hover:border-accent/40 sm:col-span-3"
      >
        <span>Open your Personal Vault to add, view and export everything</span>
        <ArrowRight size={16} className="text-accent" />
      </Link>
    </div>
  );
}

export function GenericWorldModules({ slug }: { slug: string }) {
  if (slug === "personal") return <PersonalModules />;

  const simIds = WORLD_SIMS[slug];
  if (!simIds) return null;
  const sims = simIds.map((id) => SIMULATORS.find((s) => s.id === id)!).filter(Boolean);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {sims.map((sim) => (
        <SimulatorCard key={sim.id} sim={sim} />
      ))}
    </div>
  );
}
