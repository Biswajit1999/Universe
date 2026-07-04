import type { AgentId } from "./types";

const SIGNALS: Array<{ agent: Exclude<AgentId, "core">; terms: RegExp }> = [
  { agent: "system", terms: /\b(open|launch|rename|move|delete|create folder|write file|read file|on my pc|on my computer|desktop|application|clipboard)\b/i },
  { agent: "writing", terms: /\b(write|rewrite|draft|email|abstract|proposal|readme|cover letter|linkedin|summarise|summarize)\b/i },
  { agent: "simulation", terms: /\b(simulate|calculate|equation|model|what if|orbital|gravity|blackbody|transit depth|signal.to.noise|pid|sir model)\b/i },
  { agent: "data", terms: /\b(dataset|data source|nasa|apod|arxiv|gaia|mast|catalog|catalogue|latest paper|live space|query|weather|forecast|temperature|rain|snow|wind)\b/i },
  { agent: "research", terms: /\b(research|hypothesis|literature|methodology|experiment|study plan|research question|evidence|citation)\b/i },
];

export function routeIntent(prompt: string): AgentId {
  const scores = new Map<AgentId, number>();
  for (const signal of SIGNALS) {
    const matches = prompt.match(new RegExp(signal.terms.source, `${signal.terms.flags.includes("g") ? signal.terms.flags : `${signal.terms.flags}g`}`));
    scores.set(signal.agent, matches?.length ?? 0);
  }
  const ranked = [...scores.entries()].sort((left, right) => right[1] - left[1]);
  return ranked[0]?.[1] ? ranked[0][0] : "core";
}
