const fs = require("node:fs");
const path = require("node:path");

const PUBLIC_SECRET_NAMES = new Set([
  "GEMINI_API_KEY",
  "NASA_API_KEY",
  "GITHUB_TOKEN",
]);
const INTERNAL_SECRET_NAMES = new Set(["UNIVERSE_VAULT_KEY"]);

function createSecureStore({ filePath, safeStorage }) {
  function assertAvailable() {
    if (!safeStorage.isEncryptionAvailable()) {
      throw new Error("Windows credential encryption is not available on this device.");
    }
  }

  function readDocument() {
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
      return parsed?.version === 1 && parsed.values ? parsed : { version: 1, values: {} };
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
      return { version: 1, values: {} };
    }
  }

  function writeDocument(document) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const temporary = `${filePath}.tmp`;
    fs.writeFileSync(temporary, JSON.stringify(document, null, 2), { encoding: "utf8", mode: 0o600 });
    fs.renameSync(temporary, filePath);
  }

  function assertName(name, includeInternal = false) {
    const allowed = PUBLIC_SECRET_NAMES.has(name) || (includeInternal && INTERNAL_SECRET_NAMES.has(name));
    if (!allowed) throw new Error("Unsupported credential name.");
  }

  function decrypt(document, name) {
    const encrypted = document.values[name];
    if (!encrypted) return undefined;
    return safeStorage.decryptString(Buffer.from(encrypted, "base64"));
  }

  return Object.freeze({
    list() {
      const document = readDocument();
      return [...PUBLIC_SECRET_NAMES].map((name) => ({ name, configured: Boolean(document.values[name]) }));
    },
    set(name, value) {
      assertAvailable();
      assertName(name);
      const normalized = String(value ?? "").trim();
      if (normalized.length < 8 || normalized.length > 8192) throw new Error("Credential value is invalid.");
      const document = readDocument();
      document.values[name] = safeStorage.encryptString(normalized).toString("base64");
      writeDocument(document);
    },
    remove(name) {
      assertName(name);
      const document = readDocument();
      delete document.values[name];
      writeDocument(document);
    },
    ensureInternal(name, createValue) {
      assertAvailable();
      assertName(name, true);
      const document = readDocument();
      const existing = decrypt(document, name);
      if (existing) return existing;
      const value = createValue();
      document.values[name] = safeStorage.encryptString(value).toString("base64");
      writeDocument(document);
      return value;
    },
    environment() {
      assertAvailable();
      const document = readDocument();
      return [...PUBLIC_SECRET_NAMES, ...INTERNAL_SECRET_NAMES].reduce((environment, name) => {
        const value = decrypt(document, name);
        if (value) environment[name] = value;
        return environment;
      }, {});
    },
  });
}

module.exports = { createSecureStore };
