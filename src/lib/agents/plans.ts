import type { AgentId, AgentPlanStep } from "./types";

const PLAN_LABELS: Record<AgentId, Array<[AgentPlanStep["kind"], string]>> = {
  core: [["reason", "Resolve intent and constraints"], ["compose", "Compose a direct response"]],
  research: [["reason", "Frame the research question"], ["reason", "Assess evidence and methods"], ["compose", "Build the research path"]],
  data: [["reason", "Identify variables and provenance"], ["tool", "Inspect available scientific sources"], ["compose", "Return an access and analysis strategy"]],
  simulation: [["reason", "Define assumptions and units"], ["tool", "Select a transparent model"], ["compose", "Interpret results and limitations"]],
  writing: [["reason", "Identify audience and outcome"], ["compose", "Draft and structure the document"], ["reason", "Check clarity and unsupported claims"]],
  system: [["reason", "Define the exact local action"], ["approval", "Request the narrow required permission"], ["compose", "Report execution or a safe preview"]],
};

export function buildPlan(agent: AgentId): AgentPlanStep[] {
  return PLAN_LABELS[agent].map(([kind, label], index) => ({ id: `${agent}-${index + 1}`, kind, label }));
}
