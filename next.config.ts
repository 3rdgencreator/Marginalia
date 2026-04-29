import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Cloudflare Workers: /_next/image requires an IMAGES binding which is not
  // configured. Keep unoptimized: true — release cover art comes from external
  // CDNs (already optimized); local images are pre-compressed at build time.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
