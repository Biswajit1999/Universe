# Desktop security architecture

UNIVERSE uses Electron as a narrow trusted container around a sandboxed Next.js interface.

```text
Renderer (sandboxed, no Node)
  ├── same-origin fetch
  │     └── Next standalone on 127.0.0.1:3199
  │           ├── orchestrator and read-only plugins
  │           ├── AES-256-GCM memory/plugin state
  │           └── Gemini/NASA/arXiv adapters
  └── typed preload IPC
        └── Electron main permission broker
              ├── safeStorage credential store
              ├── native owner approvals
              ├── selected-file token map
              ├── private backup journal
              └── Notepad/Calculator allow-list
```

## Credentials

`electron/secure-store.cjs` accepts only named connectors. Electron `safeStorage` encrypts values
using Windows protection. The renderer can list configured/not-configured state, set a replacement,
or remove a key; no method returns plaintext. The main process injects decrypted values only into
the local server process at startup.

## Memory

The main process creates a random 256-bit vault key and protects it through the credential store.
The local server uses AES-256-GCM envelopes for explicit memory and plugin state. Files are fixed-name
collections inside Electron's private user-data directory. Hosted deployments do not receive the
data directory/key and therefore cannot open these routes.

## Atlas

Atlas is disabled by default. Enabling it shows a native warning. A file becomes accessible only
after the owner selects it in a native picker; the renderer receives a short-lived token rather than
an arbitrary path. Text reads are capped at 1 MiB. Every write shows another native approval,
creates a private backup and atomically replaces only the selected file.

Application launching uses an internal allow-list. There is deliberately no `exec(command)`, broad
folder traversal, shell string or arbitrary application path API.

## Diagnostics

Lifecycle and Atlas events are JSONL records in the app's user-data logs directory. Fields whose
names resemble secrets, tokens, passwords or API keys are replaced with `[redacted]` before writing.

## Distribution

`npm run desktop:package` creates an NSIS installer. A trusted public/private distribution still
requires a Windows code-signing certificate and a private update feed; those are external release
credentials, not values that belong in Git.
