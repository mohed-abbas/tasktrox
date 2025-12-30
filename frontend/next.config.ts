import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Monorepo support - tell Next.js where the root is for proper module resolution
  outputFileTracingRoot: path.join(__dirname, '../'),

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google avatars
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com', // Cloudflare R2
      },
    ],
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },

  // Experimental features
  experimental: {
    // Enable server actions
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // Turbopack configuration for monorepo
  turbopack: {
    root: path.join(__dirname, '../'),
  },
};

export default nextConfig;
