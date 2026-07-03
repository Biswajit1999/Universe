"use client";
import { useState } from "react";
import { Panel, PanelHeader } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { AskButton } from "@/components/ui/AskButton";

/** Shows how framing (role, format, constraints) reshapes a prompt. */
const FRAMES = [
  { id: "plain", label: "Plain", wrap: (t: string) => t },
  { id: "role", label: "+ Role", wrap: (t: string) => `You are a meticulous domain expert. ${t}` },
  { id: "format", label: "+ Format", wrap: (t: string) => `You are a meticulous domain expert. ${t}\n\nRespond as: (1) one-sentence answer, (2) three bullet reasons, (3) one caveat.` },
  { id: "constraint", label: "+ Constraints", wrap: (t: string) => `You are a meticulous domain expert. ${t}\n\nRules: cite an equation if relevant, use SI units, and flag any assumption. Format: answer → reasons → caveat.` },
];

export function PromptLab() {
  const [task, setTask] = useState("Explain why the sky is blue.");
  const [frame, setFrame] = useState(3);
  const built = FRAMES[frame].wrap(task.trim() || "…");

  return (
    <Panel>
      <PanelHeader title="Prompt Engineering Lab" subtitle="See how framing changes a prompt" right={<Badge mode="demo" />} />
      <label className="block text-xs text-muted">Your task</label>
      <input
        value={task}
        onChange={(e) => setTask(e.target.value)}
        className="mt-1 w-full rounded-lg border border-edge bg-white/5 px-3 py-2 text-sm text-ink"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {FRAMES.map((f, i) => (
          <button
            key={f.id}
            onClick={() => setFrame(i)}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              frame === i ? "border-accent/50 bg-accent/15 text-ink" : "border-edge text-muted hover:text-ink"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <pre className="mt-3 whitespace-pre-wrap rounded-lg border border-edge bg-black/30 p-3 text-xs text-ink scroll-thin">
        {built}
      </pre>
      <div className="mt-3">
        <AskButton size="sm" label="Run this prompt" prompt={built} context="Prompt Engineering Lab" />
      </div>
      <p className="mt-3 text-xs text-muted">
        Same task, richer framing: adding a role, an explicit output format, and constraints reliably improves structure and reduces vagueness.
      </p>
    </Panel>
  );
}
