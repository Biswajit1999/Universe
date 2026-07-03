/** Shared types across UNIVERSE. */

/** Every piece of data in the UI carries an honest provenance label. */
export type DataMode = "demo" | "live" | "estimated" | "simulated";

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
  /** Which provider produced it — mock answers are always labelled. */
  mode?: DataMode;
  agent?: string;
  requestId?: string;
}

export interface AIRequest {
  prompt: string;
  /** Optional context injected by the page (e.g. "user is viewing the NEO feed"). */
  context?: string;
  history?: AIMessage[];
}

export interface AIResponse {
  text: string;
  mode: DataMode;
  provider: string;
}

export type VaultItemType =
  | "note"
  | "idea"
  | "report"
  | "dataset"
  | "simulation"
  | "answer"
  | "email"
  | "project";

export interface VaultItem {
  id: string;
  type: VaultItemType;
  title: string;
  content: string;
  createdAt: number;
}

export interface WorldDef {
  slug: string;
  name: string;
  tagline: string;
  summary: string;
  color: string; // accent hex used by hero visual
  icon: string; // lucide icon name key (see WorldHero)
  concepts: string[];
  modules: { name: string; status: "interactive" | "demo" | "planned"; desc: string }[];
  questions: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  group: "domain" | "topic" | "instrument" | "personal";
  x: number;
  y: number;
  blurb: string;
  questions: string[];
}

export interface GraphEdge {
  from: string;
  to: string;
}

export interface DataSourceDef {
  id: string;
  name: string;
  provides: string;
  status: "wrapped" | "placeholder" | "no-key-needed";
  needsKey: boolean;
  exampleQuery: string;
  docsUrl: string;
}
