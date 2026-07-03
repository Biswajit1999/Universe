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

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY; // ← insert your key in .env.local
  const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

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
    const contents = [
      ...(body.history ?? []).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
      { role: "user", parts: [{ text: body.prompt }] },
    ];

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: UNIVERSE_SYSTEM_PROMPT }] },
          contents,
          generationConfig: { temperature: 0.6, maxOutputTokens: 2048 },
        }),
      },
    );

    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: `Gemini API error (${res.status})`, detail: detail.slice(0, 300) },
        { status: 502 },
      );
    }

    const data = await res.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join("");

    if (!text) {
      return NextResponse.json({ error: "Empty model response" }, { status: 502 });
    }
    return NextResponse.json({ mode: "live", provider: `gemini/${model}`, text });
  } catch (err) {
    return NextResponse.json(
      { error: "Upstream request failed", detail: String(err).slice(0, 200) },
      { status: 502 },
    );
  }
}
