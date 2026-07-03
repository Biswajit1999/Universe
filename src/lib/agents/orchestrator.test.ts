import { describe, expect, it } from "vitest";
import { buildPlan } from "./plans";
import { routeIntent } from "./router";
import { runOrchestrator } from "./orchestrator";

describe("agent routing", () => {
  it.each([
    ["Find the latest arXiv exoplanet papers", "data"],
    ["Simulate an Earth orbit at two astronomical units", "simulation"],
    ["Draft a concise supervisor email", "writing"],
    ["Create a research methodology for biosignatures", "research"],
    ["Open an application on my PC", "system"],
    ["Explain why the sky is blue", "core"],
  ])("routes %s to %s", (prompt, expected) => {
    expect(routeIntent(prompt)).toBe(expected);
  });

  it("builds a bounded plan with stable step ids", () => {
    const plan = buildPlan("research");
    expect(plan).toHaveLength(3);
    expect(plan.map((step) => step.id)).toEqual(["research-1", "research-2", "research-3"]);
  });
});

describe("orchestrator policy", () => {
  it("routes desktop requests to Atlas without executing them", async () => {
    const events = [];
    for await (const event of runOrchestrator({ prompt: "Delete a file on my PC", demoMode: true })) events.push(event);

    expect(events.some((event) => event.type === "blocked")).toBe(true);
    const final = events.find((event) => event.type === "completed");
    expect(final?.agent).toBe("system");
    expect(final?.result?.text).toContain("did not execute");
  });
});
