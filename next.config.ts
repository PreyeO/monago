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
      {
        // Images uploaded from the admin product form (Supabase Storage, public bucket)
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
