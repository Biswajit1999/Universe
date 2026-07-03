/* UNIVERSE service worker — minimal, safe offline support.
 * Strategy:
 *  - Demo data (/demo-data/*) and static assets: cache-first (they're static).
 *  - Everything else: network-first, falling back to cache when offline.
 * Kept intentionally small; a richer Workbox setup is on the v2 roadmap. */
const CACHE = "universe-v1";
const PRECACHE = ["/", "/command", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // don't touch API/CDN cross-origin

  const cacheFirst = url.pathname.startsWith("/demo-data/") || url.pathname.startsWith("/_next/static/");

  if (cacheFirst) {
    event.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      })),
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      })
      .catch(() => caches.match(request).then((hit) => hit || caches.match("/command"))),
  );
});
