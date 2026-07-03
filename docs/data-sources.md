# Data sources

UNIVERSE draws on public scientific archives and APIs. This page documents each one, its status
in the codebase, and how to enable live access.

## Status legend

- **Wrapped · live-ready** — a client wrapper + server route exist; add the key (if any) and flip
  to Live Mode.
- **Placeholder · v2** — typed stub and query builder exist; live execution is planned.

## Wrapped (live-ready in this MVP)

### NASA APOD — Astronomy Picture of the Day
- **Provides:** daily image + expert explanation.
- **Key:** `NASA_API_KEY` (free, instant at <https://api.nasa.gov>).
- **Route:** `GET /api/apod?mode=live|demo`.
- **Wrapper:** `src/lib/api/nasa.ts`.

### NASA NeoWs — Near-Earth Objects
- **Provides:** asteroid size, close-approach distance & velocity for today.
- **Key:** `NASA_API_KEY`.
- **Route:** `GET /api/neo?mode=live|demo`.

### NASA Exoplanet Archive
- **Provides:** confirmed exoplanets and stellar/planetary parameters.
- **Key:** none — the TAP service is open.
- **Route:** `GET /api/exoplanets?mode=live|demo` (server-side ADQL, avoids CORS).
- **Query:** see `EXOPLANET_TAP_QUERY` in `src/lib/api/exoplanets.ts`.

### arXiv
- **Provides:** latest preprints by category (Atom API).
- **Key:** none.
- **Route:** `GET /api/arxiv?mode=live|demo&category=astro-ph.EP` (parses Atom → JSON).

## Placeholders (v2 roadmap)

| Source | Provides | Notes |
|--------|----------|-------|
| **Gaia (ESA)** | Astrometry/photometry for ~2B stars | ADQL cone-search **query builder ready** in `src/lib/api/gaia.ts`; live TAP execution + pagination pending. |
| **MAST / TESS** | Space-telescope products, light curves | MVP ships a **synthetic** transit-light-curve generator (`src/lib/api/mast.ts`, labelled Simulated). |
| **ESA** | Mission archives | Broad; mission-specific integrations planned. |
| **ADS** | Astronomy literature + citations | Requires a free API token. |
| **GitHub** | Public dev activity | Public events need no key; Command Center card uses demo data with a live wrapper (`src/lib/api/github.ts`) ready. |
| **NOAA / SWPC** | Space weather + climate | Space-weather card uses demo data shaped like SWPC products. |
| **USGS** | Earthquakes, volcanoes | GeoJSON feeds, no key. |
| **OpenAlex** | Scholarly works | Open, no key. |
| **Wikidata** | Linked structured knowledge | SPARQL endpoint. |

## Adding a source

Follow the engineering rules in [`MASTER_BUILD_PROMPT.md`](MASTER_BUILD_PROMPT.md). The short
version: typed wrapper → server route with demo fallback → demo JSON → register in
`src/lib/data/sources.ts`.

## Rate limits & etiquette

- NASA `DEMO_KEY` is heavily rate-limited — get your own free key.
- arXiv asks for ≤ 1 request / 3 s and a descriptive `User-Agent` for heavy use.
- Cache where possible: routes use Next.js `revalidate` (1 h for APOD/NEO/arXiv, 24 h for the
  Exoplanet Archive).
