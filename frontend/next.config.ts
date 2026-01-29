import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Note: Rewrites are not supported in static export mode.
  // API requests must be directed to the absolute URL of the backend (e.g., http://localhost:8000)
};

export default nextConfig;
