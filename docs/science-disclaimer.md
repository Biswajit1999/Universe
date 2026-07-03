# Science disclaimer

UNIVERSE is an **educational and productivity tool**, not a research-grade instrument or a source
of operational/real-time data. Read this before relying on anything it shows you.

## Provenance labels

Every dataset and result in UNIVERSE carries one of four badges:

| Badge | Meaning |
|-------|---------|
| **`Live`** | Real data fetched from a real API at request time (e.g. NASA APOD with a key). |
| **`Demo`** | Bundled static sample data from `public/demo-data/`. It is illustrative and **does not reflect current real-world conditions.** |
| **`Estimated`** | Heuristic or suggested content (e.g. suggested learning topics), not measured. |
| **`Simulated`** | Output of a simplified physics model running in your browser. |

## About the simulations

The Simulation Lab and world modules use **first-order, transparent models** chosen for clarity:

- Orbital period — Kepler's third law (two-body, circular).
- Gravity — Newtonian point masses.
- Blackbody peak — Wien's displacement law.
- Transit depth — geometric `(Rp/R★)²` (no limb darkening, grazing, or contamination).
- Signal-to-noise — photon-limited approximation.
- PID response — a single first-order plant.
- Thermal drift — Newton's law of cooling (single time constant).
- Light curves — synthetic box+taper transits with white noise (not real photometry).

These are excellent for **intuition and sanity checks**. They are **not** suitable for:
- Mission planning, navigation, or operations.
- Publication-grade measurement or inference.
- Safety-critical or financial decisions.

Real analyses require full models (relativistic corrections, limb darkening, correlated noise,
instrument systematics, proper error propagation) and validation against real data.

## About the AI assistant

"Hey Universe" is a language model (live Gemini) or an offline template-based mock. Language
models are **fluent, not inherently truthful**:

- They can **hallucinate** facts, numbers, and citations. Always verify against primary sources.
- Citation output is a **placeholder format**, not a verified reference.
- They reflect **biases** in their training data.
- Keep a **human accountable** for any decision informed by AI output.

The assistant's replies are always labelled `Demo AI` (mock) or `Live`.

## Data accuracy

Live data is only as accurate and current as the upstream provider. UNIVERSE does not modify
values, but network issues can cause a silent fallback to **Demo** data — always check the badge.

## No warranty

UNIVERSE is private proprietary software provided "as is", without warranty of any kind. See
[`LICENSE`](../LICENSE).
