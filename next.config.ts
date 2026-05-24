import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
      }
    ],
  },
};



export default nextConfig;
