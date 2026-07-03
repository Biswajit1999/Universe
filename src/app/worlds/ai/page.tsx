import { WorldOverview } from "@/components/worlds/WorldOverview";
import { getWorld } from "@/lib/data/worlds";
import { NeuralNetViz } from "@/components/worlds/ai/NeuralNetViz";
import { EmbeddingDemo } from "@/components/worlds/ai/EmbeddingDemo";
import { PromptLab } from "@/components/worlds/ai/PromptLab";
import { AlertTriangle } from "lucide-react";

export const metadata = { title: "Artificial Intelligence · UNIVERSE" };

export default function AIWorld() {
  const world = getWorld("ai")!;
  return (
    <WorldOverview
      world={world}
      interactive={
        <div className="grid gap-4 lg:grid-cols-2">
          <NeuralNetViz />
          <EmbeddingDemo />
          <PromptLab />
          <div className="glass p-5">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <AlertTriangle size={15} className="text-amber-400" /> AI Ethics &amp; Safety notes
            </h4>
            <ul className="space-y-2 text-xs text-muted">
              <li>• <span className="text-ink">Label AI output.</span> UNIVERSE marks every generated answer Demo or Live — never pass model text off as verified fact.</li>
              <li>• <span className="text-ink">Hallucination.</span> LLMs are fluent, not truthful by construction. Always verify citations and numbers against a source.</li>
              <li>• <span className="text-ink">Bias &amp; provenance.</span> Models inherit their training data. Ask whose perspective is represented.</li>
              <li>• <span className="text-ink">Human oversight.</span> Keep a person accountable for decisions; use AI to draft and explore, not to autonomously act on high-stakes choices.</li>
              <li>• <span className="text-ink">Privacy.</span> Don&apos;t send sensitive data to third-party models without consent and a clear retention policy.</li>
            </ul>
          </div>
        </div>
      }
    />
  );
}
