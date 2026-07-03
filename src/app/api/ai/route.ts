/**
 * POST /api/ai — server-side gateway to a real LLM.
 *
 * If GEMINI_API_KEY is set in .env.local, requests are forwarded to the
 * Gemini API (compatible with Firebase AI Logic keys). Without a key it
 * returns { mode: "demo", text: null } and the client uses the offline
 * mock provider — the app never fakes a live model.
 */
import { NextResponse } from "next/server";
import { UNIVERSE_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { generateGemini } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY; // ← insert your key in .env.local

  let body: { prompt?: string; history?: { role: string; content: string }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.prompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  if (!apiKey) {
    // Honest demo signal — client falls back to the labelled mock provider.
    return NextResponse.json({ mode: "demo", text: null });
  }

  try {
    const generated = await generateGemini({
      prompt: body.prompt,
      history: (body.history ?? []).filter((message): message is { role: "user" | "assistant"; content: string } =>
        (message.role === "user" || message.role === "assistant") && typeof message.content === "string"),
      systemPrompt: UNIVERSE_SYSTEM_PROMPT,
      signal: request.signal,
    });
    return NextResponse.json({ mode: "live", provider: generated.provider, text: generated.text });
  } catch (err) {
    return NextResponse.json(
      { error: "Upstream request failed", detail: String(err).slice(0, 200) },
      { status: 502 },
    );
  }
}
