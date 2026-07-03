/**
 * NASA Exoplanet Archive wrapper.
 * The archive's TAP service requires NO API key — live mode queries it
 * directly through our /api/exoplanets route (server-side, avoids CORS).
 * Demo mode returns the curated bundled snapshot.
 */
import type { DataMode } from "@/lib/types";

export interface Exoplanet {
  name: string;
  hostStar: string;
  method: string;
  discoveryYear: number;
  orbitalPeriodDays: number;
  radiusEarth: number;
  massEarth: number;
  eqTempK: number;
  distanceLy: number;
  facility: string;
}

export interface ExoplanetResult {
  mode: DataMode;
  source: string;
  planets: Exoplanet[];
}

export async function fetchExoplanets(live: boolean): Promise<ExoplanetResult> {
  const res = await fetch(`/api/exoplanets?mode=${live ? "live" : "demo"}`);
  if (!res.ok) throw new Error(`Exoplanet request failed (${res.status})`);
  return res.json();
}

/** ADQL used against the archive's TAP endpoint in live mode. */
export const EXOPLANET_TAP_QUERY = `
SELECT TOP 30 pl_name, hostname, discoverymethod, disc_year,
       pl_orbper, pl_rade, pl_bmasse, pl_eqt, sy_dist, disc_facility
FROM ps
WHERE default_flag = 1 AND pl_rade IS NOT NULL
ORDER BY disc_year DESC`.trim();
