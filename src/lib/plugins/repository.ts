import { privateRuntimeAvailable, readEncryptedJson, writeEncryptedJson } from "@/lib/server/encrypted-store";
import { PLUGIN_MANIFESTS, pluginManifest, type PluginId } from "./manifests";

export interface PluginState {
  id: PluginId;
  enabled: boolean;
  updatedAt: number;
}

const FILE = "plugins.enc";
let writeQueue = Promise.resolve();

export async function listPluginStates(): Promise<PluginState[]> {
  const defaults = PLUGIN_MANIFESTS.map((manifest) => ({ id: manifest.id, enabled: manifest.defaultEnabled, updatedAt: 0 }));
  if (!privateRuntimeAvailable()) return defaults;
  const stored = await readEncryptedJson<PluginState[]>(FILE, []);
  return defaults.map((item) => stored.find((candidate) => candidate.id === item.id) ?? item);
}

export async function setPluginEnabled(id: string, enabled: boolean): Promise<PluginState> {
  const manifest = pluginManifest(id);
  if (!manifest) throw new Error("Unknown plugin.");
  const next: PluginState = { id: manifest.id, enabled, updatedAt: Date.now() };
  writeQueue = writeQueue.then(async () => {
    const states = await listPluginStates();
    await writeEncryptedJson(FILE, [...states.filter((state) => state.id !== manifest.id), next]);
  });
  await writeQueue;
  return next;
}

export async function pluginEnabled(id: PluginId): Promise<boolean> {
  return (await listPluginStates()).find((state) => state.id === id)?.enabled ?? false;
}
