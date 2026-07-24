import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/chat', destination: '/dashboard', permanent: true },
      { source: '/chat-embed', destination: '/dashboard', permanent: true },
    ];
  },
  images: {
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vchyjroofvqmgdlbydhp.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'zenoimages.s3.us-west-001.backblazeb2.com',
      },
      {
        protocol: 'https',
        hostname: 'www.embersoflight.net',
      },
      {
        protocol: 'https',
        hostname: 'images-api.printify.com', // 🚀 Printify is now whitelisted!
      }
    ],
  },
};

export default nextConfig;
