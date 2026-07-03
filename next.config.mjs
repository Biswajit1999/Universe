/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The Electron build embeds Next's traced standalone server so all API
  // routes continue to run locally and secrets never enter the renderer.
  output: "standalone",
  // Pin the tracing root to this project so a stray parent lockfile doesn't
  // confuse Next.js about the workspace root.
  outputFileTracingRoot: import.meta.dirname,
  images: {
    // NASA APOD and other external imagery
    remotePatterns: [
      { protocol: "https", hostname: "apod.nasa.gov" },
      { protocol: "https", hostname: "*.nasa.gov" },
    ],
  },
};

export default nextConfig;
