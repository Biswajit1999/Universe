import type { MetadataRoute } from "next";
import { WORLDS } from "@/lib/data/worlds";

const BASE = "http://127.0.0.1:3199";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/command",
    "/worlds",
    "/simulations",
    "/research",
    "/data",
    "/graph",
    "/briefing",
    "/writing",
    "/vault",
    "/operator",
    "/settings",
  ];
  const worldPaths = WORLDS.map((w) => `/worlds/${w.slug}`);
  const now = new Date();
  return [...staticPaths, ...worldPaths].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/command" ? 1 : 0.7,
  }));
}
