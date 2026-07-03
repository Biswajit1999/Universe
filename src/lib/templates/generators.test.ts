import { describe, it, expect } from "vitest";
import { generateResearchPlan, planToMarkdown } from "./research";
import { WRITING_TOOLS } from "./writing";

describe("generateResearchPlan", () => {
  it("fills every section for a domain-matched topic", () => {
    const plan = generateResearchPlan("Exoplanet transit recovery in TESS FFIs");
    expect(plan.question.length).toBeGreaterThan(10);
    expect(plan.datasets.length).toBeGreaterThan(0);
    expect(plan.methods.length).toBeGreaterThan(0);
    expect(plan.plots.length).toBeGreaterThan(0);
    expect(plan.limitations.length).toBeGreaterThan(0);
    expect(plan.readme).toContain("#");
    expect(plan.abstract.length).toBeGreaterThan(50);
  });

  it("picks exoplanet-specific datasets for a transit topic", () => {
    const plan = generateResearchPlan("TESS transit search");
    expect(plan.datasets.join(" ").toLowerCase()).toContain("tess");
  });

  it("falls back to generic hints for an unknown topic", () => {
    const plan = generateResearchPlan("underwater basket weaving dynamics");
    expect(plan.datasets.length).toBeGreaterThan(0);
    expect(plan.methods.length).toBeGreaterThan(0);
  });

  it("renders a Markdown document with all headings", () => {
    const md = planToMarkdown(generateResearchPlan("Gaia kinematics"));
    for (const h of ["Research question", "Background", "Datasets", "Methods", "Limitations", "README", "abstract"]) {
      expect(md).toContain(h);
    }
  });
});

describe("WRITING_TOOLS", () => {
  it("exposes exactly the ten documented tools", () => {
    expect(WRITING_TOOLS).toHaveLength(10);
  });

  it("every tool produces non-empty output from empty input", () => {
    for (const tool of WRITING_TOOLS) {
      const out = tool.generate({ topic: "", recipient: "", yourName: "", context: "" });
      expect(out.length).toBeGreaterThan(20);
    }
  });

  it("weaves the topic and name into a research email", () => {
    const tool = WRITING_TOOLS.find((t) => t.id === "research-email")!;
    const out = tool.generate({ topic: "spectral lines", recipient: "Ada", yourName: "Bela", context: "" });
    expect(out).toContain("spectral lines");
    expect(out).toContain("Ada");
    expect(out).toContain("Bela");
  });
});
