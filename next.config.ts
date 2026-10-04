import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // Keep a running local dev server from overwriting production verification artifacts.
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next-production',
  outputFileTracingRoot: path.resolve(process.cwd()),
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
  },
};

export default nextConfig;
