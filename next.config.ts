import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Cloudflare Workers: /_next/image requires an IMAGES binding which is not
  // configured. Keep unoptimized: true — release cover art comes from external
  // CDNs (already optimized); local images are pre-compressed at build time.
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/backgrounds/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
