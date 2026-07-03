export type AgentStatus = "ready" | "standby" | "locked";

export interface UniverseAgent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  accent: string;
  capabilities: string[];
}

/** Built-in specialists available to the personal orchestrator. */
export const UNIVERSE_AGENTS: UniverseAgent[] = [
  {
    id: "research",
    name: "Kepler",
    role: "Research strategist",
    status: "ready",
    accent: "#67e8f9",
    capabilities: ["literature synthesis", "research plans", "source reasoning"],
  },
  {
    id: "data",
    name: "Vega",
    role: "Scientific data navigator",
    status: "ready",
    accent: "#818cf8",
    capabilities: ["NASA feeds", "arXiv", "dataset discovery"],
  },
  {
    id: "simulation",
    name: "Newton",
    role: "Simulation specialist",
    status: "ready",
    accent: "#c4b5fd",
    capabilities: ["physics models", "scenario analysis", "equation checks"],
  },
  {
    id: "writing",
    name: "Muse",
    role: "Scientific writing specialist",
    status: "ready",
    accent: "#a5f3fc",
    capabilities: ["documents", "summaries", "audience adaptation"],
  },
  {
    id: "system",
    name: "Atlas",
    role: "Local system operator",
    status: "locked",
    accent: "#fda4af",
    capabilities: ["files", "applications", "approved automations"],
  },
];

export interface UniversePlugin {
  id: string;
  name: string;
  scope: "cloud" | "local" | "builtin";
  state: "connected" | "available" | "desktop-only";
}

export const UNIVERSE_PLUGINS: UniversePlugin[] = [
  { id: "gemini", name: "Gemini intelligence", scope: "cloud", state: "available" },
  { id: "nasa", name: "NASA live data", scope: "cloud", state: "available" },
  { id: "science", name: "Science toolkit", scope: "builtin", state: "available" },
  { id: "desktop", name: "Desktop bridge", scope: "local", state: "desktop-only" },
];
