import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Phase 3: ship unoptimized — avoid /_next/image 404 on Cloudflare Workers
  // (no IMAGES binding configured yet). Phase 7 will flip this off and add
  // a custom Cloudflare Images loader. See 03-RESEARCH.md Pitfall #5.
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
