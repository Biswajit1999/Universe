import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { randomBytes } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { addMemory, listMemory, removeMemory, searchMemory } from "./repository";
import { listPluginStates, setPluginEnabled } from "@/lib/plugins/repository";
import { assertPrivateDesktopRequest } from "@/lib/server/local-request";

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

describe("private request boundary", () => {
  it("accepts a loopback Host/Origin pair even when the internal URL was reconstructed", () => {
    const request = new Request("http://localhost:3000/api/memory", {
      headers: { host: "127.0.0.1:3199", origin: "http://127.0.0.1:3199", "sec-fetch-site": "same-origin" },
    });
    expect(() => assertPrivateDesktopRequest(request)).not.toThrow();
  });

  it("rejects a non-loopback host", () => {
    const request = new Request("https://universe.example.com/api/memory", { headers: { host: "universe.example.com" } });
    expect(() => assertPrivateDesktopRequest(request)).toThrow("PRIVATE_RUNTIME_REQUIRED");
  });
});
