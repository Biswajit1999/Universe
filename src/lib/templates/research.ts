/**
 * Research Copilot template engine.
 * Deterministic, transparent template logic (no AI required) that turns a
 * topic into a full research plan. The assistant can refine any section.
 */

export interface ResearchPlan {
  topic: string;
  question: string;
  background: string;
  datasets: string[];
  methods: string[];
  plots: string[];
  limitations: string[];
  repoStructure: string;
  readme: string;
  abstract: string;
  linkedin: string;
}

const DOMAIN_HINTS: { match: RegExp; datasets: string[]; methods: string[] }[] = [
  {
    match: /exoplanet|transit|tess|kepler/i,
    datasets: ["TESS light curves (MAST, public)", "NASA Exoplanet Archive confirmed-planets table", "Gaia DR3 stellar parameters"],
    methods: ["Detrending (biweight / GP)", "BLS periodogram transit search", "Injection–recovery completeness tests", "MCMC transit fitting (e.g. exoplanet / batman)"],
  },
  {
    match: /gaia|stellar|star cluster|kinematic/i,
    datasets: ["Gaia DR3 astrometry + photometry (TAP/ADQL)", "SIMBAD cross-matches"],
    methods: ["ADQL cone / quality-cut queries", "Colour–magnitude diagram analysis", "Proper-motion clustering (HDBSCAN)", "Distance inference from parallax (Bayesian)"],
  },
  {
    match: /spectro|radial velocity|thermal|instrument/i,
    datasets: ["Public HARPS/ESPRESSO archival spectra (ESO)", "Instrument housekeeping/telemetry (temperature, pressure)"],
    methods: ["Cross-correlation RV extraction", "Systematics decorrelation vs. telemetry", "Allan deviation stability analysis", "Thermal modelling (first-order lag)"],
  },
  {
    match: /machine learning|neural|ai|deep learning|llm/i,
    datasets: ["Curated public benchmark for the task", "Synthetic data generator for controlled tests"],
    methods: ["Baseline (linear/GBM) before deep model", "Cross-validated training with fixed seeds", "Ablation study", "Error analysis on held-out slices"],
  },
  {
    match: /climate|earth|ocean|atmospher/i,
    datasets: ["NOAA / Copernicus ERA5 reanalysis", "NASA GISTEMP surface temperature"],
    methods: ["Trend + seasonality decomposition", "Regridding and anomaly computation", "Uncertainty via bootstrap over years"],
  },
];

function pickHints(topic: string) {
  return (
    DOMAIN_HINTS.find((d) => d.match.test(topic)) ?? {
      datasets: ["Primary public archive for the field", "One secondary dataset for cross-validation"],
      methods: ["Exploratory data analysis with documented notebooks", "A simple, defensible baseline model", "One rigorous statistical test of the core claim"],
    }
  );
}

export function generateResearchPlan(rawTopic: string): ResearchPlan {
  const topic = rawTopic.trim().replace(/\s+/g, " ");
  const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 40) || "project";
  const hints = pickHints(topic);

  const question = `To what extent can ${topic.toLowerCase()} be quantified, and what is the dominant source of uncertainty?`;

  const background = `${topic} sits at the intersection of open data and reproducible methods. Recent literature shows active work in this area, but a clearly-scoped, fully open analysis with published code and injection/robustness tests is often missing. This project targets exactly that gap: a narrow, answerable question, one primary dataset, and a defensible uncertainty budget.`;

  const plots = [
    "Fig 1 — Raw data overview (coverage, quality flags)",
    "Fig 2 — Main result: measured quantity vs. the driving variable, with uncertainties",
    "Fig 3 — Robustness: result under alternative method choices",
    "Fig 4 — Completeness / bias test (synthetic injection where applicable)",
  ];

  const limitations = [
    "Single primary dataset — conclusions bounded by its selection function",
    "Simplified model assumptions (documented in METHODS.md)",
    "No independent confirmation dataset in v1",
    "Compute-limited hyperparameter/systematics exploration",
  ];

  const repoStructure = `${slug}/
├── README.md
├── LICENSE
├── environment.yml
├── data/            # download scripts only — never commit raw data
│   └── get_data.py
├── notebooks/
│   ├── 01_explore.ipynb
│   ├── 02_method.ipynb
│   └── 03_results.ipynb
├── src/${slug.replace(/-/g, "_")}/
│   ├── io.py
│   ├── model.py
│   └── plots.py
├── tests/
│   └── test_model.py
└── docs/
    └── METHODS.md`;

  const readme = `# ${topic}

> ${question}

## What this is
An open, reproducible analysis of ${topic.toLowerCase()}. All data are public; all figures regenerate from \`make figures\`.

## Data
${hints.datasets.map((d) => `- ${d}`).join("\n")}

## Method
${hints.methods.map((m) => `- ${m}`).join("\n")}

## Reproduce
\`\`\`bash
conda env create -f environment.yml
python data/get_data.py
jupyter lab notebooks/
\`\`\`

## Status
🚧 Active research project — results are preliminary until tagged v1.0.

## License
MIT`;

  const abstract = `We present an open analysis of ${topic.toLowerCase()}. Using ${hints.datasets[0].toLowerCase()}, we apply ${hints.methods[0].toLowerCase()} to address the question: ${question.toLowerCase()} We quantify the dominant uncertainties through explicit robustness tests and release all code and processed data products. Our results provide a reproducible baseline for future work, and we identify the key limitation to be addressed next: independent validation on a second dataset.`;

  const linkedin = `🔭 New open-science project: ${topic}

The question: ${question}

The plan:
• Data — ${hints.datasets[0]}
• Method — ${hints.methods[0]}
• Everything open: code, figures, and an honest limitations section

Building it in public — repo link in comments. Feedback and collaborators welcome.

#OpenScience #Research #DataScience`;

  return {
    topic,
    question,
    background,
    datasets: hints.datasets,
    methods: hints.methods,
    plots,
    limitations,
    repoStructure,
    readme,
    abstract,
    linkedin,
  };
}

export function planToMarkdown(p: ResearchPlan): string {
  return `# Research Plan — ${p.topic}

*Generated by UNIVERSE Research Copilot (template engine — refine with the assistant).*

## Research question
${p.question}

## Background
${p.background}

## Datasets
${p.datasets.map((d) => `- ${d}`).join("\n")}

## Methods
${p.methods.map((m) => `- ${m}`).join("\n")}

## Planned figures
${p.plots.map((f) => `- ${f}`).join("\n")}

## Limitations
${p.limitations.map((l) => `- ${l}`).join("\n")}

## Suggested repository structure
\`\`\`
${p.repoStructure}
\`\`\`

## README draft
${p.readme}

## Paper-style abstract
${p.abstract}

## LinkedIn post
${p.linkedin}
`;
}
