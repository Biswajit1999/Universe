# Roadmap

UNIVERSE is designed to grow into a long-term public scientific AI platform. This is the intended
trajectory — contributions against any item are welcome.

## v0.1 — MVP (this release) ✅

- 15 pages, responsive shell with mobile drawer, dark/light theme.
- "Hey Universe" assistant with live (Gemini) + labelled offline mock.
- Live-ready wrappers: NASA APOD, NEO, Exoplanet Archive, arXiv.
- 7 simulators (orbital, gravity, blackbody, transit, SNR, PID, thermal).
- 4 deep worlds with interactive modules (astronomy, physics, mathematics, AI).
- Research Copilot + Writing Studio template engines with Markdown export.
- Interactive Knowledge Graph, Daily Briefing, Personal Vault (Firestore + local).
- Honest data labelling throughout; full Demo Mode with zero keys.

## v0.2 — Live data depth

- [ ] **Gaia TAP** live cone-search execution + result pagination.
- [ ] **MAST/TESS** real light-curve retrieval (FITS/JSON parsing) alongside the synthetic lab.
- [ ] **USGS** live earthquake feed for Earth Systems.
- [ ] **NOAA SWPC** live space-weather card.
- [ ] **GitHub** live activity card (public events).
- [ ] Streaming AI responses in the assistant.

## v0.3 — Voice & PWA

- [ ] Real "Hey Universe" **voice** input (Web Speech API) + optional TTS replies.
- [ ] **Service worker** for offline caching of demo data and shell.
- [ ] Installable app polish (icons at all sizes, splash screens).

## v0.4 — Deeper science

- [ ] React Three Fiber 3D hero scenes per world (currently symbolic SVG).
- [ ] Biology: working SIR epidemiology model + protein-structure viewer.
- [ ] Earth Systems: live climate indicators, satellite tiles (NASA GIBS).
- [ ] Engineering: interactive circuit/electronics dashboard.
- [ ] Observation Planner (airmass, visibility) in Astronomy.

## v0.5 — Knowledge & collaboration

- [ ] Full-text search across worlds, datasets and the Vault.
- [ ] Shareable research plans and public Vault items.
- [ ] Citation manager (ADS/OpenAlex) with BibTeX export.
- [ ] Multi-provider AI (OpenAI, local Ollama) selectable in Settings.

## v1.0 — Platform

- [ ] Plugin/module API so the community can add worlds and data sources.
- [ ] Notebook-style workspaces that combine data, simulations and writing.
- [ ] Accounts, teams, and synced multi-device workspaces.
- [ ] Comprehensive test suite + CI.

## Non-goals

- Presenting simulated or demo output as authoritative real-world data — ever.
- Becoming a closed SaaS. UNIVERSE stays open-source.
