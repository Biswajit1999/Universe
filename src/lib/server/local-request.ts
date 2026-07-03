import { privateRuntimeAvailable } from "./encrypted-store";

export function assertPrivateDesktopRequest(request: Request): void {
  if (!privateRuntimeAvailable()) throw new Error("PRIVATE_RUNTIME_UNAVAILABLE");
  const host = request.headers.get("host") || new URL(request.url).host;
  const hostname = host.startsWith("[") ? host.slice(1, host.indexOf("]")) : host.split(":")[0];
  if (hostname !== "127.0.0.1" && hostname !== "localhost" && hostname !== "::1") throw new Error("PRIVATE_RUNTIME_REQUIRED");
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== host) throw new Error("CROSS_ORIGIN_REJECTED");
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
