import type { NextConfig } from "next";
import os from "os";
import path from "path";
import pricing from "./content/pdp/tidl-launch-pricing.json";

/** Hosts allowed to load /_next in `next dev`. DHCP IPs change. */
function allowedDevOrigins() {
  const hosts = new Set(["127.0.0.1", "localhost", "*.local"]);
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const addr of addrs ?? []) {
      if (addr.internal) continue;
      if (addr.family === "IPv4") {
        hosts.add(addr.address);
      }
    }
  }
  return [...hosts];
}

const nextConfig: NextConfig = {
  // Cursor preview and some local clients hit 127.0.0.1 while `next dev`
  // binds as localhost. Without this, /_next chunks are blocked and client
  // components stay stuck on their SSR loading state.
  allowedDevOrigins: allowedDevOrigins(),
  // Hide the Next.js N badge. Compile and runtime errors still surface.
  devIndicators: false,
  async redirects() {
    const fromFile = Object.entries(pricing.meta.redirects).map(
      ([source, destination]) => ({
        source,
        destination,
        permanent: true,
      }),
    );
    return [
      ...fromFile,
      {
        source: "/treatments/testosterone",
        destination: "/products/testosterone",
        permanent: true,
      },
      {
        source: "/treatments/mens-peak-performance",
        destination: "/treatments/mens-health",
        permanent: true,
      },
      {
        source: "/treatments/womens-total-balance",
        destination: "/treatments/womens-balance",
        permanent: true,
      },
      {
        source: "/treatments/hair-skin-nails",
        destination: "/treatments/skin-and-hair",
        permanent: true,
      },
      {
        source: "/treatments/repair-mobility",
        destination: "/treatments/recovery-and-performance",
        permanent: true,
      },
      {
        source: "/treatments/appetite-balance",
        destination: "/stacks/transformation",
        permanent: true,
      },
      {
        source: "/treatments/body-composition",
        destination: "/bundles/body-composition",
        permanent: true,
      },
      {
        source: "/treatments/focus",
        destination: "/programs/creators-and-builders",
        permanent: true,
      },
      {
        source: "/treatments/rest-rebuild",
        destination: "/programs/athletes",
        permanent: true,
      },
      {
        source: "/treatments/longevity",
        destination: "/programs/healthspan",
        permanent: true,
      },
      {
        source: "/treatments/stress-mood",
        destination: "/programs/parents",
        permanent: true,
      },
      {
        source: "/treatments/cellular-health",
        destination: "/treatments",
        permanent: true,
      },
      {
        source: "/treatments/lean-cut",
        destination: "/bundles/lean-and-cut",
        permanent: true,
      },
      {
        source: "/treatments/complete-stack",
        destination: "/bundles/complete-stack",
        permanent: true,
      },
      {
        source: "/bundles/rest-rise",
        destination: "/bundles/rest-and-rise",
        permanent: true,
      },
      {
        source: "/stacks",
        destination: "/treatments",
        permanent: true,
      },
      {
        source: "/programs/ceos-and-executives",
        destination: "/treatments/mens-health",
        permanent: true,
      },
      {
        source: "/programs",
        destination: "/treatments",
        permanent: true,
      },
      {
        source: "/products/at-home-lab",
        destination: "/labs",
        permanent: true,
      },
      {
        source: "/treatments/pain-relief",
        destination: "/pain-relief",
        permanent: true,
      },
      {
        source: "/pricing-and-terms",
        destination: "/",
        permanent: false,
      },
      {
        source: "/guide",
        destination: "/treatments",
        permanent: true,
      },
    ];
  },
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source:
            "/:path((?!landing|pdp|pain-relief|brand|labs|_opt|favicon.png).*)",
          headers: [
            { key: "Cache-Control", value: "no-store, must-revalidate" },
          ],
        },
      ];
    }
    return [
      {
        source: "/_opt/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=604800, stale-while-revalidate=2592000",
          },
        ],
      },
      {
        source:
          "/:path(.*\\.(?:webp|avif|jpe?g|png|gif|svg|mp4|webm|woff2))",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
