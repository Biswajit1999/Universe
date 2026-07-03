/**
 * MAST / TESS placeholder wrapper.
 *
 * The MAST portal API (https://mast.stsci.edu/api/) serves TESS light curves
 * without a key, but responses are large FITS/JSON products that need real
 * parsing. The MVP ships a synthetic-but-physical light curve generator used
 * by the TESS module — always labelled "Simulated" in the UI.
 */

export interface LightCurvePoint {
  time: number; // days
  flux: number; // normalised
}

/**
 * Generate a physically-shaped transit light curve:
 * box transit + limb-darkening-ish smoothing + white noise.
 */
export function syntheticTransitLightCurve(opts: {
  periodDays?: number;
  depth?: number; // fractional, e.g. 0.01 = 1%
  durationHours?: number;
  noise?: number; // 1-sigma fractional
  lengthDays?: number;
  cadenceMinutes?: number;
}): LightCurvePoint[] {
  const {
    periodDays = 3.5,
    depth = 0.012,
    durationHours = 2.8,
    noise = 0.0012,
    lengthDays = 10,
    cadenceMinutes = 10,
  } = opts;

  const points: LightCurvePoint[] = [];
  const dt = cadenceMinutes / (60 * 24);
  const halfDur = durationHours / 24 / 2;

  for (let t = 0; t < lengthDays; t += dt) {
    const phase = ((t % periodDays) + periodDays) % periodDays;
    const dist = Math.min(phase, periodDays - phase); // distance to nearest mid-transit
    let flux = 1;
    if (dist < halfDur) {
      // smooth ingress/egress with a cosine taper (limb-darkening-like)
      const x = dist / halfDur;
      flux = 1 - depth * (0.5 * (1 + Math.cos(Math.PI * Math.min(x * 1.15, 1))));
    }
    // Box–Muller white noise
    const u1 = Math.random() || 1e-9;
    const u2 = Math.random();
    flux += noise * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    points.push({ time: Number(t.toFixed(4)), flux: Number(flux.toFixed(6)) });
  }
  return points;
}

export const MAST_STATUS = {
  implemented: false,
  note: "Placeholder wrapper — synthetic light curves only. Live MAST product retrieval planned for v2.",
} as const;
