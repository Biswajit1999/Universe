import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getAISettings, setAISettings } from "./settings";

let directory = "";

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "universe-ai-settings-"));
  process.env.UNIVERSE_DATA_DIR = directory;
  process.env.UNIVERSE_VAULT_KEY = randomBytes(32).toString("base64");
});

afterEach(() => {
  delete process.env.UNIVERSE_DATA_DIR;
  delete process.env.UNIVERSE_VAULT_KEY;
  rmSync(directory, { recursive: true, force: true });
});

describe("encrypted AI settings", () => {
  it("persists a local-only route without plaintext metadata", async () => {
    await setAISettings({ provider: "ollama", ollamaModel: "gemma3:4b" });
    await expect(getAISettings()).resolves.toMatchObject({ provider: "ollama", ollamaModel: "gemma3:4b" });
    const envelope = readFileSync(join(directory, "ai-settings.enc"), "utf8");
    expect(envelope).not.toContain("gemma3");
    expect(envelope).not.toContain("ollama");
  });

  it("requires a model for local-only routing", async () => {
    await expect(setAISettings({ provider: "ollama", ollamaModel: "" })).rejects.toThrow("Choose an installed");
  });
});
