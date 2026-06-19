import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.mlp.amway.eu',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.amway.co.uk',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
