import { afterEach, describe, expect, it, vi } from "vitest";
import { generateOllama, listOllamaModels, resolveOllamaBaseUrl } from "./ollama";

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.OLLAMA_BASE_URL;
});

describe("Ollama loopback boundary", () => {
  it("accepts only local HTTP endpoints", () => {
    expect(resolveOllamaBaseUrl()).toBe("http://127.0.0.1:11434");
    expect(resolveOllamaBaseUrl("http://localhost:11434/")).toBe("http://localhost:11434");
    expect(() => resolveOllamaBaseUrl("https://localhost:11434")).toThrow("loopback");
    expect(() => resolveOllamaBaseUrl("http://192.168.1.20:11434")).toThrow("loopback");
    expect(() => resolveOllamaBaseUrl("http://example.com:11434")).toThrow("loopback");
  });

  it("parses local model metadata without exposing arbitrary fields", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ models: [{
      name: "gemma3:4b",
      size: 3_300_000_000,
      details: { parameter_size: "4.3B", quantization_level: "Q4_K_M" },
      secret: "ignored",
    }] }), { status: 200 })));
    await expect(listOllamaModels()).resolves.toEqual([{
      name: "gemma3:4b",
      size: 3_300_000_000,
      parameterSize: "4.3B",
      quantization: "Q4_K_M",
    }]);
  });

  it("sends a non-streaming chat request to loopback", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ message: { content: "Local answer" } }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await expect(generateOllama({ prompt: "Hello", systemPrompt: "Be precise", model: "gemma3:4b" })).resolves.toEqual({
      text: "Local answer",
      provider: "ollama/gemma3:4b",
    });
    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:11434/api/chat", expect.objectContaining({ method: "POST" }));
    const request = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(request).toMatchObject({ model: "gemma3:4b", stream: false });
  });
});
