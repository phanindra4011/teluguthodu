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
  // Use the correct property name for Next.js 15
  serverExternalPackages: ['genkit'],
  // Add output configuration for static deployments
  output: 'standalone',
  // Add trailing slash for better compatibility
  trailingSlash: false,
  // Add powered by header
  poweredByHeader: false,
};

export default nextConfig;
