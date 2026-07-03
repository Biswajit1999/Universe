# Desktop architecture

UNIVERSE uses Electron as a narrow desktop container around the existing Next.js application. The
desktop boundary is intentionally conservative because future agents may work with personal files
and applications.

## Processes

```text
┌──────────────────────────────────────────────────────────────┐
│ Electron main (trusted)                                      │
│  lifecycle · local server · credential store · permissions   │
└───────────────────┬───────────────────────────┬──────────────┘
                    │ typed IPC                 │ spawn
┌───────────────────▼─────────────────┐  ┌──────▼──────────────┐
│ Preload capability facade          │  │ Next standalone     │
│ no generic fs/shell/exec exposure  │  │ 127.0.0.1 only      │
└───────────────────┬─────────────────┘  │ API + orchestrator   │
                    │                    └──────┬──────────────┘
┌───────────────────▼─────────────────┐         │ HTTPS
│ Renderer (sandboxed)                │         ▼
│ React · Tailwind · R3F · voice UI   │   approved cloud APIs
└─────────────────────────────────────┘
```

## Current bridge

The preload exposes only `getInfo()`. File access, command execution and application launching are
not exposed. This keeps the initial desktop build useful without accidentally granting a model or
web content unrestricted access to the PC.

## Next security slice

The permission broker should introduce one capability at a time:

1. `files.pick` through a native owner-controlled picker
2. `files.read` for the exact selected path
3. `files.write` with a diff/preview and explicit confirmation
4. `apps.launch` from a user-managed allow-list

Each call receives a request id, agent id, purpose, exact scope and risk level. The broker validates
the payload, requests approval when necessary, executes with a timeout and writes a local audit
event. No generic `exec(command)` IPC method should ever exist.

## Packaging

`npm run desktop:package` creates the Next standalone build, copies it into Electron resources and
builds a Windows NSIS installer. Production starts the local server on `127.0.0.1:3199`; the window
rejects navigation away from that origin and opens external HTTP links in the default browser.
