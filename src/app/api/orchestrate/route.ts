import { runOrchestrator } from "@/lib/agents/orchestrator";
import type { OrchestratorRequest } from "@/lib/agents/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let input: OrchestratorRequest;
  try {
    input = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!input.prompt?.trim() || input.prompt.length > 12000) {
    return Response.json({ error: "A prompt between 1 and 12,000 characters is required." }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runOrchestrator({ ...input, prompt: input.prompt.trim() }, request.signal)) {
          controller.enqueue(encoder.encode(`event: universe\ndata: ${JSON.stringify(event)}\n\n`));
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          controller.enqueue(encoder.encode(`event: universe\ndata: ${JSON.stringify({ type: "error", label: "Orchestration failed", detail: String(error).slice(0, 300), at: Date.now(), requestId: "unknown" })}\n\n`));
        }
      } finally {
        try { controller.close(); } catch { /* client disconnected */ }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
