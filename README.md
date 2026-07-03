<div align="center">

# 🌌 UNIVERSE

### The Living Scientific Operating System

**A Jarvis-like, open-source research, science, productivity and knowledge platform.**
Say _"Hey Universe"_ and explore live datasets, run simulations, generate research plans,
draft your writing, and travel through connected knowledge worlds.

`Next.js 15` · `TypeScript` · `Tailwind` · `Firebase` · `Recharts` · `PWA-ready`

</div>

---

## What is this?

UNIVERSE is **not** a portfolio, a normal dashboard, or only an astronomy app. It's a
mission-control-style command center for doing science and thinking — a calm, cinematic
research copilot that runs entirely in your browser.

It ships **production-ready in Demo Mode with zero API keys**, and upgrades to live data and a
live LLM the moment you add keys. Every dataset and result is honestly labelled:
**`Live`**, **`Demo`**, **`Estimated`**, or **`Simulated`** — UNIVERSE never fakes live data.

## Features

| # | Area | What it does |
|---|------|--------------|
| 1 | **Command Center** | Time-aware greeting, universal command bar, quick commands, live status cards (APOD, space weather, arXiv, GitHub, notes). |
| 2 | **Hey Universe** | Global AI assistant — explains concepts, drafts docs, plans studies, reasons about "what ifs". Live (Gemini) or labelled offline mock. |
| 3 | **Science Worlds** | Ten interconnected domains; four with deep interactive modules. |
| 4 | **Astronomy** | Exoplanet Explorer (real snapshot + live TAP), NEO feed (NASA), synthetic TESS light curves. |
| 5 | **Physics** | Gravity, orbits, PID, thermal drift, blackbody, black-hole explainer. |
| 6 | **Mathematics** | Live Mandelbrot, equation plotter, rotating tesseract, probability sim. |
| 7 | **AI** | Neural-net visualiser, embedding space, prompt lab, safety notes. |
| 8 | **Simulation Lab** | Seven transparent physics calculators for "what if?" scenarios. |
| 9 | **Research Copilot** | Topic → full research plan (question, data, methods, repo, README, abstract, LinkedIn) + Markdown export. |
| 10 | **Data Explorer** | 13 data sources with status, example queries and docs. |
| 11 | **Knowledge Graph** | Interactive, clickable map of how the fields connect. |
| 12 | **Daily Briefing** | One-glance morning briefing, exportable to Markdown. |
| 13 | **Writing Studio** | Ten template-driven writing tools with live preview. |
| 14 | **Personal Vault** | Save everything — Firestore when signed in, localStorage in Demo Mode. |
| 15 | **Settings** | Demo/Live toggle, theme, integration status, science disclaimer. |

## Quick start

```bash
# 1. Install
npm install

# 2. Run the dev server (works immediately in Demo Mode — no keys needed)
npm run dev
# → http://localhost:3000

# 3. Production build
npm run build && npm start
```

That's it. With no `.env.local`, UNIVERSE runs fully in **Demo Mode**.

## Going live (optional keys)

Copy `.env.example` to `.env.local` and fill in whichever you have — each is independent:

```bash
cp .env.example .env.local
```

| Key | Enables | Where to get it |
|-----|---------|-----------------|
| `NASA_API_KEY` | Live APOD + NEO feeds | <https://api.nasa.gov> (free, instant) |
| `GEMINI_API_KEY` | Live "Hey Universe" assistant | <https://aistudio.google.com/apikey> |
| `NEXT_PUBLIC_FIREBASE_*` | Auth + Firestore vault sync | Firebase console → Web app config |

> arXiv and the NASA Exoplanet Archive need **no key** and work in Live Mode out of the box.

Toggle **Demo ⇄ Live** anytime from the top bar or **Settings**. Missing a key? UNIVERSE
falls back to labelled demo data instead of failing.

## Firebase setup (for the Vault)

1. Create a project at <https://console.firebase.google.com>.
2. **Build → Authentication → Sign-in method →** enable **Google**.
3. **Build → Firestore Database → Create database** (production mode is fine).
4. **Project settings → Your apps → Web app** → copy the config into `NEXT_PUBLIC_FIREBASE_*`.
5. Suggested Firestore security rules (each user owns their vault):

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid}/vault/{doc} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```

6. **Deploy** with [Firebase App Hosting](https://firebase.google.com/docs/app-hosting) or any
   Next.js host (Vercel, Netlify). See [`docs/architecture.md`](docs/architecture.md).

## Project structure

```
src/
├── app/                 # Next.js App Router pages + API routes
│   ├── api/             # apod, neo, exoplanets, arxiv, ai (server-side)
│   └── worlds/          # worlds hub, [slug], + deep worlds
├── components/          # UI, nav, assistant, world modules, page sections
├── lib/
│   ├── ai/              # provider abstraction + offline mock + prompts
│   ├── api/             # NASA / arXiv / Gaia / MAST / GitHub wrappers
│   ├── firebase/        # client, auth, firestore (demo-safe)
│   ├── simulations/     # pure physics models + registry
│   ├── templates/       # research + writing generators
│   ├── data/            # worlds, graph, sources, nav, commands
│   └── state/           # settings + vault React contexts
public/demo-data/        # bundled, inspectable demo datasets
docs/                    # architecture, data-sources, roadmap, disclaimers
```

## Honest-data principle

This is a science tool, so provenance is a first-class feature:

- **`Live`** — real data from a real API right now.
- **`Demo`** — bundled static sample (never current conditions).
- **`Estimated`** — heuristic/suggested content.
- **`Simulated`** — output of a simplified in-app physics model.

See [`docs/science-disclaimer.md`](docs/science-disclaimer.md).

## Contributing

PRs welcome — see [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`docs/roadmap.md`](docs/roadmap.md).

## License

MIT © Biswajit Jana — see [`LICENSE`](LICENSE).
