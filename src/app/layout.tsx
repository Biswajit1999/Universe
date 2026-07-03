import type { Metadata, Viewport } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://universe.example.com"),
  title: "UNIVERSE — Personal Intelligence System",
  description:
    "Biswajit's private, local-first scientific intelligence system with voice, agents, live data, simulations and a secure personal knowledge vault.",
  applicationName: "UNIVERSE",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "UNIVERSE" },
  authors: [{ name: "Biswajit Jana" }],
  keywords: ["science", "research", "astronomy", "AI", "personal assistant", "data", "simulation"],
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export const viewport: Viewport = {
  themeColor: "#05060f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
