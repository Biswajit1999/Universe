import { randomUUID } from "node:crypto";
import { UNIVERSE_SYSTEM_PROMPT, withContext } from "@/lib/ai/prompts";
import { generateGemini } from "@/lib/ai/gemini";
import { mockGenerate } from "@/lib/ai/mock";
import { AGENT_PROFILES } from "./profiles";
import { buildPlan } from "./plans";
import { routeIntent } from "./router";
import { runReadOnlyTools } from "./tools";
import { searchMemory } from "@/lib/memory/repository";
import { pluginEnabled } from "@/lib/plugins/repository";
import type { AgentEvent, OrchestratorRequest } from "./types";

function event(requestId: string, type: AgentEvent["type"], label: string, detail?: string): AgentEvent {
  return { requestId, type, label, detail, at: Date.now() };
}

function assertActive(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Request cancelled", "AbortError");
}

export async function* runOrchestrator(input: OrchestratorRequest, signal?: AbortSignal): AsyncGenerator<AgentEvent> {
  const requestId = randomUUID();
  assertActive(signal);
  yield event(requestId, "accepted", "Request authenticated");

  const agent = routeIntent(input.prompt);
  const profile = AGENT_PROFILES[agent];
  yield { ...event(requestId, "routed", `${profile.name} selected`, profile.role), agent };

  const plan = buildPlan(agent);
  yield { ...event(requestId, "planning", "Execution plan prepared", `${plan.length} bounded steps`), agent, plan };

  const memory = input.useMemory ? await searchMemory(input.prompt, 4) : [];
  const memoryTool = memory.length ? [{
    tool: "memory.retrieve",
    label: "Encrypted personal memory",
    mode: "live" as const,
    summary: memory.map((record) => `${record.title}: ${record.content.slice(0, 900)}`).join("\n"),
    data: memory.map((record) => ({ id: record.id, title: record.title, tags: record.tags })),
  }] : [];
  const tools = [...memoryTool, ...await runReadOnlyTools(agent, input.prompt, signal)];
  for (const tool of tools) {
    assertActive(signal);
    yield { ...event(requestId, "tool-start", `Calling ${tool.label}`), agent, tool: { ...tool, summary: "" } };
    yield {
      ...event(requestId, tool.mode === "blocked" ? "blocked" : "tool-result", tool.mode === "blocked" ? "Action requires approval" : `${tool.label} returned`, tool.summary),
      agent,
      tool,
    };
  }

  assertActive(signal);
  yield { ...event(requestId, "synthesising", `${profile.name} is composing the response`), agent };
  const toolContext = tools.length
    ? `\n\nTool evidence (preserve provenance labels):\n${tools.map((tool) => `- [${tool.mode}] ${tool.label}: ${tool.summary}`).join("\n")}`
    : "";
  const prompt = `${withContext(input.prompt, input.context)}${toolContext}`;
  let response;
  if (!input.demoMode && process.env.GEMINI_API_KEY && await pluginEnabled("gemini")) {
    const generated = await generateGemini({
      prompt,
      history: input.history,
      systemPrompt: `${UNIVERSE_SYSTEM_PROMPT}\n\nActive specialist: ${profile.name}, ${profile.role}. ${profile.systemFocus}`,
      signal,
    });
    response = { text: generated.text, provider: generated.provider, mode: "live" as const };
  } else if (agent === "system") {
    response = {
      text: `**Atlas prepared the request but did not execute it.**\n\n${tools[0]?.summary}\n\nOpen the approval centre in the desktop application once the requested capability is enabled.`,
      provider: "universe-policy",
      mode: "demo" as const,
    };
  } else if (tools.some((tool) => tool.mode === "simulated")) {
    const simulated = tools.filter((tool) => tool.mode === "simulated");
    response = {
      text: `## Newton simulation\n\n${simulated.map((tool) => tool.summary).join("\n\n")}\n\n**Provenance:** simulated locally with transparent first-order models. Verify assumptions before research or operational use.`,
      provider: "universe-simulation",
      mode: "simulated" as const,
    };
  } else {
    response = await mockGenerate({ prompt, context: input.context, history: input.history });
  }

  assertActive(signal);
  yield {
    ...event(requestId, "completed", `${profile.name} completed the request`),
    agent,
    result: { ...response, agent, requestId },
  };
}
