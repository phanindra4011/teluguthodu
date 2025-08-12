import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // Enable type checking for better deployment
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable linting for better deployment
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true, // Better for static deployments
  },
  // Remove env section as it's not needed in Next.js 13+
  experimental: {
    // Enable modern features
    serverComponentsExternalPackages: ['genkit'],
  },
  // Add output configuration for static deployments
  output: 'standalone',
  // Add trailing slash for better compatibility
  trailingSlash: false,
  // Add powered by header
  poweredByHeader: false,
};

export default nextConfig;
