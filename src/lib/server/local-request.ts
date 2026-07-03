import { privateRuntimeAvailable } from "./encrypted-store";

export function assertPrivateDesktopRequest(request: Request): void {
  if (!privateRuntimeAvailable()) throw new Error("PRIVATE_RUNTIME_UNAVAILABLE");
  const url = new URL(request.url);
  if (url.hostname !== "127.0.0.1" && url.hostname !== "localhost") throw new Error("PRIVATE_RUNTIME_REQUIRED");
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).origin !== url.origin) throw new Error("CROSS_ORIGIN_REJECTED");
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") throw new Error("CROSS_ORIGIN_REJECTED");
}

export function privateRuntimeError(error: unknown): Response {
  const message = String(error);
  const unavailable = message.includes("PRIVATE_RUNTIME_UNAVAILABLE");
  return Response.json(
    { error: unavailable ? "Encrypted desktop memory is available only in the packaged application." : "Private desktop request rejected." },
    { status: unavailable ? 503 : 403 },
  );
}
