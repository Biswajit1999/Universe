/**
 * GET /api/apod?mode=live|demo — NASA Astronomy Picture of the Day.
 * Live mode requires NASA_API_KEY (free at https://api.nasa.gov).
 * Any failure degrades gracefully to labelled demo data.
 */
import { NextResponse } from "next/server";
import { demoData } from "@/lib/demo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wantLive = searchParams.get("mode") === "live";
  const apiKey = process.env.NASA_API_KEY; // ← insert your NASA key in .env.local

  if (wantLive && apiKey) {
    try {
      const res = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`, {
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const d = await res.json();
        return NextResponse.json({
          mode: "live",
          title: d.title,
          date: d.date,
          explanation: d.explanation,
          url: d.url,
          media_type: d.media_type,
          copyright: d.copyright,
        });
      }
    } catch {
      // fall through to demo
    }
  }
  return NextResponse.json(demoData.apod);
}
