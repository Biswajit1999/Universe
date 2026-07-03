"use client";
import { useState } from "react";
import { Wand2, Download, Save, Copy, Check } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Markdown } from "@/components/ui/Markdown";
import { AskButton } from "@/components/ui/AskButton";
import { useVault } from "@/lib/state/vault";
import { generateResearchPlan, planToMarkdown, type ResearchPlan } from "@/lib/templates/research";
import { downloadMarkdown, copyToClipboard } from "@/lib/utils";

const EXAMPLES = ["Exoplanet transit recovery in TESS FFIs", "Gaia kinematics of nearby clusters", "Spectrograph thermal stability with model-predictive control", "LLM world models"];

export function ResearchCopilot() {
  const { add } = useVault();
  const [topic, setTopic] = useState("");
  const [plan, setPlan] = useState<ResearchPlan | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  function run(t: string) {
    if (!t.trim()) return;
    setPlan(generateResearchPlan(t));
  }

  return (
    <div className="space-y-6">
      <Panel>
        <label className="block text-sm font-medium">Research topic</label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && run(topic)}
            placeholder="e.g. Exoplanet transit recovery in TESS full-frame images"
            className="flex-1 rounded-lg border border-edge bg-white/5 px-3 py-2.5 text-sm text-ink placeholder:text-muted"
          />
          <button
            onClick={() => run(topic)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent/20 px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-accent/30"
          >
            <Wand2 size={16} /> Generate plan
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((e) => (
            <button
              key={e}
              onClick={() => {
                setTopic(e);
                run(e);
              }}
              className="rounded-full border border-edge px-3 py-1 text-xs text-muted transition hover:text-accent"
            >
              {e}
            </button>
          ))}
        </div>
      </Panel>

      {plan && (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => downloadMarkdown(`research-plan-${plan.topic.slice(0, 20)}`, planToMarkdown(plan))}
              className="inline-flex items-center gap-2 rounded-lg border border-edge px-3 py-2 text-sm hover:bg-white/5"
            >
              <Download size={15} /> Export Markdown
            </button>
            <button
              onClick={async () => {
                setCopied(await copyToClipboard(planToMarkdown(plan)));
                setTimeout(() => setCopied(false), 1500);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-edge px-3 py-2 text-sm hover:bg-white/5"
            >
              {copied ? <Check size={15} className="text-good" /> : <Copy size={15} />} {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={() => {
                add({ type: "report", title: `Research plan — ${plan.topic}`, content: planToMarkdown(plan) });
                setSaved(true);
                setTimeout(() => setSaved(false), 1500);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-edge px-3 py-2 text-sm hover:bg-white/5"
            >
              <Save size={15} /> {saved ? "Saved to Vault" : "Save to Vault"}
            </button>
            <AskButton label="Refine with Universe" prompt={`Critique and improve this research plan for "${plan.topic}". Tighten the question and flag the biggest risk.`} context="Research Copilot plan" />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Section title="Research question">{plan.question}</Section>
            <Section title="Background">{plan.background}</Section>
            <ListSection title="Datasets" items={plan.datasets} />
            <ListSection title="Methods" items={plan.methods} />
            <ListSection title="Planned figures" items={plan.plots} />
            <ListSection title="Limitations" items={plan.limitations} />
          </div>

          <Panel>
            <h3 className="mb-2 text-sm font-semibold">Suggested repository structure</h3>
            <pre className="overflow-x-auto rounded-lg border border-edge bg-black/30 p-3 text-xs scroll-thin">{plan.repoStructure}</pre>
          </Panel>

          <Panel>
            <h3 className="mb-2 text-sm font-semibold">README draft</h3>
            <Markdown content={plan.readme} />
          </Panel>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel>
              <h3 className="mb-2 text-sm font-semibold">Paper-style abstract</h3>
              <p className="text-sm text-muted">{plan.abstract}</p>
            </Panel>
            <Panel>
              <h3 className="mb-2 text-sm font-semibold">LinkedIn post</h3>
              <p className="whitespace-pre-wrap text-sm text-muted">{plan.linkedin}</p>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Panel>
      <h3 className="mb-1.5 text-sm font-semibold">{title}</h3>
      <p className="text-sm text-muted">{children}</p>
    </Panel>
  );
}

function ListSection({ title, items }: { title: string; items: string[] }) {
  return (
    <Panel>
      <h3 className="mb-1.5 text-sm font-semibold">{title}</h3>
      <ul className="space-y-1 text-sm text-muted">
        {items.map((it) => (
          <li key={it}>• {it}</li>
        ))}
      </ul>
    </Panel>
  );
}
