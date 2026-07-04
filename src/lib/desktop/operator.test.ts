import { afterEach, describe, expect, it } from "vitest";
import { createRequire } from "node:module";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const require = createRequire(import.meta.url);
const { createOperator } = require("../../../electron/operator.cjs");
const directories: string[] = [];

function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "universe-operator-"));
  directories.push(directory);
  const selectedFile = join(directory, "notes.md");
  writeFileSync(selectedFile, "original", "utf8");
  const messages: Array<Record<string, unknown>> = [];
  const operator = createOperator({
    stateFile: join(directory, "operator.json"),
    backupDirectory: join(directory, "backups"),
    dialog: {
      showMessageBox: async (_window: unknown, options: Record<string, unknown>) => { messages.push(options); return { response: 0 }; },
      showOpenDialog: async () => ({ canceled: false, filePaths: [selectedFile] }),
    },
    shell: { openExternal: async () => undefined, openPath: async () => "" },
    diagnostics: { write: () => undefined },
    getWindow: () => null,
  });
  return { operator, directory, selectedFile, messages };
}

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe("Atlas permission broker", () => {
  it("cannot inspect files before explicit enablement and selection", async () => {
    const { operator } = fixture();
    expect(() => operator.readSelectedFile("made-up-token")).toThrow("ATLAS_DISABLED");
    await operator.setEnabled(true);
    expect(() => operator.readSelectedFile("made-up-token")).toThrow("FILE_SELECTION_EXPIRED");
  });

  it("scopes reads and confirmed writes to the owner-selected file with a backup", async () => {
    const { operator, directory, selectedFile, messages } = fixture();
    await operator.setEnabled(true);
    const selected = await operator.pickTextFile();
    expect(operator.readSelectedFile(selected.token).content).toBe("original");
    const result = await operator.writeSelectedFile(selected.token, "updated");
    expect(result.written).toBe(true);
    expect(readFileSync(selectedFile, "utf8")).toBe("updated");
    expect(existsSync(join(directory, "backups", result.backupName))).toBe(true);
    expect(messages.some((message) => message.title === "Approve file write")).toBe(true);
  });

  it("rejects applications outside the allow-list", async () => {
    const { operator } = fixture();
    await operator.setEnabled(true);
    await expect(operator.launchApplication("powershell")).rejects.toThrow("APPLICATION_NOT_ALLOWED");
  });

  it("launches an allow-listed music service after one-time Atlas enablement", async () => {
    const { operator, messages } = fixture();
    await operator.setEnabled(true);
    await expect(operator.launchApplication("spotify")).resolves.toMatchObject({ launched: true, cancelled: false });
    expect(messages.filter((message) => message.title === "Approve application launch")).toHaveLength(0);
  });
});
