import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable unstable_prefetch to fix runtime error
    clientRouterFilter: false,
  },
};

export default nextConfig;
