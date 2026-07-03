/**
 * Offline mock AI provider.
 * Used when no GEMINI_API_KEY is configured, or when Demo Mode is on.
 * Every response is honestly labelled `mode: "demo"` and rendered with a
 * "Demo AI" badge — it never pretends to be a live model.
 */
import type { AIRequest, AIResponse } from "@/lib/types";

const CONCEPTS: Record<string, string> = {
  "black hole": `A **black hole** is a region where spacetime curvature is so extreme that nothing inside the event horizon — not even light — can escape.

- **Formation:** gravitational collapse of massive stellar cores (> ~3 solar masses after supernova).
- **Key scale:** the Schwarzschild radius, $r_s = 2GM/c^2$ ≈ 3 km per solar mass.
- **Observables:** accretion disk X-rays, gravitational waves from mergers (LIGO/Virgo), and direct horizon-scale imaging (EHT: M87*, Sgr A*).
- **Open questions:** the information paradox and the nature of the interior singularity.`,
  exoplanet: `An **exoplanet** is a planet orbiting a star other than the Sun. Over 5,800 are confirmed.

- **Transit method** (most productive): a planet crossing its star dims it by $\\delta \\approx (R_p/R_\\star)^2$. An Earth crossing a Sun-like star gives ~0.008% — hence space photometry (Kepler, TESS).
- **Radial velocity:** the star's spectral lines shift as it orbits the common barycentre.
- **Frontier:** atmosphere characterisation with JWST transmission spectroscopy.`,
  transit: `The **transit method** detects exoplanets from periodic dips in stellar brightness.

Depth: $\\delta = (R_p/R_\\star)^2$. Duration and shape constrain the orbit's inclination and the stellar density. Repeat transits give the orbital period; combined with radial velocity mass, you get bulk density — the first clue to composition. Try the transit depth calculator in the Simulation Lab.`,
  fourier: `The **Fourier transform** decomposes a signal into sinusoids: $X(f) = \\int x(t)\\,e^{-2\\pi i f t}\\,dt$.

It is the workhorse of periodicity searches (light curves → periodograms), spectroscopy, image filtering, and control theory. Practical notes: sampling below the Nyquist rate aliases power to false frequencies, and windowing controls spectral leakage.`,
  "neural network": `A **neural network** is a stack of learned linear maps and nonlinearities: $h = \\sigma(Wx + b)$, repeated.

Training minimises a loss by gradient descent via backpropagation. Depth builds hierarchical features; the transformer variant replaced recurrence with attention, enabling today's large language models. See the interactive visualiser in the AI world.`,
  pid: `A **PID controller** drives a system toward a setpoint using three terms on the error $e(t)$:

$u(t) = K_p e + K_i \\int e\\,dt + K_d \\dot e$

- $K_p$: immediate correction (too high → oscillation)
- $K_i$: removes steady-state error (too high → windup/overshoot)
- $K_d$: damping/anticipation (sensitive to noise)

Used everywhere from telescope thermal control to quadcopters. Try the PID toy model in the Simulation Lab.`,
  spectroscopy: `**Spectroscopy** splits light by wavelength to read the composition, temperature, velocity, and magnetic fields of the source.

- Absorption/emission lines are fingerprints of elements and molecules.
- Doppler shifts of lines give radial velocities — the basis of exoplanet RV detection.
- Instrument stability (temperature, pressure) directly limits precision, which is why spectrograph thermal control is an active engineering field.`,
  gravity: `**Gravity** in the Newtonian regime: $F = G m_1 m_2 / r^2$, with $G = 6.674\\times10^{-11}\\ \\mathrm{N\\,m^2\\,kg^{-2}}$.

General relativity reframes it as spacetime curvature — needed for GPS corrections, Mercury's perihelion, lensing, and black holes. For most orbital mechanics, Newton plus perturbations is sufficient. The Simulation Lab has gravity and orbital period calculators.`,
  dna: `**DNA** stores genetic information as base sequences (A–T, G–C) in a double helix.

Central dogma: DNA → (transcription) → RNA → (translation) → protein. A human genome is ~3.2 Gbp; genes are interspersed with regulatory and non-coding regions. Modern biology reads it (sequencing), edits it (CRISPR), and increasingly predicts protein structure from it (AlphaFold).`,
  climate: `**Climate** is the statistics of weather. The core physics is energy balance: absorbed solar flux vs. emitted infrared, modulated by greenhouse gases.

Key indicators: global mean surface temperature (~+1.3 °C vs pre-industrial), CO₂ (~425 ppm), sea level rise (~4 mm/yr), Arctic sea-ice decline. Models are physics-based (radiative transfer + fluid dynamics on a grid), validated against paleoclimate and satellite records.`,
};

function findConcept(p: string): string | null {
  const lower = p.toLowerCase();
  for (const key of Object.keys(CONCEPTS)) {
    if (lower.includes(key)) return CONCEPTS[key];
  }
  return null;
}

function generate(req: AIRequest): string {
  const p = req.prompt.toLowerCase();
  const concept = findConcept(req.prompt);

  if (concept) return concept;

  if (p.includes("email")) {
    return `Here is a draft you can adapt:

**Subject:** Request to discuss ${extractTopic(req.prompt) || "a research question"}

Dear [Name],

I hope this finds you well. I am writing regarding ${extractTopic(req.prompt) || "[topic]"}. I have been working on related analysis and would value your perspective on [specific question].

Would you have 20 minutes in the coming two weeks? I am happy to send a short summary in advance.

Best regards,
Biswajit Jana

*For richer drafting, use the Writing Studio — it has dedicated templates for research emails, PhD enquiries, and supervisor updates.*`;
  }

  if (p.includes("research idea") || p.includes("project idea")) {
    return `A concrete, tractable idea:

**Systematics-aware transit recovery in TESS full-frame images of faint M dwarfs**

- **Why:** small planets around faint M dwarfs are underexplored because detrending erases shallow transits.
- **Data:** TESS FFI cutouts (MAST, public), Gaia DR3 stellar parameters.
- **Method:** joint modelling of instrumental systematics + transit signal; injection–recovery tests to quantify completeness.
- **First plot:** recovered-vs-injected depth for 100 synthetic transits.
- **Scope guard:** one sector, one camera, before generalising.

Run this through the Research Copilot to expand it into a full plan with repo structure and README.`;
  }

  if (p.includes("study plan") || p.includes("roadmap") || p.includes("learn")) {
    return `A 6-week study roadmap (adjust pace to your schedule):

| Week | Focus | Deliverable |
|------|-------|-------------|
| 1 | Foundations: units, error propagation, statistics | Notebook of worked examples |
| 2 | Core theory of your target field | 2-page summary in your own words |
| 3 | Data access: APIs, archives (MAST/Gaia/arXiv) | Script that downloads + plots real data |
| 4 | Methods: fitting, periodograms, model comparison | Reproduce one figure from a published paper |
| 5 | Mini-project | End-to-end analysis, documented repo |
| 6 | Writing: abstract + README + short talk | Share publicly, collect feedback |

The rule that matters most: every week must end in an artefact, not just reading.`;
  }

  if (p.includes("summar")) {
    return `**Structured summary template** (paste a paper's abstract or key section and I will fill this):

- **Claim:** the paper's central result, in one sentence.
- **Method:** data + technique used to get there.
- **Evidence strength:** sample size, significance, independent confirmation.
- **Limitations:** what the authors concede, and what they don't.
- **Relevance to you:** how it connects to your current work.

*Note: I'm running in offline demo mode — connect a Gemini API key in .env.local for full generative summaries of pasted text.*`;
  }

  if (p.includes("what if") || p.includes("simulate")) {
    return `Scenario questions are best answered quantitatively. The **Simulation Lab** has working calculators for:

- Orbital period (Kepler's third law) — "what if Earth orbited at 2 AU?"
- Gravity force — "what if gravity were 5% weaker?"
- Blackbody peak wavelength — "what if the star were cooler?"
- Transit depth, SNR, PID response, exponential cooling.

State your scenario as parameter changes (mass, distance, temperature…) and the models will show the consequence. All outputs there are labelled **Simulated** — simplified physics, not mission-grade.`;
  }

  return `I can help with that. As a research copilot I work best when you give me one of these shapes:

- **Explain** — "explain the transit method" (I know a set of core concepts offline)
- **Draft** — emails, READMEs, LinkedIn posts, abstracts (or use the Writing Studio)
- **Plan** — study roadmaps, research plans (or the Research Copilot)
- **Simulate** — "what if gravity were 5% weaker?" (Simulation Lab)

*I'm currently the offline demo provider. Add a GEMINI_API_KEY in .env.local to switch to a live model — the badge on my replies will change from "Demo AI" to "Live".*`;
}

function extractTopic(prompt: string): string | null {
  const m = prompt.match(/(?:about|regarding|on|for)\s+(.{4,60})/i);
  return m ? m[1].replace(/[.?!]+$/, "") : null;
}

export async function mockGenerate(req: AIRequest): Promise<AIResponse> {
  // Small delay so the UI's thinking state is visible and honest.
  await new Promise((r) => setTimeout(r, 450 + Math.random() * 500));
  return { text: generate(req), mode: "demo", provider: "universe-mock" };
}
