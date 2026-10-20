// Allow server-side fetch to reach APIs with self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  serverExternalPackages: ['googleapis', 'sharp'],
  images: {
    formats: ['image/avif', 'image/webp'],
    localPatterns: [
      { pathname: '/**' },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'docs.google.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.minglefashionbd.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'minglefashionbd.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;