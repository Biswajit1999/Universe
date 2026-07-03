/**
 * NASA API wrappers (APOD + Near-Earth Objects).
 * Client-side helpers that call our own /api routes; the routes decide
 * between live NASA data (when NASA_API_KEY is set and mode=live) and
 * bundled demo data. The payload always carries `mode` for honest labelling.
 */
import type { DataMode } from "@/lib/types";

export interface ApodData {
  mode: DataMode;
  title: string;
  date: string;
  explanation: string;
  url: string;
  media_type: string;
  copyright?: string;
}

export interface NeoObject {
  name: string;
  estDiameterMinM: number;
  estDiameterMaxM: number;
  isPotentiallyHazardous: boolean;
  closeApproachDate: string;
  missDistanceLunar: number;
  relativeVelocityKps: number;
}

export interface NeoFeed {
  mode: DataMode;
  date: string;
  count: number;
  objects: NeoObject[];
}

export async function fetchApod(live: boolean): Promise<ApodData> {
  const res = await fetch(`/api/apod?mode=${live ? "live" : "demo"}`);
  if (!res.ok) throw new Error(`APOD request failed (${res.status})`);
  return res.json();
}

export async function fetchNeoFeed(live: boolean): Promise<NeoFeed> {
  const res = await fetch(`/api/neo?mode=${live ? "live" : "demo"}`);
  if (!res.ok) throw new Error(`NEO request failed (${res.status})`);
  return res.json();
}
