import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { addMemory, listMemory, removeMemory, searchMemory } from "./repository";
import { listPluginStates, setPluginEnabled } from "@/lib/plugins/repository";

let directory = "";

beforeEach(() => {
  directory = mkdtempSync(join(tmpdir(), "universe-memory-"));
  process.env.UNIVERSE_DATA_DIR = directory;
  process.env.UNIVERSE_VAULT_KEY = randomBytes(32).toString("base64");
});

afterEach(() => {
  delete process.env.UNIVERSE_DATA_DIR;
  delete process.env.UNIVERSE_VAULT_KEY;
  rmSync(directory, { recursive: true, force: true });
});

describe("encrypted memory", () => {
  it("persists, retrieves and removes explicit records without plaintext on disk", async () => {
    const item = await addMemory({
      title: "Exoplanet project",
      content: "Prioritise transmission spectroscopy of temperate sub-Neptunes.",
      tags: ["JWST", "exoplanets"],
    });
    expect(await listMemory()).toHaveLength(1);
    expect((await searchMemory("temperate exoplanet spectroscopy"))[0]?.id).toBe(item.id);
    expect(readFileSync(join(directory, "memory.enc"), "utf8")).not.toContain("transmission spectroscopy");
    expect(await removeMemory(item.id)).toBe(true);
    expect(await listMemory()).toHaveLength(0);
  });
});

describe("plugin state", () => {
  it("stores owner-controlled enablement in the encrypted runtime", async () => {
    await setPluginEnabled("nasa", false);
    expect((await listPluginStates()).find((plugin) => plugin.id === "nasa")?.enabled).toBe(false);
    expect(readFileSync(join(directory, "plugins.enc"), "utf8")).not.toContain('"enabled":false');
  });
});
