import type { AIResponse } from "@/lib/types";
import type { AgentEvent, AgentId, OrchestratorOptions, OrchestratorRequest } from "./types";

export async function askOrchestrator(
  input: OrchestratorRequest,
  options: OrchestratorOptions = {},
): Promise<AIResponse & { agent: AgentId; requestId: string }> {
  const response = await fetch("/api/orchestrate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify(input),
    signal: options.signal,
  });
  if (!response.ok || !response.body) throw new Error(`Orchestrator unavailable (${response.status}).`);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finalResult: AgentEvent["result"];

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const frames = buffer.split("\n\n");
    buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const data = frame.split("\n").find((line) => line.startsWith("data: "))?.slice(6);
      if (!data) continue;
      const event = JSON.parse(data) as AgentEvent;
      options.onEvent?.(event);
      if (event.type === "completed" && event.result) finalResult = event.result;
      if (event.type === "error") throw new Error(event.detail || event.label);
    }
    if (done) break;
  }
  if (!finalResult) throw new Error("The orchestrator ended without a response.");
  return finalResult;
}
