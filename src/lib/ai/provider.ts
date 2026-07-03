/**
 * AI provider abstraction.
 *
 * askAI() tries the live provider (Gemini via /api/ai) unless the app is in
 * Demo Mode; if the server has no key or errors, it falls back to the offline
 * mock provider. The response always carries `mode` + `provider` so the UI
 * can label the answer honestly ("Live" vs "Demo AI").
 *
 * To add a provider (OpenAI, local Ollama, Firebase AI Logic…):
 *  1. Implement generate(req): Promise<AIResponse>
 *  2. Wire it in /src/app/api/ai/route.ts behind its env key
 */
import type { AIRequest, AIResponse } from "@/lib/types";
import { mockGenerate } from "./mock";
import { withContext } from "./prompts";

async function liveGenerate(req: AIRequest): Promise<AIResponse | null> {
  try {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: withContext(req.prompt, req.context),
        history: req.history?.slice(-8) ?? [],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { text?: string; provider?: string };
    if (!data.text) return null; // server reports demo mode (no key configured)
    return { text: data.text, mode: "live", provider: data.provider ?? "gemini" };
  } catch {
    return null;
  }
}

export async function askAI(
  req: AIRequest,
  opts: { demoMode: boolean } = { demoMode: true },
): Promise<AIResponse> {
  if (!opts.demoMode) {
    const live = await liveGenerate(req);
    if (live) return live;
    // Graceful fallback — never fail silently, never fake "live".
  }
  return mockGenerate(req);
}
