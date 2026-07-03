export type PluginId = "gemini" | "nasa" | "science" | "desktop";
export type PluginRisk = "low" | "medium" | "high";

export interface PluginManifest {
  id: PluginId;
  name: string;
  version: string;
  description: string;
  scope: "cloud" | "builtin" | "local";
  risk: PluginRisk;
  defaultEnabled: boolean;
  capabilities: string[];
  tools: string[];
}

export const PLUGIN_MANIFESTS: PluginManifest[] = [
  {
    id: "gemini",
    name: "Gemini intelligence",
    version: "1.0.0",
    description: "Cloud reasoning and response synthesis through the configured Gemini model.",
    scope: "cloud",
    risk: "medium",
    defaultEnabled: true,
    capabilities: ["network.google-ai", "conversation.read"],
    tools: ["generate-response"],
  },
  {
    id: "nasa",
    name: "NASA science data",
    version: "1.0.0",
    description: "Read-only APOD and near-Earth object data from NASA APIs.",
    scope: "cloud",
    risk: "low",
    defaultEnabled: true,
    capabilities: ["network.nasa", "data.read"],
    tools: ["nasa-apod", "nasa-neo"],
  },
  {
    id: "science",
    name: "Scientific toolkit",
    version: "1.0.0",
    description: "Local constants, transparent models and deterministic scientific calculations.",
    scope: "builtin",
    risk: "low",
    defaultEnabled: true,
    capabilities: ["compute.local"],
    tools: ["constants", "orbital-period", "gravity", "transit-depth"],
  },
  {
    id: "desktop",
    name: "Atlas desktop tools",
    version: "0.1.0",
    description: "Owner-approved file selection, scoped reads/writes and allow-listed application launches.",
    scope: "local",
    risk: "high",
    defaultEnabled: false,
    capabilities: ["files.pick", "files.read", "files.write", "apps.launch"],
    tools: ["pick-file", "read-selected-file", "write-selected-file", "launch-approved-app"],
  },
];

export function pluginManifest(id: string) {
  return PLUGIN_MANIFESTS.find((manifest) => manifest.id === id);
}
