import { privateRuntimeAvailable, readEncryptedJson, writeEncryptedJson } from "@/lib/server/encrypted-store";

export type AIProviderPreference = "auto" | "ollama" | "gemini";

export interface AISettings {
  provider: AIProviderPreference;
  ollamaModel: string;
  updatedAt: number;
}

const FILE = "ai-settings.enc";
const DEFAULTS: AISettings = {
  provider: "auto",
  ollamaModel: process.env.OLLAMA_MODEL?.trim() ?? "",
  updatedAt: 0,
};

function validProvider(value: unknown): value is AIProviderPreference {
  return value === "auto" || value === "ollama" || value === "gemini";
}

export async function getAISettings(): Promise<AISettings> {
  if (!privateRuntimeAvailable()) {
    const provider = validProvider(process.env.UNIVERSE_AI_PROVIDER) ? process.env.UNIVERSE_AI_PROVIDER : DEFAULTS.provider;
    return { ...DEFAULTS, provider };
  }
  const stored = await readEncryptedJson<Partial<AISettings>>(FILE, DEFAULTS);
  return {
    provider: validProvider(stored.provider) ? stored.provider : DEFAULTS.provider,
    ollamaModel: typeof stored.ollamaModel === "string" ? stored.ollamaModel.trim().slice(0, 160) : "",
    updatedAt: typeof stored.updatedAt === "number" ? stored.updatedAt : 0,
  };
}

export async function setAISettings(input: { provider: unknown; ollamaModel: unknown }): Promise<AISettings> {
  if (!validProvider(input.provider)) throw new Error("Invalid AI provider.");
  const ollamaModel = typeof input.ollamaModel === "string" ? input.ollamaModel.trim().slice(0, 160) : "";
  if (input.provider === "ollama" && !ollamaModel) throw new Error("Choose an installed Ollama model.");
  const next = { provider: input.provider, ollamaModel, updatedAt: Date.now() } satisfies AISettings;
  await writeEncryptedJson(FILE, next);
  return next;
}
