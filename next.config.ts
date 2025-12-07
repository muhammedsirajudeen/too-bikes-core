import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Use webpack instead of Turbopack to support winston externals
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark winston as external for server-side only
      config.externals = config.externals || [];
      config.externals.push('winston', 'winston-daily-rotate-file');
    }
    return config;
  },
  // Add empty turbopack config to silence the warning
  // We're using webpack for winston externals support
  turbopack: {},
};

export default nextConfig;
