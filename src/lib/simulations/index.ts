export * from "./models";

/**
 * Registry describing each simulator for the Simulation Lab UI.
 * Adding a new calculator = add the pure model in models.ts + one entry here
 * + a case in the SimulatorCard compute switch.
 */
export interface SimField {
  key: string;
  label: string;
  unit: string;
  default: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface SimDef {
  id: string;
  name: string;
  question: string; // the "what if" it answers
  explain: string;
  fields: SimField[];
  chart?: boolean; // renders a time-series chart instead of a single number
}

export const SIMULATORS: SimDef[] = [
  {
    id: "orbital",
    name: "Orbital Period",
    question: "What if Earth orbited at 2 AU? What if the star were twice as massive?",
    explain: "Kepler's third law: T = 2π√(a³/GM). Period grows with distance^1.5 and shrinks with the square root of stellar mass.",
    fields: [
      { key: "massSun", label: "Central mass", unit: "M☉", default: 1, min: 0.05, max: 50, step: 0.05 },
      { key: "distanceAu", label: "Orbital distance", unit: "AU", default: 1, min: 0.01, max: 100, step: 0.01 },
    ],
  },
  {
    id: "gravity",
    name: "Gravity Force",
    question: "What if gravity were 5% weaker? What if the Moon were twice as close?",
    explain: "Newton: F = Gm₁m₂/r². Scale G, masses, or distance and read the force ratio.",
    fields: [
      { key: "m1Earth", label: "Mass 1", unit: "M⊕", default: 1, min: 0.001, max: 1000, step: 0.001 },
      { key: "m2Earth", label: "Mass 2", unit: "M⊕", default: 0.0123, min: 0.0001, max: 1000, step: 0.0001 },
      { key: "distanceKm", label: "Separation", unit: "×10³ km", default: 384.4, min: 1, max: 100000, step: 0.1 },
      { key: "gScale", label: "G scaling", unit: "×", default: 1, min: 0.5, max: 1.5, step: 0.01 },
    ],
  },
  {
    id: "blackbody",
    name: "Blackbody Peak",
    question: "What if the star were cooler — where does its light peak?",
    explain: "Wien's law: λ_max = b/T. The Sun (5772 K) peaks at ~502 nm (green); a 3000 K M dwarf peaks in the infrared.",
    fields: [
      { key: "tempK", label: "Temperature", unit: "K", default: 5772, min: 500, max: 50000, step: 10 },
    ],
  },
  {
    id: "transit",
    name: "Transit Depth",
    question: "How much does a star dim when a given planet crosses it?",
    explain: "Depth δ = (Rp/R★)². Jupiter on the Sun: ~1%. Earth on the Sun: ~84 ppm — why space photometry exists.",
    fields: [
      { key: "planetRe", label: "Planet radius", unit: "R⊕", default: 1, min: 0.1, max: 30, step: 0.1 },
      { key: "starRs", label: "Star radius", unit: "R☉", default: 1, min: 0.05, max: 20, step: 0.05 },
    ],
  },
  {
    id: "snr",
    name: "Signal-to-Noise",
    question: "What if a signal had more background noise?",
    explain: "Photon-limited SNR = S/√(S + B + R²). Doubling exposure ~ doubles S and B → SNR grows as √t.",
    fields: [
      { key: "signal", label: "Signal", unit: "counts", default: 10000, min: 1, max: 1e7, step: 100 },
      { key: "background", label: "Background", unit: "counts", default: 2000, min: 0, max: 1e7, step: 100 },
      { key: "readNoise", label: "Read noise", unit: "e⁻", default: 10, min: 0, max: 500, step: 1 },
    ],
  },
  {
    id: "pid",
    name: "PID Response",
    question: "What if you raise the proportional gain — does it overshoot?",
    explain: "A PID controller drives a first-order plant to a setpoint. Watch overshoot, ringing and settling as you tune Kp/Ki/Kd.",
    chart: true,
    fields: [
      { key: "kp", label: "Kp", unit: "", default: 2, min: 0, max: 20, step: 0.1 },
      { key: "ki", label: "Ki", unit: "", default: 0.5, min: 0, max: 10, step: 0.1 },
      { key: "kd", label: "Kd", unit: "", default: 0.2, min: 0, max: 5, step: 0.05 },
    ],
  },
  {
    id: "sir",
    name: "Epidemic (SIR)",
    question: "What if a disease spreads faster — when does the outbreak peak?",
    explain: "The SIR model splits a population into Susceptible, Infected and Recovered. R₀ = β/γ is the reproduction number; below 1 the outbreak fizzles, above 1 it grows until susceptibles run out.",
    chart: true,
    fields: [
      { key: "r0", label: "R₀ (reproduction number)", unit: "", default: 2.5, min: 0.3, max: 8, step: 0.1 },
      { key: "infectiousDays", label: "Infectious period", unit: "days", default: 7, min: 1, max: 30, step: 1 },
      { key: "initialInfectedPct", label: "Initial infected", unit: "%", default: 0.1, min: 0.01, max: 5, step: 0.01 },
    ],
  },
  {
    id: "cooling",
    name: "Thermal Drift",
    question: "What if a spectrograph's temperature setpoint changes — how long to stabilise?",
    explain: "Newton's law of cooling: T(t) = T_env + (T₀ − T_env)e^(−t/τ). After 3τ you are 95% of the way there.",
    chart: true,
    fields: [
      { key: "t0", label: "Start temp", unit: "°C", default: 25, min: -50, max: 100, step: 0.5 },
      { key: "tEnv", label: "Setpoint", unit: "°C", default: 20, min: -50, max: 100, step: 0.5 },
      { key: "tau", label: "Time constant τ", unit: "min", default: 30, min: 1, max: 600, step: 1 },
    ],
  },
];
