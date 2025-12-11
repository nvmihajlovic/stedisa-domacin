import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Force rebuild timestamp: 2025-12-05
  env: {
    BUILD_TIME: new Date().toISOString(),
  },
};

export default nextConfig;
