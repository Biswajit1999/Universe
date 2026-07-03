import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    // Update to your deployed domain.
    sitemap: "https://universe.example.com/sitemap.xml",
  };
}
