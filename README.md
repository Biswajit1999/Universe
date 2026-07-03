<div align="center">

# UNIVERSE

### Biswajit's Personal Intelligence System

**Private · Local-first · Voice-first · Agentic · Windows desktop**

<img src="docs/assets/universe-dashboard-cover.png" alt="UNIVERSE personal command nexus" width="100%" />

</div>

UNIVERSE is a private scientific assistant and personal operating layer. It combines a cinematic
3D command interface, voice conversation, specialist agents, live scientific APIs, simulations,
writing tools and a personal knowledge vault. The long-term product is a desktop application on
Biswajit's PC—not a public SaaS product.

> Proprietary software. Copyright © Biswajit Jana. All rights reserved.

## Current state

- Futuristic command nexus with an animated React Three Fiber core
- Voice-to-voice and text assistant backed by Gemini
- NASA APOD/NEO, arXiv and scientific data integrations
- Research, writing, simulation, knowledge graph and vault modules
- Built-in specialist registry: Kepler, Vega, Newton and Atlas
- Secure Electron desktop shell foundation
- API secrets kept outside the browser renderer

The agent display is intentionally honest: **Atlas remains locked** until the permissioned desktop
tool bridge is implemented. The UI never claims that a system capability exists before it works.

## Run locally

```bash
npm install
copy .env.example .env.local
npm run desktop:dev
```

The browser development mode remains available:

```bash
npm run dev
```

Open `http://127.0.0.1:3000/command`.

## Build the Windows application

```bash
npm run desktop:package
```

The installer is written to `release/`. The desktop package embeds a local Next.js server so API
routes continue to execute on the PC and server-only keys are not exposed to the interface.

## Private API setup

Create `.env.local` and add only the services you want:

```env
GEMINI_API_KEY=replace_me
GEMINI_MODEL=gemini-3.5-flash
NASA_API_KEY=replace_me
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
```

Firebase variables are optional and listed in `.env.example`. Never commit `.env.local`, API keys,
tokens, passwords or personal data. For the packaged desktop release, secrets will move into the
Windows Credential Manager phase of the roadmap.

## Architecture

```text
Electron main process (trusted, minimal)
  ├── local Next.js standalone server
  │     ├── AI and data API routes
  │     ├── agent orchestrator (next phase)
  │     └── encrypted memory service (next phase)
  └── permission broker
        └── allow-listed desktop tools (next phase)

Electron renderer (sandboxed)
  └── Next.js + React + Tailwind + React Three Fiber
```

The renderer has no Node.js access. Future file, application and automation tools must pass through
small validated IPC commands, show the requested scope, and require explicit approval for risky
actions.

## Build plan

1. **Nexus** — cinematic command deck, voice core, responsive HUD and private identity.
2. **Desktop** — signed Windows installer, local server, credential storage and update channel.
3. **Orchestrator** — task planning, specialist routing, tool calls, cancellation and audit log.
4. **Memory** — encrypted local vault, retrieval, projects, people and user-controlled retention.
5. **Plugins** — signed manifests, capability permissions, enable/disable controls and health checks.
6. **Operator** — allow-listed file/app/automation tools with confirmation and reversible actions.
7. **Voice** — wake phrase, streaming transcription, interruption and high-quality local/cloud TTS.

See [MASTER_BUILD_PROMPT.md](docs/MASTER_BUILD_PROMPT.md) and
[desktop-architecture.md](docs/desktop-architecture.md).

## Validation

```bash
npm test
npx tsc --noEmit
npm run build
```

## Ownership

This repository is private. It is not licensed for redistribution, collaboration, copying or public
deployment. See [LICENSE](LICENSE).
