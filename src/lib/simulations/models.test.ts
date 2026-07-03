import { describe, it, expect } from "vitest";
import {
  orbitalPeriod,
  gravityForce,
  blackbodyPeak,
  transitDepth,
  signalToNoise,
  pidResponse,
  exponentialCooling,
  sirModel,
  M_SUN,
  M_EARTH,
  AU,
} from "./models";

describe("orbitalPeriod", () => {
  it("gives ~1 year for Earth around the Sun", () => {
    const { years } = orbitalPeriod(M_SUN, AU);
    expect(years).toBeCloseTo(1, 1);
  });
  it("scales as a^1.5 (Kepler's third law)", () => {
    const t1 = orbitalPeriod(M_SUN, AU).years;
    const t4 = orbitalPeriod(M_SUN, 4 * AU).years;
    expect(t4 / t1).toBeCloseTo(8, 1); // 4^1.5 = 8
  });
});

describe("gravityForce", () => {
  it("computes Earth's surface gravity force on a 1 kg mass (~9.8 N)", () => {
    const R_EARTH = 6.371e6;
    const f = gravityForce(M_EARTH, 1, R_EARTH);
    expect(f).toBeGreaterThan(9.6);
    expect(f).toBeLessThan(10);
  });
  it("obeys the inverse-square law", () => {
    const near = gravityForce(M_EARTH, 1, 1e7);
    const far = gravityForce(M_EARTH, 1, 2e7);
    expect(near / far).toBeCloseTo(4, 5);
  });
});

describe("blackbodyPeak", () => {
  it("peaks the Sun (5772 K) near ~502 nm in the visible", () => {
    const { wavelengthNm, band } = blackbodyPeak(5772);
    expect(wavelengthNm).toBeGreaterThan(480);
    expect(wavelengthNm).toBeLessThan(520);
    expect(band).toBe("visible");
  });
  it("puts a cool 3000 K star in the infrared", () => {
    expect(blackbodyPeak(3000).band).toBe("infrared");
  });
});

describe("transitDepth", () => {
  it("gives ~1% for a Jupiter-sized planet on a Sun-like star", () => {
    const { percent } = transitDepth(11.2, 1); // Jupiter ≈ 11.2 R⊕
    expect(percent).toBeGreaterThan(0.9);
    expect(percent).toBeLessThan(1.4);
  });
  it("gives ~84 ppm for an Earth on the Sun", () => {
    const { ppm } = transitDepth(1, 1);
    expect(ppm).toBeGreaterThan(70);
    expect(ppm).toBeLessThan(100);
  });
});

describe("signalToNoise", () => {
  it("reduces to sqrt(S) when background and read noise are zero", () => {
    expect(signalToNoise(10000, 0, 0)).toBeCloseTo(100, 5);
  });
  it("decreases as background grows", () => {
    expect(signalToNoise(1000, 0, 0)).toBeGreaterThan(signalToNoise(1000, 5000, 0));
  });
});

describe("pidResponse", () => {
  it("converges toward the setpoint", () => {
    const series = pidResponse({ kp: 2, ki: 0.5, kd: 0.2, setpoint: 1 });
    expect(series.at(-1)!.y).toBeGreaterThan(0.9);
    expect(series.at(-1)!.y).toBeLessThan(1.1);
  });
});

describe("exponentialCooling", () => {
  it("starts at T0 and decays toward the environment", () => {
    const series = exponentialCooling({ t0: 30, tEnv: 20, tauMinutes: 10 });
    expect(series[0].temp).toBeCloseTo(30, 1);
    expect(series.at(-1)!.temp).toBeLessThan(21);
  });
});

describe("sirModel", () => {
  it("keeps fractions summing to ~100%", () => {
    const series = sirModel({ r0: 2.5, infectiousDays: 7 });
    for (const p of series) {
      expect(p.S + p.I + p.R).toBeGreaterThan(99);
      expect(p.S + p.I + p.R).toBeLessThan(101);
    }
  });
  it("produces a bigger peak for higher R0", () => {
    const low = Math.max(...sirModel({ r0: 1.2, infectiousDays: 7 }).map((p) => p.I));
    const high = Math.max(...sirModel({ r0: 4, infectiousDays: 7 }).map((p) => p.I));
    expect(high).toBeGreaterThan(low);
  });
  it("barely spreads when R0 < 1", () => {
    const peak = Math.max(...sirModel({ r0: 0.5, infectiousDays: 7, initialInfectedPct: 0.1 }).map((p) => p.I));
    expect(peak).toBeLessThan(0.2);
  });
});
