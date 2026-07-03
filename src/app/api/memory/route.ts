import { addMemory, listMemory, removeMemory } from "@/lib/memory/repository";
import { assertPrivateDesktopRequest, privateRuntimeError } from "@/lib/server/local-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    assertPrivateDesktopRequest(request);
    return Response.json({ items: await listMemory() });
  } catch (error) {
    return privateRuntimeError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertPrivateDesktopRequest(request);
    const body = await request.json();
    const item = await addMemory({ title: String(body.title ?? ""), content: String(body.content ?? ""), tags: Array.isArray(body.tags) ? body.tags.map(String) : [] });
    return Response.json({ item }, { status: 201 });
  } catch (error) {
    if (String(error).includes("required")) return Response.json({ error: String(error) }, { status: 400 });
    return privateRuntimeError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    assertPrivateDesktopRequest(request);
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return Response.json({ error: "Memory id is required." }, { status: 400 });
    return Response.json({ removed: await removeMemory(id) });
  } catch (error) {
    return privateRuntimeError(error);
  }
}
