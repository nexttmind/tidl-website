import type { NextConfig } from "next";
import os from "os";
import path from "path";

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
  // Intake posts ID photos as base64 JSON. Next 16 proxy defaults to 10MB
  // and truncates the body, which becomes a 400 on request.json().
  experimental: {
    proxyClientMaxBodySize: "50mb",
  },
  // Cursor preview and some local clients hit 127.0.0.1 while `next dev`
  // binds as localhost. Without this, /_next chunks are blocked and client
  // components stay stuck on their SSR loading state.
  allowedDevOrigins: allowedDevOrigins(),
  // Hide the Next.js N badge. Compile and runtime errors still surface.
  devIndicators: false,
  async redirects() {
    return [
      {
        source: "/treatments/testosterone",
        destination: "/treatments/mens-health",
        permanent: true,
      },
      {
        source: "/pricing-and-terms",
        destination: "/",
        permanent: false,
      },
    ];
  },
  turbopack: {
    root: path.join(__dirname),
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];

    if (process.env.NODE_ENV === "development") {
      return [
        {
          source:
            "/:path((?!landing|pdp|pain-relief|brand|favicon.png).*)",
          headers: [
            { key: "Cache-Control", value: "no-store, must-revalidate" },
          ],
        },
      ];
    }

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
