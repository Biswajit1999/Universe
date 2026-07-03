/**
 * GET /api/exoplanets?mode=live|demo — NASA Exoplanet Archive (TAP, no key).
 * Live mode queries the archive's TAP service server-side; failures fall
 * back to the curated demo snapshot.
 */
import { NextResponse } from "next/server";
import { demoData } from "@/lib/demo";
import { EXOPLANET_TAP_QUERY } from "@/lib/api/exoplanets";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wantLive = searchParams.get("mode") === "live";

  if (wantLive) {
    try {
      const url = `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${encodeURIComponent(
        EXOPLANET_TAP_QUERY,
      )}&format=json`;
      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (res.ok) {
        const rows = (await res.json()) as {
          pl_name: string; hostname: string; discoverymethod: string; disc_year: number;
          pl_orbper: number | null; pl_rade: number | null; pl_bmasse: number | null;
          pl_eqt: number | null; sy_dist: number | null; disc_facility: string;
        }[];
        return NextResponse.json({
          mode: "live",
          source: "NASA Exoplanet Archive TAP (live)",
          planets: rows.map((r) => ({
            name: r.pl_name,
            hostStar: r.hostname,
            method: r.discoverymethod,
            discoveryYear: r.disc_year,
            orbitalPeriodDays: r.pl_orbper ?? 0,
            radiusEarth: r.pl_rade ?? 0,
            massEarth: r.pl_bmasse ?? 0,
            eqTempK: r.pl_eqt ?? 0,
            distanceLy: r.sy_dist ? Number((r.sy_dist * 3.262).toFixed(1)) : 0,
            facility: r.disc_facility,
          })),
        });
      }
    } catch {
      // fall through to demo
    }
  }
  return NextResponse.json(demoData.exoplanets);
}
