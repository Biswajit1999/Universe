import { randomUUID } from "node:crypto";
import { privateRuntimeAvailable, readEncryptedJson, writeEncryptedJson } from "@/lib/server/encrypted-store";
import type { MemoryRecord } from "./types";

const FILE = "memory.enc";
let writeQueue = Promise.resolve();

export function memoryAvailable() {
  return privateRuntimeAvailable();
}

export async function listMemory(): Promise<MemoryRecord[]> {
  if (!memoryAvailable()) return [];
  return readEncryptedJson<MemoryRecord[]>(FILE, []);
}

export async function addMemory(input: { title: string; content: string; tags?: string[] }): Promise<MemoryRecord> {
  const now = Date.now();
  const record: MemoryRecord = {
    id: randomUUID(),
    title: input.title.trim().slice(0, 160),
    content: input.content.trim().slice(0, 20000),
    tags: (input.tags ?? []).map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 12),
    createdAt: now,
    updatedAt: now,
    source: "explicit",
  };
  if (!record.title || !record.content) throw new Error("Memory title and content are required.");
  writeQueue = writeQueue.then(async () => {
    const records = await listMemory();
    await writeEncryptedJson(FILE, [record, ...records].slice(0, 5000));
  });
  await writeQueue;
  return record;
}

export async function removeMemory(id: string): Promise<boolean> {
  let removed = false;
  writeQueue = writeQueue.then(async () => {
    const records = await listMemory();
    const next = records.filter((record) => record.id !== id);
    removed = next.length !== records.length;
    if (removed) await writeEncryptedJson(FILE, next);
  });
  await writeQueue;
  return removed;
}

function tokens(value: string) {
  return new Set(value.toLowerCase().match(/[a-z0-9]{3,}/g) ?? []);
}

export async function searchMemory(query: string, limit = 4): Promise<MemoryRecord[]> {
  if (!memoryAvailable()) return [];
  const queryTokens = tokens(query);
  if (!queryTokens.size) return [];
  const records = await listMemory();
  return records
    .map((record) => {
      const recordTokens = tokens(`${record.title} ${record.tags.join(" ")} ${record.content}`);
      const score = [...queryTokens].reduce((total, token) => total + (recordTokens.has(token) ? 1 : 0), 0);
      return { record, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || right.record.updatedAt - left.record.updatedAt)
    .slice(0, Math.max(1, Math.min(limit, 10)))
    .map((item) => item.record);
}
