/**
 * GET /api/neo?mode=live|demo — NASA Near-Earth Object feed (today).
 * Live mode requires NASA_API_KEY. Falls back to labelled demo data.
 */
import { NextResponse } from "next/server";
import { demoData } from "@/lib/demo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wantLive = searchParams.get("mode") === "live";
  const apiKey = process.env.NASA_API_KEY; // ← insert your NASA key in .env.local

  if (wantLive && apiKey) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await fetch(
        `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${apiKey}`,
        { next: { revalidate: 3600 } },
      );
      if (res.ok) {
        const d = await res.json();
        const raw = (d.near_earth_objects?.[today] ?? []) as {
          name: string;
          estimated_diameter: { meters: { estimated_diameter_min: number; estimated_diameter_max: number } };
          is_potentially_hazardous_asteroid: boolean;
          close_approach_data: { close_approach_date: string; miss_distance: { lunar: string }; relative_velocity: { kilometers_per_second: string } }[];
        }[];
        return NextResponse.json({
          mode: "live",
          date: today,
          count: raw.length,
          objects: raw.slice(0, 10).map((o) => ({
            name: o.name,
            estDiameterMinM: Math.round(o.estimated_diameter.meters.estimated_diameter_min),
            estDiameterMaxM: Math.round(o.estimated_diameter.meters.estimated_diameter_max),
            isPotentiallyHazardous: o.is_potentially_hazardous_asteroid,
            closeApproachDate: o.close_approach_data[0]?.close_approach_date ?? today,
            missDistanceLunar: Number(parseFloat(o.close_approach_data[0]?.miss_distance.lunar ?? "0").toFixed(1)),
            relativeVelocityKps: Number(parseFloat(o.close_approach_data[0]?.relative_velocity.kilometers_per_second ?? "0").toFixed(1)),
          })),
        });
      }
    } catch {
      // fall through to demo
    }
  }
  return NextResponse.json(demoData.neo);
}
