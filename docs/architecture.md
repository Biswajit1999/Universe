# Architecture

UNIVERSE is a Next.js 15 (App Router) application with a security-hardened Electron desktop shell.
It is deliberately structured so that **pure logic**, **data access**, **presentation**, and the
trusted desktop boundary remain separable and testable. See [desktop-architecture.md](desktop-architecture.md).

## High-level diagram

```
┌────────────────────────────────────────────────────────────┐
│                        Browser (PWA)                        │
│                                                             │
│  Providers (Settings + Vault contexts, Starfield, Shell)    │
│    ├── Pages (app/*)  ── Components (components/*)           │
│    └── Hey Universe assistant (global slide-over)           │
│                    │                                        │
│         askAI() abstraction (lib/ai/provider.ts)            │
└────────────────────┼───────────────────────────────────────┘
                     │  fetch
        ┌────────────┴─────────────┐
        │   Next.js API routes      │  (app/api/*)
        │  ai · apod · neo ·        │
        │  exoplanets · arxiv       │
        └────────────┬─────────────┘
                     │  server-side fetch (keys stay on server)
   ┌─────────────────┼───────────────────────────────┐
   │ Gemini   NASA   arXiv   Exoplanet Archive   …    │  external
   └──────────────────────────────────────────────────┘
                     │  (fallback on any failure)
             public/demo-data/*.json  (bundled, labelled Demo)
```

## Layers

### 1. Pure logic — `src/lib/{simulations,templates}`
No React, no `fetch`. Physics models (`orbitalPeriod`, `transitDepth`, `pidResponse`, …) and the
research/writing generators are deterministic functions. This makes them trivial to unit-test and
reuse (e.g. the same simulators power both the Simulation Lab and the Physics world).

### 2. Data access — `src/lib/api` + `src/app/api`
Client wrappers (`lib/api/*`) call our own API routes; the **routes** (`app/api/*`) hold the
secret keys and talk to external services. Every route accepts `?mode=live|demo` and **always**
degrades to bundled demo data on error or missing key. Keys never reach the browser (except the
`NEXT_PUBLIC_FIREBASE_*` values, which are public by design).

### 3. AI abstraction — `src/lib/ai`
`askAI(req, { demoMode })` tries the live route first (unless Demo Mode), then falls back to the
offline `mock` provider. Responses carry `{ mode, provider }` so the UI can label them. Swapping
in a new LLM means editing one server route.

### 4. State — `src/lib/state`
Two React contexts:
- **Settings** — Demo/Live mode + theme, persisted to `localStorage`.
- **Vault** — auth + saved items; Firestore when signed in, `localStorage` otherwise.

### 5. Presentation — `src/components` + `src/app`
Shared primitives (`Panel`, `Badge`, `Slider`, `Markdown`, `Skeleton`, `ErrorState`) keep the
cinematic glass-panel look consistent. The `Shell` provides the responsive sidebar/drawer; the
`Starfield` canvas renders the ambient background; the `Assistant` is mounted once globally.

## Rendering strategy

- Most pages are **statically prerendered** (`○`) — they're fast and cacheable.
- World detail pages use **`generateStaticParams`** (`●`).
- API routes are **dynamic** (`ƒ`) and run on demand.
- Interactive components are client components (`"use client"`); data-fetching cards fetch on the
  client so the Demo/Live toggle re-fetches instantly.

## PWA

`app/layout.tsx` links a web manifest (`public/manifest.webmanifest`) with an SVG icon, theme
color and `standalone` display, so UNIVERSE is installable. A service worker for offline caching
is on the [roadmap](roadmap.md) (v2).

## Deployment

Any Next.js host works. For the intended stack:
- **Firebase App Hosting** — connect the repo; it builds and serves the Next.js app, with
  Firestore/Auth in the same project.
- **Vercel/Netlify** — zero-config; add the same environment variables in the dashboard.
