# Security policy

## Reporting a vulnerability

If you discover a security issue, please **do not open a public issue**. Instead, email the
maintainer with:

- a description of the issue,
- steps to reproduce,
- the potential impact.

You can expect an acknowledgement within a few days and a fix or mitigation plan thereafter.

## Scope and good practices

UNIVERSE is a client-heavy Next.js app. A few things worth knowing:

- **API keys stay server-side.** `NASA_API_KEY` and `GEMINI_API_KEY` are read only in
  `src/app/api/*` route handlers and are never exposed to the browser. Never move them to a
  `NEXT_PUBLIC_*` variable.
- **`NEXT_PUBLIC_FIREBASE_*` values are public by design** — that's how Firebase web SDKs work.
  Your protection is **Firestore security rules**, not secrecy. Use the owner-only rules in the
  README so a user can only read/write their own `users/{uid}/vault` documents.
- **Never commit `.env.local`** — it is gitignored. Use Cloud Secret Manager (App Hosting) or your
  host's env settings in production.
- The offline mock AI and demo data contain no secrets and make no external calls.

## Supported versions

This is a pre-1.0 project; security fixes are applied to `main`.
