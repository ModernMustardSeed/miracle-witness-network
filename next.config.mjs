/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Story photography is hotlinked from the outlet that published it, so the
    // remote host is never known ahead of time. Next still optimises, resizes
    // and serves it from our own domain.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24,
  },
  async redirects() {
    return [
      { source: '/whitepaper', destination: '/how-we-verify', permanent: true },
      { source: '/desks', destination: '/wire', permanent: false },
    ];
  },
};

export default nextConfig;
