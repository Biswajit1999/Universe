import { getAISettings, setAISettings } from "@/lib/ai/settings";
import { listOllamaModels } from "@/lib/ai/ollama";
import { privateRuntimeAvailable } from "@/lib/server/encrypted-store";
import { assertPrivateDesktopRequest, privateRuntimeError } from "@/lib/server/local-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const privateRuntime = privateRuntimeAvailable();
  if (!privateRuntime) {
    return Response.json({ privateRuntime: false, ollamaOnline: false, geminiConfigured: Boolean(process.env.GEMINI_API_KEY), models: [], settings: await getAISettings() });
  }
  try {
    assertPrivateDesktopRequest(request);
    const [settings, models] = await Promise.all([getAISettings(), listOllamaModels(request.signal)]);
    return Response.json({ privateRuntime: true, ollamaOnline: true, geminiConfigured: Boolean(process.env.GEMINI_API_KEY), models, settings });
  } catch (error) {
    if (String(error).includes("PRIVATE_RUNTIME") || String(error).includes("CROSS_ORIGIN")) return privateRuntimeError(error);
    return Response.json({ privateRuntime: true, ollamaOnline: false, geminiConfigured: Boolean(process.env.GEMINI_API_KEY), models: [], settings: await getAISettings() });
  }
}

export async function POST(request: Request) {
  try {
    assertPrivateDesktopRequest(request);
    const body = await request.json();
    const settings = await setAISettings({ provider: body.provider, ollamaModel: body.ollamaModel });
    return Response.json({ settings });
  } catch (error) {
    if (String(error).includes("Invalid AI provider") || String(error).includes("Choose an installed")) {
      return Response.json({ error: (error as Error).message }, { status: 400 });
    }
    return privateRuntimeError(error);
  }
}
