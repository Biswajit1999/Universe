const fs = require("node:fs");
const path = require("node:path");

const BLOCKED_KEY = /secret|token|password|authorization|api.?key|vault.?key/i;

function sanitize(value, depth = 0) {
  if (depth > 4) return "[truncated]";
  if (value instanceof Error) return { name: value.name, message: value.message };
  if (Array.isArray(value)) return value.slice(0, 20).map((item) => sanitize(item, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      BLOCKED_KEY.test(key) ? "[redacted]" : sanitize(item, depth + 1),
    ]));
  }
  if (typeof value === "string") return value.slice(0, 1000);
  return value;
}

function createDiagnostics(logDirectory) {
  const filePath = path.join(logDirectory, "lifecycle.jsonl");
  fs.mkdirSync(logDirectory, { recursive: true });

  return Object.freeze({
    filePath,
    write(event, detail = {}) {
      const entry = { at: new Date().toISOString(), event, detail: sanitize(detail) };
      fs.appendFileSync(filePath, `${JSON.stringify(entry)}\n`, { encoding: "utf8", mode: 0o600 });
    },
    recent(limit = 50) {
      try {
        return fs.readFileSync(filePath, "utf8").trim().split("\n").slice(-Math.min(limit, 100)).map((line) => JSON.parse(line));
      } catch {
        return [];
      }
    },
  });
}

module.exports = { createDiagnostics };
