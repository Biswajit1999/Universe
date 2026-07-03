import type { AIMessage, AIResponse, DataMode } from "@/lib/types";

export type AgentId = "core" | "research" | "data" | "simulation" | "writing" | "system";
export type AgentEventType = "accepted" | "routed" | "planning" | "tool-start" | "tool-result" | "synthesising" | "completed" | "blocked" | "error";

export interface AgentProfile {
  id: AgentId;
  name: string;
  role: string;
  systemFocus: string;
}

export interface AgentPlanStep {
  id: string;
  label: string;
  kind: "reason" | "tool" | "compose" | "approval";
}

export interface AgentToolResult {
  tool: string;
  label: string;
  mode: DataMode | "blocked";
  summary: string;
  data?: unknown;
}

export interface AgentEvent {
  requestId: string;
  type: AgentEventType;
  at: number;
  agent?: AgentId;
  label: string;
  detail?: string;
  plan?: AgentPlanStep[];
  tool?: AgentToolResult;
  result?: AIResponse & { agent: AgentId; requestId: string };
}

export interface OrchestratorRequest {
  prompt: string;
  context?: string;
  history?: AIMessage[];
  demoMode?: boolean;
}

export interface OrchestratorOptions {
  signal?: AbortSignal;
  onEvent?: (event: AgentEvent) => void;
}
