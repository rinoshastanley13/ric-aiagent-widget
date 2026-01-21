import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: '/widget',
  images: {
    // Disable server-side image optimization to avoid native image libs (sharp/libvips)
    // which can probe host /dev devices and cause runtime errors in container environments.
    unoptimized: true,
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
