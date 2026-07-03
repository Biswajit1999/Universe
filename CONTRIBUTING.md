# Contributing to UNIVERSE

Thanks for your interest in building the Living Scientific Operating System. This is a
long-term, open flagship project — contributions of all sizes are welcome.

## Ground rules

1. **Never fake live data.** If a real API isn't wired up, use bundled demo data and label it
   `Demo` / `Estimated` / `Simulated`. This is the project's core principle.
2. **Keep modules pure and testable.** Physics models in `src/lib/simulations` and generators in
   `src/lib/templates` should be pure functions with no UI or network dependencies.
3. **Demo Mode must always work** with zero API keys. Every new API integration needs a graceful
   demo fallback.
4. **Label provenance in the UI** with the `<Badge mode=… />` component.

## Getting started

```bash
git clone https://github.com/<your-username>/universe
cd universe
npm install
npm run dev
```

No keys are required to develop — you get the full app in Demo Mode.

## Development workflow

- **Branch** from `main`: `git checkout -b feature/my-thing`.
- **Build must pass**: `npm run build` (this runs type-checking and linting).
- **Match the code style**: TypeScript strict mode, Tailwind utility classes, the shared
  `Panel` / `Badge` / `Slider` / `Markdown` primitives, and lucide icons via the `Icon` registry.
- **Keep PRs focused** — one feature or fix per PR, with a short description of the change.

## Where things live

| I want to… | Edit |
|------------|------|
| Add a simulator | `src/lib/simulations/models.ts` (pure model) + `index.ts` (registry entry) + a `compute` case in `SimulatorCard.tsx` |
| Add a data source | `src/lib/api/<source>.ts` (wrapper) + `src/app/api/<source>/route.ts` (route) + `src/lib/data/sources.ts` (card) |
| Add a world module | `src/components/worlds/<world>/…` and wire it into the world page |
| Add a writing tool | append to `WRITING_TOOLS` in `src/lib/templates/writing.ts` |
| Add an AI provider | implement in `src/app/api/ai/route.ts` behind its env key; the client abstraction in `src/lib/ai/provider.ts` already handles fallback |
| Add a knowledge-graph node | `src/lib/data/graph.ts` |

## Adding a live API integration

1. Write a typed wrapper in `src/lib/api/`.
2. Add a server route in `src/app/api/` that honours `?mode=live|demo` and **falls back to demo
   data on any error or missing key**.
3. Add matching demo data in `public/demo-data/` and register it in `src/lib/demo.ts`.
4. Surface the source in `src/lib/data/sources.ts`.
5. Comment clearly where the API key is read (`process.env.…`).

## Commit messages

Conventional-ish and readable: `feat: add USGS earthquake feed`, `fix: NEO date boundary`,
`docs: clarify Firebase rules`.

## Reporting bugs / ideas

Open an issue with steps to reproduce (for bugs) or the problem you're trying to solve (for
features). The [`docs/roadmap.md`](docs/roadmap.md) lists what's already planned.
