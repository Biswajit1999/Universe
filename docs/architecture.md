# Application architecture

UNIVERSE is a Next.js 15 application embedded in a security-hardened Electron desktop shell.

## Layers

### Interface

`src/app` and `src/components` contain the command nexus, science worlds, assistant, encrypted-memory
console, plugin manager and Atlas approval centre. React Three Fiber supplies depth-bearing motion;
CSS/Tailwind supplies precise instrument geometry and reduced-motion fallbacks.

### Orchestrator

`src/lib/agents` contains deterministic intent routing, specialist profiles, bounded plans, safe
read-only tools, streamed server-sent events and the browser client. The global assistant routes to:

- Universe — general orchestration
- Kepler — research strategy
- Vega — scientific data
- Newton — simulations
- Muse — scientific writing
- Atlas — local operations through the desktop permission broker

The browser can cancel a running request. Model failure falls back to the labelled offline provider.

### Plugins and data

`src/lib/plugins` defines versioned manifests with scope, risk, capabilities and tools. Encrypted
enablement state gates Gemini, NASA, scientific calculation and Atlas surfaces. Existing `lib/api`
wrappers and `app/api` routes preserve Demo/Live provenance labels.

### Memory

`src/lib/memory` provides explicit-only long-term records and lexical retrieval. The desktop server
stores AES-256-GCM envelopes using a random key protected by Electron. Memory retrieval is off by
default; the conversation Memory toggle is the owner action that permits selected records to enter
model context.

### Desktop boundary

`electron/main.cjs` owns lifecycle, local-server startup and trusted IPC. Separate modules implement
credentials, diagnostics and Atlas tools. The preload exposes only typed methods. It never exposes
Node.js, arbitrary filesystem paths, a shell or generic command execution.

See [desktop-architecture.md](desktop-architecture.md) for the threat boundary.

### Pure logic

Physics models and writing/research generators remain deterministic, browser-independent functions
with unit tests. This keeps scientific calculations reviewable and prevents the model from replacing
known equations with opaque guesses.

## Runtime modes

- **Packaged desktop:** all private capabilities available; server listens on `127.0.0.1:3199`.
- **Desktop development:** Electron UI plus Next dev server; credentials/memory/operator remain
  packaged-runtime features unless their private environment is explicitly configured.
- **Browser/Vercel:** science UI and labelled cloud/demo data only. Private memory and PC tools reject
  requests because no desktop data directory or vault key exists.

## Testing

Vitest covers simulations, templates, Markdown normalization, agent routing/policy, Electron
credential redaction, encrypted memory/plugin state and Atlas selection/approval boundaries.
