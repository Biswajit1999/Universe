/**
 * arXiv API wrapper. The arXiv Atom API requires no key; live mode is
 * fetched server-side via /api/arxiv (which parses Atom XML into JSON).
 */
import type { DataMode } from "@/lib/types";

export interface ArxivPaper {
  id: string;
  title: string;
  authors: string[];
  category: string;
  published: string;
  summary: string;
}

export interface ArxivResult {
  mode: DataMode;
  papers: ArxivPaper[];
}

export async function fetchArxiv(
  live: boolean,
  category = "astro-ph.EP",
): Promise<ArxivResult> {
  const res = await fetch(
    `/api/arxiv?mode=${live ? "live" : "demo"}&category=${encodeURIComponent(category)}`,
  );
  if (!res.ok) throw new Error(`arXiv request failed (${res.status})`);
  return res.json();
}
