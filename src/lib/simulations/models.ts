/**
 * Simulation Lab physics models.
 * These are deliberately simple, transparent, first-order models — good for
 * intuition and sanity checks, NOT mission-grade. Every result rendered from
 * here is labelled "Simulated" in the UI. See docs/science-disclaimer.md.
 */

export const G = 6.674e-11; // N m^2 kg^-2
export const M_SUN = 1.989e30; // kg
export const M_EARTH = 5.972e24; // kg
export const AU = 1.496e11; // m
export const WIEN_B = 2.898e-3; // m K

/** Kepler's third law: orbital period around a central mass. */
export function orbitalPeriod(centralMassKg: number, semiMajorAxisM: number): {
  seconds: number;
  days: number;
  years: number;
} {
  const seconds = 2 * Math.PI * Math.sqrt(Math.pow(semiMajorAxisM, 3) / (G * centralMassKg));
  return { seconds, days: seconds / 86400, years: seconds / (86400 * 365.25) };
}

/** Newtonian gravitational force between two masses. */
export function gravityForce(m1Kg: number, m2Kg: number, distanceM: number): number {
  return (G * m1Kg * m2Kg) / (distanceM * distanceM);
}

/** Wien's displacement law: blackbody peak wavelength for temperature T. */
export function blackbodyPeak(temperatureK: number): {
  wavelengthNm: number;
  band: string;
} {
  const lambdaM = WIEN_B / temperatureK;
  const nm = lambdaM * 1e9;
  let band = "radio/IR";
  if (nm < 10) band = "X-ray";
  else if (nm < 380) band = "ultraviolet";
  else if (nm < 750) band = "visible";
  else if (nm < 1e6) band = "infrared";
  return { wavelengthNm: nm, band };
}

/** Transit depth: fractional flux drop when a planet crosses its star. */
export function transitDepth(planetRadiusEarth: number, starRadiusSun: number): {
  fraction: number;
  ppm: number;
  percent: number;
} {
  const R_EARTH = 6.371e6;
  const R_SUN = 6.957e8;
  const ratio = (planetRadiusEarth * R_EARTH) / (starRadiusSun * R_SUN);
  const fraction = ratio * ratio;
  return { fraction, ppm: fraction * 1e6, percent: fraction * 100 };
}

/** Photon-noise-limited signal-to-noise ratio: SNR = S / sqrt(S + B + R^2). */
export function signalToNoise(signalCounts: number, backgroundCounts: number, readNoise: number): number {
  return signalCounts / Math.sqrt(signalCounts + backgroundCounts + readNoise * readNoise);
}

/**
 * Discrete PID controller driving a first-order plant toward a setpoint.
 * Plant: dy/dt = (-y + u) / tau. Returns the time series for plotting.
 */
export function pidResponse(opts: {
  kp: number;
  ki: number;
  kd: number;
  setpoint?: number;
  tau?: number;
  steps?: number;
  dt?: number;
}): { t: number; y: number; setpoint: number }[] {
  const { kp, ki, kd, setpoint = 1, tau = 2, steps = 200, dt = 0.05 } = opts;
  let y = 0;
  let integral = 0;
  let prevErr = setpoint - y;
  const out: { t: number; y: number; setpoint: number }[] = [];
  for (let i = 0; i < steps; i++) {
    const err = setpoint - y;
    integral += err * dt;
    const derivative = (err - prevErr) / dt;
    const u = kp * err + ki * integral + kd * derivative;
    y += ((-y + u) / tau) * dt;
    prevErr = err;
    out.push({ t: Number((i * dt).toFixed(2)), y: Number(y.toFixed(4)), setpoint });
  }
  return out;
}

/**
 * Newton's law of cooling/heating: T(t) = T_env + (T0 - T_env) e^(-t/tau).
 * Models e.g. telescope temperature drift after a setpoint change.
 */
export function exponentialCooling(opts: {
  t0: number; // initial temperature
  tEnv: number; // environment temperature
  tauMinutes: number;
  durationMinutes?: number;
}): { t: number; temp: number }[] {
  const { t0, tEnv, tauMinutes, durationMinutes = tauMinutes * 5 } = opts;
  const out: { t: number; temp: number }[] = [];
  const n = 120;
  for (let i = 0; i <= n; i++) {
    const t = (durationMinutes * i) / n;
    const temp = tEnv + (t0 - tEnv) * Math.exp(-t / tauMinutes);
    out.push({ t: Number(t.toFixed(1)), temp: Number(temp.toFixed(3)) });
  }
  return out;
}
