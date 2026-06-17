import type { NextConfig } from "next";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://vchyjroofvqmgdlbydhp.supabase.co https://zenoimages.s3.us-west-001.backblazeb2.com https://*.giphy.com https://images-api.printify.com;
  connect-src 'self' https://vchyjroofvqmgdlbydhp.supabase.co https://api.stripe.com;
  frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://zeno.fm;
`.replace(/\s{2,}/g, ' ').trim();

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
      },
      {
        protocol: 'https',
        hostname: '*.giphy.com',
      },
      {
        protocol: 'https',
        hostname: 'images-api.printify.com', 
      }
    ],
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          }
        ],
      },
    ];
  },
}

export default nextConfig;