import type { WorldDef } from "@/lib/types";

/** The ten Science Worlds. Four have dedicated deep pages in the MVP
 *  (astronomy, physics, mathematics, ai); the rest render from this data. */
export const WORLDS: WorldDef[] = [
  {
    slug: "astronomy",
    name: "Astronomy",
    tagline: "Reading the sky as data",
    summary:
      "From exoplanets to the large-scale structure of the cosmos. Live-ready wrappers for NASA APOD, the Exoplanet Archive, near-Earth objects and arXiv, plus synthetic light curves and blackbody tools.",
    color: "#7dd3fc",
    icon: "telescope",
    concepts: ["Transit photometry", "Radial velocity", "Spectroscopy", "Stellar populations", "Orbital mechanics"],
    modules: [
      { name: "Exoplanet Explorer", status: "interactive", desc: "Filter, sort and plot a real catalogue snapshot." },
      { name: "Solar System", status: "demo", desc: "Scaled orbital-period model." },
      { name: "Gaia Stars", status: "planned", desc: "TAP/ADQL cone search (query builder ready)." },
      { name: "TESS Light Curves", status: "interactive", desc: "Synthetic transit light curves you can tune." },
      { name: "JWST Discoveries", status: "demo", desc: "Curated highlights feed." },
      { name: "Near-Earth Objects", status: "interactive", desc: "NASA NeoWs feed (live with key)." },
      { name: "Space Missions", status: "demo", desc: "Timeline of major missions." },
      { name: "Spectroscopy", status: "demo", desc: "Line-fingerprint explainer." },
      { name: "Observation Planner", status: "planned", desc: "Airmass + visibility (v2)." },
    ],
    questions: [
      "Explain the transit method and its detection limits",
      "Why do we need space telescopes for small planets?",
      "What does a radial-velocity curve tell us about a planet?",
    ],
  },
  {
    slug: "physics",
    name: "Physics",
    tagline: "The rules the universe runs on",
    summary:
      "Interactive intuition for gravity, waves, fields, control and chaos. Simulators use transparent first-order models — labelled Simulated, not mission-grade.",
    color: "#c4b5fd",
    icon: "atom",
    concepts: ["Newtonian gravity", "Wave interference", "EM fields", "Fourier analysis", "Feedback control", "Thermodynamics"],
    modules: [
      { name: "Gravity Simulator", status: "interactive", desc: "Force + orbital period calculators." },
      { name: "Black Hole Explainer", status: "demo", desc: "Schwarzschild radius visual." },
      { name: "Wave Interference", status: "demo", desc: "Two-source pattern explainer." },
      { name: "EM Field Visualiser", status: "planned", desc: "Field-line renderer (v2)." },
      { name: "PID Playground", status: "interactive", desc: "Tune a controller, watch the response." },
      { name: "Fourier Demo", status: "demo", desc: "Signal → frequency intuition." },
      { name: "Chaos / Pendulum", status: "demo", desc: "Sensitive dependence explainer." },
      { name: "Thermodynamics Sandbox", status: "interactive", desc: "Exponential cooling model." },
    ],
    questions: [
      "Explain a PID controller intuitively",
      "What sets the size of a black hole?",
      "Why does gravity follow an inverse-square law?",
    ],
  },
  {
    slug: "mathematics",
    name: "Mathematics",
    tagline: "The language beneath everything",
    summary:
      "Visual playgrounds for functions, fractals, graphs, higher-dimensional geometry, the complex plane, probability and linear algebra.",
    color: "#fca5a5",
    icon: "sigma",
    concepts: ["Functions", "Fractals", "Graph theory", "n-dimensional geometry", "Complex analysis", "Probability", "Linear algebra"],
    modules: [
      { name: "Equation Visualiser", status: "interactive", desc: "Plot y = f(x) live." },
      { name: "Fractal Explorer", status: "interactive", desc: "Render the Mandelbrot set." },
      { name: "Graph Theory", status: "demo", desc: "Nodes, edges, traversal." },
      { name: "Hypercube / nD", status: "interactive", desc: "Rotating tesseract projection." },
      { name: "Complex Plane", status: "demo", desc: "Argand-plane intuition." },
      { name: "Probability Simulator", status: "interactive", desc: "Law of large numbers demo." },
      { name: "Linear Algebra", status: "demo", desc: "Matrix-as-transformation." },
    ],
    questions: [
      "What does the Mandelbrot set actually represent?",
      "How is a matrix a transformation?",
      "Explain the law of large numbers with an example",
    ],
  },
  {
    slug: "biology",
    name: "Biology",
    tagline: "Information written in molecules",
    summary:
      "From DNA to neurons to epidemics. MVP ships explainers and a working epidemiology model; protein folding and cell maps are placeholders.",
    color: "#86efac",
    icon: "dna",
    concepts: ["Central dogma", "Evolution", "Protein structure", "Cell biology", "Neuroscience", "Epidemiology"],
    modules: [
      { name: "DNA Explainer", status: "demo", desc: "Base pairing and the central dogma." },
      { name: "Evolution Tree", status: "demo", desc: "Tree-of-life explainer." },
      { name: "Protein Folding", status: "planned", desc: "AlphaFold-style placeholder." },
      { name: "Cell Systems Map", status: "planned", desc: "Organelle map (v2)." },
      { name: "Neuron Visualiser", status: "demo", desc: "Action-potential explainer." },
      { name: "Epidemiology (SIR)", status: "interactive", desc: "Tune an outbreak model." },
    ],
    questions: [
      "Explain the central dogma of molecular biology",
      "How does an SIR model predict an epidemic peak?",
      "What is protein folding and why is it hard?",
    ],
  },
  {
    slug: "earth",
    name: "Earth Systems",
    tagline: "One planet, coupled systems",
    summary:
      "Climate indicators, seismic and volcanic activity, oceans and satellites. MVP shows demo indicators with clearly-marked placeholders for live feeds.",
    color: "#7dd3fc",
    icon: "globe",
    concepts: ["Energy balance", "Carbon cycle", "Plate tectonics", "Ocean circulation", "Remote sensing"],
    modules: [
      { name: "Climate Indicators", status: "demo", desc: "CO₂, temperature, sea level snapshot." },
      { name: "Earthquake Feed", status: "planned", desc: "USGS feed (v2)." },
      { name: "Volcano Map", status: "planned", desc: "Global activity map (v2)." },
      { name: "Weather Dashboard", status: "planned", desc: "NOAA integration (v2)." },
      { name: "Ocean Currents", status: "planned", desc: "Circulation visual (v2)." },
      { name: "Satellite Imagery", status: "planned", desc: "NASA GIBS tiles (v2)." },
    ],
    questions: [
      "Explain Earth's energy balance simply",
      "What drives ocean circulation?",
      "How do we measure global temperature?",
    ],
  },
  {
    slug: "ai",
    name: "Artificial Intelligence",
    tagline: "Machines that learn structure",
    summary:
      "How modern AI works — neural nets, transformers, embeddings, prompting and agents — with honest safety notes. Interactive network visualiser included.",
    color: "#fcd34d",
    icon: "brain",
    concepts: ["Backpropagation", "Attention", "Embeddings", "Prompt design", "Agents", "Alignment & safety"],
    modules: [
      { name: "Neural Network Visualiser", status: "interactive", desc: "Animated forward pass." },
      { name: "Transformer Explainer", status: "demo", desc: "Attention, step by step." },
      { name: "Embedding Space", status: "interactive", desc: "2D semantic-distance demo." },
      { name: "Prompt Lab", status: "interactive", desc: "See how framing changes output shape." },
      { name: "Agent Workflow Builder", status: "demo", desc: "Compose a tool-using loop." },
      { name: "AI Ethics & Safety", status: "demo", desc: "Practical safety notes." },
      { name: "Model Comparison", status: "planned", desc: "Benchmark table (v2)." },
    ],
    questions: [
      "Explain attention in transformers intuitively",
      "What is an embedding, really?",
      "What are the main open problems in AI safety?",
    ],
  },
  {
    slug: "engineering",
    name: "Engineering",
    tagline: "Turning physics into systems",
    summary:
      "Electronics, signals, control and robotics. Shares the PID and signal tools with Physics; hardware modules are placeholders in the MVP.",
    color: "#fdba74",
    icon: "cpu",
    concepts: ["Circuits", "Signal processing", "Control systems", "Sensor fusion", "Robotics"],
    modules: [
      { name: "Electronics Dashboard", status: "planned", desc: "Live sensor read-out (v2)." },
      { name: "Signal Processing Lab", status: "interactive", desc: "Fourier + SNR tools." },
      { name: "Control Systems", status: "interactive", desc: "PID response model." },
      { name: "Sensor Fusion", status: "demo", desc: "Complementary-filter explainer." },
      { name: "Robotics", status: "planned", desc: "Kinematics playground (v2)." },
      { name: "PCB / Circuit", status: "planned", desc: "Schematic viewer (v2)." },
    ],
    questions: [
      "How does a complementary filter fuse sensors?",
      "Why does signal-to-noise scale as √time?",
      "When does a control loop go unstable?",
    ],
  },
  {
    slug: "history",
    name: "History of Science",
    tagline: "How we came to know",
    summary:
      "The turning points — from heliocentrism to relativity to the genome. A narrative world connecting ideas to the people and instruments that produced them.",
    color: "#d8b4fe",
    icon: "scroll",
    concepts: ["Scientific revolution", "Key experiments", "Instruments", "Paradigm shifts", "Open science"],
    modules: [
      { name: "Timeline of Discovery", status: "demo", desc: "Milestones across fields." },
      { name: "Great Experiments", status: "demo", desc: "The measurements that changed everything." },
      { name: "Instruments", status: "demo", desc: "How new tools opened new questions." },
    ],
    questions: [
      "What made the scientific revolution possible?",
      "Which experiment most changed physics?",
      "How did open science emerge?",
    ],
  },
  {
    slug: "missions",
    name: "Space Missions",
    tagline: "Humanity's instruments in the dark",
    summary:
      "Past, present and planned missions — what each one measures and why it matters. Connects directly to the datasets in Data Explorer.",
    color: "#93c5fd",
    icon: "rocket",
    concepts: ["Observatories", "Planetary probes", "Sample return", "Human spaceflight", "Mission design"],
    modules: [
      { name: "Mission Timeline", status: "demo", desc: "From Voyager to JWST and beyond." },
      { name: "Active Observatories", status: "demo", desc: "What's collecting data right now." },
      { name: "Instrument Payloads", status: "demo", desc: "How each mission sees." },
    ],
    questions: [
      "What makes JWST different from Hubble?",
      "Why are sample-return missions so valuable?",
      "How is a space observatory's orbit chosen?",
    ],
  },
  {
    slug: "personal",
    name: "Personal Research",
    tagline: "Your own line of enquiry",
    summary:
      "Your workspace: saved ideas, notes, generated plans and datasets live here and in the Personal Vault. This world is what UNIVERSE is ultimately for.",
    color: "#67e8f9",
    icon: "user",
    concepts: ["Your questions", "Your datasets", "Your methods", "Your writing", "Your roadmap"],
    modules: [
      { name: "Saved Ideas", status: "interactive", desc: "From the Vault." },
      { name: "Research Plans", status: "interactive", desc: "From the Research Copilot." },
      { name: "Notes", status: "interactive", desc: "Personal notebook." },
    ],
    questions: [
      "Help me choose a tractable first research project",
      "Turn my rough idea into a research plan",
      "What should I learn next for my goals?",
    ],
  },
];

export const DEEP_WORLDS = new Set(["astronomy", "physics", "mathematics", "ai"]);

export function getWorld(slug: string): WorldDef | undefined {
  return WORLDS.find((w) => w.slug === slug);
}
