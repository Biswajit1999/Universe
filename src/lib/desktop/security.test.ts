import { afterEach, describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { createSecureStore } = require("../../../electron/secure-store.cjs");
const { createDiagnostics } = require("../../../electron/diagnostics.cjs");
const temporaryDirectories: string[] = [];

function temporaryDirectory() {
  const directory = mkdtempSync(join(tmpdir(), "universe-security-"));
  temporaryDirectories.push(directory);
  return directory;
}

const safeStorage = {
  isEncryptionAvailable: () => true,
  encryptString: (value: string) => Buffer.from(`protected:${value}`, "utf8"),
  decryptString: (value: Buffer) => value.toString("utf8").replace(/^protected:/, ""),
};

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe("desktop credential store", () => {
  it("stores encrypted values and exposes status only", () => {
    const filePath = join(temporaryDirectory(), "credentials.json");
    const store = createSecureStore({ filePath, safeStorage });
    store.set("GEMINI_API_KEY", "private-gemini-key");

    expect(store.list()).toContainEqual({ name: "GEMINI_API_KEY", configured: true });
    expect(store.environment().GEMINI_API_KEY).toBe("private-gemini-key");
    expect(readFileSync(filePath, "utf8")).not.toContain("private-gemini-key");
  });

  it("rejects arbitrary credential names", () => {
    const store = createSecureStore({ filePath: join(temporaryDirectory(), "credentials.json"), safeStorage });
    expect(() => store.set("UNTRUSTED_SECRET", "a-secret-value")).toThrow("Unsupported credential name");
  });
});

describe("desktop diagnostics", () => {
  it("redacts secret-shaped fields", () => {
    const directory = temporaryDirectory();
    const diagnostics = createDiagnostics(directory);
    diagnostics.write("connector.test", { apiKey: "do-not-log", nested: { token: "also-private" }, status: "ok" });
    const written = readFileSync(diagnostics.filePath, "utf8");
    expect(written).not.toContain("do-not-log");
    expect(written).not.toContain("also-private");
    expect(written).toContain("[redacted]");
    expect(written).toContain('"status":"ok"');
  });
});
