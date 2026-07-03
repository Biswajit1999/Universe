# Prompt system

How the "Hey Universe" assistant is instructed, and how to extend or replace it.

## Persona

The system prompt lives in [`src/lib/ai/prompts.ts`](../src/lib/ai/prompts.ts)
(`UNIVERSE_SYSTEM_PROMPT`). The assistant is defined as a **research copilot**:

- Intelligent, calm, precise, slightly cinematic — a mission-control voice.
- Never childish or overhyped.
- Separates established science from speculation; quantifies where possible.
- Prefers SI units and shows governing equations.
- Emits clean Markdown for documents (emails, READMEs, abstracts).
- Says plainly when data is demo/simulated, and when unsure, states what observation or
  calculation would settle the question.

## Request flow

```
UI (Assistant / AskButton / CommandBar)
   → askAI({ prompt, context, history }, { demoMode })   // lib/ai/provider.ts
       → if Live Mode: POST /api/ai                       // app/api/ai/route.ts
            → Gemini generateContent (systemInstruction = persona)
            → returns { mode: "live", provider, text }
       → else / on failure: mockGenerate()                // lib/ai/mock.ts
            → returns { mode: "demo", provider, text }
   → response.mode drives the Badge shown next to the reply
```

### Context injection

Pages pass a short `context` string (e.g. `"TESS Light Curve Lab"`). `withContext()` wraps it:

```
Context — the user is currently looking at: <context>

User question: <prompt>
```

This lets the assistant "explain the dashboard data" without the UI dumping raw JSON into the
prompt.

### History

The last 8 turns are forwarded so follow-up questions keep context. History is mapped to Gemini's
`role: "user" | "model"` shape in the route.

## The offline mock provider

`src/lib/ai/mock.ts` is a deterministic, no-network responder used in Demo Mode or when no
`GEMINI_API_KEY` is set. It:

- Recognises a set of **core concepts** (black holes, exoplanets, transit, Fourier, PID, DNA,
  climate, …) and returns compact, correct explainers.
- Detects **intents** (email, research idea, study plan, summary, "what if") and returns useful
  scaffolds that point to the relevant page (Simulation Lab, Writing Studio, Research Copilot).
- Is **always labelled `Demo AI`** — it never impersonates a live model.

This keeps the app genuinely useful with zero keys, while being honest about what it is.

## Swapping / adding a provider

1. Edit [`src/app/api/ai/route.ts`](../src/app/api/ai/route.ts) — add a branch behind a new env
   key (OpenAI, Anthropic, local Ollama, Firebase AI Logic).
2. Return `{ mode: "live", provider, text }`.
3. The client abstraction and fallback in `provider.ts` need no changes.

Because the persona is sent as the system instruction, any provider inherits the same voice.

## Design principle

The prompt system exists to make the assistant **trustworthy**: consistent persona, explicit
context, honest labelling, and graceful degradation. When extending it, preserve those four
properties.
