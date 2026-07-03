import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

interface Envelope {
  version: 1;
  iv: string;
  tag: string;
  ciphertext: string;
}

export function privateRuntimeAvailable(): boolean {
  return Boolean(process.env.UNIVERSE_DATA_DIR && process.env.UNIVERSE_VAULT_KEY);
}

function runtime() {
  const directory = process.env.UNIVERSE_DATA_DIR;
  const encodedKey = process.env.UNIVERSE_VAULT_KEY;
  if (!directory || !encodedKey) throw new Error("Private desktop storage is unavailable.");
  const key = Buffer.from(encodedKey, "base64");
  if (key.length !== 32) throw new Error("Private desktop storage key is invalid.");
  return { directory, key };
}

function safeFilename(filename: string) {
  if (!/^[a-z0-9-]+\.enc$/i.test(filename)) throw new Error("Invalid encrypted store filename.");
  return filename;
}

export async function readEncryptedJson<T>(filename: string, fallback: T): Promise<T> {
  const { directory, key } = runtime();
  try {
    const envelope = JSON.parse(await readFile(path.join(directory, safeFilename(filename)), "utf8")) as Envelope;
    if (envelope.version !== 1) throw new Error("Unsupported encrypted store version.");
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(envelope.iv, "base64"));
    decipher.setAuthTag(Buffer.from(envelope.tag, "base64"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(envelope.ciphertext, "base64")),
      decipher.final(),
    ]).toString("utf8");
    return JSON.parse(plaintext) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

export async function writeEncryptedJson<T>(filename: string, value: T): Promise<void> {
  const { directory, key } = runtime();
  await mkdir(directory, { recursive: true });
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  const envelope: Envelope = {
    version: 1,
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };
  const destination = path.join(directory, safeFilename(filename));
  const temporary = `${destination}.tmp`;
  await writeFile(temporary, JSON.stringify(envelope), { encoding: "utf8", mode: 0o600 });
  await rename(temporary, destination);
}
