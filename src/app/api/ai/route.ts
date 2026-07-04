/**
 * POST /api/ai — server-side gateway to the owner's configured model.
 *
 * Routes to loopback-only Ollama, Gemini, or local-first automatic selection.
 * If no configured model is available it returns { mode: "demo", text: null }
 * so the client uses the labelled offline provider; the app never fakes a result.
 */
import { NextResponse } from "next/server";
import { UNIVERSE_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { generateConfiguredAI } from "@/lib/ai/configured";

export async function POST(request: Request) {
  let body: { prompt?: string; history?: { role: string; content: string }[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body.prompt) {
    return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
  }

  try {
    const generated = await generateConfiguredAI({
      prompt: body.prompt,
      history: (body.history ?? []).filter((message): message is { role: "user" | "assistant"; content: string } =>
        (message.role === "user" || message.role === "assistant") && typeof message.content === "string"),
      systemPrompt: UNIVERSE_SYSTEM_PROMPT,
      signal: request.signal,
    });
    if (!generated) return NextResponse.json({ mode: "demo", text: null });
    return NextResponse.json(generated);
  } catch (err) {
    return NextResponse.json(
      { error: "Upstream request failed", detail: String(err).slice(0, 200) },
      { status: 502 },
    );
  }
}
