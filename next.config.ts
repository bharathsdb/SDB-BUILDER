import type { NextConfig } from "next";
import path from "path";

const isMobile = process.env.BUILD_MOBILE === "true";

const nextConfig: NextConfig = {
  ...(isMobile ? { output: "export" } : {}),

  // Fix "multiple lockfiles" workspace root warning on Vercel/CI
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  // ── Performance ─────────────────────────────────────────────────
  // Minify output and strip all console.* calls in production builds
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 3600,
    ...(isMobile ? { unoptimized: true } : {}),
  },

  experimental: {
    // Tree-shake icon/animation libraries so only used exports ship
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@react-three/drei",
      "@react-three/fiber",
      "recharts",
    ],
  },

  ...(isMobile ? {} : {
    async headers() {
      return [
        {
          // Never cache the service worker
          source: "/sw.js",
          headers: [
            { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          ],
        },
        {
          // Cache all static assets (images, fonts, icons) for 1 year
          source: "/(.*\.(?:png|jpg|jpeg|svg|gif|webp|avif|woff2|woff|ttf|ico))",
          headers: [
            { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          ],
        },
        {
          // Cache API responses briefly to avoid duplicate fetches on navigation
          source: "/api/:path*",
          headers: [
            { key: "Cache-Control", value: "private, max-age=10, stale-while-revalidate=30" },
          ],
        },
      ];
    },
    async rewrites() {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
      const rewrites = [];

      if (apiUrl) {
        rewrites.push({
          source: "/api/:path*",
          destination: `${apiUrl}/api/:path*`,
        });
        rewrites.push({
          source: "/uploads/:path*",
          destination: `${apiUrl}/uploads/:path*`,
        });
      }

      if (wsUrl) {
        rewrites.push({
          source: "/ws/:path*",
          destination: `${wsUrl}/ws/:path*`,
        });
      }

      return rewrites;
    },
  }),
};

export default nextConfig;
