import type { AIMessage, AIResponse } from "@/lib/types";
import { generateGemini } from "./gemini";
import { generateOllama } from "./ollama";
import { getAISettings } from "./settings";
import { pluginEnabled } from "@/lib/plugins/repository";

export async function generateConfiguredAI(input: {
  prompt: string;
  history?: AIMessage[];
  systemPrompt: string;
  signal?: AbortSignal;
}): Promise<AIResponse | null> {
  const settings = await getAISettings();
  const localEnabled = await pluginEnabled("ollama");
  const cloudEnabled = await pluginEnabled("gemini");

  if (settings.provider === "ollama") {
    if (!localEnabled) throw new Error("The Ollama plugin is disabled.");
    const generated = await generateOllama({ ...input, model: settings.ollamaModel });
    return { ...generated, mode: "local" };
  }

  if (settings.provider === "gemini") {
    if (!cloudEnabled || !process.env.GEMINI_API_KEY) return null;
    const generated = await generateGemini(input);
    return { ...generated, mode: "live" };
  }

  if (localEnabled && settings.ollamaModel) {
    try {
      const generated = await generateOllama({ ...input, model: settings.ollamaModel });
      return { ...generated, mode: "local" };
    } catch (error) {
      if (input.signal?.aborted) throw error;
      // Auto mode may fall through to the explicitly configured cloud provider.
    }
  }
  if (cloudEnabled && process.env.GEMINI_API_KEY) {
    const generated = await generateGemini(input);
    return { ...generated, mode: "live" };
  }
  return null;
}
