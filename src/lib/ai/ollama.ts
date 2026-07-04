import type { AIMessage } from "@/lib/types";

const DEFAULT_BASE_URL = "http://127.0.0.1:11434";

export interface OllamaModel {
  name: string;
  size: number;
  parameterSize?: string;
  quantization?: string;
}

function timeoutSignal(timeoutMs: number, parent?: AbortSignal): { signal: AbortSignal; dispose: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException("Ollama request timed out", "TimeoutError")), timeoutMs);
  const onAbort = () => controller.abort(parent?.reason);
  if (parent?.aborted) onAbort();
  else parent?.addEventListener("abort", onAbort, { once: true });
  return {
    signal: controller.signal,
    dispose: () => {
      clearTimeout(timer);
      parent?.removeEventListener("abort", onAbort);
    },
  };
}

export function resolveOllamaBaseUrl(value = process.env.OLLAMA_BASE_URL): string {
  const candidate = value?.trim() || DEFAULT_BASE_URL;
  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    throw new Error("OLLAMA_BASE_URL is invalid.");
  }
  const loopback = parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost" || parsed.hostname === "::1" || parsed.hostname === "[::1]";
  if (parsed.protocol !== "http:" || !loopback || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("Ollama must use an unauthenticated loopback HTTP address.");
  }
  return parsed.toString().replace(/\/$/, "");
}

export async function listOllamaModels(signal?: AbortSignal): Promise<OllamaModel[]> {
  const timed = timeoutSignal(1200, signal);
  try {
    const response = await fetch(`${resolveOllamaBaseUrl()}/api/tags`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: timed.signal,
    });
    if (!response.ok) throw new Error(`Ollama model list failed (${response.status}).`);
    const data = await response.json() as { models?: Array<{ name?: unknown; size?: unknown; details?: { parameter_size?: unknown; quantization_level?: unknown } }> };
    return (data.models ?? []).flatMap((model) => typeof model.name === "string" ? [{
      name: model.name,
      size: typeof model.size === "number" ? model.size : 0,
      parameterSize: typeof model.details?.parameter_size === "string" ? model.details.parameter_size : undefined,
      quantization: typeof model.details?.quantization_level === "string" ? model.details.quantization_level : undefined,
    }] : []);
  } finally {
    timed.dispose();
  }
}

export async function generateOllama(input: {
  prompt: string;
  history?: AIMessage[];
  systemPrompt: string;
  model: string;
  signal?: AbortSignal;
}): Promise<{ text: string; provider: string }> {
  if (!input.model.trim()) throw new Error("No Ollama model is selected.");
  const timed = timeoutSignal(180_000, input.signal);
  try {
    const response = await fetch(`${resolveOllamaBaseUrl()}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        model: input.model,
        stream: false,
        messages: [
          { role: "system", content: input.systemPrompt },
          ...(input.history ?? []).slice(-10).map((message) => ({ role: message.role, content: message.content })),
          { role: "user", content: input.prompt },
        ],
        options: { temperature: 0.55 },
      }),
      signal: timed.signal,
    });
    if (!response.ok) throw new Error(`Ollama API error (${response.status}): ${(await response.text()).slice(0, 240)}`);
    const data = await response.json() as { message?: { content?: unknown } };
    const text = typeof data.message?.content === "string" ? data.message.content.trim() : "";
    if (!text) throw new Error("Ollama returned an empty response.");
    return { text, provider: `ollama/${input.model}` };
  } finally {
    timed.dispose();
  }
}
