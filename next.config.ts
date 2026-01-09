import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  basePath: '/widget',
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // Disable server-side image optimization to avoid native image libs (sharp/libvips)
    // which can probe host /dev devices and cause runtime errors in container environments.
    unoptimized: true,
  },
};

export default nextConfig;
