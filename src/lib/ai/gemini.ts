import type { AIMessage } from "@/lib/types";

export async function generateGemini(input: {
  prompt: string;
  history?: AIMessage[];
  systemPrompt: string;
  signal?: AbortSignal;
}): Promise<{ text: string; provider: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  if (!apiKey) throw new Error("Gemini is not configured.");

  const contents = [
    ...(input.history ?? []).slice(-10).map((message) => ({
      role: message.role === "assistant" ? "model" : "user",
      parts: [{ text: message.content }],
    })),
    { role: "user", parts: [{ text: input.prompt }] },
  ];
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: input.systemPrompt }] },
      contents,
      generationConfig: { temperature: 0.55, maxOutputTokens: 2048 },
    }),
    signal: input.signal,
  });
  if (!response.ok) throw new Error(`Gemini API error (${response.status}): ${(await response.text()).slice(0, 240)}`);
  const data = await response.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text).join("");
  if (!text) throw new Error("Gemini returned an empty response.");
  return { text, provider: `gemini/${model}` };
}
