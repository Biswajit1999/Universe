# Demo data

These JSON files are **bundled sample datasets** used when UNIVERSE runs in Demo Mode or when a
live API key is missing. They are intentionally inspectable and editable.

**Every file is labelled `"mode": "demo"`** and rendered in the UI with a `Demo` badge. They are
illustrative and **do not represent current real-world conditions.** See
[`../../docs/science-disclaimer.md`](../../docs/science-disclaimer.md).

| File | Shape mirrors | Used by |
|------|---------------|---------|
| `apod.json` | NASA APOD response | Command Center, Briefing |
| `exoplanets.json` | NASA Exoplanet Archive (real published values, static) | Astronomy · Exoplanet Explorer |
| `neo.json` | NASA NeoWs feed | Astronomy · NEO feed |
| `arxiv.json` | arXiv Atom API | Command Center, Briefing |
| `space-weather.json` | NOAA SWPC products | Command Center |
| `github-activity.json` | GitHub Events API | Command Center |

To refresh a snapshot with real values, fetch from the live API (see
[`../../docs/data-sources.md`](../../docs/data-sources.md)) and paste the mapped fields here,
keeping `"mode": "demo"`.
