import { PLUGIN_MANIFESTS } from "@/lib/plugins/manifests";
import { listPluginStates, setPluginEnabled } from "@/lib/plugins/repository";
import { privateRuntimeAvailable } from "@/lib/server/encrypted-store";
import { assertPrivateDesktopRequest, privateRuntimeError } from "@/lib/server/local-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const states = await listPluginStates();
  return Response.json({
    privateRuntime: privateRuntimeAvailable(),
    plugins: PLUGIN_MANIFESTS.map((manifest) => ({ ...manifest, enabled: states.find((state) => state.id === manifest.id)?.enabled ?? false })),
  });
}

export async function POST(request: Request) {
  try {
    assertPrivateDesktopRequest(request);
    const body = await request.json();
    if (typeof body.enabled !== "boolean") return Response.json({ error: "enabled must be boolean." }, { status: 400 });
    return Response.json({ state: await setPluginEnabled(String(body.id ?? ""), body.enabled) });
  } catch (error) {
    if (String(error).includes("Unknown plugin")) return Response.json({ error: "Unknown plugin." }, { status: 404 });
    return privateRuntimeError(error);
  }
}
