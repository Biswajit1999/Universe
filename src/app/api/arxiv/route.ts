/**
 * GET /api/arxiv?mode=live|demo&category=astro-ph.EP — latest arXiv papers.
 * The arXiv Atom API needs no key; live mode parses the feed server-side.
 */
import { NextResponse } from "next/server";
import { demoData } from "@/lib/demo";

function tag(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? m[1].replace(/\s+/g, " ").trim() : "";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wantLive = searchParams.get("mode") === "live";
  const category = searchParams.get("category") || "astro-ph.EP";

  if (wantLive) {
    try {
      const url = `https://export.arxiv.org/api/query?search_query=cat:${encodeURIComponent(
        category,
      )}&sortBy=submittedDate&sortOrder=descending&max_results=8`;
      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (res.ok) {
        const xml = await res.text();
        const entries = xml.split("<entry>").slice(1);
        const papers = entries.map((e) => ({
          id: tag(e, "id").split("/abs/")[1] ?? "",
          title: tag(e, "title"),
          authors: [...e.matchAll(/<name>([\s\S]*?)<\/name>/g)].map((m) => m[1].trim()).slice(0, 5),
          category,
          published: tag(e, "published").slice(0, 10),
          summary: tag(e, "summary").slice(0, 400),
        }));
        if (papers.length > 0) {
          return NextResponse.json({ mode: "live", papers });
        }
      }
    } catch {
      // fall through to demo
    }
  }
  return NextResponse.json(demoData.arxiv);
}
