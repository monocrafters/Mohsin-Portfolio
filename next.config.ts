import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Allow LAN / mobile device access during dev (e.g. 192.168.x.x)
  allowedDevOrigins: [
    "192.168.100.11",
    "192.168.*.*",
    "10.*.*.*",
    "172.*.*.*",
    "*.*.*.*",
    "*.local",
    "*.lan",
  ],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["framer-motion"],
  },
};

export default nextConfig;
