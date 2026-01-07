import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/widget',
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
